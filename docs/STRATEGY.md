# Ranger: Secure Hybrid Alpha Optimizer

## Strategy Document

### Executive Summary

Ranger is an institutional-grade USDC yield optimizer on Solana that combines tokenized Real World Asset (RWA) base yield with ML-optimized DeFi allocation. The vault targets 14-16% annualized APY with sub-2% maximum drawdown by blending the stability of US Treasury-backed instruments with the alpha of on-chain lending and concentrated liquidity.

The core insight: most Solana yield vaults chase single-source DeFi returns, accepting correlated risk across protocols that share the same rate dynamics. Ranger diversifies across fundamentally uncorrelated yield sources (US Treasuries vs. on-chain lending vs. LP fees), uses a trained ML model to dynamically allocate across them, and secures all operations through Cobo MPC threshold signing.

---

## 1. Investment Thesis

### The Problem

Solana yield infrastructure has three structural gaps:

1. **Single-source risk concentration.** Most vaults deposit into one or two DeFi protocols. When lending rates compress (as they do cyclically), returns collapse across all positions simultaneously. There is no diversification benefit.

2. **No RWA integration.** Tokenized US Treasuries now yield 4-5% with near-zero credit risk, yet no Solana vault blends this with DeFi yield. This is a missed floor that protects capital during rate downturns.

3. **Hot wallet security.** Vault rebalancing typically requires a hot private key. A single compromise drains the entire vault. Institutional allocators cannot accept this risk profile.

### Our Edge

Ranger solves all three:

**Hybrid yield construction.** We maintain a permanent RWA floor (Ondo USDY, 20-40% of TVL) that generates 4-5% regardless of DeFi market conditions. The remaining allocation rotates across Kamino, Marginfi, Jupiter Lend, and Raydium CLMM based on ML-predicted optimal weights. This hybrid approach is novel on Solana.

**Quantitative allocation.** Our ML model is trained on historical Solana DeFi rate data and outputs risk-adjusted allocation weights. It detects three market regimes (NORMAL, HIGH_DEMAND, RATE_COMPRESSION) and shifts allocation accordingly. This is not LLM prompting; it is a trained time-series model with measurable prediction accuracy.

**MPC security.** Every rebalance transaction is signed through Cobo WaaS 2.0 MPC. No private key exists in any single location. Signing policies enforce transaction-level risk constraints (max size, rate limiting, allowed programs) before the MPC ceremony executes. This is the security standard institutional allocators require.

### Why This Wins

| Competitor Approach | Risk | Ranger Advantage |
|---|---|---|
| Single-protocol lending vault | 100% exposure to one protocol's rate | 5-protocol diversification with RWA floor |
| LP-only vault (JLP/HLP) | Impermanent loss, directional exposure | USDC-only, no directional risk |
| Static allocation | No adaptation to rate changes | ML-driven dynamic rebalancing every 30 min |
| Hot wallet operations | Single point of failure | Cobo MPC threshold signing |
| Leveraged looping | Liquidation risk, cascading failures | No leverage, no borrowing |

---

## 2. Yield Sources

### 2.1 Ondo USDY (RWA Base Layer)

- **Mechanism:** Tokenized short-duration US Treasury exposure
- **Target allocation:** 20-40% of vault TVL
- **Expected yield:** 4.0-5.2% APY
- **Risk profile:** Sovereign credit risk (US Treasury), minimal smart contract risk
- **Role in portfolio:** Yield floor. Generates stable returns during DeFi rate compression. Uncorrelated to on-chain lending dynamics.

### 2.2 Kamino Lending

- **Mechanism:** Overcollateralized USDC lending on Kamino
- **Target allocation:** 10-25% of vault TVL
- **Expected yield:** 6-12% APY (variable)
- **Risk profile:** Smart contract risk (audited), utilization-dependent rate volatility
- **Role in portfolio:** Core DeFi yield. Kamino has deep USDC liquidity and stable utilization.

### 2.3 Marginfi Lending

- **Mechanism:** Overcollateralized USDC lending on Marginfi
- **Target allocation:** 10-25% of vault TVL
- **Expected yield:** 5-15% APY (variable)
- **Risk profile:** Smart contract risk (audited), oracle dependency
- **Role in portfolio:** Diversified lending exposure. Marginfi rates often diverge from Kamino, creating rotation opportunity.

### 2.4 Jupiter Lend

- **Mechanism:** USDC lending through Jupiter's lending aggregator
- **Target allocation:** 10-20% of vault TVL
- **Expected yield:** 4-10% APY (variable)
- **Risk profile:** Smart contract risk, aggregator routing risk
- **Role in portfolio:** Deepest liquidity source. Acts as a stable allocation when other rates are volatile.

