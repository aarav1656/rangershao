"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PnlDataPoint } from "@/lib/types";

interface PnlChartProps {
  data: PnlDataPoint[];
}

function CumulativeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${val >= 0 ? "text-gain" : "text-loss"}`}>
        {val >= 0 ? "+" : ""}
        {val.toFixed(2)}%
      </p>
    </div>
  );
}

export function PnlChart({ data }: PnlChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Profit & Loss
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v2m0 8v2"/></svg>
            </div>
            <p className="text-sm text-muted-foreground">PnL tracking begins after first deposit</p>
          </div>
        ) : (
          <Tabs defaultValue="cumulative">
            <TabsList className="mb-4 h-8">
              <TabsTrigger value="cumulative" className="text-xs px-3">
                Cumulative
              </TabsTrigger>
              <TabsTrigger value="daily" className="text-xs px-3">
                Daily
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cumulative">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.765 0.177 163.223)"
                        stopOpacity={0.25}
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
                  <Tooltip content={<CumulativeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="oklch(0.765 0.177 163.223)"
                    strokeWidth={2}
                    fill="url(#pnlGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="daily">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
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
                  <Tooltip content={<CumulativeTooltip />} />
                  <Bar
                    dataKey="daily"
                    fill="oklch(0.765 0.177 163.223)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
