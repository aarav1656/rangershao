# Ranger Technical Architecture

## System Overview

Ranger is a USDC yield optimization vault built on Voltr (Solana) that combines three yield sources through ML-driven allocation, secured by Cobo MPC multi-party signing.

## Components

### 1. Voltr Vault (On-Chain)

The vault is a Voltr-managed USDC vault with three adaptor types:

- **Lending Adaptor** connects to Kamino, Marginfi, and Jupiter Lend for overcollateralized USDC lending (8-15% APY)
- **Trustful Adaptor** connects to Ondo USDY for tokenized US Treasury yield (4-5% APY)
- **Raydium Adaptor** connects to Raydium CLMM for concentrated liquidity on stable pairs (10-25% APY)

Vault parameters:
- Base asset: USDC (SPL Token)
- Lock period: 3-month rolling
- Performance fee: configurable
- Vault authority: Cobo MPC wallet

### 2. Keeper Bot (Off-Chain, TypeScript)

The keeper runs as a standalone process on a 30-minute cron cycle:

```
┌─────────────────────────────────────────────────┐
│                  Keeper Cycle                     │
│                                                   │
│  1. FETCH    Pull live rates from all protocols   │
│              (Helius RPC + protocol APIs)          │
│                     │                             │
│  2. INFER    Run ML model on current data         │
│              Output: allocation weights            │
│                     │                             │
│  3. COMPARE  Current vs. target allocation        │
│              Skip if delta < threshold             │
│                     │                             │
│  4. BUILD    Construct Voltr rebalance txns        │
│              (withdraw from over, deposit to under)│
│                     │                             │
│  5. SIGN     Submit to Cobo MPC for signing       │
│              Multi-party computation, no hot key   │
│                     │                             │
│  6. EXECUTE  Broadcast signed txns to Solana      │
│              Verify confirmation                   │
│                     │                             │
│  7. LOG      Record rebalance to dashboard API    │
│              Store tx signatures for Solscan       │
└─────────────────────────────────────────────────┘
```

**Fallback mode:** If the ML model is unavailable, the keeper falls back to a greedy static strategy that allocates to the highest-rate protocol within risk constraints.

### 3. ML Allocation Model (PyTorch)

A time-series prediction model trained on historical Solana DeFi rate data:

**Input features (per protocol):**
- Current lending/LP rate
- Utilization ratio
- TVL
- 7-day rate moving average
- Rate volatility (30-day)

**Output:**
- Allocation weight per protocol (summing to 1.0)
- Confidence score

**Constraints enforced post-inference:**
- Min 10% per active protocol
- Max 60% per protocol
- Min 20% Ondo USDY
- Max 50% total DeFi lending
- Max 30% Raydium CLMM

**Training:**
- Data: Historical rates from Kamino, Marginfi, Jupiter Lend, Raydium, Ondo USDY
- Objective: Maximize risk-adjusted returns (Sharpe ratio >2.0)
- Regime detection: Bull/bear/neutral market classification
- Local inference only, no cloud dependencies

### 4. Cobo MPC Security Layer

All vault operations requiring signing go through Cobo WaaS 2.0:

- **MPC wallet** holds vault authority, no single private key exists
- **Signing policy** enforces risk constraints before signing (max transaction size, rate limiting, allowed programs)
- **Multi-party computation** requires threshold of key shares to sign
- **Audit trail** logs every signing request for compliance

Integration flow:
```
Keeper builds unsigned tx → Cobo API receives tx → MPC signing ceremony → 
Signed tx returned → Keeper broadcasts to Solana RPC
```

### 5. Dashboard (Next.js)

Real-time monitoring and interaction interface:

**Pages:**
- `/` Main dashboard: TVL, APY, PnL chart, allocation breakdown
- `/rebalances` Rebalance history with Solscan links
- `/risk` Risk metrics: drawdown, VaR, health factors, protocol exposure
- `/strategy` Strategy thesis and methodology

**Data flow:**
- Dashboard polls keeper bot API endpoints for current state
- WebSocket for real-time updates (optional)
- Wallet adapter for deposit/withdraw interactions

### 6. Circuit Breakers & Monitoring

Automated safety systems:

- **Drawdown monitor** tracks portfolio NAV and triggers tiered response (0.5% watch through 3.0% halt)
- **Protocol health monitor** watches TVL, utilization, oracle prices via Helius webhooks
- **Rate limiter** prevents excessive rebalancing (max 1 per 15 minutes, max 10 per day)
- **USDC depeg monitor** tracks USDC/USD via Pyth and Switchboard oracles

## Data Flow

```
External Sources                Internal Systems              On-Chain
─────────────────              ────────────────              ────────

Kamino API    ──┐
Marginfi API  ──┤              ┌──────────────┐
Jupiter API   ──┼──► Keeper ──►│  ML Model    │
Raydium API   ──┤    Bot       │  (inference)  │
Ondo API      ──┘    │         └──────┬───────┘
                     │                │ weights
Helius RPC ─────────►│         ┌──────▼───────┐
                     │         │  Rebalance   │          ┌──────────┐
                     │         │  Engine      ├─────────►│  Cobo    │
                     │         └──────────────┘  unsigned │  MPC     │
                     │                            tx      └────┬─────┘
                     │                                  signed │
                     │         ┌──────────────┐        tx      │
                     ├────────►│  Dashboard   │    ┌───────────▼──┐
                     │  API    │  (Next.js)   │    │ Solana       │
                     │         └──────────────┘    │ (Voltr Vault)│
                     │                             └──────────────┘
                     │         ┌──────────────┐
                     └────────►│  Circuit     │
                        events │  Breakers    │
                               └──────────────┘
```

## Deployment

### Development
1. Start Next.js dashboard: `npm run dev`
2. Start keeper bot: `cd keeper-bot && npm run dev`
3. Use Solana devnet for testing

### Production (Mainnet)
1. Deploy dashboard to Vercel
2. Run keeper bot on a server with 30-min cron (systemd or PM2)
3. Cobo MPC wallet configured with production signing policies
4. Helius RPC for reliable Solana access
5. Monitoring alerts via webhook (Discord/Telegram)

## Security Considerations

- No private keys stored anywhere in the codebase
- All signing through Cobo MPC (threshold cryptography)
- Circuit breakers enforce risk limits independently of ML model
- Keeper bot has no direct access to vault funds (only rebalance authority)
- Dashboard is read-only except for deposit/withdraw (which require user wallet signature)
- All environment variables in `.env.local`, never committed
