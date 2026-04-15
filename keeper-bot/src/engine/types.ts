// Re-export shared types from the root keeper module
export {
  StrategyAllocation,
  RebalancePlan,
  RebalanceAction,
  UnsignedTransaction,
  TransactionSigner,
  TransactionBroadcaster,
  ProtocolData,
  AllocationWeights,
  KeeperConfig,
  StrategyConfig,
} from "../../src/keeper/types";

// Additional types specific to the keeper-bot engine
export interface CurrentAllocation {
  strategyId: string;
  protocol: string;
  currentWeight: number;
  currentAmountUsdc: number;
}

export interface RebalanceDecision {
  should: boolean;
  trigger: string;
  totalDrift: number;
}
