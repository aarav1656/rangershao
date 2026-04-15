export interface VaultState {
  tvl: number;
  tvlChange24h: number;
  currentApy: number;
  totalDepositors: number;
  vaultAddress: string;
  lastRebalance: string;
}

export interface ApyDataPoint {
  date: string;
  apy: number;
}

export interface AllocationEntry {
  protocol: string;
  weight: number;
  value: number;
  apy: number;
  color: string;
}

export interface RebalanceEvent {
  timestamp: string;
  txSignature: string;
  fromProtocol: string;
  toProtocol: string;
  amount: number;
  reason: string;
}

export interface RiskMetrics {
  currentVaR: number;
  healthFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility30d: number;
  correlationToSol: number;
}

export interface PnlDataPoint {
  date: string;
  cumulative: number;
  daily: number;
}

export interface DepositWithdrawParams {
  action: "deposit" | "withdraw";
  amount: number;
  walletAddress: string;
}
