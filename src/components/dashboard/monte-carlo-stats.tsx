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

interface SimulationHistogramProps {
  p5: number;
  mean: number;
  p95: number;
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

function SimulationHistogram({ p5, mean, p95 }: SimulationHistogramProps) {
  const binCount = 12;
  const zScore95 = 1.6448536269514722;
  const sigma =
    Math.max((p95 - mean) / zScore95, (mean - p5) / zScore95, Number.EPSILON);
  const min = mean - sigma * 3;
  const max = mean + sigma * 3;
  const step = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, index) => {
    const center = min + step * (index + 0.5);
    const exponent = -0.5 * ((center - mean) / sigma) ** 2;
    const density = Math.exp(exponent) / (sigma * Math.sqrt(2 * Math.PI));

    return {
      center,
      density,
    };
  });

  const maxDensity = Math.max(...bins.map((bin) => bin.density), Number.EPSILON);
  const meanBinIndex = bins.reduce((closestIndex, bin, index, allBins) => {
    const currentDistance = Math.abs(bin.center - mean);
    const closestDistance = Math.abs(allBins[closestIndex].center - mean);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end gap-2">
        {bins.map((bin, index) => {
          const height = Math.max((bin.density / maxDensity) * 100, 8);
          const isMeanBin = index === meanBinIndex;

          return (
            <div
              key={index}
              className="flex-1 rounded-t-md bg-emerald-500 transition-all"
              style={{
                height: `${height}%`,
                opacity: isMeanBin ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>P5: {p5.toFixed(1)}%</span>
        <span>Mean: {mean.toFixed(1)}%</span>
        <span>P95: {p95.toFixed(1)}%</span>
      </div>
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
        <div className="mt-4 rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Simulation Distribution (10,000 runs)
          </h3>
          <SimulationHistogram
            p5={data.p5Apy}
            mean={data.meanApy}
            p95={data.p95Apy}
          />
        </div>
      </CardContent>
    </Card>
  );
}
