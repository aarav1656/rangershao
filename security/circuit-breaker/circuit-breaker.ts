import { SecurityConfig } from '../config/security-config';

export interface TransactionCheckParams {
  amountUsd: number;
  healthFactor: number;
  isRebalance: boolean;
}

export interface TransactionCheckResult {
  allowed: boolean;
  reason?: string;
  warnings: string[];
}

export interface CircuitBreakerStatus {
  isPaused: boolean;
  pauseReason: string | null;
  tripCount: number;
  txLastMinute: number;
  txLastHour: number;
  dailyVolumeUsd: number;
  rebalancesToday: number;
  lastRebalanceTime: number;
  cooldownActive: boolean;
  cooldownRemainingMs: number;
}

interface TransactionLogEntry {
  timestamp: number;
  amountUsd: number;
}

export class CircuitBreaker {
  private config: SecurityConfig;
  private transactionLog: TransactionLogEntry[] = [];
  private lastRebalanceTime: number = 0;
  private rebalancesToday: number = 0;
  private dailyResetDate: string = this.getTodayDate();
  private isPaused: boolean = false;
  private pauseReason: string | null = null;
  private lastTripTime: number | null = null;
  private tripCount: number = 0;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Check if a transaction is allowed based on circuit breaker rules.
   */
  checkCanExecute(params: TransactionCheckParams): TransactionCheckResult {
    this.resetDailyCounters();
    this.pruneOldTransactions();

    const warnings: string[] = [];

    // Check 1: Emergency pause active
    if (this.isPaused) {
      return {
        allowed: false,
        reason: `Circuit breaker paused: ${this.pauseReason}`,
        warnings,
      };
    }

    // Check 2: Cooldown active after trip
    const cooldownRemaining = this.getCooldownRemaining();
    if (cooldownRemaining > 0) {
      return {
        allowed: false,
        reason: `Cooldown active. Remaining: ${cooldownRemaining}ms`,
        warnings,
      };
    }

    // Check 3: Health factor emergency threshold
    if (params.healthFactor < this.config.circuitBreaker.healthFactorEmergency) {
      this.emergencyPause(
        `Health factor critical: ${params.healthFactor.toFixed(2)} < ${this.config.circuitBreaker.healthFactorEmergency}`
      );
      return {
        allowed: false,
        reason: `Health factor critical threshold breached`,
        warnings,
      };
    }

    // Check 4: Health factor minimum threshold
    if (params.healthFactor < this.config.circuitBreaker.healthFactorMinimum) {
      warnings.push(
        `Health factor warning: ${params.healthFactor.toFixed(2)} < ${this.config.circuitBreaker.healthFactorMinimum}`
      );
      // Block rebalances but allow emergency withdrawals
      if (params.isRebalance) {
        return {
          allowed: false,
          reason: `Rebalance blocked due to low health factor`,
          warnings,
        };
      }
    }

    // Check 5: Single transaction limit
    if (params.amountUsd > this.config.circuitBreaker.maxSingleTransactionUsd) {
      return {
        allowed: false,
        reason: `Transaction size exceeds limit: $${params.amountUsd.toFixed(2)} > $${this.config.circuitBreaker.maxSingleTransactionUsd.toFixed(2)}`,
        warnings,
      };
    }

    // Check 6: Transactions in last minute
    const txLastMinute = this.getTransactionsInLastMinute();
    if (txLastMinute >= this.config.circuitBreaker.maxTransactionsPerMinute) {
      return {
        allowed: false,
        reason: `Max transactions per minute exceeded: ${txLastMinute} >= ${this.config.circuitBreaker.maxTransactionsPerMinute}`,
        warnings,
      };
    }

    // Check 7: Transactions in last hour
    const txLastHour = this.getTransactionsInLastHour();
    if (txLastHour >= this.config.circuitBreaker.maxTransactionsPerHour) {
      return {
        allowed: false,
        reason: `Max transactions per hour exceeded: ${txLastHour} >= ${this.config.circuitBreaker.maxTransactionsPerHour}`,
        warnings,
      };
    }

    // Check 8: Daily volume limit
    const dailyVolume = this.getDailyVolume();
    if (
      dailyVolume + params.amountUsd >
      this.config.circuitBreaker.maxDailyVolumeUsd
    ) {
      return {
        allowed: false,
        reason: `Daily volume would exceed limit: $${(dailyVolume + params.amountUsd).toFixed(2)} > $${this.config.circuitBreaker.maxDailyVolumeUsd.toFixed(2)}`,
        warnings,
      };
    }

    // Check 9: Rebalance-specific checks
    if (params.isRebalance) {
      const timeSinceLastRebalance = Date.now() - this.lastRebalanceTime;
      if (
        timeSinceLastRebalance <
        this.config.rateLimit.rebalanceMinIntervalMs
      ) {
        return {
          allowed: false,
          reason: `Rebalance cooldown active: ${timeSinceLastRebalance}ms < ${this.config.rateLimit.rebalanceMinIntervalMs}ms`,
          warnings,
        };
      }

      if (
        this.rebalancesToday >=
        this.config.rateLimit.maxRebalancesPerDay
      ) {
        return {
          allowed: false,
          reason: `Max rebalances per day exceeded: ${this.rebalancesToday} >= ${this.config.rateLimit.maxRebalancesPerDay}`,
          warnings,
        };
      }
    }

    return {
      allowed: true,
      warnings,
    };
  }

