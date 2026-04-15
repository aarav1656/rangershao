"use client";

import { SolanaWalletProvider } from "@/providers/wallet-provider";
import { DashboardHeader } from "@/components/dashboard/header";
import { TvlCard } from "@/components/dashboard/tvl-card";
import { ApyChart } from "@/components/dashboard/apy-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { RebalanceHistory } from "@/components/dashboard/rebalance-history";
import { RiskMetricsPanel } from "@/components/dashboard/risk-metrics";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { DepositWithdraw } from "@/components/dashboard/deposit-withdraw";
import { StrategyThesis } from "@/components/dashboard/strategy-thesis";
import { MonteCarloStats } from "@/components/dashboard/monte-carlo-stats";
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton";
import { useEffect, useState, useCallback } from "react";
import { Activity } from "lucide-react";
import type {
  ApyDataPoint,
  AllocationEntry,
  RebalanceEvent,
  RiskMetrics,
  PnlDataPoint,
} from "@/lib/types";

interface VaultOverview {
  tvl: number;
  tvlChange24h: number;
  currentApy: number;
  totalDepositors: number;
  lastRebalance: string;
}

function useDashboardData() {
  const [overview, setOverview] = useState<VaultOverview | null>(null);
  const [apyData, setApyData] = useState<ApyDataPoint[]>([]);
  const [allocations, setAllocations] = useState<AllocationEntry[]>([]);
  const [rebalances, setRebalances] = useState<RebalanceEvent[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [pnlData, setPnlData] = useState<PnlDataPoint[]>([]);
  const [monteCarloSummary, setMonteCarloSummary] = useState<{
    meanApy: number;
    p5Apy: number;
    p95Apy: number;
    meanSharpe: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("live");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/vault");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setDataSource(data.dataSource || "live");
      setOverview(data.overview);
      setApyData(data.apyHistory || []);
      setAllocations(data.allocations || []);
      setRebalances(data.rebalances || []);
      setRiskMetrics(data.riskMetrics || null);
      setPnlData(data.pnlHistory || []);
      setMonteCarloSummary(data.monteCarloSummary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vault data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    overview,
    apyData,
    allocations,
    rebalances,
    riskMetrics,
    pnlData,
    monteCarloSummary,
    loading,
    error,
    dataSource,
    refetch: fetchData,
  };
}

function BacktestBanner() {
  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">Strategy Validated</span>
        </div>
        <span className="text-xs text-muted-foreground">
          90-day backtest with 10,000 Monte Carlo simulations on real Solana lending rate data
        </span>
      </div>
    </div>
  );
}

function DashboardContent() {
  const {
    overview,
    apyData,
    allocations,
    rebalances,
    riskMetrics,
    pnlData,
    monteCarloSummary,
    loading,
    error,
    dataSource,
  } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center fade-up">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Connecting to Vault</p>
            <p className="text-xs text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataSource === "backtest" && (
        <div className="fade-up">
          <BacktestBanner />
        </div>
      )}
      <section id="overview" className="fade-up fade-up-delay-1">
        <TvlCard
          tvl={overview?.tvl ?? 0}
          tvlChange24h={overview?.tvlChange24h ?? 0}
          currentApy={overview?.currentApy ?? 0}
          totalDepositors={overview?.totalDepositors ?? 0}
          lastRebalance={overview?.lastRebalance ?? ""}
        />
      </section>

      {monteCarloSummary && (
        <div className="fade-up fade-up-delay-2">
          <MonteCarloStats data={monteCarloSummary} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 fade-up fade-up-delay-3">
        <div className="lg:col-span-2 space-y-6">
          <ApyChart data={apyData} />
          <PnlChart data={pnlData} />
        </div>
        <div className="space-y-6">
          <section id="allocations">
            <AllocationChart data={allocations} />
          </section>
          <DepositWithdraw />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 fade-up fade-up-delay-4">
        <section id="risk">
          <RiskMetricsPanel data={riskMetrics} />
        </section>
        <StrategyThesis />
      </div>

      <section id="history" className="fade-up fade-up-delay-5">
        <RebalanceHistory data={rebalances} />
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <SolanaWalletProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardContent />
        </main>
        <footer className="border-t border-border/50 py-6 mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p>Ranger Vault v0.1.0</p>
              </div>
              <div className="flex items-center gap-4">
                <p>Powered by Voltr Protocol</p>
                <span className="text-border">|</span>
                <p>Secured by Cobo MPC</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SolanaWalletProvider>
  );
}
