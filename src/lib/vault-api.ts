import { Connection, PublicKey } from "@solana/web3.js";
import type {
  VaultState,
  ApyDataPoint,
  AllocationEntry,
  RebalanceEvent,
  RiskMetrics,
  PnlDataPoint,
} from "./types";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const VAULT_PROGRAM_ID = process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID || "";
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "";

function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

async function fetchVaultData(): Promise<any> {
  const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000");
  const res = await fetch(`${baseUrl}/api/vault`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Vault API returned ${res.status}`);
  return res.json();
}

export async function fetchVaultState(): Promise<VaultState> {
  const data = await fetchVaultData();
  return {
    tvl: data.overview?.tvl ?? 0,
    tvlChange24h: data.overview?.tvlChange24h ?? 0,
    currentApy: data.overview?.currentApy ?? 0,
    totalDepositors: data.overview?.totalDepositors ?? 0,
    vaultAddress: data.vaultOnChain?.exists ? VAULT_ADDRESS : "",
    lastRebalance: data.overview?.lastRebalance ?? "",
    dataSource: data.dataSource ?? "backtest",
  } as unknown as VaultState;
}

export async function fetchApyHistory(days: number): Promise<ApyDataPoint[]> {
  const data = await fetchVaultData();
  const history = data.apyHistory ?? [];
  return history.slice(-days);
}

export async function fetchAllocations(): Promise<AllocationEntry[]> {
  const data = await fetchVaultData();
  return data.allocations ?? [];
}

export async function fetchRebalanceHistory(): Promise<RebalanceEvent[]> {
  const data = await fetchVaultData();
  return data.rebalances ?? [];
}

export async function fetchRiskMetrics(): Promise<RiskMetrics> {
  const data = await fetchVaultData();
  return data.riskMetrics ?? {};
}

export async function fetchPnlHistory(): Promise<PnlDataPoint[]> {
  const data = await fetchVaultData();
  return data.pnlHistory ?? [];
}

export { RPC_URL, VAULT_PROGRAM_ID, VAULT_ADDRESS };
