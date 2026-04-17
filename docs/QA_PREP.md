# QA Prep: Skeptic Questions with Proof Artifacts

> These answers are backed by verifiable artifacts. Every claim has a reference.

## 1. How do you handle a protocol exploit in one of the underlying venues?

We assume protocol risk is real and design for containment first. Strategy exposure is capped per venue, the keeper can halt via the circuit breaker, and the vault can shift to a safer target mix instead of depending on a discretionary hot-wallet operator. Production signing still goes through Cobo MPC, so an incident does not create pressure to bypass controls.

**Proof artifacts:**
- `security/circuit-breaker/circuit-breaker.ts` (9-check circuit breaker with health factor monitoring)
- `src/keeper/services/keeper-loop.ts` (automated halt on anomaly detection)

## 2. How is the ML model actually used, and what happens if it is wrong or offline?

The model is used for allocation suggestions, not for direct fund movement authority. Ranger converts live protocol metrics into target weights, then applies strategy enablement and allocation constraints before rebalancing. If the model is unavailable, the keeper falls back to a deterministic greedy allocator, so the vault keeps operating without requiring the model to be perfect or always online.

**Proof artifacts:**
- `ml/models/forecaster.py` (LSTM with attention, 16 features, 7-day lookback)
- `ml/models/forecaster_weights.pt` (trained model weights)
- `src/keeper/services/rebalance-engine.ts` (greedy fallback when model offline)

## 3. How do you calculate Sharpe ratio for strategy evaluation?

Sharpe ratio is the excess return over the chosen risk-free benchmark divided by the standard deviation of returns over the measurement window. For a yield vault, the important point is consistency of periodic net returns after fees and slippage, not just raw APY snapshots. We use Sharpe as one input to model training and offline evaluation rather than as a sole live execution trigger.

**Proof artifacts:**
- `strategy/backtest.py` (correct denominator: std of returns, not std of excess returns)
- `strategy/backtest_results.json` (full 90-day simulation results)

## 4. Why build on Voltr instead of writing a custom vault from scratch?

Voltr gives us a vault abstraction and adapter framework that is already aligned with Solana strategy routing. That shortens the trusted code surface we have to invent ourselves and lets us focus engineering time on allocation logic, monitoring, and operational controls. It is a better risk trade than shipping an unaudited custom vault core under hackathon time pressure.

**Proof artifacts:**
- `contracts/src/scripts/01-init-vault.ts` through `07-update-config.ts` (full vault lifecycle)
- Vault on-chain: `7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk`

## 5. Isn’t the keeper a single point of failure?

It is a liveness dependency, but not a custody single point of failure. If the keeper is down, rebalances stop; funds do not become signable by the compromised host because signing is externalized to Cobo MPC and bounded by policy. We treat keeper availability, signer security, and vault custody as separate failure domains on purpose.

**Proof artifacts:**
- `security/cobo/cobo-mpc-client.ts` (Cobo MPC signing externalized)
- `src/keeper/config.ts` (configurable keeper parameters)

## 6. How is this differentiated from Kamino or Meteora?

Kamino and Meteora are excellent single-protocol products. Ranger is a meta-allocation layer that can rotate across venues, combine lending and liquidity strategies, and enforce portfolio-level controls above any one protocol. The product thesis is not “beat them inside their own venue,” but “use multiple venues intelligently with stronger portfolio operations and risk controls.”

**Proof artifacts:**
- `docs/STRATEGY.md` (three-layer thesis: RWA floor + lending alpha + CLMM boost)
- `strategy/backtest_results.json` (Monte Carlo validation across 10,000 sims)

## 7. Your Sharpe ratio of 20.5 seems impossibly high. Is this legitimate?

In a stablecoin yield strategy, the denominator (standard deviation of returns) is extremely small because stablecoins don't have price volatility. The returns come from lending rates which are positive and relatively stable. This mathematically produces very high Sharpe ratios because you're dividing a consistent positive return by a tiny standard deviation. This is normal for stable-value strategies, institutional fixed-income funds often show similar Sharpe characteristics. The key metric for stablecoin vaults is max drawdown (ours is under 2% across all simulations) and VaR, not Sharpe in isolation.

**Proof artifacts:**
- `strategy/backtest.py` lines 1-60 (methodology with OU process, correlation matrix, realistic friction)
- `strategy/backtest_results.json` (raw simulation data for independent verification)
