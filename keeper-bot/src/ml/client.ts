import axios from "axios";
import { ProtocolMetrics } from "../data/types";
import { AllocationWeights } from "../engine/types";

export class MLClient {
  private mlModelUrl: string | undefined;

  constructor(mlModelUrl: string | undefined) {
    this.mlModelUrl = mlModelUrl;
  }

  async getOptimalWeights(
    metrics: ProtocolMetrics[]
  ): Promise<AllocationWeights> {
    if (!this.mlModelUrl) {
      throw new Error(
        "ML_MODEL_URL not configured, fallback allocator should be used"
      );
    }

    const response = await axios.post(
      this.mlModelUrl,
      {
        metrics: metrics.map((m) => ({
          protocol: m.protocol,
          strategyId: m.strategyId,
          apy: m.apy,
          tvl: m.tvl,
          utilizationRate: m.utilizationRate,
          healthFactor: m.healthFactor,
          lastUpdated: m.lastUpdated,
        })),
        timestamp: Date.now(),
      },
      {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      }
    );

    const { weights, confidence } = response.data as {
      weights: Record<string, number>;
      confidence: number;
    };

    if (!weights || typeof confidence !== "number") {
      throw new Error("Invalid ML model response: missing weights or confidence");
    }

    // Validate weights sum to approximately 1.0
    const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error(
        `ML model weights do not sum to 1.0: ${totalWeight.toFixed(4)}`
      );
    }

    return {
      weights,
      confidence,
      source: "ml_model",
    };
  }
}