  /**
   * Record a transaction in the log.
   */
  recordTransaction(amountUsd: number, isRebalance: boolean): void {
    this.resetDailyCounters();
    this.transactionLog.push({
      timestamp: Date.now(),
      amountUsd,
    });

    if (isRebalance) {
      this.lastRebalanceTime = Date.now();
      this.rebalancesToday++;
    }
  }

  /**
   * Emergency pause the circuit breaker.
   */
  emergencyPause(reason: string): void {
    this.isPaused = true;
    this.pauseReason = reason;
    this.lastTripTime = Date.now();
    this.tripCount++;
  }

  /**
   * Resume the circuit breaker (only if cooldown expired).
   */
  resume(): void {
    const cooldownRemaining = this.getCooldownRemaining();
    if (cooldownRemaining > 0) {
      throw new Error(
        `Cannot resume: cooldown active (${cooldownRemaining}ms remaining)`
      );
    }

    this.isPaused = false;
    this.pauseReason = null;
  }

  /**
   * Get the current status of the circuit breaker.
   */
  getStatus(): CircuitBreakerStatus {
    this.resetDailyCounters();
    this.pruneOldTransactions();

    return {
      isPaused: this.isPaused,
      pauseReason: this.pauseReason,
      tripCount: this.tripCount,
      txLastMinute: this.getTransactionsInLastMinute(),
      txLastHour: this.getTransactionsInLastHour(),
      dailyVolumeUsd: this.getDailyVolume(),
      rebalancesToday: this.rebalancesToday,
      lastRebalanceTime: this.lastRebalanceTime,
      cooldownActive: this.getCooldownRemaining() > 0,
      cooldownRemainingMs: Math.max(0, this.getCooldownRemaining()),
    };
  }

  /**
   * Get the number of transactions in the last minute.
   */
  private getTransactionsInLastMinute(): number {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return this.transactionLog.filter((tx) => tx.timestamp > oneMinuteAgo)
      .length;
  }

  /**
   * Get the number of transactions in the last hour.
   */
  private getTransactionsInLastHour(): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.transactionLog.filter((tx) => tx.timestamp > oneHourAgo).length;
  }

  /**
   * Get the total USD volume for today.
   */
  private getDailyVolume(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.transactionLog
      .filter((tx) => tx.timestamp > oneDayAgo)
      .reduce((sum, tx) => sum + tx.amountUsd, 0);
  }

  /**
   * Get remaining cooldown time in milliseconds.
   */
  private getCooldownRemaining(): number {
    if (!this.lastTripTime) {
      return 0;
    }

    const elapsed = Date.now() - this.lastTripTime;
    const remaining =
      this.config.circuitBreaker.cooldownAfterTripMs - elapsed;

    return Math.max(0, remaining);
  }

  /**
   * Remove transactions older than 24 hours from the log.
   */
  private pruneOldTransactions(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.transactionLog = this.transactionLog.filter(
      (tx) => tx.timestamp > oneDayAgo
    );
  }

  /**
   * Reset daily counters if the date has changed.
   */
  private resetDailyCounters(): void {
    const today = this.getTodayDate();

    if (today !== this.dailyResetDate) {
      this.dailyResetDate = today;
      this.rebalancesToday = 0;
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format.
   */
  private getTodayDate(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
