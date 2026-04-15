import { CircuitBreaker } from "../circuit-breaker/circuit-breaker";
import { SecurityConfig } from "../config/security-config";

export interface HealthStatus {
  healthy: boolean;
  healthFactor: number;
  vaultTvl: number;
  timestamp: number;
  alerts: Alert[];
  circuitBreakerStatus: ReturnType<CircuitBreaker["getStatus"]>;
}

export interface Alert {
  level: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  source: string;
}

export class HealthMonitor {
  private config: SecurityConfig["monitoring"];
  private circuitBreaker: CircuitBreaker;
  private alerts: Alert[] = [];
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private healthCheckFn: (() => Promise<{ healthFactor: number; tvl: number }>) | null = null;
  private alertCallbacks: Array<(alert: Alert) => void> = [];
  private lastHealthFactor: number = Infinity;
  private lastTvl: number = 0;

  constructor(
    config: SecurityConfig["monitoring"],
    circuitBreaker: CircuitBreaker
  ) {
    this.config = config;
    this.circuitBreaker = circuitBreaker;
  }

  setHealthCheckFunction(
    fn: () => Promise<{ healthFactor: number; tvl: number }>
  ): void {
    this.healthCheckFn = fn;
  }

  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  start(): void {
    if (this.intervalHandle) return;

    this.intervalHandle = setInterval(
      () => this.runHealthCheck(),
      this.config.healthCheckIntervalMs
    );

    this.runHealthCheck();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async runHealthCheck(): Promise<HealthStatus> {
    const cbStatus = this.circuitBreaker.getStatus();

    if (!this.healthCheckFn) {
      return {
        healthy: !cbStatus.isPaused,
        healthFactor: this.lastHealthFactor,
        vaultTvl: this.lastTvl,
        timestamp: Date.now(),
        alerts: [],
        circuitBreakerStatus: cbStatus,
      };
    }

    try {
      const { healthFactor, tvl } = await this.healthCheckFn();
      this.lastHealthFactor = healthFactor;
      this.lastTvl = tvl;

      const newAlerts: Alert[] = [];

      if (healthFactor <= 1.05) {
        newAlerts.push(this.createAlert(
          "critical",
          `CRITICAL: Health factor ${healthFactor.toFixed(4)} near liquidation`,
          "health-monitor"
        ));
      } else if (healthFactor <= 1.2) {
        newAlerts.push(this.createAlert(
          "warning",
          `Health factor ${healthFactor.toFixed(4)} below safe threshold`,
          "health-monitor"
        ));
      }

      if (cbStatus.isPaused) {
        newAlerts.push(this.createAlert(
          "critical",
          `Circuit breaker paused: ${cbStatus.pauseReason}`,
          "circuit-breaker"
        ));
      }

      for (const alert of newAlerts) {
        this.alerts.push(alert);
        for (const cb of this.alertCallbacks) {
          try { cb(alert); } catch {}
        }
      }

      return {
        healthy: healthFactor > 1.2 && !cbStatus.isPaused,
        healthFactor,
        vaultTvl: tvl,
        timestamp: Date.now(),
        alerts: newAlerts,
        circuitBreakerStatus: cbStatus,
      };
    } catch (error) {
      const alert = this.createAlert(
        "critical",
        `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
        "health-monitor"
      );
      this.alerts.push(alert);
      for (const cb of this.alertCallbacks) {
        try { cb(alert); } catch {}
      }

      return {
        healthy: false,
        healthFactor: this.lastHealthFactor,
        vaultTvl: this.lastTvl,
        timestamp: Date.now(),
        alerts: [alert],
        circuitBreakerStatus: cbStatus,
      };
    }
  }

  getRecentAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(-limit);
  }

  getStatus(): HealthStatus {
    return {
      healthy: this.lastHealthFactor > 1.2 && !this.circuitBreaker.getStatus().isPaused,
      healthFactor: this.lastHealthFactor,
      vaultTvl: this.lastTvl,
      timestamp: Date.now(),
      alerts: this.alerts.slice(-5),
      circuitBreakerStatus: this.circuitBreaker.getStatus(),
    };
  }

  private createAlert(
    level: Alert["level"],
    message: string,
    source: string
  ): Alert {
    return { level, message, timestamp: Date.now(), source };
  }
}
