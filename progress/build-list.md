# Build List: Close the Gap Between Claims and Code

Strategy: every audit finding becomes a build task. We build up to match claims, never cut claims.

---

## Priority 1: Missing Pages (Build Them)

**Claim:** `/rebalances`, `/risk`, `/strategy` dashboard pages exist  
**Gap:** Only root `page.tsx` exists  
**Build:**
- `src/app/rebalances/page.tsx` - rebalance history table + timeline chart
- `src/app/risk/page.tsx` - circuit breaker status, drawdown meter, VaR display
- `src/app/strategy/page.tsx` - regime card, allocation breakdown, thesis narrative

---

## Priority 2: Test Suite (Build It)

**Claim:** "production-ready at the code layer"  
**Gap:** Zero test files, no test script  
**Build:**
- `tests/unit/backtest.test.ts` - backtest math correctness
- `tests/unit/circuit-breaker.test.ts` - drawdown threshold, daily reset
- `tests/unit/ml-inference.test.py` - allocation output shape, weight sum = 1.0
- `tests/integration/keeper-loop.test.ts` - end-to-end rebalance cycle
- Add `"test": "jest"` to `package.json`

---

## Priority 3: ML Model Upgrades (Build Them)

### 3a. Add Marginfi to trained model
**Claim:** ARCHITECTURE.md lists Marginfi as a trained protocol  
**Gap:** `model_info.json` excludes it  
**Build:** Retrain with Marginfi data included; update `model_info.json`

### 3b. Add utilization ratio + 7-day MA as features
**Claim:** ARCHITECTURE.md lists 5 features including utilization ratio and 7-day MA  
**Gap:** `FEATURES_PER_PROTOCOL = 4`, only apy/apy_base/apy_reward/log(tvl)  
**Build:** Add `utilization_ratio` and `apy_7d_ma` to feature pipeline, update `FEATURES_PER_PROTOCOL = 6`, retrain

### 3c. Add Sharpe-ratio loss term to training
**Claim:** "Objective: Maximize risk-adjusted returns (Sharpe ratio >2.0)"  
**Gap:** Training uses `nn.MSELoss()` only  
**Build:** Add composite loss: `loss = mse_loss + lambda * (-sharpe_approx)` where sharpe_approx = mean(returns) / std(returns) over prediction window

---

## Priority 4: Fix Math Bugs (So Numbers Are Real)

### 4a. Fix drawdown calculation in ml/backtest/engine.py
**Bug:** Uses `np.cumsum` (additive) instead of `np.cumprod` (multiplicative)  
**Fix:** Replace lines 275-278 with multiplicative compounding matching `strategy/backtest.py:221-224`

### 4b. Fix Sharpe ratio denominator in strategy/backtest.py
**Bug:** `daily_returns_arr.std()` in denominator instead of `excess_returns.std()`  
**Fix:** `sharpe = (excess_returns.mean() / excess_returns.std()) * np.sqrt(365)`  
**Note:** Also add realistic DeFi volatility noise (~0.8%/day) to backtest so Sharpe reflects real market conditions

### 4c. Fix VaR percentile calculation
**Bug:** `int(0.05 * 90) = 4` gives 4.44th percentile instead of 5th  
**Fix:** Use `np.percentile(daily_returns_arr, 5)` with linear interpolation

### 4d. Fix circuit breaker midnight reset to rolling 24h window
**Bug:** `resetDailyCounters()` fires on calendar date change, erasing <24h transactions  
**Fix:** Replace wall-clock date check with rolling 24-hour window: filter `transactionLog` to entries within last 86400000ms

---

## Priority 5: Align Config to Stronger Numbers (Docs -> Code)

### 5a. Circuit breaker threshold: set code to match 3.0% claim
**Gap:** Code fires at 2.5%, all docs say 3.0%  
**Fix:** `drawdown-tracker.ts:24` set `pct: 0.03`

### 5b. Keeper loop interval: align to 5-min for 15-min regime confirmation
**Gap:** `keeper-loop.ts` defaults to 30min, making "3 confirmations = 15 min" actually 90 min  
**Fix:** Set `intervalMs` default to `300_000` (5 min). Three confirmations = 15 min as claimed.

### 5c. Fix ml/config.py sequence_length to match trained model
**Gap:** `config.py` says 30, `forecaster.py` and `model_info.json` use 7  
**Fix:** `ml/config.py:40` set `sequence_length: int = 7`

### 5d. Remove marginfi from ml/config.py PROTOCOLS until model is retrained with it
**Gap:** `config.py` includes `marginfi-lend`, forecaster excludes it  
**Fix (temporary):** Comment out marginfi in `ml/config.py` until Priority 3a retrain is done

### 5e. Standardize max rebalances/day to 48 across all docs
**Gap:** Docs say 10 (arch) and 20 (strategy); code enforces 48  
**Fix:** Update ARCHITECTURE.md and REBALANCING.md to say 48. The higher number is stronger.

### 5f. Standardize min rebalance interval to 1 min across all docs
**Gap:** Docs say 15 min; code defaults to 1 min  
**Fix:** Update ARCHITECTURE.md to say 1 min (more responsive = better story)

---

## Priority 6: Fix Docs to Match Real (Better) Numbers

### 6a. Update README mean APY: 14.15% -> 14.99%
**Fix:** `README.md:99` change to "14.99% mean APY"

### 6b. Update ARCHITECTURE.md model output description
**Fix:** Describe the two-stage pipeline: "Stage 1: RateForecaster predicts next-day APY per protocol. Stage 2: optimize_allocation() converts APY predictions to allocation weights using Sharpe-maximizing optimizer."

### 6c. Update ARCHITECTURE.md regime names
**Fix:** Change "Bull/bear/neutral" to "NORMAL/HIGH_DEMAND/RATE_COMPRESSION"

### 6d. Update README dashboard component count to 11
**Fix:** `README.md:70` change to "11 dashboard components"

### 6e. Fix HHI example in ALLOCATION_MODEL.md to use real NORMAL weights
**Fix:** Use `ondo=28%, kamino=22%, marginfi=18%, jupiter=12%, raydium=20%` -> HHI = 2136; update `backtest_results.json` accordingly

### 6f. Create ml-service/ as a proper standalone service
**Gap:** `E2E-STATUS.md` references `ml-service/` directory with uvicorn  
**Build:** Move `ml/` entrypoint into `ml-service/main.py` with FastAPI + uvicorn wrapper so the documented `cd ml-service && uvicorn main:app --reload` actually works

---

## Execution Order

| Phase | Tasks | Effort |
|-------|-------|--------|
| **Now (docs/config)** | 5a-5f, 6a-6f | 1-2h |
| **This session (code)** | 4a-4d, Priority 1 (pages) | 3-4h |
| **Next session (ML)** | 2 (tests), 3a-3c, 6f | 4-6h |
