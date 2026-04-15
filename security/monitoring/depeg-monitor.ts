import { Connection, PublicKey } from '@solana/web3.js';
import { AlertManager, AlertSeverity, AlertType } from './alert-manager';
import { CircuitBreaker } from '../circuit-breaker/circuit-breaker';

export enum DepegLevel {
  NORMAL = 'normal',
  ALERT = 'alert',
  HALT_DEPOSITS = 'halt_deposits',
  EMERGENCY_EXIT = 'emergency_exit',
  FULL_EXIT = 'full_exit',
}

export interface DepegThreshold {
  level: DepegLevel;
  pct: number;
  action: string;
}

export const DEPEG_THRESHOLDS: DepegThreshold[] = [
  { level: DepegLevel.ALERT, pct: 0.005, action: 'Alert team, monitor closely' },
  { level: DepegLevel.HALT_DEPOSITS, pct: 0.01, action: 'Halt new deposits' },
  { level: DepegLevel.EMERGENCY_EXIT, pct: 0.02, action: 'Begin unwinding USDC to SOL via Jupiter' },
  { level: DepegLevel.FULL_EXIT, pct: 0.05, action: 'Full emergency exit' },
];

export interface DepegStatus {
  usdcPrice: number;
  depegPct: number;
  level: DepegLevel;
  lastUpdated: number;
  priceSource: 'pyth_onchain' | 'pyth_hermes' | 'unknown';
}

export interface DepegAction {
  level: DepegLevel;
  action: 'alert_only' | 'halt_deposits' | 'unwind_to_sol' | 'full_exit';
}

const PYTH_USDC_USD_FEED_ID = 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a';

const PYTH_USDC_USD_PRICE_ACCOUNT = new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD');
const PYTH_MAGIC = 0xa1b2c3d4;

export class DepegMonitor {
  private connection: Connection;
  private alertManager: AlertManager;
  private circuitBreaker: CircuitBreaker;
  private currentLevel: DepegLevel = DepegLevel.NORMAL;
  private lastPrice: number = 1.0;
  private lastUpdated: number = 0;
  private priceSource: DepegStatus['priceSource'] = 'unknown';
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private checkIntervalMs: number;
  private actionCallbacks: Array<(action: DepegAction) => void> = [];

  constructor(
    rpcUrl: string,
    alertManager: AlertManager,
    circuitBreaker: CircuitBreaker,
    checkIntervalMs: number = 60_000,
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.alertManager = alertManager;
    this.circuitBreaker = circuitBreaker;
    this.checkIntervalMs = checkIntervalMs;
  }

  onAction(callback: (action: DepegAction) => void): void {
    this.actionCallbacks.push(callback);
  }

