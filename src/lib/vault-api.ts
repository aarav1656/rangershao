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

export async function fetchVaultState(): Promise<VaultState> {
  if (!VAULT_ADDRESS) {
    throw new Error("NOT_IMPLEMENTED: VAULT_ADDRESS not configured");
  }
  const connection = getConnection();
  const pubkey = new PublicKey(VAULT_ADDRESS);
  const accountInfo = await connection.getAccountInfo(pubkey);
  if (!accountInfo) {
    throw new Error("Vault account not found on-chain");
  }
  // TODO: Decode account data using vault IDL once available from Solana Contract Engineer
  throw new Error("NOT_IMPLEMENTED: Vault account deserialization pending IDL from contract team");
}

export async function fetchApyHistory(days: number): Promise<ApyDataPoint[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("NOT_IMPLEMENTED: API_BASE_URL not configured for historical APY data");
  }
  const res = await fetch(`${apiBase}/api/vault/apy-history?days=${days}`);
  if (!res.ok) throw new Error(`APY history fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchAllocations(): Promise<AllocationEntry[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("NOT_IMPLEMENTED: API_BASE_URL not configured for allocation data");
  }
  const res = await fetch(`${apiBase}/api/vault/allocations`);
  if (!res.ok) throw new Error(`Allocations fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchRebalanceHistory(): Promise<RebalanceEvent[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("NOT_IMPLEMENTED: API_BASE_URL not configured for rebalance history");
  }
  const res = await fetch(`${apiBase}/api/vault/rebalance-history`);
  if (!res.ok) throw new Error(`Rebalance history fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchRiskMetrics(): Promise<RiskMetrics> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("NOT_IMPLEMENTED: API_BASE_URL not configured for risk metrics");
  }
  const res = await fetch(`${apiBase}/api/vault/risk-metrics`);
  if (!res.ok) throw new Error(`Risk metrics fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPnlHistory(): Promise<PnlDataPoint[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error("NOT_IMPLEMENTED: API_BASE_URL not configured for PnL data");
  }
  const res = await fetch(`${apiBase}/api/vault/pnl-history`);
  if (!res.ok) throw new Error(`PnL history fetch failed: ${res.status}`);
  return res.json();
}

export { RPC_URL, VAULT_PROGRAM_ID, VAULT_ADDRESS };
