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
import { useEffect, useState, useCallback } from "react";
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
    loading,
    error,
    dataSource,
    refetch: fetchData,
  };
}

function BacktestBanner() {
  return (
    <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm font-medium text-yellow-500">Backtest Mode</span>
        <span className="text-xs text-muted-foreground">
          Displaying real strategy backtest results (90-day, 10K Monte Carlo simulations). Live vault data will replace this once contracts are deployed.
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
    loading,
    error,
    dataSource,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading vault data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground/60">
            The vault API will return live data once the keeper bot and contracts are deployed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataSource === "backtest" && <BacktestBanner />}
      <section id="overview">
        <TvlCard
          tvl={overview?.tvl ?? 0}
          tvlChange24h={overview?.tvlChange24h ?? 0}
          currentApy={overview?.currentApy ?? 0}
          totalDepositors={overview?.totalDepositors ?? 0}
          lastRebalance={overview?.lastRebalance ?? ""}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section id="risk">
          <RiskMetricsPanel data={riskMetrics} />
        </section>
        <StrategyThesis />
      </div>

      <section id="history">
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
        <footer className="border-t border-border/50 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Ranger Vault v0.1.0</p>
              <p>Built on Solana</p>
            </div>
          </div>
        </footer>
      </div>
    </SolanaWalletProvider>
  );
}