  start(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => this.checkPrice(), this.checkIntervalMs);
    this.checkPrice();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async checkPrice(): Promise<DepegAction | null> {
    try {
      const price = await this.fetchPythOnChain();
      return this.processPrice(price, 'pyth_onchain');
    } catch {
      try {
        const price = await this.fetchPythHermes();
        return this.processPrice(price, 'pyth_hermes');
      } catch (error) {
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_CRITICAL,
          severity: AlertSeverity.CRITICAL,
          title: 'USDC price feed unavailable',
          message: `Both Pyth on-chain and Hermes API failed: ${error instanceof Error ? error.message : String(error)}`,
        });
        return null;
      }
    }
  }

  private async fetchPythOnChain(): Promise<number> {
    const accountInfo = await this.connection.getAccountInfo(PYTH_USDC_USD_PRICE_ACCOUNT);
    if (!accountInfo || !accountInfo.data) {
      throw new Error('Pyth USDC/USD price account not found');
    }

    return this.parsePythPriceAccount(accountInfo.data);
  }

  private parsePythPriceAccount(data: Buffer): number {
    if (data.length < 48) {
      throw new Error(`Price account data too short: ${data.length} bytes`);
    }

    const magic = data.readUInt32LE(0);
    if (magic !== PYTH_MAGIC) {
      throw new Error(`Invalid Pyth magic: 0x${magic.toString(16)}`);
    }

    // Pyth price account layout (v2):
    // offset 208: price (i64)
    // offset 216: conf (u64)
    // offset 224: status (u32)
    // offset 232: expo (i32)
    const priceOffset = 208;
    const expoOffset = 232;

    if (data.length < expoOffset + 4) {
      throw new Error(`Price account data too short for v2 layout: ${data.length} bytes`);
    }

    const price = data.readBigInt64LE(priceOffset);
    const expo = data.readInt32LE(expoOffset);

    const priceFloat = Number(price) * Math.pow(10, expo);

    if (priceFloat <= 0 || priceFloat > 2) {
      throw new Error(`Pyth price out of range: ${priceFloat}`);
    }

    return priceFloat;
  }

  private async fetchPythHermes(): Promise<number> {
    const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=0x${PYTH_USDC_USD_FEED_ID}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (!response.ok) {
      throw new Error(`Hermes API returned ${response.status}`);
    }

    const data = await response.json() as {
      parsed: Array<{
        price: { price: string; expo: number; conf: string };
      }>;
    };

    if (!data.parsed || data.parsed.length === 0) {
      throw new Error('No price data from Hermes');
    }

    const priceData = data.parsed[0].price;
    const price = Number(priceData.price) * Math.pow(10, priceData.expo);

    if (price <= 0 || price > 2) {
      throw new Error(`Hermes price out of range: ${price}`);
    }

    return price;
  }

  private processPrice(price: number, source: DepegStatus['priceSource']): DepegAction | null {
    this.lastPrice = price;
    this.lastUpdated = Date.now();
    this.priceSource = source;

    const depegPct = Math.abs(1 - price);
    const previousLevel = this.currentLevel;
    this.currentLevel = this.computeLevel(depegPct);

    if (this.currentLevel !== DepegLevel.NORMAL && this.currentLevel !== previousLevel) {
      return this.triggerAction(this.currentLevel, price, depegPct);
    }

    if (this.currentLevel === DepegLevel.NORMAL && previousLevel !== DepegLevel.NORMAL) {
      this.alertManager.sendAlert({
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.INFO,
        title: 'USDC peg restored',
        message: `USDC/USD price: $${price.toFixed(6)}, source: ${source}`,
        data: { price, source },
      });
    }

    return null;
  }

  private computeLevel(depegPct: number): DepegLevel {
    for (let i = DEPEG_THRESHOLDS.length - 1; i >= 0; i--) {
      if (depegPct >= DEPEG_THRESHOLDS[i].pct) {
        return DEPEG_THRESHOLDS[i].level;
      }
    }
    return DepegLevel.NORMAL;
  }

  private triggerAction(level: DepegLevel, price: number, depegPct: number): DepegAction {
    const threshold = DEPEG_THRESHOLDS.find(t => t.level === level)!;
    let action: DepegAction;

    switch (level) {
      case DepegLevel.ALERT:
        action = { level, action: 'alert_only' };
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_WARNING,
          severity: AlertSeverity.WARNING,
          title: `USDC DEPEG ALERT: ${(depegPct * 100).toFixed(3)}%`,
          message: `${threshold.action}. USDC/USD: $${price.toFixed(6)}`,
          data: { price, depegPct, source: this.priceSource },
        });
        break;

      case DepegLevel.HALT_DEPOSITS:
        action = { level, action: 'halt_deposits' };
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_CRITICAL,
          severity: AlertSeverity.CRITICAL,
          title: `USDC DEPEG: HALTING DEPOSITS (${(depegPct * 100).toFixed(3)}%)`,
          message: `${threshold.action}. USDC/USD: $${price.toFixed(6)}`,
          data: { price, depegPct, source: this.priceSource },
        });
        break;

      case DepegLevel.EMERGENCY_EXIT:
        action = { level, action: 'unwind_to_sol' };
        this.alertManager.sendAlert({
          type: AlertType.EMERGENCY_PAUSE,
          severity: AlertSeverity.EMERGENCY,
          title: `USDC DEPEG EMERGENCY: ${(depegPct * 100).toFixed(3)}%`,
          message: `${threshold.action}. USDC/USD: $${price.toFixed(6)}`,
          data: { price, depegPct, source: this.priceSource },
        });
        break;

      case DepegLevel.FULL_EXIT:
        action = { level, action: 'full_exit' };
        this.circuitBreaker.emergencyPause(
          `USDC depeg ${(depegPct * 100).toFixed(3)}% exceeds 5% threshold`
        );
        this.alertManager.sendAlert({
          type: AlertType.CIRCUIT_BREAKER_TRIP,
          severity: AlertSeverity.EMERGENCY,
          title: `USDC FULL EXIT: ${(depegPct * 100).toFixed(3)}% depeg`,
          message: `${threshold.action}. USDC/USD: $${price.toFixed(6)}`,
          data: { price, depegPct, source: this.priceSource },
        });
        break;

      default:
        action = { level, action: 'alert_only' };
    }

    for (const cb of this.actionCallbacks) {
      try { cb(action); } catch {}
    }

    return action;
  }

  getStatus(): DepegStatus {
    return {
      usdcPrice: this.lastPrice,
      depegPct: Math.abs(1 - this.lastPrice),
      level: this.currentLevel,
      lastUpdated: this.lastUpdated,
      priceSource: this.priceSource,
    };
  }
}
