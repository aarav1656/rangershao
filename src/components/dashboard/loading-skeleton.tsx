"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

function CardSkeleton({ height = "h-[300px]" }: { height?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Shimmer className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Shimmer className={height} />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Shimmer className="h-3 w-24 mb-3" />
              <Shimmer className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Shimmer className="h-5 w-40" />
            <div className="flex gap-2">
              <Shimmer className="h-7 w-32 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-7 w-20" />
                <Shimmer className="h-2 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton height="h-[280px]" />
        </div>
        <div className="space-y-6">
          <CardSkeleton height="h-[260px]" />
          <CardSkeleton height="h-[200px]" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton height="h-[240px]" />
        <CardSkeleton height="h-[240px]" />
      </div>
    </div>
  );
}
