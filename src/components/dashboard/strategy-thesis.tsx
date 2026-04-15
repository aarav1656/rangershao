"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, Shield, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "ML-Driven Allocation",
    description:
      "LSTM models predict optimal yield allocation across Solana lending protocols, trained on historical rate data, utilization curves, and liquidity metrics.",
  },
  {
    icon: Zap,
    title: "Autonomous Rebalancing",
    description:
      "Keeper bot monitors rates every 5 minutes and executes rebalances when predicted yield improvement exceeds gas + slippage costs.",
  },
  {
    icon: Shield,
    title: "Risk-First Architecture",
    description:
      "Position limits, health factor floors, VaR constraints, and protocol diversification rules enforced on-chain. No single protocol exceeds 40% allocation.",
  },
  {
    icon: BarChart3,
    title: "Transparent Performance",
    description:
      "Every rebalance, every allocation change, every risk metric is on-chain and visible in real-time. No black boxes.",
  },
];

const PROTOCOLS = [
  "Kamino",
  "MarginFi",
  "Solend",
  "Drift",
  "Save",
];

export function StrategyThesis() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Strategy Thesis
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary">
            Delta Neutral Yield
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranger autonomously optimizes USDC yield across Solana&apos;s top lending
          protocols using machine learning, capturing rate differentials while
          maintaining institutional-grade risk controls.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <feature.icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">{feature.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Integrated Protocols
          </p>
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
