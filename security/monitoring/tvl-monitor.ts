import { Connection, PublicKey } from '@solana/web3.js';
import { AlertManager, AlertSeverity, AlertType } from './alert-manager';
import { CircuitBreaker } from '../circuit-breaker/circuit-breaker';

export interface ProtocolTvlConfig {
  name: string;
  reserveAccounts: string[];
  tokenDecimals: number;
}

interface TvlSnapshot {
  timestamp: number;
  tvlByProtocol: Map<string, number>;
  totalTvl: number;
}

export interface TvlStatus {
  protocols: Array<{
    name: string;
    currentTvl: number;
    oneHourAgoTvl: number;
    changePct: number;
  }>;
  totalTvl: number;
  lastUpdated: number;
}

export interface TvlDropAction {
  protocol: string;
  dropPct: number;
  action: 'alert' | 'emergency_withdraw';
}

const TVL_DROP_ALERT_THRESHOLD = 0.20;
const TVL_DROP_EMERGENCY_THRESHOLD = 0.50;

export class TvlMonitor {
  private connection: Connection;
  private alertManager: AlertManager;
  private circuitBreaker: CircuitBreaker;
  private protocols: ProtocolTvlConfig[];
  private snapshots: TvlSnapshot[] = [];
  private readonly maxSnapshots = 720; // 1h of data at 5s intervals, or 60h at 5min intervals
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private checkIntervalMs: number;
  private actionCallbacks: Array<(action: TvlDropAction) => void> = [];

  constructor(
    rpcUrl: string,
    protocols: ProtocolTvlConfig[],
    alertManager: AlertManager,
    circuitBreaker: CircuitBreaker,
    checkIntervalMs: number = 300_000,
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.protocols = protocols;
    this.alertManager = alertManager;
    this.circuitBreaker = circuitBreaker;
    this.checkIntervalMs = checkIntervalMs;
  }

  onAction(callback: (action: TvlDropAction) => void): void {
    this.actionCallbacks.push(callback);
  }

  start(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => this.checkTvl(), this.checkIntervalMs);
    this.checkTvl();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async checkTvl(): Promise<TvlDropAction[]> {
    const actions: TvlDropAction[] = [];

    try {
      const tvlByProtocol = new Map<string, number>();
      let totalTvl = 0;

      for (const protocol of this.protocols) {
        const tvl = await this.readProtocolTvl(protocol);
        tvlByProtocol.set(protocol.name, tvl);
        totalTvl += tvl;
      }

      const snapshot: TvlSnapshot = {
        timestamp: Date.now(),
        tvlByProtocol,
        totalTvl,
      };

      this.snapshots.push(snapshot);
      if (this.snapshots.length > this.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.maxSnapshots);
      }

      const oneHourAgo = Date.now() - 3_600_000;
      const baselineSnapshot = this.snapshots.find(s => s.timestamp >= oneHourAgo) || this.snapshots[0];

      if (baselineSnapshot && baselineSnapshot !== snapshot) {
        for (const protocol of this.protocols) {
          const currentTvl = tvlByProtocol.get(protocol.name) || 0;
          const baselineTvl = baselineSnapshot.tvlByProtocol.get(protocol.name) || 0;

          if (baselineTvl > 0) {
            const dropPct = (baselineTvl - currentTvl) / baselineTvl;

            if (dropPct >= TVL_DROP_EMERGENCY_THRESHOLD) {
              const action: TvlDropAction = {
                protocol: protocol.name,
                dropPct,
                action: 'emergency_withdraw',
              };
              actions.push(action);

              this.circuitBreaker.emergencyPause(
                `${protocol.name} TVL dropped ${(dropPct * 100).toFixed(1)}% in 1 hour (possible exploit)`
              );

              this.alertManager.sendAlert({
                type: AlertType.EMERGENCY_PAUSE,
                severity: AlertSeverity.EMERGENCY,
                title: `PROTOCOL EXPLOIT? ${protocol.name} TVL -${(dropPct * 100).toFixed(1)}%`,
                message: `TVL dropped from $${baselineTvl.toFixed(0)} to $${currentTvl.toFixed(0)} in 1 hour. Emergency withdrawal initiated.`,
                data: { protocol: protocol.name, currentTvl, baselineTvl, dropPct },
              });
            } else if (dropPct >= TVL_DROP_ALERT_THRESHOLD) {
              const action: TvlDropAction = {
                protocol: protocol.name,
                dropPct,
                action: 'alert',
              };
              actions.push(action);

              this.alertManager.sendAlert({
                type: AlertType.HEALTH_CRITICAL,
                severity: AlertSeverity.CRITICAL,
                title: `TVL DROP: ${protocol.name} -${(dropPct * 100).toFixed(1)}% in 1h`,
                message: `TVL dropped from $${baselineTvl.toFixed(0)} to $${currentTvl.toFixed(0)}. Monitoring for further decline.`,
                data: { protocol: protocol.name, currentTvl, baselineTvl, dropPct },
              });
            }
          }
        }
      }

      for (const action of actions) {
        for (const cb of this.actionCallbacks) {
          try { cb(action); } catch {}
        }
      }
    } catch (error) {
      this.alertManager.sendAlert({
        type: AlertType.HEALTH_CRITICAL,
        severity: AlertSeverity.CRITICAL,
        title: 'TVL monitoring failed',
        message: `Failed to read protocol TVL: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return actions;
  }

  private async readProtocolTvl(protocol: ProtocolTvlConfig): Promise<number> {
    let totalBalance = 0;

    const accounts = protocol.reserveAccounts.map(addr => new PublicKey(addr));
    const infos = await this.connection.getMultipleAccountsInfo(accounts);

    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      if (!info) continue;

      if (info.data.length >= 165) {
        // SPL Token account layout: amount is at offset 64, 8 bytes LE
        const amount = info.data.readBigUInt64LE(64);
        totalBalance += Number(amount) / Math.pow(10, protocol.tokenDecimals);
      } else if (info.data.length === 0) {
        // Native SOL account
        totalBalance += info.lamports / 1e9;
      }
    }

    return totalBalance;
  }

  getStatus(): TvlStatus {
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];
    const oneHourAgo = Date.now() - 3_600_000;
    const baselineSnapshot = this.snapshots.find(s => s.timestamp >= oneHourAgo) || this.snapshots[0];

    const protocols = this.protocols.map(p => {
      const currentTvl = latestSnapshot?.tvlByProtocol.get(p.name) || 0;
      const baselineTvl = baselineSnapshot?.tvlByProtocol.get(p.name) || 0;
      const changePct = baselineTvl > 0 ? (currentTvl - baselineTvl) / baselineTvl : 0;

      return {
        name: p.name,
        currentTvl,
        oneHourAgoTvl: baselineTvl,
        changePct,
      };
    });

    return {
      protocols,
      totalTvl: latestSnapshot?.totalTvl || 0,
      lastUpdated: latestSnapshot?.timestamp || 0,
    };
  }
}
