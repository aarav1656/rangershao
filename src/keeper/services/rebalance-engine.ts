import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  StrategyAllocation,
  RebalancePlan,
  RebalanceAction,
  AllocationWeights,
  KeeperConfig,
  ProtocolData,
  StrategyConfig,
} from "../types";
import { VoltrInstructionBuilder } from "./voltr-instruction-builder";

export class RebalanceEngine {
  private readonly config: KeeperConfig;
  private readonly vaultPubkey: PublicKey;
  private readonly strategiesById: Map<string, StrategyConfig>;
  private readonly instructionBuilder: VoltrInstructionBuilder;
  private readonly managerPubkey: PublicKey;

  constructor(config: KeeperConfig, connection: Connection, managerPubkey: PublicKey) {
    this.config = config;
    this.vaultPubkey = new PublicKey(config.vaultPubkey);
    this.managerPubkey = managerPubkey;
    this.strategiesById = new Map(
      config.strategies.map((strategy) => [strategy.id, strategy])
    );
    this.instructionBuilder = new VoltrInstructionBuilder(connection);
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

    const [withdrawals, deposits] = await Promise.all([
      this.computeWithdrawals(allocations),
      this.computeDeposits(allocations),
    ]);

    return {
      vaultPubkey: this.vaultPubkey,
      timestamp: Date.now(),
      withdrawals,
      deposits,
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

  private async computeWithdrawals(
    allocations: StrategyAllocation[]
  ): Promise<RebalanceAction[]> {
    const actions: RebalanceAction[] = [];

    for (const allocation of allocations) {
      if (allocation.currentWeight <= allocation.targetWeight) continue;

      const amountUsdc =
        (allocation.currentAmountUsdc - allocation.targetAmountUsdc) * 0.999;
      if (amountUsdc <= 0) continue;

      const amountLamports = new BN(Math.floor(amountUsdc * 1e6));
      const marginfiAccount = this.config.marginfiAccount
        ? new PublicKey(this.config.marginfiAccount)
        : undefined;

      const instructions = await this.instructionBuilder.buildWithdrawInstructions(
        allocation.protocol,
        {
          manager: this.managerPubkey,
          vault: this.vaultPubkey,
          amount: amountLamports,
          assetTokenProgram: TOKEN_PROGRAM_ID,
          marginfiAccount,
        }
      );

      actions.push({
        strategyId: allocation.strategyId,
        strategyPubkey: allocation.strategyPubkey,
        protocol: allocation.protocol as ProtocolData["protocol"],
        direction: "withdraw",
        amountUsdc,
        instructions,
      });
    }

    return actions;
  }

  private async computeDeposits(
    allocations: StrategyAllocation[]
  ): Promise<RebalanceAction[]> {
    const actions: RebalanceAction[] = [];

    for (const allocation of allocations) {
      if (allocation.currentWeight >= allocation.targetWeight) continue;

      const amountUsdc =
        allocation.targetAmountUsdc - allocation.currentAmountUsdc;
      if (amountUsdc <= 0) continue;

      const amountLamports = new BN(Math.floor(amountUsdc * 1e6));
      const marginfiAccount = this.config.marginfiAccount
        ? new PublicKey(this.config.marginfiAccount)
        : undefined;

      const instructions = await this.instructionBuilder.buildDepositInstructions(
        allocation.protocol,
        {
          manager: this.managerPubkey,
          vault: this.vaultPubkey,
          amount: amountLamports,
          assetTokenProgram: TOKEN_PROGRAM_ID,
          marginfiAccount,
        }
      );

      actions.push({
        strategyId: allocation.strategyId,
        strategyPubkey: allocation.strategyPubkey,
        protocol: allocation.protocol as ProtocolData["protocol"],
        direction: "deposit",
        amountUsdc,
        instructions,
      });
    }

    return actions;
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
