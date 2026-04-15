"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Clock } from "lucide-react";

interface TvlCardProps {
  tvl: number;
  tvlChange24h: number;
  currentApy: number;
  totalDepositors: number;
  lastRebalance: string;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatTimeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function TvlCard({
  tvl,
  tvlChange24h,
  currentApy,
  totalDepositors,
  lastRebalance,
}: TvlCardProps) {
  const isPositive = tvlChange24h >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="glow-emerald border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <p className="text-sm font-medium text-muted-foreground">
            Total Value Locked
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {formatUsd(tvl)}
            </span>
            <span
              className={`flex items-center gap-0.5 text-sm font-medium ${
                isPositive ? "text-gain" : "text-loss"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? "+" : ""}
              {tvlChange24h.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">
            Current APY
          </p>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-primary">
              {currentApy.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">
            Depositors
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {totalDepositors.toLocaleString()}
            </span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">
            Last Rebalance
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {lastRebalance ? formatTimeSince(lastRebalance) : "N/A"}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
