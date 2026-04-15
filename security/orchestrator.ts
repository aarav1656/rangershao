import { loadSecurityConfig, SecurityConfig } from "./config/security-config";
import { CoboMpcClient } from "./cobo/cobo-mpc-client";
import { CoboSigningService, SigningRequest, SigningResult } from "./cobo/cobo-signing-service";
import { CircuitBreaker } from "./circuit-breaker/circuit-breaker";
import { RateLimiter } from "./circuit-breaker/rate-limiter";
import { HealthMonitor, Alert } from "./monitoring/health-monitor";
import { HeliusWebhookManager } from "./monitoring/helius-webhook";

export class SecurityOrchestrator {
  readonly config: SecurityConfig;
  readonly coboClient: CoboMpcClient;
  readonly signingService: CoboSigningService;
  readonly circuitBreaker: CircuitBreaker;
  readonly rateLimiter: RateLimiter;
  readonly healthMonitor: HealthMonitor;
  readonly webhookManager: HeliusWebhookManager;

  private constructor(config: SecurityConfig) {
    this.config = config;

    this.circuitBreaker = new CircuitBreaker({
      maxFailures: 3,
      cooldownMs: config.circuitBreaker.cooldownAfterTripMs,
      halfOpenMaxAttempts: 2,
      maxTransactionsPerMinute: config.circuitBreaker.maxTransactionsPerMinute,
      maxTransactionsPerHour: config.circuitBreaker.maxTransactionsPerHour,
      healthFactorMinimum: config.circuitBreaker.healthFactorMinimum,
      healthFactorEmergency: config.circuitBreaker.healthFactorEmergency,
    });

    this.rateLimiter = new RateLimiter();
    this.rateLimiter.addBucket(
      "rebalance",
      config.rateLimit.maxRebalancesPerDay,
      86400_000
    );
    this.rateLimiter.addBucket(
      "rebalance-interval",
      1,
      config.rateLimit.rebalanceMinIntervalMs
    );

    this.coboClient = new CoboMpcClient(config.cobo);

    this.signingService = new CoboSigningService(
      config,
      this.coboClient,
      this.circuitBreaker,
      this.rateLimiter
    );

    this.healthMonitor = new HealthMonitor(
      config.monitoring,
      this.circuitBreaker
    );

    this.webhookManager = new HeliusWebhookManager(
      config.monitoring,
      this.circuitBreaker
    );

    this.circuitBreaker.onStateChange((state, reason) => {
      console.log(`[SECURITY] Circuit breaker ${state}: ${reason}`);
      if (state === "OPEN") {
        this.sendAlert({
          level: "critical",
          message: `Circuit breaker tripped: ${reason}`,
          timestamp: Date.now(),
          source: "circuit-breaker",
        });
      }
    });
  }

  static async create(configOverrides?: Partial<SecurityConfig>): Promise<SecurityOrchestrator> {
    const baseConfig = loadSecurityConfig();
    const config = configOverrides
      ? deepMerge(baseConfig, configOverrides)
      : baseConfig;

    const orchestrator = new SecurityOrchestrator(config as SecurityConfig);
    await orchestrator.coboClient.initialize();
    return orchestrator;
  }

  async signTransaction(request: SigningRequest): Promise<SigningResult> {
    if (!this.rateLimiter.tryAcquire("rebalance-interval")) {
      return {
        success: false,
        error: `Rebalance too frequent. Wait ${this.rateLimiter.getTimeUntilAvailable("rebalance-interval")}ms`,
        requestId: "",
        timestamp: Date.now(),
      };
    }

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
    this.circuitBreaker.emergencyStop(reason);
    console.error(`[EMERGENCY] All operations paused: ${reason}`);
  }

  resumeOperations(): void {
    this.circuitBreaker.resetEmergency();
    console.log("[SECURITY] Operations resumed from emergency pause");
  }

  getSecurityStatus(): {
    circuitBreaker: ReturnType<CircuitBreaker["getStatus"]>;
    rateLimiter: ReturnType<RateLimiter["getStatus"]>;
    health: ReturnType<HealthMonitor["getStatus"]>;
    signing: ReturnType<CoboSigningService["getStats"]>;
  } {
    return {
      circuitBreaker: this.circuitBreaker.getStatus(),
      rateLimiter: this.rateLimiter.getStatus(),
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