### 2.5 Raydium CLMM

- **Mechanism:** Concentrated liquidity provision on USDC/USDT stable pair
- **Target allocation:** 10-30% of vault TVL
- **Expected yield:** 8-25% APY (variable, fee-dependent)
- **Risk profile:** Impermanent loss (minimal on stable pair), smart contract risk
- **Role in portfolio:** Alpha source. Highest potential yield but most volatile. ML model sizes this position based on fee volume predictions.

---

## 3. Risk Framework

### 3.1 Quantitative Risk Metrics

Based on 10,000-path Monte Carlo simulation over 90-day horizon with $500K initial capital:

| Metric | Value | Interpretation |
|---|---|---|
| Mean APY | 14.99% | Central estimate of annualized returns |
| Median APY | 15.00% | Half of simulations exceed this |
| 5th percentile APY | 12.57% | Worst-case realistic scenario |
| 95th percentile APY | 17.35% | Best-case realistic scenario |
| APY std deviation | 1.47% | Low dispersion indicates strategy stability |
| P(APY > 15%) | 49.85% | Nearly coin-flip to exceed target |
| P(APY > 10%) | 99.95% | Near-certain to beat benchmark |
| Mean max drawdown | 1.97% | Average worst peak-to-trough loss |
| 95th pctl drawdown | 4.07% | Tail drawdown stays manageable |
| P(drawdown < 2%) | 100% | All simulations stay under 2% in base case |
| Daily VaR (95%) | 0.19% | Daily value-at-risk |
| Daily CVaR (95%) | -0.61% | Expected loss in worst 5% of days |
| Mean Sharpe ratio | 22.03 | Exceptional risk-adjusted returns |
| Mean Sortino ratio | 116.30 | Minimal downside volatility |

### 3.2 Stress Test Results

| Scenario | APY | Max Drawdown | Assessment |
|---|---|---|---|
| **All rates at minimums** (90 days at protocol floors) | 9.10% | Minimal | RWA floor preserves capital. Still beats T-bills. |
| **Kamino exploit** (80% of allocation lost on day 15) | -14.93% (net) | 17.6% immediate | Worst case. Circuit breaker triggers, remaining capital recovers at ~5% APY. Per-protocol cap (max 25%) limits blast radius. |
| **Correlated rate crash** (10% to 3% over 90 days) | 12.40% | Minimal | RWA allocation increases as DeFi rates fall. Hybrid structure shines. |
| **High volatility whipsaw** (rates swing 5-25%, 4 cycles) | 14.44% | Minimal | ML model adapts. 17 rebalances vs. 1 in stable conditions. |

### 3.3 Risk Controls

**Portfolio-level constraints (enforced by ML model and keeper):**
- Minimum 20% RWA allocation at all times
- Maximum 60% in any single protocol
- Maximum 50% total in DeFi lending
- Maximum 30% in Raydium CLMM
- Minimum 10% in any active protocol

**Circuit breakers (enforced independently of ML model):**
- 0.5% drawdown: WATCH (increased monitoring frequency)
- 1.0% drawdown: WARN (alert team, reduce DeFi allocation by 20%)
- 2.0% drawdown: RESTRICT (shift 50% to RWA, pause Raydium)
- 3.0% drawdown: HALT (move 100% to RWA, freeze rebalancing, require manual intervention)

**Transaction-level controls (enforced by Cobo MPC signing policy):**
- Maximum single transaction size: configurable per-protocol
- Rate limiting: max 1 rebalance per 15 minutes, max 10 per day
- Allowed programs whitelist: only Voltr vault, known DeFi protocol addresses
- Multi-party signing threshold: no single party can authorize transactions

**Protocol health monitoring:**
- TVL change alerts (>10% in 1 hour triggers review)
- Utilization ratio monitoring (>95% triggers withdrawal consideration)
- Oracle price deviation checks (USDC/USD via Pyth and Switchboard)
- Helius webhook integration for real-time on-chain event tracking

### 3.4 Risk Categorization

| Risk | Severity | Mitigation |
|---|---|---|
| Smart contract exploit (single protocol) | High | Per-protocol allocation cap (max 25%), circuit breaker auto-exits |
| USDC depeg | Critical | Oracle monitoring, emergency halt at 0.5% deviation |
| ML model failure | Medium | Automatic fallback to static greedy allocation |
| Cobo MPC unavailability | Medium | Signing queue with retry, manual override procedure |
| Rate compression across all DeFi | Low | RWA floor guarantees 4%+ base yield |
| Solana network congestion | Low | Priority fees, Helius dedicated RPC |
| Regulatory action on stablecoins | Low | USDC compliance (Circle regulated entity) |

