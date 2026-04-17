# ML Methodology

## Model Architecture

Ranger uses an LSTM (Long Short-Term Memory) neural network with attention for time-series forecasting of DeFi protocol yields.

| Parameter | Value |
|-----------|-------|
| Architecture | LSTM + Attention |
| Framework | PyTorch |
| Input features | 23 (16 raw + 7 derived) |
| Sequence length | 7 days |
| Forecast horizon | 1 day |
| Protocols covered | Kamino, Jupiter Lend, Raydium CLMM, Ondo USDY |

## Feature Engineering

### Raw Features (per protocol, 4 each)
- `apy`: Current annualized yield
- `apy_base`: Base lending/LP yield component
- `apy_reward`: Incentive/reward yield component
- `tvl`: Total value locked (log-transformed via `log1p`)

### Derived Features (7 total)
- `avg_apy`: Mean APY across all protocols
- `std_apy`: Standard deviation of APYs (dispersion signal)
- `spread`: Max APY minus Min APY (opportunity signal)
- `momentum_*`: Per-protocol APY change from previous day (4 values)

## Training Pipeline

1. **Data acquisition**: Historical rates downloaded from DefiLlama API (`ml/data/download_historical.py`)
2. **Preprocessing**: Z-score normalization with saved scaler parameters
3. **Windowing**: Sliding windows of 7 consecutive days, predicting day 8
4. **Training**: Standard supervised learning with MSE loss
5. **Persistence**: Weights saved to `ml/models/forecaster_weights.pt`, scaler to `ml/models/scaler_params.json`

Training is orchestrated end-to-end by `ml/train.py`.

## Inference Flow

The trained model runs in a FastAPI service (`ml/inference/service.py`). The keeper bot calls it every 30 minutes:

1. Keeper fetches live protocol rates from on-chain data
2. Features are constructed in the same order as training
3. Model predicts next-day risk-adjusted returns per protocol
4. Predictions feed into the allocation optimizer (convex optimization + regime detection)
5. Optimizer outputs target weights respecting constraints (min 10%, max 60%)

If the ML service is unavailable, the keeper falls back to a deterministic greedy allocator.

## Backtest Validation

### Methodology
- **Window**: 90 days
- **Simulations**: 10,000 Monte Carlo runs
- **Rate model**: Ornstein-Uhlenbeck (mean-reverting) with protocol-specific parameters
- **Correlation**: Cross-protocol correlation modeled via Cholesky decomposition
- **Friction**: Gas, slippage, and rate lag modeled per protocol (0.1-0.5 bps/day)
- **Risk events**: Annual exploit probability per protocol (0.5-4%)
- **CLMM IL**: Impermanent loss modeled at 0.08% daily std for tight stable pair ranges
- **Rebalance cost**: 5 bps per rebalance

### Regime-Based Allocation

The optimizer detects three market regimes and adjusts target allocations:

| Regime | Ondo USDY | Kamino | MarginFi | Jupiter | Raydium CLMM |
|--------|-----------|--------|----------|---------|--------------|
| Normal | 28% | 22% | 18% | 12% | 20% |
| High Demand | 20% | 28% | 22% | 12% | 18% |
| Rate Compression | 38% | 15% | 10% | 10% | 27% |

### Results Summary
- **Mean APY**: 14.15%
- **Max drawdown (P95)**: < 2%
- **Sharpe ratio**: > 1.8 (mean across simulations)
- **100% of simulations**: Drawdown under 2%

### Why the Sharpe Ratio Is High

Stablecoin yield strategies have inherently low return volatility (no price risk, only rate risk). The Sharpe denominator (std of returns) is small while the numerator (excess return) is consistently positive. This produces mathematically high Sharpe ratios, consistent with institutional fixed-income strategies operating in low-volatility regimes.

## Model Limitations

- Historical DefiLlama data may not capture flash events or oracle manipulation
- 7-day lookback may miss longer-term regime shifts
- Protocol incentive structures can change abruptly (e.g., reward token emissions ending)
- The model is retrained periodically; live inference uses the last trained weights

## File References

| File | Purpose |
|------|---------|
| `ml/models/forecaster.py` | LSTM model definition and training |
| `ml/models/forecaster_weights.pt` | Trained model weights |
| `ml/models/scaler_params.json` | Feature normalization parameters |
| `ml/train.py` | End-to-end training orchestrator |
| `ml/inference/service.py` | FastAPI inference service |
| `ml/data/download_historical.py` | DefiLlama data download |
| `strategy/backtest.py` | Monte Carlo backtest engine |
| `strategy/backtest_results.json` | Backtest output data |
