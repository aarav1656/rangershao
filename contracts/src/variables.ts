import { BN } from "@coral-xyz/anchor";
import { VaultConfig, VaultParams } from "@voltr/vault-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const THREE_MONTHS_SECONDS = 90 * 86400;

export const vaultConfig: VaultConfig = {
  maxCap: new BN("18446744073709551615"),
  startAtTs: new BN(0),
  managerPerformanceFee: 1500,
  adminPerformanceFee: 500,
  managerManagementFee: 0,
  adminManagementFee: 0,
  lockedProfitDegradationDuration: new BN(86400),
  redemptionFee: 0,
  issuanceFee: 0,
  withdrawalWaitingPeriod: new BN(THREE_MONTHS_SECONDS),
};

export const vaultParams: VaultParams = {
  config: vaultConfig,
  name: "Ranger Hybrid Alpha",
  description: "RWA + Multi-DeFi USDC yield optimizer",
};

export const adminFilePath =
  process.env.ADMIN_KEYPAIR_PATH || "./keys/admin.json";
export const managerFilePath =
  process.env.MANAGER_KEYPAIR_PATH || "./keys/manager.json";
// Mainnet USDC by default; set ASSET_MINT to devnet USDC for testing
export const assetMintAddress =
  process.env.ASSET_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const assetTokenProgram = TOKEN_PROGRAM_ID.toBase58();

export const vaultAddress = process.env.VAULT_ADDRESS || "";
export const useLookupTable = true;
export const lookupTableAddress = process.env.LOOKUP_TABLE_ADDRESS || "";
export const marginfiAccount = process.env.MARGINFI_ACCOUNT || "";

export const depositAssetAmountPerStrategy =
  process.env.DEPOSIT_AMOUNT || "1000000";
export const withdrawAssetAmountPerStrategy =
  process.env.WITHDRAW_AMOUNT || "1000000";

export const outputMintAddress = assetMintAddress;
export const outputTokenProgram = assetTokenProgram;
