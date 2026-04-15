import axios from "axios";
import {
  ProtocolData,
  AllocationWeights,
  KeeperConfig,
  StrategyConfig,
} from "../types";

const ML_TIMEOUT_MS = 5_000;

export class AllocationEngine {
  private config: KeeperConfig;
  private mlModelUrl?: string;

  constructor(config: KeeperConfig) {
    this.config = config;
    this.mlModelUrl = config.mlModelUrl;
  }

  async getWeights(protocolData: ProtocolData[]): Promise<AllocationWeights> {
    if (this.mlModelUrl) {
      try {
        return await this.fetchMlWeights(protocolData);
      } catch (error) {
        const err = error as Error;
        console.warn(`[allocation-engine] ML model failed, using fallback: ${err.message}`);
      }
    }

    return this.computeGreedyWeights(protocolData);
  }

  private async fetchMlWeights(
    protocolData: ProtocolData[]
  ): Promise<AllocationWeights> {
    if (!this.mlModelUrl) {
      throw new Error("ML model URL is not configured");
    }

    const url = `${this.mlModelUrl.replace(/\/$/, "")}/predict`;
    const response = await axios.post<{
      weights: Record<string, number>;
      confidence: number;
    }>(
      url,
      { protocol_data: protocolData },
      { timeout: ML_TIMEOUT_MS }
    );

    return {
      weights: this.filterEnabledWeights(response.data.weights),
      confidence: response.data.confidence,
      source: "ml_model",
    };
  }

  private computeGreedyWeights(protocolData: ProtocolData[]): AllocationWeights {
    const strategyById = new Map<string, StrategyConfig>(
      this.config.strategies
        .filter((strategy) => strategy.enabled)
        .map((strategy) => [strategy.id, strategy])
    );

    const eligibleData = protocolData.filter((data) =>
      strategyById.has(data.strategyId)
    );

    if (eligibleData.length === 0) {
      return {
        weights: {},
        confidence: 0.5,
        source: "fallback_greedy",
      };
    }

    const scores: Record<string, number> = {};
    for (const data of eligibleData) {
      const tvlFactor = this.getTvlFactor(data.tvl);
      const utilizationFactor = 1 - data.utilizationRate * 0.3;
      scores[data.strategyId] = Math.max(data.apy * utilizationFactor * tvlFactor, 0);
    }

    const weights = this.normalizeWithConstraints(scores, strategyById);

    return {
      weights,
      confidence: 0.5,
      source: "fallback_greedy",
    };
  }

  private getTvlFactor(tvl: number): number {
    if (tvl > 10_000_000) {
      return 1.0;
    }

    if (tvl >= 1_000_000) {
      return 0.9;
    }

    return 0.7;
  }

  private normalizeWithConstraints(
    scores: Record<string, number>,
    strategyById: Map<string, StrategyConfig>
  ): Record<string, number> {
    const strategyIds = Object.keys(scores);
    const scoreTotal = strategyIds.reduce((sum, id) => sum + scores[id], 0);
    const targetWeights: Record<string, number> = {};

    for (const id of strategyIds) {
      targetWeights[id] =
        scoreTotal > 0 ? scores[id] / scoreTotal : 1 / strategyIds.length;
    }

    const bounds = new Map(
      strategyIds.map((id) => {
        const strategy = strategyById.get(id);
        const min = this.percentToWeight(strategy?.minAllocationPct ?? 0);
        const max = this.percentToWeight(strategy?.maxAllocationPct ?? 100);

        return [id, { min: Math.min(min, max), max: Math.max(min, max) }];
      })
    );

    const minTotal = strategyIds.reduce(
      (sum, id) => sum + (bounds.get(id)?.min ?? 0),
      0
    );
    const maxTotal = strategyIds.reduce(
      (sum, id) => sum + (bounds.get(id)?.max ?? 0),
      0
    );

    if (minTotal >= 1) {
      return this.normalizeRawWeights(
        Object.fromEntries(
          strategyIds.map((id) => [id, bounds.get(id)?.min ?? 0])
        )
      );
    }

    if (maxTotal <= 1) {
      return this.normalizeRawWeights(
        Object.fromEntries(
          strategyIds.map((id) => [id, bounds.get(id)?.max ?? 0])
        )
      );
    }

    const weights: Record<string, number> = {};
    const remaining = new Set(strategyIds);
    let remainingWeight = 1;

    while (remaining.size > 0) {
      const remainingTargetTotal = Array.from(remaining).reduce(
        (sum, id) => sum + targetWeights[id],
        0
      );
      let constrainedThisPass = false;

      for (const id of Array.from(remaining)) {
        const target =
          remainingTargetTotal > 0
            ? (targetWeights[id] / remainingTargetTotal) * remainingWeight
            : remainingWeight / remaining.size;
        const bound = bounds.get(id);

        if (!bound) {
          continue;
        }

        if (target < bound.min) {
          weights[id] = bound.min;
          remainingWeight -= bound.min;
          remaining.delete(id);
          constrainedThisPass = true;
        } else if (target > bound.max) {
          weights[id] = bound.max;
          remainingWeight -= bound.max;
          remaining.delete(id);
          constrainedThisPass = true;
        }
      }

      if (!constrainedThisPass) {
        for (const id of remaining) {
          const target =
            remainingTargetTotal > 0
              ? (targetWeights[id] / remainingTargetTotal) * remainingWeight
              : remainingWeight / remaining.size;
          weights[id] = target;
        }
        break;
      }
    }

    return this.normalizeRawWeights(weights);
  }

  private percentToWeight(percent: number): number {
    return Math.min(Math.max(percent / 100, 0), 1);
  }

  private filterEnabledWeights(weights: Record<string, number>): Record<string, number> {
    const enabledStrategyIds = new Set(
      this.config.strategies
        .filter((strategy) => strategy.enabled)
        .map((strategy) => strategy.id)
    );

    return this.normalizeRawWeights(
      Object.fromEntries(
        Object.entries(weights).filter(([strategyId]) =>
          enabledStrategyIds.has(strategyId)
        )
      )
    );
  }

  private normalizeRawWeights(weights: Record<string, number>): Record<string, number> {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

    if (total <= 0) {
      return weights;
    }

    return Object.fromEntries(
      Object.entries(weights).map(([id, weight]) => [id, weight / total])
    );
  }
}
