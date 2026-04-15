export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  maxFailures: number;
  cooldownMs: number;
  halfOpenMaxAttempts: number;
  maxTransactionsPerMinute: number;
  maxTransactionsPerHour: number;
  healthFactorMinimum: number;
  healthFactorEmergency: number;
}

interface TransactionRecord {
  timestamp: number;
  success: boolean;
  error?: string;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private tripReason: string = "";
  private lastTripTime: number = 0;
  private consecutiveFailures: number = 0;
  private halfOpenAttempts: number = 0;
  private config: CircuitBreakerConfig;
  private txHistory: TransactionRecord[] = [];
  private emergencyPause: boolean = false;
  private currentHealthFactor: number = Infinity;
  private listeners: Array<(state: CircuitState, reason: string) => void> = [];

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  isOperational(): boolean {
    if (this.emergencyPause) return false;

    if (this.state === "OPEN") {
      if (Date.now() - this.lastTripTime > this.config.cooldownMs) {
        this.state = "HALF_OPEN";
        this.halfOpenAttempts = 0;
        this.notify("HALF_OPEN", "Cooldown expired, entering half-open");
        return true;
      }
      return false;
    }

    return true;
  }

  recordAttempt(): void {
    const now = Date.now();
    this.pruneOldRecords(now);

    const txLastMinute = this.txHistory.filter(
      (t) => now - t.timestamp < 60_000
    ).length;
    if (txLastMinute >= this.config.maxTransactionsPerMinute) {
      this.trip(`Rate limit: ${txLastMinute} tx/min exceeds ${this.config.maxTransactionsPerMinute}`);
    }

    const txLastHour = this.txHistory.filter(
      (t) => now - t.timestamp < 3600_000
    ).length;
    if (txLastHour >= this.config.maxTransactionsPerHour) {
      this.trip(`Rate limit: ${txLastHour} tx/hour exceeds ${this.config.maxTransactionsPerHour}`);
    }
  }

  recordSuccess(): void {
    this.txHistory.push({ timestamp: Date.now(), success: true });
    this.consecutiveFailures = 0;

    if (this.state === "HALF_OPEN") {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        this.state = "CLOSED";
        this.notify("CLOSED", "Half-open test passed, circuit closed");
      }
    }
  }

  recordFailure(error: string): void {
    this.txHistory.push({ timestamp: Date.now(), success: false, error });
    this.consecutiveFailures++;

    if (this.state === "HALF_OPEN") {
      this.trip(`Failed during half-open test: ${error}`);
      return;
    }

    if (this.consecutiveFailures >= this.config.maxFailures) {
      this.trip(`${this.consecutiveFailures} consecutive failures. Last: ${error}`);
    }
  }

  updateHealthFactor(healthFactor: number): void {
    this.currentHealthFactor = healthFactor;

    if (healthFactor <= this.config.healthFactorEmergency) {
      this.emergencyPause = true;
      this.trip(`EMERGENCY: Health factor ${healthFactor} below emergency threshold ${this.config.healthFactorEmergency}`);
    } else if (healthFactor <= this.config.healthFactorMinimum) {
      this.trip(`Health factor ${healthFactor} below minimum ${this.config.healthFactorMinimum}`);
    }
  }

  emergencyStop(reason: string): void {
    this.emergencyPause = true;
    this.trip(`EMERGENCY STOP: ${reason}`);
  }

  resetEmergency(): void {
    this.emergencyPause = false;
    this.state = "HALF_OPEN";
    this.halfOpenAttempts = 0;
    this.notify("HALF_OPEN", "Emergency cleared, entering half-open");
  }

  getState(): CircuitState {
    return this.state;
  }

  getTripReason(): string {
    return this.tripReason;
  }

  isEmergencyPaused(): boolean {
    return this.emergencyPause;
  }

  getHealthFactor(): number {
    return this.currentHealthFactor;
  }

  onStateChange(
    listener: (state: CircuitState, reason: string) => void
  ): void {
    this.listeners.push(listener);
  }

  getStatus(): {
    state: CircuitState;
    emergencyPause: boolean;
    healthFactor: number;
    tripReason: string;
    consecutiveFailures: number;
    txLastMinute: number;
    txLastHour: number;
  } {
    const now = Date.now();
    this.pruneOldRecords(now);
    return {
      state: this.state,
      emergencyPause: this.emergencyPause,
      healthFactor: this.currentHealthFactor,
      tripReason: this.tripReason,
      consecutiveFailures: this.consecutiveFailures,
      txLastMinute: this.txHistory.filter((t) => now - t.timestamp < 60_000)
        .length,
      txLastHour: this.txHistory.filter((t) => now - t.timestamp < 3600_000)
        .length,
    };
  }

  private trip(reason: string): void {
    this.state = "OPEN";
    this.tripReason = reason;
    this.lastTripTime = Date.now();
    this.notify("OPEN", reason);
  }

  private notify(state: CircuitState, reason: string): void {
    for (const listener of this.listeners) {
      try {
        listener(state, reason);
      } catch {}
    }
  }

  private pruneOldRecords(now: number): void {
    const cutoff = now - 3600_000;
    this.txHistory = this.txHistory.filter((t) => t.timestamp > cutoff);
  }
}
