import { loadSecurityConfig, SecurityConfig } from "./config/security-config";
import { CoboMpcClient } from "./cobo/cobo-mpc-client";
import { CoboSolanaSigner } from "./cobo/cobo-solana-signer";
import { CoboSigningService, SigningRequest, SigningResult } from "./cobo/cobo-signing-service";
import { CircuitBreaker } from "./circuit-breaker/circuit-breaker";
import { HealthMonitor, Alert } from "./monitoring/health-monitor";
import { HeliusWebhookManager } from "./monitoring/helius-webhook";
import { AlertManager } from "./monitoring/alert-manager";
import { HeliusMonitor } from "./monitoring/helius-monitor";

export class SecurityOrchestrator {
  readonly config: SecurityConfig;
  readonly coboClient: CoboMpcClient;
  readonly solanaSigner: CoboSolanaSigner;
  readonly signingService: CoboSigningService;
  readonly circuitBreaker: CircuitBreaker;
  readonly healthMonitor: HealthMonitor;
  readonly webhookManager: HeliusWebhookManager;
  readonly alertManager: AlertManager;
  readonly heliusMonitor: HeliusMonitor;

  private constructor(config: SecurityConfig, vaultAddress: string) {
    this.config = config;

    this.circuitBreaker = new CircuitBreaker(config);

    this.coboClient = new CoboMpcClient(config.cobo);

    this.solanaSigner = new CoboSolanaSigner(config.cobo, vaultAddress);

    this.signingService = new CoboSigningService(
      config,
      this.coboClient,
      this.circuitBreaker
    );

    this.alertManager = new AlertManager({
      webhookUrl: config.monitoring.alertWebhookUrl,
      enableConsole: true,
    });

    this.healthMonitor = new HealthMonitor(
      config.monitoring,
      this.circuitBreaker
    );

    this.heliusMonitor = new HeliusMonitor(
      config.monitoring,
      config.circuitBreaker,
      this.alertManager
    );

    this.webhookManager = new HeliusWebhookManager(
      config.monitoring,
      this.circuitBreaker
    );
  }

  static async create(
    configOverrides?: Partial<SecurityConfig>,
    vaultAddress?: string
  ): Promise<SecurityOrchestrator> {
    const baseConfig = loadSecurityConfig();
    const config = configOverrides
      ? deepMerge(baseConfig, configOverrides)
      : baseConfig;

    const addr = vaultAddress || config.monitoring.vaultAddress;
    const orchestrator = new SecurityOrchestrator(config as SecurityConfig, addr);
    await orchestrator.coboClient.initialize();
    await orchestrator.solanaSigner.initialize();
    return orchestrator;
  }

  async signTransaction(request: SigningRequest): Promise<SigningResult> {
    return this.signingService.signAndBroadcast(request);
  }

  async setupWebhooks(callbackUrl: string): Promise<void> {
    const addresses = [
      this.config.monitoring.vaultAddress,
      ...this.config.monitoring.watchAddresses,
    ].filter(Boolean);

    if (addresses.length > 0) {
      await this.webhookManager.registerWebhook(callbackUrl, addresses);
    }
  }

  startMonitoring(
    healthCheckFn: () => Promise<{ healthFactor: number; tvl: number }>
  ): void {
    this.healthMonitor.setHealthCheckFunction(healthCheckFn);
    this.healthMonitor.start();
  }

  stopMonitoring(): void {
    this.healthMonitor.stop();
  }

  emergencyPause(reason: string): void {
    this.circuitBreaker.emergencyPause(reason);
    console.error(`[EMERGENCY] All operations paused: ${reason}`);
    this.sendAlert({
      level: "critical",
      message: `Emergency pause activated: ${reason}`,
      timestamp: Date.now(),
      source: "orchestrator",
    });
  }

  resumeOperations(): void {
    this.circuitBreaker.resume();
    console.log("[SECURITY] Operations resumed");
  }

  getSecurityStatus() {
    return {
      circuitBreaker: this.circuitBreaker.getStatus(),
      health: this.healthMonitor.getStatus(),
      signing: this.signingService.getStats(),
    };
  }

  private sendAlert(alert: Alert): void {
    if (!this.config.monitoring.alertWebhookUrl) return;

    fetch(this.config.monitoring.alertWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    }).catch((err) =>
      console.error(`[SECURITY] Failed to send alert: ${err.message}`)
    );
  }
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