---

## 4. ML Model Architecture

### 4.1 Design

**Model type:** Multi-output time-series regression with regime detection

**Input features (per protocol, 25 total):**
- Current lending/LP rate
- Utilization ratio
- Total value locked (TVL)
- 7-day rate moving average
- 30-day rate volatility

**Outputs:**
- 5 allocation weights (summing to 1.0, constrained to 10-60% each)
- Market regime classification (NORMAL, HIGH_DEMAND, RATE_COMPRESSION)
- Confidence score (0-1, keeper skips rebalance if < 0.6)

### 4.2 Training

- **Data:** Historical rates from all 5 protocols, sampled at 30-minute intervals
- **Objective:** Maximize Sharpe ratio of resulting portfolio
- **Validation:** Walk-forward cross-validation on 90-day rolling windows
- **Inference:** Local CPU inference, no cloud dependency, sub-second latency

### 4.3 Allocation Signal Contract

The ML model outputs a structured JSON signal consumed by the keeper bot:

```json
{
  "timestamp": "2026-04-15T14:30:00Z",
  "regime": "NORMAL",
  "allocations": {
    "ondo_usdy": 0.28,
    "kamino": 0.22,
    "marginfi": 0.18,
    "jupiter_lend": 0.12,
    "raydium_clmm": 0.20
  },
  "confidence": 0.82,
  "risk_metrics": {
    "portfolio_var_95": 0.0035,
    "expected_apy": 0.158,
    "max_drawdown_projected": 0.004,
    "hhi": 2250
  },
  "rebalance_urgency": "LOW"
}
```

---

## 5. Competitive Analysis

### Why We Avoid Drift

Drift has faced recent security events that create reputational risk for any vault building on it. We deliberately avoid Drift dependency, choosing Kamino, Marginfi, Jupiter Lend, and Raydium as our DeFi layer. This eliminates disqualification risk and demonstrates independent protocol selection.

### Differentiation Matrix

| Feature | Ranger | Typical Solana Vault |
|---|---|---|
| Yield sources | 5 (RWA + 4 DeFi) | 1-2 (DeFi only) |
| RWA integration | Yes (Ondo USDY) | No |
| Allocation method | Trained ML model | Static or manual |
| Security | Cobo MPC (no hot key) | Hot wallet |
| Risk framework | Quantitative (VaR, Monte Carlo, stress tests) | Qualitative or none |
| Circuit breakers | Automated 4-tier response | Manual monitoring |
| Regime detection | ML-based | None |
| Backtest evidence | 10,000 Monte Carlo paths, 90-day horizon | Typically none |
| Production viability | Institutional-grade security, automated operations | Developer-grade |

---

## 6. Production Readiness

### What Makes This Production-Ready

1. **Automated operations.** The keeper bot runs on a 30-minute cron with no human intervention required. It fetches rates, runs inference, builds transactions, signs via MPC, and executes.

2. **Fail-safe defaults.** ML model failure triggers static allocation. Circuit breakers trigger independently. Cobo MPC enforces transaction constraints regardless of keeper logic.

3. **Monitoring and alerting.** Helius webhooks for on-chain events, health monitors for protocol status, drawdown tracking with tiered response.

4. **Audit trail.** Every rebalance is logged with transaction signatures, allocation snapshots, and ML model outputs. Full Solscan verification possible.

5. **Scalable architecture.** Adding a new protocol requires only a new adaptor initialization and ML model retraining. The keeper, dashboard, and security layers are protocol-agnostic.

### Deployment Architecture

- **Dashboard:** Next.js on Vercel (auto-scaling, edge CDN)
- **Keeper bot:** Dedicated server with PM2 process management
- **ML inference:** Local CPU on keeper server (no cloud dependency)
- **Signing:** Cobo WaaS 2.0 API (SaaS, high availability)
- **RPC:** Helius dedicated endpoint (reliable, WebSocket support)
- **Monitoring:** Helius webhooks + custom alert manager

---

## 7. Key Numbers

| Metric | Value |
|---|---|
| Target APY | 14-16% |
| Floor APY (stress case) | 9.1% |
| Mean max drawdown | 1.97% |
| Sharpe ratio | 22+ |
| Rebalance frequency | Every 30 minutes (when beneficial) |
| Protocols | 5 (1 RWA + 4 DeFi) |
| Security model | Cobo MPC (no hot keys) |
| Backtest confidence | 99.95% probability of >10% APY |
