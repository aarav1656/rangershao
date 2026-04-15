import { ProtocolMetrics } from "../data/types";
import { AllocationWeights } from "../engine/types";

type Regime = "NORMAL" | "HIGH_DEMAND" | "RATE_COMPRESSION";

// Risk scores per protocol (from ALLOCATION_MODEL.md)
const RISK_SCORES: Record<string, number> = {
  solend: 0.14,
  marginfi: 0.18,
  klend: 0.21,
  drift: 0.15,
};

const MIN_ALLOCATION = 0.10;
const MAX_ALLOCATION = 0.60;

export class FallbackAllocator {
  private consecutiveRegimeCounts: Record<Regime, number> = {
    NORMAL: 0,
    HIGH_DEMAND: 0,
    RATE_COMPRESSION: 0,
  };
  private currentRegime: Regime = "NORMAL";
  private readonly REGIME_PERSISTENCE_THRESHOLD = 3;

  detectRegime(metrics: ProtocolMetrics[]): Regime {
    // Calculate weighted average lending rate across protocols
    // Weights: largest markets get more signal weight
    const protocolWeights: Record<string, number> = {
      solend: 0.30,
      marginfi: 0.30,
      klend: 0.25,
      drift: 0.15,
    };

    let weightedAvgRate = 0;
    let totalWeight = 0;

    for (const m of metrics) {
      const w = protocolWeights[m.protocol] ?? 0.1;
      weightedAvgRate += (m.apy / 100) * w;
      totalWeight += w;
    }

    if (totalWeight > 0) {
      weightedAvgRate /= totalWeight;
    }

    let detectedRegime: Regime;
    if (weightedAvgRate > 0.15) {
      detectedRegime = "HIGH_DEMAND";
    } else if (weightedAvgRate < 0.06) {
      detectedRegime = "RATE_COMPRESSION";
    } else {
      detectedRegime = "NORMAL";
    }

    // Regime persistence: require 3 consecutive detections to switch
    for (const regime of Object.keys(this.consecutiveRegimeCounts) as Regime[]) {
      if (regime === detectedRegime) {
        this.consecutiveRegimeCounts[regime]++;
      } else {
        this.consecutiveRegimeCounts[regime] = 0;
      }
    }

    if (
      this.consecutiveRegimeCounts[detectedRegime] >=
      this.REGIME_PERSISTENCE_THRESHOLD
    ) {
      this.currentRegime = detectedRegime;
    }

    return this.currentRegime;
  }

  calculateWeights(
    metrics: ProtocolMetrics[],
    regime: Regime
  ): AllocationWeights {
    if (metrics.length === 0) {
      return { weights: {}, confidence: 0, source: "fallback_greedy" };
    }

    // Step 1: Calculate raw scores (inverse risk * APY)
    const rawScores: Record<string, number> = {};
    for (const m of metrics) {
      const riskScore = RISK_SCORES[m.protocol] ?? 0.2;
      const inverseRisk = 1 - riskScore;
      rawScores[m.strategyId] = inverseRisk * (m.apy / 100);
    }

    // Step 2: Normalize to sum to 1.0
    const totalRaw = Object.values(rawScores).reduce((s, v) => s + v, 0);
    const normalized: Record<string, number> = {};
    if (totalRaw > 0) {
      for (const [id, score] of Object.entries(rawScores)) {
        normalized[id] = score / totalRaw;
      }
    } else {
      // Equal weight fallback
      const n = metrics.length;
      for (const m of metrics) {
        normalized[m.strategyId] = 1 / n;
      }
    }

    // Step 3: Apply regime tilts
    const regimeTilted = this.applyRegimeTilts(normalized, metrics, regime);

    // Step 4: Enforce hard constraints (min 10%, max 60%)
    const constrained = this.enforceConstraints(regimeTilted);

    // Step 5: Calculate confidence based on regime stability and data quality
    const confidence = this.calculateConfidence(metrics, regime);

    return {
      weights: constrained,
      confidence,
      source: "fallback_greedy",
    };
  }

  private applyRegimeTilts(
    weights: Record<string, number>,
    metrics: ProtocolMetrics[],
    regime: Regime
  ): Record<string, number> {
    const tilted = { ...weights };

    // Apply regime-specific adjustments
    switch (regime) {
      case "HIGH_DEMAND":
        // Boost lending protocols, reduce others
        for (const m of metrics) {
          if (
            m.protocol === "solend" ||
            m.protocol === "marginfi" ||
            m.protocol === "klend"
          ) {
            tilted[m.strategyId] = (tilted[m.strategyId] || 0) * 1.15;
          }
        }
        break;

      case "RATE_COMPRESSION":
        // More conservative, favor safer protocols
        for (const m of metrics) {
          const risk = RISK_SCORES[m.protocol] ?? 0.2;
          if (risk < 0.16) {
            tilted[m.strategyId] = (tilted[m.strategyId] || 0) * 1.2;
          } else {
            tilted[m.strategyId] = (tilted[m.strategyId] || 0) * 0.85;
          }
        }
        break;

      case "NORMAL":
      default:
        // No special tilts
        break;
    }

    // Re-normalize
    const total = Object.values(tilted).reduce((s, v) => s + v, 0);
    if (total > 0) {
      for (const key of Object.keys(tilted)) {
        tilted[key] /= total;
      }
    }

    return tilted;
  }

  private enforceConstraints(
    weights: Record<string, number>
  ): Record<string, number> {
    const keys = Object.keys(weights);
    const result: Record<string, number> = {};

    // First pass: clip to [min, max]
    let surplus = 0;
    let uncappedCount = 0;

    for (const key of keys) {
      let w = weights[key];
      if (w < MIN_ALLOCATION) {
        surplus += MIN_ALLOCATION - w;
        w = MIN_ALLOCATION;
      } else if (w > MAX_ALLOCATION) {
        surplus -= w - MAX_ALLOCATION;
        w = MAX_ALLOCATION;
      } else {
        uncappedCount++;
      }
      result[key] = w;
    }

    // Redistribute surplus/deficit among uncapped weights
    if (Math.abs(surplus) > 0.001 && uncappedCount > 0) {
      const adjustment = surplus / uncappedCount;
      for (const key of keys) {
        if (
          result[key] > MIN_ALLOCATION &&
          result[key] < MAX_ALLOCATION
        ) {
          result[key] = Math.max(
            MIN_ALLOCATION,
            Math.min(MAX_ALLOCATION, result[key] - adjustment)
          );
        }
      }
    }

    // Final normalization to ensure sum = 1.0
    const total = Object.values(result).reduce((s, v) => s + v, 0);
    if (total > 0) {
      for (const key of Object.keys(result)) {
        result[key] /= total;
      }
    }

    return result;
  }

  private calculateConfidence(
    metrics: ProtocolMetrics[],
    regime: Regime
  ): number {
    // Base confidence from regime stability
    let confidence =
      this.consecutiveRegimeCounts[regime] >= this.REGIME_PERSISTENCE_THRESHOLD
        ? 0.7
        : 0.5;

    // Adjust for data freshness (penalize stale data)
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    for (const m of metrics) {
      const age = now - m.lastUpdated;
      if (age > maxAge) {
        confidence *= 0.9;
      }
    }

    // Adjust for number of protocols with data
    if (metrics.length >= 4) {
      confidence = Math.min(1.0, confidence * 1.1);
    } else if (metrics.length <= 2) {
      confidence *= 0.8;
    }

    return Math.min(1.0, Math.max(0.1, confidence));
  }
}
