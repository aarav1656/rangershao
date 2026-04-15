export interface ProtocolMetrics {
  protocol: string;
  strategyId: string;
  apy: number;
  tvl: number;
  utilizationRate: number;
  healthFactor?: number;
  lastUpdated: number;
}

export interface FetcherResult {
  metrics: ProtocolMetrics[];
  timestamp: number;
  errors: string[];
}
