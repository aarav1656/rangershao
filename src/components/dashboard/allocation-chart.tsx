"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { AllocationEntry } from "@/lib/types";

interface AllocationChartProps {
  data: AllocationEntry[];
}

const PROTOCOL_COLORS: Record<string, string> = {
  "Ondo USDY": "#8b5cf6",
  Kamino: "#34d399",
  MarginFi: "#60a5fa",
  "Jupiter Lend": "#fbbf24",
  "Raydium CLMM": "#f87171",
  Solend: "#fb923c",
  Drift: "#a78bfa",
  Save: "#f59e0b",
  Mango: "#ec4899",
};

function getColor(protocol: string, fallback: string): string {
  return PROTOCOL_COLORS[protocol] || fallback;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: AllocationEntry;
  }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold">{entry.protocol}</p>
      <p className="text-xs text-muted-foreground">
        {entry.weight.toFixed(1)}% allocation
      </p>
      <p className="text-xs text-primary">{entry.apy.toFixed(2)}% APY</p>
      <p className="text-xs text-muted-foreground">
        ${entry.value.toLocaleString()}
      </p>
    </div>
  );
}

export function AllocationChart({ data }: AllocationChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Protocol Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
            </div>
            <p className="text-sm text-muted-foreground">Allocation visible after vault deployment</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="weight"
                  nameKey="protocol"
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={entry.protocol}
                      fill={getColor(
                        entry.protocol,
                        entry.color || `hsl(${i * 60}, 70%, 50%)`
                      )}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full space-y-2 lg:w-48">
              {data.map((entry) => (
                <div
                  key={entry.protocol}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getColor(
                          entry.protocol,
                          entry.color || "#888"
                        ),
                      }}
                    />
                    <span className="text-muted-foreground">
                      {entry.protocol}
                    </span>
                  </div>
                  <span className="font-medium">
                    {entry.weight.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
