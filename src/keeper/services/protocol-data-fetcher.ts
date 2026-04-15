import axios, { AxiosInstance } from "axios";
import { ProtocolData, KeeperConfig, StrategyConfig } from "../types";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

// USDC mint on Solana
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export class ProtocolDataFetcher {
  private readonly config: KeeperConfig;
  private readonly http: AxiosInstance;

  constructor(config: KeeperConfig) {
    this.config = config;
    this.http = axios.create({
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        "Accept": "application/json",
        "User-Agent": "ranger-keeper/1.0",
      },
    });

    this.http.interceptors.response.use(undefined, async (error) => {
      const config = error.config;
      if (!config || config.__retryCount >= MAX_RETRIES) return Promise.reject(error);

      const status = error.response?.status;
      if (status !== 429 && status !== 503) return Promise.reject(error);

      config.__retryCount = (config.__retryCount ?? 0) + 1;
      const retryAfter = error.response?.headers?.["retry-after"];
      const delayMs = retryAfter
        ? Number(retryAfter) * 1000
        : BASE_BACKOFF_MS * Math.pow(2, config.__retryCount - 1);

      console.warn(
        `[ProtocolDataFetcher] ${status} on ${config.url}, retry ${config.__retryCount}/${MAX_RETRIES} in ${delayMs}ms`
      );

      await new Promise((r) => setTimeout(r, delayMs));
      return this.http.request(config);
    });
  }

  /**
   * Fetch data from all enabled protocols in parallel.
   * Individual failures are logged and skipped.
   */
  async fetchAll(): Promise<ProtocolData[]> {
    const enabledStrategies = this.config.strategies.filter((s) => s.enabled);
    const uniqueProtocols = [
      ...new Set(enabledStrategies.map((s) => s.protocol)),
    ];

    const results = await Promise.allSettled(
      uniqueProtocols.map((protocol) => this.fetchProtocol(protocol))
    );

    const data: ProtocolData[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        data.push(result.value);
      } else {
        console.error(
          `[ProtocolDataFetcher] Failed to fetch ${uniqueProtocols[i]}:`,
          result.reason?.message || result.reason
        );
      }
    }

    return data;
  }

  /**
   * Fetch data for a single protocol by name.
   */
  async fetchProtocol(protocol: string): Promise<ProtocolData> {
    const strategy = this.config.strategies.find(
      (s) => s.protocol === protocol && s.enabled
    );
    const strategyId = strategy?.id ?? protocol;

    switch (protocol) {
      case "kamino":
        return this.fetchKamino(strategyId);
      case "marginfi":
        return this.fetchMarginfi(strategyId);
      case "jupiter_lend":
        return this.fetchJupiterLend(strategyId);
      case "raydium":
        return this.fetchRaydium(strategyId);
      default:
        throw new Error(`Unknown protocol: ${protocol}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Kamino (Hubble Protocol)
  // ---------------------------------------------------------------------------
  // Expected response shape from /v2/kamino-market/<market>/strategies:
  // [
  //   {
  //     "strategy": "<pubkey>",
  //     "tokenAMint": "...",
  //     "tokenBMint": "...",
  //     "apy": { "total": 0.05, ... },
  //     "tvl": 12345678.90,
  //     "borrowRate": 0.03,
  //     "utilizationRate": 0.75,
  //     ...
  //   }
  // ]
  private async fetchKamino(strategyId: string): Promise<ProtocolData> {
    // Main Kamino USDC market on Solana mainnet
    const KAMINO_MAIN_MARKET = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

    const { data: strategies } = await this.http.get(
      `https://api.hubbleprotocol.io/v2/kamino-market/${KAMINO_MAIN_MARKET}/strategies`
    );

    // Find a USDC-related strategy (lending or liquidity)
    const usdcStrategy = Array.isArray(strategies)
      ? strategies.find(
          (s: any) =>
            s.tokenAMint === USDC_MINT || s.tokenBMint === USDC_MINT
        )
      : null;

    if (!usdcStrategy) {
      throw new Error("Kamino: No USDC strategy found");
    }

    const apy =
      typeof usdcStrategy.apy === "object"
        ? usdcStrategy.apy.total ?? usdcStrategy.apy.net ?? 0
        : typeof usdcStrategy.apy === "number"
          ? usdcStrategy.apy
          : 0;

    return {
      protocol: "kamino",
      strategyId,
      apy: this.normalizeApy(apy),
      tvl: Number(usdcStrategy.tvl ?? 0),
      utilizationRate: Number(usdcStrategy.utilizationRate ?? 0),
      lastUpdated: Date.now(),
    };
  }

  // ---------------------------------------------------------------------------
  // Marginfi
  // ---------------------------------------------------------------------------
  // Expected response shape from mrgn-bank-metadata-cache.json:
  // [
  //   {
  //     "bankAddress": "...",
  //     "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  //     "tokenSymbol": "USDC",
  //     "lendingRate": 0.045,
  //     "borrowingRate": 0.08,
  //     "totalDeposits": 150000000,
  //     "totalBorrows": 90000000,
  //     ...
  //   }
  // ]
  private async fetchMarginfi(strategyId: string): Promise<ProtocolData> {
    const { data: banks } = await this.http.get(
      "https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json"
    );

    // Banks can be an array or an object keyed by bank address
    const bankList = Array.isArray(banks) ? banks : Object.values(banks);

    const usdcBank = bankList.find(
      (b: any) =>
        b.tokenMint === USDC_MINT ||
        b.mint === USDC_MINT ||
        (b.tokenSymbol && b.tokenSymbol.toUpperCase() === "USDC")
    );

    if (!usdcBank) {
      throw new Error("Marginfi: No USDC bank found in metadata cache");
    }

    const totalDeposits = Number(
      usdcBank.totalDeposits ?? usdcBank.totalAssets ?? usdcBank.tvl ?? 0
    );
    const totalBorrows = Number(
      usdcBank.totalBorrows ?? usdcBank.totalLiabilities ?? 0
    );
    const utilizationRate =
      totalDeposits > 0 ? totalBorrows / totalDeposits : 0;

    const apy =
      usdcBank.lendingRate ??
      usdcBank.depositRate ??
      usdcBank.supplyApy ??
      usdcBank.lendApy ??
      0;

    return {
      protocol: "marginfi",
      strategyId,
      apy: this.normalizeApy(Number(apy)),
      tvl: totalDeposits,
      utilizationRate,
      lastUpdated: Date.now(),
    };
  }

  // ---------------------------------------------------------------------------
  // Jupiter Lend (JLP)
  // ---------------------------------------------------------------------------
  // Expected response from https://api.jlp.so/v1/pools or stats.jup.ag:
  // {
  //   "pools": [
  //     {
  //       "name": "JLP",
  //       "apy": 0.12,
  //       "tvl": 500000000,
  //       "utilizationRate": 0.65,
  //       ...
  //     }
  //   ]
  // }
  // Fallback: https://stats.jup.ag/info/day returns { volume24h, tvl, ... }
  private async fetchJupiterLend(strategyId: string): Promise<ProtocolData> {
    // Try JLP pools API first
    try {
      const { data } = await this.http.get("https://api.jlp.so/v1/pools");

      const pools = Array.isArray(data) ? data : data?.pools ?? data?.data ?? [];
      const jlpPool = pools.find(
        (p: any) =>
          p.name === "JLP" ||
          p.symbol === "JLP" ||
          p.tokenMint === USDC_MINT ||
          (p.tokens && p.tokens.some((t: any) => t.mint === USDC_MINT))
      );

      if (jlpPool) {
        return {
          protocol: "jupiter_lend",
          strategyId,
          apy: this.normalizeApy(
            Number(jlpPool.apy ?? jlpPool.apr ?? jlpPool.yield ?? 0)
          ),
          tvl: Number(jlpPool.tvl ?? jlpPool.liquidity ?? 0),
          utilizationRate: Number(jlpPool.utilizationRate ?? jlpPool.utilization ?? 0),
          lastUpdated: Date.now(),
        };
      }
    } catch (err: any) {
      console.error(
        `[ProtocolDataFetcher] JLP pools API failed, falling back to stats:`,
        err.message
      );
    }

    // Fallback: Jupiter stats + fees API
    const [statsRes, feesRes] = await Promise.all([
      this.http.get("https://stats.jup.ag/info/day"),
      this.http.get("https://fe-api.jup.ag/api/v1/fees/current"),
    ]);

    const stats = statsRes.data;
    const fees = feesRes.data;

    // Estimate APY from daily fees / TVL * 365
    const dailyFees = Number(fees?.totalFees ?? fees?.fees ?? 0);
    const tvl = Number(stats?.tvl ?? stats?.totalTvl ?? 0);
    const estimatedApy = tvl > 0 ? (dailyFees / tvl) * 365 : 0;

    return {
      protocol: "jupiter_lend",
      strategyId,
      apy: this.normalizeApy(estimatedApy),
      tvl,
      utilizationRate: Number(stats?.utilizationRate ?? 0),
      lastUpdated: Date.now(),
    };
  }

  // ---------------------------------------------------------------------------
  // Raydium CLMM
  // ---------------------------------------------------------------------------
  // Expected response from https://api-v3.raydium.io/pools/info/list:
  // {
  //   "success": true,
  //   "data": {
  //     "data": [
  //       {
  //         "id": "...",
  //         "mintA": { "address": "...", "symbol": "USDC" },
  //         "mintB": { "address": "...", "symbol": "SOL" },
  //         "tvl": 5000000,
  //         "day": { "apr": 15.2, "feeApr": 10.1, "rewardApr": [5.1] },
  //         "type": "Concentrated",
  //         ...
  //       }
  //     ]
  //   }
  // }
  private async fetchRaydium(strategyId: string): Promise<ProtocolData> {
    const { data: response } = await this.http.get(
      "https://api-v3.raydium.io/pools/info/list",
      {
        params: {
          poolType: "concentrated",
          poolSortField: "tvl",
          sortType: "desc",
          pageSize: 100,
          page: 1,
        },
      }
    );

    const pools: any[] =
      response?.data?.data ?? response?.data ?? response ?? [];

    // Find the highest-TVL USDC pool
    const usdcPools = pools.filter(
      (p: any) =>
        p.mintA?.address === USDC_MINT ||
        p.mintB?.address === USDC_MINT ||
        p.mintA?.symbol === "USDC" ||
        p.mintB?.symbol === "USDC"
    );

    if (usdcPools.length === 0) {
      throw new Error("Raydium: No USDC concentrated pools found");
    }

    // Pick pool with highest TVL
    const bestPool = usdcPools.reduce((best: any, current: any) =>
      Number(current.tvl ?? 0) > Number(best.tvl ?? 0) ? current : best
    );

    // APR from Raydium is typically in percentage (e.g., 15.2 for 15.2%)
    const dayApr = bestPool.day?.apr ?? bestPool.day?.feeApr ?? bestPool.apr ?? 0;

    return {
      protocol: "raydium",
      strategyId,
      apy: this.normalizeApy(Number(dayApr)),
      tvl: Number(bestPool.tvl ?? 0),
      utilizationRate: Number(bestPool.utilizationRate ?? bestPool.utilization ?? 0),
      lastUpdated: Date.now(),
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Normalize APY to decimal form.
   * If the value looks like a percentage (> 1), divide by 100.
   * If already decimal (0-1 range), keep as-is.
   */
  private normalizeApy(value: number): number {
    if (value > 1) {
      // Likely a percentage value like 5.2 meaning 5.2%
      return value / 100;
    }
    return value;
  }
}
