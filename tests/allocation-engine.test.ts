import { AllocationEngine } from "../src/keeper/services/allocation-engine";
import { KeeperConfig, ProtocolData } from "../src/keeper/types";

function createConfig(overrides: Partial<KeeperConfig> = {}): KeeperConfig {
  return {
    vaultPubkey: "vault",
    managerPubkey: "manager",
    heliusRpcUrl: "https://example.com/rpc",
    heliusApiKey: "helius-key",
    intervalMs: 30_000,
    driftThresholdPct: 5,
    apyChangeThresholdPct: 1,
    maxSlippageBps: 50,
    strategies: [
      {
        id: "kamino",
        pubkey: "kamino-pubkey",
        protocol: "kamino",
        enabled: true,
        minAllocationPct: 10,
        maxAllocationPct: 70,
      },
      {
        id: "marginfi",
        pubkey: "marginfi-pubkey",
        protocol: "marginfi",
        enabled: true,
        minAllocationPct: 10,
        maxAllocationPct: 70,
      },
      {
        id: "jupiter",
        pubkey: "jupiter-pubkey",
        protocol: "jupiter_lend",
        enabled: true,
        minAllocationPct: 10,
        maxAllocationPct: 70,
      },
    ],
    ...overrides,
  };
}

function createProtocolData(): ProtocolData[] {
  return [
    {
      protocol: "kamino",
      strategyId: "kamino",
      apy: 0.12,
      tvl: 20_000_000,
      utilizationRate: 0.2,
      lastUpdated: 1,
    },
    {
      protocol: "marginfi",
      strategyId: "marginfi",
      apy: 0.09,
      tvl: 5_000_000,
      utilizationRate: 0.1,
      lastUpdated: 1,
    },
    {
      protocol: "jupiter_lend",
      strategyId: "jupiter",
      apy: 0.06,
      tvl: 500_000,
      utilizationRate: 0.05,
      lastUpdated: 1,
    },
  ];
}

describe("AllocationEngine", () => {
  it("computes greedy weights that sum to 1", async () => {
    const engine = new AllocationEngine(createConfig());

    const result = await engine.getWeights(createProtocolData());
    const total = Object.values(result.weights).reduce((sum, weight) => sum + weight, 0);

    expect(result.source).toBe("fallback_greedy");
    expect(total).toBeCloseTo(1, 10);
  });

  it("respects min and max allocation constraints", async () => {
    const config = createConfig({
      strategies: [
        {
          id: "kamino",
          pubkey: "kamino-pubkey",
          protocol: "kamino",
          enabled: true,
          minAllocationPct: 20,
          maxAllocationPct: 40,
        },
        {
          id: "marginfi",
          pubkey: "marginfi-pubkey",
          protocol: "marginfi",
          enabled: true,
          minAllocationPct: 20,
          maxAllocationPct: 50,
        },
        {
          id: "jupiter",
          pubkey: "jupiter-pubkey",
          protocol: "jupiter_lend",
          enabled: true,
          minAllocationPct: 20,
          maxAllocationPct: 30,
        },
      ],
    });
    const engine = new AllocationEngine(config);

    const result = await engine.getWeights(createProtocolData());

    expect(result.weights.kamino).toBeGreaterThanOrEqual(0.2);
    expect(result.weights.kamino).toBeLessThanOrEqual(0.4);
    expect(result.weights.marginfi).toBeGreaterThanOrEqual(0.2);
    expect(result.weights.marginfi).toBeLessThanOrEqual(0.5);
    expect(result.weights.jupiter).toBeGreaterThanOrEqual(0.2);
    expect(result.weights.jupiter).toBeLessThanOrEqual(0.3);
  });

  it("returns empty weights when no protocol data is available", async () => {
    const engine = new AllocationEngine(createConfig());

    const result = await engine.getWeights([]);

    expect(result).toEqual({
      weights: {},
      confidence: 0.5,
      source: "fallback_greedy",
    });
  });
});
