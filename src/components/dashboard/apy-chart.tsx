"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import type { ApyDataPoint } from "@/lib/types";

interface ApyChartProps {
  data: ApyDataPoint[];
  onPeriodChange?: (days: number) => void;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-primary">
        {payload[0].value.toFixed(2)}% APY
      </p>
    </div>
  );
}

export function ApyChart({ data, onPeriodChange }: ApyChartProps) {
  const [period, setPeriod] = useState<string>("30");

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    onPeriodChange?.(Number(val));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Historical APY
        </CardTitle>
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="h-8">
            <TabsTrigger value="30" className="text-xs px-3">
              30D
            </TabsTrigger>
            <TabsTrigger value="60" className="text-xs px-3">
              60D
            </TabsTrigger>
            <TabsTrigger value="90" className="text-xs px-3">
              90D
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Awaiting historical data from keeper bot
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.765 0.177 163.223)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.765 0.177 163.223)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(1 0 0 / 5%)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="apy"
                stroke="oklch(0.765 0.177 163.223)"
                strokeWidth={2}
                fill="url(#apyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
