import { VersionedTransaction, TransactionInstruction, PublicKey } from "@solana/web3.js";

export interface StrategyAllocation {
  strategyId: string;
  strategyPubkey: PublicKey;
  protocol: "kamino" | "marginfi" | "jupiter_lend" | "solend" | "raydium";
  currentWeight: number;
  targetWeight: number;
  currentAmountUsdc: number;
  targetAmountUsdc: number;
}

export interface RebalancePlan {
  vaultPubkey: PublicKey;
  timestamp: number;
  withdrawals: RebalanceAction[];
  deposits: RebalanceAction[];
  totalDriftPct: number;
  trigger: "drift" | "apy_change" | "manual";
}

export interface RebalanceAction {
  strategyId: string;
  strategyPubkey: PublicKey;
  protocol: string;
  direction: "deposit" | "withdraw";
  amountUsdc: number;
  instructions: TransactionInstruction[];
}

export interface UnsignedTransaction {
  id: string;
  description: string;
  transaction: VersionedTransaction;
  rebalancePlan: RebalancePlan;
  createdAt: number;
}

export interface TransactionSigner {
  sign(tx: UnsignedTransaction): Promise<VersionedTransaction>;
}

export interface TransactionBroadcaster {
  send(signedTx: VersionedTransaction): Promise<string>;
  confirm(signature: string, timeoutMs?: number): Promise<boolean>;
}

export interface ProtocolData {
  protocol: string;
  strategyId: string;
  apy: number;
  tvl: number;
  utilizationRate: number;
  healthFactor?: number;
  lastUpdated: number;
}

export interface AllocationWeights {
  weights: Record<string, number>;
  confidence: number;
  source: "ml_model" | "fallback_greedy";
}

export interface KeeperConfig {
  vaultPubkey: string;
  managerPubkey: string;
  heliusRpcUrl: string;
  heliusApiKey: string;
  intervalMs: number;
  driftThresholdPct: number;
  apyChangeThresholdPct: number;
  mlModelUrl?: string;
  coboApiBaseUrl?: string;
  marginfiAccount?: string;
  maxSlippageBps: number;
  strategies: StrategyConfig[];
}

export interface StrategyConfig {
  id: string;
  pubkey: string;
  protocol: "kamino" | "marginfi" | "jupiter_lend" | "solend" | "raydium";
  enabled: boolean;
  maxAllocationPct: number;
  minAllocationPct: number;
}
