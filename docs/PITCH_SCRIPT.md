# Ranger Pitch Video Script (3 Minutes)

## Timing Guide

| Segment | Time | Duration |
|---------|------|----------|
| Hook | 0:00-0:20 | 20s |
| Strategy Thesis | 0:20-0:50 | 30s |
| Live Demo | 0:50-1:30 | 40s |
| Risk Framework | 1:30-2:00 | 30s |
| Tech Deep-Dive | 2:00-2:30 | 30s |
| Results & Close | 2:30-3:00 | 30s |

## Script

### [0:00-0:20] HOOK: The Problem

> "There are $8 billion in stablecoins sitting on Solana right now. Most of it is earning 4% in lending, or nothing at all. The few vaults promising higher yields are concentrated in single protocols, one exploit away from disaster.
>
> Ranger changes that."

*[VISUAL: Dashboard overview showing TVL, APY counter ticking up]*

### [0:20-0:50] STRATEGY THESIS: RWA + DeFi Hybrid

> "Ranger is the first hybrid RWA-DeFi vault on Solana. We stack three yield layers:
>
> First, a treasury floor. 20-40% of the vault sits in Ondo USDY, tokenized US Treasuries earning 4-5%. This is our safety net, it guarantees minimum yield even if every DeFi rate drops to zero.
>
> Second, lending alpha. We spread USDC across Kamino, Marginfi, and Jupiter Lend, capturing 8-15% from Solana's structurally elevated utilization rates.
>
> Third, a concentrated liquidity boost. Raydium CLMM stable pairs with tight ranges add 10-25% on a smaller allocation.
>
> Blended target: 15-20% APY on USDC."

*[VISUAL: Allocation pie chart showing three layers, APY breakdown table]*

### [0:50-1:30] LIVE DEMO: Dashboard & On-Chain Proof

> "Let me show you this running live on mainnet."

*[SCREEN RECORDING: Navigate through dashboard]*

> "Here's our dashboard. [Point to TVL] This is real USDC in the vault. [Point to APY] Current blended APY across all positions.
>
> [Click to allocation view] You can see the live allocation: 30% in Ondo USDY, 25% Kamino, 20% Marginfi, 10% Jupiter Lend, 15% Raydium CLMM.
>
> [Click to rebalance log] Every 30 minutes, our keeper bot evaluates rates across all protocols and rebalances. Here are the last 24 hours of rebalances, each one a real Solana transaction you can verify on Solscan.
>
> [Click a transaction link] Here's the proof on-chain."

*[VISUAL: Solscan showing real transaction]*

### [1:30-2:00] RISK FRAMEWORK: How We Protect Capital

> "Yield without risk management is gambling. Here's how we protect capital.
>
> No single protocol holds more than 60% of the vault. Minimum 3 active protocols at all times. We run Monte Carlo simulations, our 95th percentile 90-day max drawdown is under 2%.
>
> We have a five-tier drawdown response: at 0.5% we increase monitoring, at 1% we shift to treasuries, at 2% we exit all DeFi positions entirely, at 3% the vault pauses.
>
> And critically, we avoid Drift entirely. Zero exposure to the protocols that have had security incidents."

*[VISUAL: Risk metrics panel showing drawdown levels, VaR numbers]*

### [2:00-2:30] TECH: ML Model + Cobo MPC

> "Two things make this production-ready, not just a hackathon demo.
>
> First, a trained PyTorch time-series model predicts optimal allocation weights. Not an LLM guessing, a real model trained on historical Solana DeFi rate data with risk-adjusted optimization.
>
> Second, every rebalance transaction is signed through Cobo MPC, multi-party computation that eliminates single-point-of-failure key management. This is the same infrastructure institutions use for hundred-million-dollar treasuries. No hot wallet, no single private key."

*[VISUAL: Architecture diagram showing ML model + Cobo MPC flow]*

### [2:30-3:00] RESULTS & CLOSE

> "Ranger delivers institutional-grade yield management on Solana:
>
> 15-20% target APY on USDC. Under 2% max drawdown. Live on mainnet with verifiable transactions. ML-driven allocation with quantitative backtesting. Cobo MPC security for real capital.
>
> This isn't a prototype. This is a structured product ready for real TVL.
>
> Ranger: Secure Hybrid Alpha, Optimized."

*[VISUAL: Dashboard hero shot with key metrics highlighted]*

## Production Notes

- **Recording tool:** OBS or Loom, 1080p minimum
- **Voice:** Clear, confident, moderate pace. Not rushed.
- **Dashboard:** Must have real data visible, not placeholder values
- **Solscan proof:** Pre-load the transaction page, don't navigate live (risk of slow load)
- **Music:** Subtle, professional background track (optional)
- **Total runtime:** Aim for 2:50-2:55 to leave buffer under 3:00
