import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  StrategyAllocation,
  RebalancePlan,
  RebalanceAction,
  AllocationWeights,
  KeeperConfig,
  ProtocolData,
  StrategyConfig,
} from "../types";

export class RebalanceEngine {
  private readonly config: KeeperConfig;
  private readonly vaultPubkey: PublicKey;
  private readonly strategiesById: Map<string, StrategyConfig>;

  constructor(config: KeeperConfig) {
    this.config = config;
    this.vaultPubkey = new PublicKey(config.vaultPubkey);
    this.strategiesById = new Map(
      config.strategies.map((strategy) => [strategy.id, strategy])
    );
  }

  async computeRebalancePlan(
    currentAllocations: StrategyAllocation[],
    targetWeights: AllocationWeights,
    totalVaultUsdc: number
  ): Promise<RebalancePlan | null> {
    const allocations = this.withTargetAmounts(
      currentAllocations,
      targetWeights,
      totalVaultUsdc
    );
    const totalDriftPct = this.computeTotalDriftPct(allocations);

    if (totalDriftPct < this.config.driftThresholdPct) {
      return null;
    }

    return {
      vaultPubkey: this.vaultPubkey,
      timestamp: Date.now(),
      withdrawals: this.computeWithdrawals(allocations),
      deposits: this.computeDeposits(allocations),
      totalDriftPct,
      trigger: "drift",
    };
  }

  shouldRebalance(
    currentAllocations: StrategyAllocation[],
    previousApys: Map<string, number>,
    currentApys: Map<string, number>
  ): { should: boolean; trigger: "drift" | "apy_change" } {
    const driftTriggered =
      this.computeTotalDriftPct(currentAllocations) >=
      this.config.driftThresholdPct;
    const apyChangeTriggered = this.hasSignificantApyChange(
      previousApys,
      currentApys
    );

    if (apyChangeTriggered) {
      return { should: true, trigger: "apy_change" };
    }

    if (driftTriggered) {
      return { should: true, trigger: "drift" };
    }

    return { should: false, trigger: "drift" };
  }

  private computeWithdrawals(
    allocations: StrategyAllocation[]
  ): RebalanceAction[] {
    return allocations
      .filter((allocation) => allocation.currentWeight > allocation.targetWeight)
      .map((allocation) => {
        const amountUsdc =
          (allocation.currentAmountUsdc - allocation.targetAmountUsdc) * 0.999;

        if (amountUsdc <= 0) {
          return null;
        }

        const instructions: TransactionInstruction[] = [];

        return {
          strategyId: allocation.strategyId,
          strategyPubkey: allocation.strategyPubkey,
          protocol: allocation.protocol as ProtocolData["protocol"],
          direction: "withdraw",
          amountUsdc,
          instructions,
        };
      })
      .filter((action): action is RebalanceAction => action !== null);
  }

  private computeDeposits(allocations: StrategyAllocation[]): RebalanceAction[] {
    return allocations
      .filter((allocation) => allocation.currentWeight < allocation.targetWeight)
      .map((allocation) => {
        const amountUsdc =
          allocation.targetAmountUsdc - allocation.currentAmountUsdc;

        if (amountUsdc <= 0) {
          return null;
        }

        const instructions: TransactionInstruction[] = [];

        return {
          strategyId: allocation.strategyId,
          strategyPubkey: allocation.strategyPubkey,
          protocol: allocation.protocol as ProtocolData["protocol"],
          direction: "deposit",
          amountUsdc,
          instructions,
        };
      })
      .filter((action): action is RebalanceAction => action !== null);
  }

  private withTargetAmounts(
    currentAllocations: StrategyAllocation[],
    targetWeights: AllocationWeights,
    totalVaultUsdc: number
  ): StrategyAllocation[] {
    return currentAllocations.map((allocation) => {
      const strategy = this.strategiesById.get(allocation.strategyId);
      const targetWeight =
        targetWeights.weights[strategy?.id ?? allocation.strategyId] ??
        allocation.targetWeight;

      return {
        ...allocation,
        targetWeight,
        targetAmountUsdc: targetWeight * totalVaultUsdc,
      };
    });
  }

  private computeTotalDriftPct(allocations: StrategyAllocation[]): number {
    const totalDrift = allocations.reduce(
      (sum, allocation) =>
        sum + Math.abs(allocation.currentWeight - allocation.targetWeight),
      0
    );

    return totalDrift / 2;
  }

  private hasSignificantApyChange(
    previousApys: Map<string, number>,
    currentApys: Map<string, number>
  ): boolean {
    for (const [strategyId, currentApy] of currentApys) {
      const previousApy = previousApys.get(strategyId);

      if (
        previousApy !== undefined &&
        Math.abs(currentApy - previousApy) > this.config.apyChangeThresholdPct
      ) {
        return true;
      }
    }

    return false;
  }
}
