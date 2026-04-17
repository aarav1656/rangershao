"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ExternalLink, Shield } from "lucide-react";

export function DashboardHeader() {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Ranger</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Autonomous Yield Vault
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#overview"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Overview
          </a>
          <a
            href="#allocations"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Allocations
          </a>
          <a
            href="#risk"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Risk
          </a>
          <a
            href="#history"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            History
          </a>
          <a
            href="https://solscan.io/account/7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Vault
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {connected && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live
            </span>
          )}
          <WalletMultiButton
            style={{
              backgroundColor: "oklch(0.765 0.177 163.223)",
              color: "oklch(0.1 0.005 260)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              height: "2.25rem",
              padding: "0 1rem",
              fontWeight: 500,
            }}
          />
        </div>
      </div>
    </header>
  );
}
