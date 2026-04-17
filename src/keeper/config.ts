import { KeeperConfig, StrategyConfig } from "./types";

export function loadConfig(): KeeperConfig {
  const heliusRpcUrl = requireEnv("HELIUS_RPC_URL");
  const heliusApiKey = requireEnv("HELIUS_API_KEY");
  const vaultPubkey = requireEnv("VAULT_PUBKEY");
  const managerPubkey = requireEnv("MANAGER_PUBKEY");

  return {
    vaultPubkey,
    managerPubkey,
    heliusRpcUrl,
    heliusApiKey,
    intervalMs: parseInt(process.env.KEEPER_INTERVAL_MS ?? "1800000", 10),
    driftThresholdPct: parseFloat(
      process.env.DRIFT_THRESHOLD_PCT ?? "2.0"
    ),
    apyChangeThresholdPct: parseFloat(
      process.env.APY_CHANGE_THRESHOLD_PCT ?? "1.0"
    ),
    mlModelUrl: process.env.ML_MODEL_URL || undefined,
    coboApiBaseUrl: process.env.COBO_API_BASE_URL || undefined,
    marginfiAccount: process.env.MARGINFI_ACCOUNT || undefined,
    maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS ?? "50", 10),
    strategies: parseStrategies(),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your .env file or shell environment.`
    );
  }
  return value;
}

function parseStrategies(): StrategyConfig[] {
  const raw = process.env.KEEPER_STRATEGIES;
  if (!raw) {
    throw new Error(
      `Missing required environment variable: KEEPER_STRATEGIES. ` +
        `Expected a JSON array of strategy configs, e.g.: ` +
        `KEEPER_STRATEGIES='[{"id":"kamino-usdc","pubkey":"...","protocol":"kamino","enabled":true,"maxAllocationPct":40,"minAllocationPct":5}]'`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const e = err as Error;
    throw new Error(
      `Failed to parse KEEPER_STRATEGIES as JSON: ${e.message}. ` +
        `Value received: ${raw.substring(0, 200)}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `KEEPER_STRATEGIES must be a JSON array, got ${typeof parsed}`
    );
  }

  if (parsed.length === 0) {
    throw new Error(
      "KEEPER_STRATEGIES is an empty array. At least one strategy is required."
    );
  }

  const validProtocols = new Set([
    "kamino",
    "marginfi",
    "jupiter_lend",
    "raydium",
  ]);

  return parsed.map((item: any, index: number) => {
    if (!item.id || typeof item.id !== "string") {
      throw new Error(
        `KEEPER_STRATEGIES[${index}] missing or invalid "id" (expected string)`
      );
    }
    if (!item.pubkey || typeof item.pubkey !== "string") {
      throw new Error(
        `KEEPER_STRATEGIES[${index}] missing or invalid "pubkey" (expected string)`
      );
    }
    if (!item.protocol || !validProtocols.has(item.protocol)) {
      throw new Error(
        `KEEPER_STRATEGIES[${index}] invalid "protocol": "${item.protocol}". ` +
          `Must be one of: ${[...validProtocols].join(", ")}`
      );
    }

    return {
      id: item.id,
      pubkey: item.pubkey,
      protocol: item.protocol as StrategyConfig["protocol"],
      enabled: item.enabled !== false,
      maxAllocationPct:
        typeof item.maxAllocationPct === "number"
          ? item.maxAllocationPct
          : 60,
      minAllocationPct:
        typeof item.minAllocationPct === "number"
          ? item.minAllocationPct
          : 0,
    };
  });
}
