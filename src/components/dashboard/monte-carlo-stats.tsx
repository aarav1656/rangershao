"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Shield, Zap } from "lucide-react";

interface MonteCarloSummary {
  meanApy: number;
  p5Apy: number;
  p95Apy: number;
  meanSharpe: number;
}

interface MonteCarloStatsProps {
  data: MonteCarloSummary | null;
}

function StatBlock({
  icon: Icon,
  label,
  value,
  subtext,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}

export function MonteCarloStats({ data }: MonteCarloStatsProps) {
  if (!data) return null;

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Monte Carlo Analysis
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            10,000 Simulations
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBlock
            icon={TrendingUp}
            label="Expected APY"
            value={`${data.meanApy.toFixed(1)}%`}
            subtext="Mean across all sims"
            highlight
          />
          <StatBlock
            icon={Shield}
            label="Worst Case (P5)"
            value={`${data.p5Apy.toFixed(1)}%`}
            subtext="95% confidence floor"
          />
          <StatBlock
            icon={Zap}
            label="Best Case (P95)"
            value={`${data.p95Apy.toFixed(1)}%`}
            subtext="5% chance of exceeding"
          />
          <StatBlock
            icon={BarChart3}
            label="Sharpe Ratio"
            value={data.meanSharpe.toFixed(1)}
            subtext="Risk-adjusted return"
          />
        </div>
      </CardContent>
    </Card>
  );
}
