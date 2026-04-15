import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface StrategyConfig {
  id: string;
  pubkey: string;
  protocol: string;
  enabled: boolean;
  maxAllocationPct: number;
  minAllocationPct: number;
}

export interface KeeperBotConfig {
  heliusRpcUrl: string;
  heliusApiKey: string;
  vaultAddress: PublicKey;
  vaultAssetMint: PublicKey;
  assetTokenProgram: PublicKey;
  mlModelUrl?: string;
  coboApiSecret: string;
  coboWalletId: string;
  coboVaultId: string;
  coboOrgId: string;
  coboEnv: "dev" | "prod";
  keeperIntervalMs: number;
  driftThresholdPct: number;
  apyChangeThresholdPct: number;
  maxSlippageBps: number;
  strategies: StrategyConfig[];
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export function loadConfig(): KeeperBotConfig {
  const heliusRpcUrl = requireEnv("HELIUS_RPC_URL");

  // Extract API key from the RPC URL (Helius format: https://mainnet.helius-rpc.com/?api-key=XXX)
  const urlObj = new URL(heliusRpcUrl);
  const heliusApiKey =
    urlObj.searchParams.get("api-key") || requireEnv("HELIUS_API_KEY");

  const vaultAddress = new PublicKey(requireEnv("VAULT_ADDRESS"));

  const vaultAssetMint = new PublicKey(
    optionalEnv(
      "VAULT_ASSET_MINT",
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    )
  );

  const assetTokenProgramStr = optionalEnv(
    "ASSET_TOKEN_PROGRAM",
    TOKEN_PROGRAM_ID.toBase58()
  );
  const assetTokenProgram = new PublicKey(assetTokenProgramStr);

  const mlModelUrl = process.env.ML_MODEL_URL || undefined;

  const coboApiSecret = requireEnv("COBO_API_SECRET");
  const coboWalletId = requireEnv("COBO_WALLET_ID");
  const coboVaultId = requireEnv("COBO_VAULT_ID");
  const coboOrgId = requireEnv("COBO_ORG_ID");
  const coboEnv = optionalEnv("COBO_ENV", "dev") as "dev" | "prod";

  const keeperIntervalMs = Number(
    optionalEnv("KEEPER_INTERVAL_MS", "1800000")
  );
  const driftThresholdPct = Number(
    optionalEnv("DRIFT_THRESHOLD_PCT", "2")
  );
  const apyChangeThresholdPct = Number(
    optionalEnv("APY_CHANGE_THRESHOLD_PCT", "1")
  );
  const maxSlippageBps = Number(optionalEnv("MAX_SLIPPAGE_BPS", "100"));

  const strategiesRaw = optionalEnv("STRATEGIES", "[]");
  let strategies: StrategyConfig[];
  try {
    strategies = JSON.parse(strategiesRaw) as StrategyConfig[];
  } catch {
    throw new Error(
      `Invalid STRATEGIES JSON: ${strategiesRaw}`
    );
  }

  return {
    heliusRpcUrl,
    heliusApiKey,
    vaultAddress,
    vaultAssetMint,
    assetTokenProgram,
    mlModelUrl,
    coboApiSecret,
    coboWalletId,
    coboVaultId,
    coboOrgId,
    coboEnv,
    keeperIntervalMs,
    driftThresholdPct,
    apyChangeThresholdPct,
    maxSlippageBps,
    strategies,
  };
}
