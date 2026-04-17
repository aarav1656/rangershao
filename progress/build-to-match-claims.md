# Build List: Back Up Every Claim

**Directive:** Build up to match claims. Never downplay. Every gap is a build task.
**Source:** domain-expert-ranger audit (2026-04-17)

---

## Claim 1: "CLMM position management on Raydium"

**Current state:** CLMM strategy exists in allocation engine but active range management is not implemented. If price moves out of range, yield drops to zero silently.

**What to build:**
- Out-of-range detection: poll Raydium position state every keeper cycle, detect when price exits the configured tick range
- Auto-rebalance trigger: when out-of-range, close the position and reopen around current price within configured width
- Range health metric: expose `clmm_in_range_pct` (% of time in range over 24h) in the dashboard
- This makes the CLMM claim fully defensible and adds a real moat (most vaults skip this complexity)

---

## Claim 2: "LSTM predicts yield with high accuracy"

**Current state:** Model trains with 80/20 split but no test metrics are surfaced or reported.

**What to build:**
- Eval harness: after training, compute MAE and RMSE on the held-out 20% test set
- Baseline comparison: compare against naive persistence (predict tomorrow = today) — beating persistence is the minimum bar
- Metrics endpoint: expose `GET /ml/metrics` returning `{test_mae, test_rmse, baseline_mae, improvement_pct, trained_at}`
- Display in dashboard: "Model accuracy: X% better than naive baseline on held-out data"
- This turns a vague accuracy claim into a verifiable number

---

## Claim 3: "14.15% mean APY across 10,000 Monte Carlo simulations"

**Current state:** OU process parameters may be estimated rather than calibrated from actual historical rate data. Without real calibration, the number is unverifiable.

**What to build:**
- Historical data ingestion: pull actual Kamino/MarginFi/Jupiter Lend rate history from on-chain (use Flipside, Dune, or direct RPC calls to lending market state accounts)
- OU parameter calibration: fit mean-reversion speed (θ), long-run mean (μ), and volatility (σ) to actual rate history for each protocol
- Calibration report: store calibration params + fit quality (R², residuals) in `ml/calibration_report.json`
- Monte Carlo re-run: rerun 10,000 simulations with calibrated params and report the resulting mean + 95% CI
- Dashboard: show "Monte Carlo: 14.2% mean APY (95% CI: 11.8%–16.9%) — calibrated from N days of on-chain data"
- This makes the specific number defensible with real data behind it

---

## Claim 4: "Regime detection improves allocation timing"

**Current state:** Regime detection has a 15-minute lag (3 confirmations × 5-min intervals). In a utilization spike, the model is slow to react.

**What to build:**
- Configurable confirmation window: make `REGIME_CONFIRMATION_COUNT` and `REGIME_CHECK_INTERVAL_MS` env vars
- Fast-path trigger: if any single protocol utilization crosses a hard threshold (e.g., >90%), immediately declare HIGH_DEMAND without waiting for 3 confirmations
- Regime transition log: persist every regime change with timestamp, trigger protocol, and rate snapshot
- Dashboard: show current regime, last transition, and allocation change triggered
- This makes the regime detection claim stronger and measurable

---

## Claim 5: "Cobo MPC eliminates key management risk"

**Current state:** Cobo callback webhook has no HMAC verification. A spoofed callback could trigger unauthorized state transitions.

**What to build:**
- Webhook HMAC verification: verify Cobo's HMAC-SHA256 signature on every incoming callback before processing
- Reject and log any callback that fails signature check
- This closes the one real security gap in the custody stack and makes the "eliminates key management risk" claim airtight

---

## Claim 6: "Institutional-grade vault with Cobo MPC"

**Current state:** Cobo approval policies (spending limits, whitelist destinations, multi-approver) are set in the Cobo dashboard but not configured or documented in the codebase.

**What to build:**
- Policy configuration script: `scripts/configure-cobo-policies.ts` that uses Cobo WaaS v2 API to programmatically set spend limits, destination whitelists, and approval rules
- Policy documentation: `docs/cobo-policy-config.md` that specifies the exact policies enforced and how to verify them
- This lets judges and institutional clients audit the policy setup, not just take our word for it

---

## Claim 7: "ML model stays accurate over time"

**Current state:** No model drift detection. If DeFi rate regimes shift permanently (e.g., post-Fed-rate-cut baseline drops), the model's z-score normalization becomes stale.

**What to build:**
- Drift monitor: after each keeper cycle, compute rolling prediction error over the last 7 days
- Alert threshold: if 7-day RMSE exceeds 2× training RMSE, flag `MODEL_DRIFT_DETECTED` in system health
- Retrain trigger: expose `POST /ml/retrain` endpoint that keeper can call when drift is detected
- Dashboard: show model age, rolling error trend, and last retrain timestamp
- This makes the "stays accurate" claim defensible for institutional due diligence

---

## Claim 8: "Multi-protocol coverage reduces concentration risk"

**Current state:** Solend is included in constants but not featured in THESIS.md. The constraint system enforces min 3 protocols but doesn't surface HHI live.

**What to build:**
- Live HHI dashboard widget: compute and display current Herfindahl-Hirschman Index of allocation in real time
- HHI alert: if HHI exceeds 0.25 (moderately concentrated), trigger rebalance
- Protocol coverage report: show how many protocols are active vs available, and why any are excluded (e.g., low TVL, rate below floor)
- This makes the concentration risk claim quantitative and verifiable on the dashboard

---

## Claim 9: "Keeper bot maintains continuous rebalancing"

**Current state:** Single keeper instance with no redundancy. If the keeper crashes, rebalancing stops.

**What to build:**
- Heartbeat endpoint: `GET /health/keeper` returns last successful rebalance timestamp and time-since-last-run
- Stale keeper alert: if no rebalance in 2× the configured interval, emit an alert (webhook, PagerDuty, or Telegram bot)
- Restart runbook: `docs/keeper-ops.md` with step-by-step restart and health check procedure
- Optional: second keeper instance with leader election via on-chain state flag (prevents double-execution)
- This turns a potential single-point-of-failure into a monitored, documented operational system

---

## Priority Order

| # | Build Task | Claim It Backs | Effort |
|---|-----------|---------------|--------|
| 1 | CLMM range management | "CLMM position management" | High |
| 2 | ML eval harness + metrics endpoint | "High accuracy" | Medium |
| 3 | OU calibration from real on-chain data | "14.15% mean APY" | Medium |
| 4 | Cobo webhook HMAC verification | "Eliminates key management risk" | Low |
| 5 | Configurable regime detection + fast-path | "Regime detection" | Low |
| 6 | Live HHI dashboard widget | "Concentration risk" | Low |
| 7 | Model drift detection + retrain trigger | "Stays accurate over time" | Medium |
| 8 | Cobo policy configuration script | "Institutional-grade" | Medium |
| 9 | Keeper heartbeat + stale alert | "Continuous rebalancing" | Low |

---

*Build list generated by domain-expert-ranger. Every item here is a build task, not a cut.*
