# Code Critic Audit: Build Targets

Auditor: code-critic-ranger  
Date: 2026-04-17  
Directive: All findings framed as BUILD targets, not retractions.

---

## Priority 1: Build Missing Pages (High Judge Impact)

### B1. Build /rebalances, /risk, /strategy dashboard pages
- **Why:** ARCHITECTURE.md promises 4 dashboard pages. Only root `/` exists.
- **Build:** Create `src/app/rebalances/page.tsx`, `src/app/risk/page.tsx`, `src/app/strategy/page.tsx` with real data from existing components (`rebalance-history.tsx`, `risk-metrics.tsx`, `strategy-thesis.tsx`).
- **Files to update:** `docs/ARCHITECTURE.md:104-107` (update route list to match what ships)

### B2. Add test suite (backs up "production-ready" claim)
- **Why:** Zero test files exist. Judges will check. E2E-STATUS.md calls this "production-ready."
- **Build:** Add integration tests for keeper loop, circuit breaker, ML inference, and Voltr vault interactions. Add `"test"` script to `package.json`.
- **Minimum:** 10-15 tests covering critical paths (keeper rebalance, drawdown detection, ML predict, vault deposit/withdraw).

---

## Priority 2: Fix Math Bugs (Code Quality, Judge Deep-Dive)

### B3. Fix drawdown calculation in ml/backtest/engine.py
- **File:** `ml/backtest/engine.py:275-278`
- **Fix:** Replace `np.cumsum(returns)` with `np.cumprod(1 + returns)` to match the correct multiplicative compounding already used in `strategy/backtest.py:221-224`.

### B4. Fix Sharpe ratio denominator in strategy/backtest.py
- **File:** `strategy/backtest.py:227`
- **Fix:** Change `daily_returns_arr.std()` to `excess_returns.std()` in the Sharpe denominator. Rerun backtest to update `backtest_results.json` with corrected Sharpe.

### B5. Fix circuit breaker midnight reset to rolling 24h window
- **File:** `security/circuit-breaker/circuit-breaker.ts:259-260, 281-298`
- **Fix:** Replace calendar-date reset with rolling 24-hour window using timestamp filtering on `transactionLog`.

### B6. Fix VaR calculation to use proper 5th percentile
- **File:** `strategy/ALLOCATION_MODEL.md:137-143` (pseudocode example)
- **Fix:** Update pseudocode to use `np.percentile(daily_returns, 5)` matching the correct implementation in `strategy/backtest.py:231`.

---

## Priority 3: Sync Docs to Match Code (Consistency)

### B7. Update README component count: 9 -> 11
- **File:** `README.md:70`
- **Fix:** Change "9 dashboard components" to "11 dashboard components" and add `monte-carlo-stats` and `strategy-thesis` to the list.

### B8. Update mean APY figure in README and E2E-STATUS
- **Files:** `README.md:99`, `docs/E2E-STATUS.md:57`
- **Fix:** Update "14.15%" to match backtest output (14.99% or rerun after B4 fix for corrected value).

### B9. Update ARCHITECTURE.md ML section to match actual model
- **File:** `docs/ARCHITECTURE.md:60-81`
- **Fixes (batch):**
  - Features per protocol: 5 -> 4 (apy, apy_base, apy_reward, log(tvl))
  - Model output: "allocation weights" -> "predicted APY per protocol, then optimized to weights"
  - Training objective: "Sharpe ratio" -> "MSE on next-day APY prediction"
  - Protocols: Remove Marginfi or add Marginfi to actual model training
  - Regime names: "bull/bear/neutral" -> "NORMAL/HIGH_DEMAND/RATE_COMPRESSION"

### B10. Fix ml-service reference in E2E-STATUS
- **File:** `docs/E2E-STATUS.md:75`
- **Fix:** Change `cd ml-service && uvicorn main:app --reload` to actual ML inference path: `python ml/inference/predict.py`

### B11. Align rate limiter values across docs and code
- **Files:** `docs/ARCHITECTURE.md:120`, `strategy/REBALANCING.md:185`, `security/config/security-config.ts:70-71`
- **Decision needed:** Pick ONE set of values (code currently enforces 1 min / 48/day). Update all docs to match, or tighten code to match docs.

### B12. Align circuit breaker threshold: docs say 3.0%, code says 2.5%
- **Files:** `README.md:116`, `strategy/RISK_FRAMEWORK.md:49`, `security/monitoring/drawdown-tracker.ts:24`
- **Decision needed:** Pick one value. Update the others to match.

### B13. Align ML sequence_length: config.py says 30, trained model uses 7
- **Files:** `ml/config.py:40`, `ml/models/forecaster.py:31`
- **Fix:** Update `ml/config.py` `sequence_length` default to 7 to match trained model. Or make `forecaster.py` read from `ModelConfig`.

### B14. Align protocol lists between ml/config.py and forecaster.py
- **Files:** `ml/config.py:16-32`, `ml/models/forecaster.py:28`
- **Fix:** Remove `marginfi-lend` from `ml/config.py` PROTOCOLS (since the trained model doesn't include it), or retrain with Marginfi data.

### B15. Align Kamino stress-test allocation across strategy docs
- **Files:** `strategy/RISK_FRAMEWORK.md:72`, `strategy/backtest.py:399`, `strategy/THESIS.md:115`
- **Fix:** Pick 22% (the code-computed value) and update RISK_FRAMEWORK (25%) and THESIS (20%) to match.

### B16. Fix HHI example in ALLOCATION_MODEL.md
- **File:** `strategy/ALLOCATION_MODEL.md:112-125`
- **Fix:** Update example allocations and HHI value to match actual NORMAL regime weights (HHI = 2136).

### B17. Fix regime confirmation window documentation
- **Files:** `strategy/REBALANCING.md:61,83`
- **Fix:** Update "15 min persistence" to reflect actual keeper cycle (30 min intervals = 90 min for 3 confirmations), or reduce keeper interval to 5 min to match docs.

---

## Summary: Build Priority Matrix

| Priority | ID | Task | Effort | Judge Impact |
|----------|-----|------|--------|-------------|
| P1 | B1 | Build 3 missing dashboard pages | Medium | HIGH |
| P1 | B2 | Add test suite (10-15 tests) | Medium | HIGH |
| P2 | B3 | Fix drawdown calc (cumsum -> cumprod) | Small | HIGH |
| P2 | B4 | Fix Sharpe denominator + rerun backtest | Small | HIGH |
| P2 | B5 | Fix circuit breaker to rolling 24h | Small | MEDIUM |
| P2 | B6 | Fix VaR pseudocode in docs | Tiny | LOW |
| P3 | B7 | README component count 9->11 | Tiny | LOW |
| P3 | B8 | Update mean APY figure | Tiny | LOW |
| P3 | B9 | Update ARCHITECTURE.md ML section | Small | MEDIUM |
| P3 | B10 | Fix ml-service path reference | Tiny | LOW |
| P3 | B11 | Align rate limiter values (decision needed) | Small | MEDIUM |
| P3 | B12 | Align circuit breaker threshold (decision needed) | Small | MEDIUM |
| P3 | B13 | Align ML sequence_length | Tiny | MEDIUM |
| P3 | B14 | Align protocol lists | Tiny | MEDIUM |
| P3 | B15 | Align Kamino stress allocation | Tiny | LOW |
| P3 | B16 | Fix HHI example | Tiny | LOW |
| P3 | B17 | Fix regime confirmation docs | Tiny | LOW |

**17 build targets. 0 retractions. Every claim gets backed by real code.**
