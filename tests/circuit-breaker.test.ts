import { CircuitBreaker } from "../security/circuit-breaker/circuit-breaker";
import { SecurityConfig } from "../security/config/security-config";

function createSecurityConfig(): SecurityConfig {
  return {
    cobo: {
      apiSecret: "test-secret",
      env: "dev",
      vaultId: "vault-id",
      walletId: "wallet-id",
      callbackUrl: "https://example.com/callback",
      orgId: "org-id",
    },
    circuitBreaker: {
      maxTransactionsPerMinute: 3,
      maxTransactionsPerHour: 10,
      maxSingleTransactionUsd: 1_000,
      maxDailyVolumeUsd: 5_000,
      healthFactorMinimum: 1.2,
      healthFactorEmergency: 1.05,
      cooldownAfterTripMs: 300_000,
    },
    monitoring: {
      heliusApiKey: "helius-key",
      heliusWebhookSecret: "webhook-secret",
      alertWebhookUrl: "https://example.com/alert",
      healthCheckIntervalMs: 30_000,
      vaultAddress: "vault-address",
      watchAddresses: [],
    },
    rateLimit: {
      rebalanceMinIntervalMs: 60_000,
      maxRebalancesPerDay: 5,
    },
  };
}

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows normal transactions", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    const result = breaker.checkCanExecute({
      amountUsd: 500,
      healthFactor: 1.5,
      isRebalance: false,
    });

    expect(result).toEqual({
      allowed: true,
      warnings: [],
    });
  });

  it("blocks when health factor drops below emergency threshold", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    const result = breaker.checkCanExecute({
      amountUsd: 100,
      healthFactor: 1.0,
      isRebalance: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Health factor critical threshold breached");

    const status = breaker.getStatus();
    expect(status.isPaused).toBe(true);
    expect(status.tripCount).toBe(1);
    expect(status.pauseReason).toContain("Health factor critical");
  });

  it("warns but allows non-rebalance transactions when health factor is below minimum", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    const result = breaker.checkCanExecute({
      amountUsd: 100,
      healthFactor: 1.1,
      isRebalance: false,
    });

    expect(result.allowed).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("Health factor warning");
  });

  it("blocks rebalances when health factor is below minimum", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    const result = breaker.checkCanExecute({
      amountUsd: 100,
      healthFactor: 1.1,
      isRebalance: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Rebalance blocked due to low health factor");
    expect(result.warnings[0]).toContain("Health factor warning");
  });

  it("blocks transactions exceeding the single transaction limit", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    const result = breaker.checkCanExecute({
      amountUsd: 1_500,
      healthFactor: 1.5,
      isRebalance: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Transaction size exceeds limit");
  });

  it("blocks when the max transactions per minute limit is exceeded", () => {
    const config = createSecurityConfig();
    const breaker = new CircuitBreaker(config);

    for (let i = 0; i < config.circuitBreaker.maxTransactionsPerMinute; i++) {
      breaker.recordTransaction(100, false);
    }

    const result = breaker.checkCanExecute({
      amountUsd: 100,
      healthFactor: 1.5,
      isRebalance: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Max transactions per minute exceeded");
  });

  it("blocks when daily volume would exceed the configured limit", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    breaker.recordTransaction(4_500, false);

    const result = breaker.checkCanExecute({
      amountUsd: 600,
      healthFactor: 1.5,
      isRebalance: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Daily volume would exceed limit");
  });

  it("tracks emergency pause and resume", () => {
    const config = createSecurityConfig();
    const breaker = new CircuitBreaker(config);

    breaker.emergencyPause("manual test");
    expect(breaker.getStatus().isPaused).toBe(true);

    vi.advanceTimersByTime(config.circuitBreaker.cooldownAfterTripMs);
    breaker.resume();

    const status = breaker.getStatus();
    expect(status.isPaused).toBe(false);
    expect(status.pauseReason).toBeNull();
  });

  it("blocks during cooldown after a trip", () => {
    const config = createSecurityConfig();
    const breaker = new CircuitBreaker(config);

    breaker.emergencyPause("manual test");
    (breaker as any).isPaused = false;

    const result = breaker.checkCanExecute({
      amountUsd: 100,
      healthFactor: 1.5,
      isRebalance: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Cooldown active");
  });

  it("records rebalance count correctly", () => {
    const breaker = new CircuitBreaker(createSecurityConfig());

    breaker.recordTransaction(250, true);
    vi.advanceTimersByTime(1_000);
    breaker.recordTransaction(300, true);

    const status = breaker.getStatus();
    expect(status.rebalancesToday).toBe(2);
    expect(status.lastRebalanceTime).toBe(Date.now());
    expect(status.txLastMinute).toBe(2);
  });
});
