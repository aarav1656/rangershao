export interface SecurityConfig {
  cobo: {
    apiSecret: string;
    env: "dev" | "prod";
    vaultId: string;
    walletId: string;
    callbackUrl: string;
    orgId: string;
  };
  circuitBreaker: {
    maxTransactionsPerMinute: number;
    maxTransactionsPerHour: number;
    maxSingleTransactionUsd: number;
    maxDailyVolumeUsd: number;
    healthFactorMinimum: number;
    healthFactorEmergency: number;
    cooldownAfterTripMs: number;
  };
  monitoring: {
    heliusApiKey: string;
    heliusWebhookSecret: string;
    alertWebhookUrl: string;
    healthCheckIntervalMs: number;
    vaultAddress: string;
    watchAddresses: string[];
  };
  rateLimit: {
    rebalanceMinIntervalMs: number;
    maxRebalancesPerDay: number;
  };
}

export function loadSecurityConfig(): SecurityConfig {
  const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  };

  const optional = (key: string, fallback: string): string =>
    process.env[key] ?? fallback;

  return {
    cobo: {
      apiSecret: required("COBO_API_SECRET"),
      env: (optional("COBO_ENV", "dev") as "dev" | "prod"),
      vaultId: required("COBO_VAULT_ID"),
      walletId: required("COBO_WALLET_ID"),
      callbackUrl: optional("COBO_CALLBACK_URL", ""),
      orgId: required("COBO_ORG_ID"),
    },
    circuitBreaker: {
      maxTransactionsPerMinute: Number(optional("CB_MAX_TX_PER_MIN", "5")),
      maxTransactionsPerHour: Number(optional("CB_MAX_TX_PER_HOUR", "30")),
      maxSingleTransactionUsd: Number(optional("CB_MAX_SINGLE_TX_USD", "10000")),
      maxDailyVolumeUsd: Number(optional("CB_MAX_DAILY_VOLUME_USD", "100000")),
      healthFactorMinimum: Number(optional("CB_HEALTH_FACTOR_MIN", "1.2")),
      healthFactorEmergency: Number(optional("CB_HEALTH_FACTOR_EMERGENCY", "1.05")),
      cooldownAfterTripMs: Number(optional("CB_COOLDOWN_MS", "300000")),
    },
    monitoring: {
      heliusApiKey: required("HELIUS_API_KEY"),
      heliusWebhookSecret: optional("HELIUS_WEBHOOK_SECRET", ""),
      alertWebhookUrl: optional("ALERT_WEBHOOK_URL", ""),
      healthCheckIntervalMs: Number(optional("HEALTH_CHECK_INTERVAL_MS", "30000")),
      vaultAddress: required("VAULT_ADDRESS"),
      watchAddresses: optional("WATCH_ADDRESSES", "").split(",").filter(Boolean),
    },
    rateLimit: {
      rebalanceMinIntervalMs: Number(optional("REBALANCE_MIN_INTERVAL_MS", "60000")),
      maxRebalancesPerDay: Number(optional("MAX_REBALANCES_PER_DAY", "48")),
    },
  };
}
