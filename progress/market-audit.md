# Ranger Market Positioning Audit

Audited: 2026-04-17. Scope: README, THESIS.md, PITCH_SCRIPT.md, E2E-STATUS.md, ml/inference/predict.py, ml/models/model_info.json, strategy/backtest_results.json.

**Strategy: BUILD UP to match the claims. Never retract. Every gap is a build target.**

---

## BUILD PRIORITY 1: Mainnet Vault Deployment (CRITICAL)

**Claim to back up:** "Live on Solana mainnet with verifiable performance"

**Current state:** The `01-init-vault.ts` script throws `RangeError: encoding overruns Uint8Array`. Cobo MPC API returns `error_code: 2024 "Unauthorized"` because the ed25519 keypair has not been registered in the Cobo dashboard.

**What to build:**
1. Fix the `RangeError` encoding bug in `contracts/src/scripts/01-init-vault.ts`
2. Register the ed25519 public key in the Cobo dashboard and provision a Solana MPC wallet
3. Run `01-init-vault.ts` on mainnet to deploy the actual vault
4. Execute at least one real deposit + rebalance transaction and publish the tx hash

**Outcome:** Pitch script's live demo segment becomes true. Dashboard shows real USDC in a real vault.

---

## BUILD PRIORITY 2: ML Benchmark Proof (HIGH)

**Claim to back up:** "Trained PyTorch time-series ML model for allocation" + "ML-driven allocation"

**Current state:** The primary allocator (`ml/inference/predict.py`) is regime-based (rules). The LSTM (`forecaster_weights.pt`) was trained on 32 samples over 47 days, with validation loss 0.98. The LSTM provides rate inputs, not allocation decisions.

**What to build:**
1. Collect real Solana DeFi rate data (Kamino, Marginfi, Ondo) via APIs and store in a training CSV
2. Retrain the LSTM on at least 90 days of real historical rates, target validation loss < 0.05
3. Add an ML-driven allocation head on top of the LSTM output (replace the hardcoded `REGIME_ALLOCATIONS` table with learned weights)
4. Run a real backtest comparing LSTM-driven allocation vs. equal-weight baseline on actual historical rate data, compute alpha
5. Publish the methodology and numbers in the README

**Outcome:** "Trained ML model with measurable alpha over baseline" is provably true with real numbers attached.

---

## BUILD PRIORITY 3: Keeper Network (MEDIUM)

**Claim to back up:** "47 registered keepers" (or keeper network visibility)

**Current state:** No keeper registry exists on-chain. The number 47 is not verifiable.

**What to build:**
1. Deploy a keeper registry program on devnet (or use an existing Solana on-chain list)
2. Register at minimum 5-10 real keeper wallets (team wallets, partner wallets, test wallets)
3. Show the registry on the dashboard with on-chain verification links
4. Optionally recruit real keepers from Solana community (post in Discord, Telegram)

**Outcome:** "Keeper network with N registered keepers, verifiable at [program address]" is a real claim.

---

## BUILD PRIORITY 4: APY Benchmark Validation (MEDIUM)

**Claim to back up:** "15-20% APY on USDC" and "<2% Max Drawdown"

**Current state:** The `backtest_results.json` used `seed=42` synthetic data. Sharpe of 20.57 is a simulation artifact. THESIS.md base case shows 8.6% APY without incentives.

**What to build:**
1. Replace synthetic backtest with real historical rate data (Kamino/Marginfi/Ondo rate history)
2. Run the allocation strategy against those real rates for a 90-day window
3. Compute honest APY range: base case (no incentives) and bull case (with incentives)
4. Remove Sharpe 20.57 from all public materials; replace with the real computed Sharpe
5. State clearly: "Base case 8.6% APY. With protocol incentives: 12-18% APY."

**Outcome:** APY claims are backed by real data, not simulation artifacts. Judges can't poke holes in the math.

---

## BUILD PRIORITY 5: Cross-Chain Arbitrage Visibility (LOW)

**Claim to back up:** "Real-time cross-chain arbitrage detection"

**Current state:** Arbitrage detection may be running in the backend but is not surfaced on the dashboard in a verifiable way.

**What to build:**
1. Add an "Arb Opportunities" panel to the dashboard showing live detected opportunities
2. Log cross-chain opps with timestamps and estimated spread to a visible feed
3. Link to Wormhole txs or bridge detection source

**Outcome:** The dashboard visibly demonstrates cross-chain detection in real time.

---

## BUILD PRIORITY 6: Revenue Model and GTM Narrative (LOW)

**Current gap:** No fee structure is mentioned anywhere. Judges and investors will ask this immediately.

**What to build/add to README and PITCH_SCRIPT:**
- "0% management fee during hackathon. Post-launch target: 0.5% management fee + 10% performance fee above benchmark."
- Target user statement: "DeFi-native protocols, DAOs, and sophisticated retail users seeking USDC yield above standard lending rates."
- Launch GTM: "Initial TVL from team + hackathon community; keeper incentives to bootstrap network."

---

## Competitive Claims: What Holds Up Now vs. Needs Backing

| Claim | Current Status | Build Needed |
|-------|---------------|--------------|
| RWA + multi-protocol + CLMM is novel for this hackathon | TRUE, defensible | None |
| No Drift dependency | TRUE, verifiable | None |
| No other Build-a-Bear entry combines all three yield layers | Likely true, not verified | Search hackathon submissions and confirm |
| Competitor SolNeutral ~14.8% | Unverified internal estimate | Pull real data or remove specific number |
| "Our floor beats DeekRoumy's 7.7%" | Floor alone is 0.8-2%, not > 7.7% | Fix math: "full blended yield targets 15-20%, above competitor range" |

---

## What Already Works (Claim These Now, No Build Needed)

- Three-layer yield architecture (RWA floor + lending + CLMM): real and differentiated
- Five-tier drawdown circuit breaker with defined thresholds: implemented in code
- Per-protocol max allocation (60%), minimum Ondo floor (20%): real constraints
- Voltr adaptor selection (Trustful, Lending, Raydium): appropriate and implemented
- Dashboard UI with TVL, APY, allocation charts, rebalance log: real and functional
- Admin keypair funded on devnet with a verifiable Solscan transaction

---

## Build Roadmap Summary

| Priority | Item | Effort | Judge Impact |
|----------|------|--------|-------------|
| 1 | Mainnet vault deployment (fix encoding bug + Cobo registration) | High | CRITICAL |
| 2 | Retrain ML on real data + add allocation head + real backtest | High | HIGH |
| 3 | Keeper registry on-chain with real wallets | Medium | MEDIUM |
| 4 | Real APY validation from historical rate data | Medium | HIGH |
| 5 | Arb dashboard panel with live feed | Low | MEDIUM |
| 6 | Revenue model + GTM copy in README/pitch | Low | MEDIUM |
