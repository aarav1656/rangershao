"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle, Activity, BarChart3 } from "lucide-react";
import type { RiskMetrics as RiskMetricsType } from "@/lib/types";

interface RiskMetricsProps {
  data: RiskMetricsType | null;
}

function MetricRow({
  icon: Icon,
  label,
  value,
  subtext,
  progress,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  progress?: number;
  variant?: "default" | "good" | "warning" | "danger";
}) {
  const variantColor = {
    default: "text-foreground",
    good: "text-gain",
    warning: "text-yellow-500",
    danger: "text-loss",
  }[variant];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${variantColor}`}>
            {value}
          </span>
          {subtext && (
            <span className="ml-1 text-xs text-muted-foreground">
              {subtext}
            </span>
          )}
        </div>
      </div>
      {progress !== undefined && (
        <Progress value={progress} className="h-1.5" />
      )}
    </div>
  );
}

function getHealthVariant(
  hf: number
): "good" | "warning" | "danger" {
  if (hf >= 2) return "good";
  if (hf >= 1.5) return "warning";
  return "danger";
}

export function RiskMetricsPanel({ data }: RiskMetricsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Risk metrics update after first rebalance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Risk Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <MetricRow
          icon={ShieldCheck}
          label="Health Factor"
          value={data.healthFactor.toFixed(2)}
          variant={getHealthVariant(data.healthFactor)}
          progress={Math.min(data.healthFactor / 3, 1) * 100}
        />
        <MetricRow
          icon={AlertTriangle}
          label="Value at Risk (1d, 95%)"
          value={`${data.currentVaR.toFixed(2)}%`}
          variant={data.currentVaR > 5 ? "danger" : data.currentVaR > 2 ? "warning" : "good"}
        />
        <MetricRow
          icon={Activity}
          label="Max Drawdown"
          value={`${data.maxDrawdown.toFixed(2)}%`}
          variant={data.maxDrawdown > 10 ? "danger" : data.maxDrawdown > 5 ? "warning" : "good"}
        />
        <MetricRow
          icon={BarChart3}
          label="Sharpe Ratio"
          value={data.sharpeRatio.toFixed(2)}
          variant={data.sharpeRatio >= 2 ? "good" : data.sharpeRatio >= 1 ? "warning" : "danger"}
        />
        <MetricRow
          icon={Activity}
          label="30d Volatility"
          value={`${data.volatility30d.toFixed(2)}%`}
        />
        <MetricRow
          icon={BarChart3}
          label="SOL Correlation"
          value={data.correlationToSol.toFixed(3)}
        />
      </CardContent>
    </Card>
  );
}
