# Ranger Risk Framework

## Risk Taxonomy

### Tier 1: Protocol Risk (Smart Contract Exploits)
- **Probability:** Low (2-5% per protocol per year)
- **Impact:** Loss of allocated capital to that protocol
- **Mitigation:** Max 60% per protocol, min 3 active protocols, protocol risk scoring
- **Residual risk:** Max 60% loss in single-protocol exploit (absolute worst case)

### Tier 2: Market Risk (Rate Volatility)
- **Probability:** High (rates fluctuate daily)
- **Impact:** APY deviation from target
- **Mitigation:** Regime-based allocation, RWA floor, dynamic rebalancing
- **Residual risk:** APY could drop to 5-6% in sustained rate compression

### Tier 3: Liquidity Risk (Withdrawal Delays)
- **Probability:** Medium during high utilization
- **Impact:** Delayed redemptions from lending pools
- **Mitigation:** Stagger maturities, maintain 20%+ in liquid Ondo USDY, monitor utilization
- **Residual risk:** Partial withdrawal delays of 1-24 hours

### Tier 4: Oracle Risk (Price Feed Manipulation)
- **Probability:** Very low on Solana (Pyth/Switchboard)
- **Impact:** Incorrect liquidation triggers, mispriced positions
- **Mitigation:** Multi-oracle validation, Pyth confidence intervals
- **Residual risk:** Brief mispricing windows

### Tier 5: Operational Risk (Keeper/MPC Failures)
- **Probability:** Low
- **Impact:** Missed rebalances, stale positions
- **Mitigation:** Redundant keepers, Cobo MPC with multi-sig fallback
- **Residual risk:** Max 1-hour delay in rebalancing

### Tier 6: Stablecoin Risk (USDC Depeg)
- **Probability:** Very low (Circle is regulated, full reserves)
- **Impact:** NAV deviation
- **Mitigation:** Monitor depeg signals, emergency exit to SOL if >2% depeg
- **Residual risk:** Temporary NAV volatility during depeg events

## Drawdown Limits

| Level | Drawdown | Action |
|-------|----------|--------|
| **Watch** | 0.5% | Alert team, increase monitoring frequency to 1-min |
| **Caution** | 1.0% | Shift 15% from highest-risk to Ondo USDY |
| **Warning** | 1.5% | Shift 30% to Ondo USDY, pause new CLMM positions |
| **Critical** | 2.0% | Emergency exit all DeFi positions, 100% to Ondo USDY |
| **Circuit Breaker** | 3.0% | Full vault pause, manual review required |

## Liquidation Buffer Management

For any lending positions with borrowing (if applicable):

```
Health Factor Target: 1.50 (50% buffer above liquidation)
Health Factor Minimum: 1.20 (hard floor, triggers immediate deleveraging)
Health Factor Warning: 1.30 (begin reducing position)

Action at each level:
  HF > 1.50: Normal operations
  HF 1.30-1.50: Reduce position by 20%
  HF 1.20-1.30: Reduce position by 50%, alert
  HF < 1.20: Emergency full exit from position
```

Since the strategy is USDC lending (supplying, not borrowing), liquidation risk applies only if the vault uses recursive lending strategies. Our constraint of max 1.05x leverage means liquidation risk is near-zero.

## Stress Test Scenarios

### Scenario 1: Single Protocol Exploit
- **Setup:** Kamino (25% allocation) is exploited, funds lost
- **Impact:** -25% immediate, remaining 75% continues earning
- **Recovery:** At 12% APY on remaining capital, breakeven in ~25 months
- **Lesson:** This is why max allocation is 60%, not 100%

### Scenario 2: Sustained Rate Compression (90 days)
- **Setup:** All lending rates drop to 3-4% across Solana
- **Impact:** APY drops to ~5-6% (Ondo floor + minimal DeFi)
- **Recovery:** Rates historically recover within 30-60 days
- **Lesson:** RWA floor prevents negative returns even in worst rate environment

### Scenario 3: USDC Depeg Event (March 2023 replay)
- **Setup:** USDC drops to $0.87 (as it did briefly in March 2023)
- **Impact:** NAV drops 13% temporarily, but all positions denominated in USDC
- **Recovery:** USDC recovered to $1.00 within 3 days in 2023
- **Lesson:** Monitor Circle/SVB-type events, emergency procedures ready

### Scenario 4: Solana Network Outage (12 hours)
- **Setup:** Solana halts for 12 hours (has happened historically)
- **Impact:** Cannot rebalance, positions frozen, no new deposits/withdrawals
- **Recovery:** Positions resume when network returns, no capital loss
- **Lesson:** Cobo MPC queue transactions for execution on resume

### Scenario 5: Correlated Protocol Failures
- **Setup:** Two lending protocols fail simultaneously (extremely unlikely)
- **Impact:** Max loss of 50% if both at max allocation (but constraints prevent this)
- **Impact (with constraints):** Max loss ~40% (25% + 20% at target allocations)
- **Recovery:** Not feasible in short term
- **Lesson:** This is the true tail risk, probability <0.1% per year

### Scenario 6: Oracle Manipulation Attack
- **Setup:** Pyth oracle feed manipulated for USDC/USD
- **Impact:** Incorrect health factors, potential forced liquidations
- **Recovery:** Pyth confidence intervals flag anomalies, positions paused
- **Lesson:** Multi-oracle validation is critical

## Monte Carlo Simulation Parameters

For backtesting and forward projection:

```python
SIMULATION_CONFIG = {
    "num_simulations": 10000,
    "time_horizon_days": 90,
    "rate_model": "mean_reverting_ou",  # Ornstein-Uhlenbeck
    "parameters": {
        "kamino": {
            "mean_rate": 0.10,      # 10% APY long-term mean
            "volatility": 0.05,     # 5% annualized vol of rate
            "mean_reversion": 0.15, # Speed of mean reversion
            "min_rate": 0.02,       # Floor rate
            "max_rate": 0.50        # Ceiling rate
        },
        "marginfi": {
            "mean_rate": 0.09,
            "volatility": 0.06,
            "mean_reversion": 0.12,
            "min_rate": 0.02,
            "max_rate": 0.45
        },
        "jupiter_lend": {
            "mean_rate": 0.08,
            "volatility": 0.05,
            "mean_reversion": 0.15,
            "min_rate": 0.02,
            "max_rate": 0.40
        },
        "raydium_clmm": {
            "mean_rate": 0.15,
            "volatility": 0.08,
            "mean_reversion": 0.10,
            "min_rate": 0.03,
            "max_rate": 0.35
        },
        "ondo_usdy": {
            "mean_rate": 0.042,
            "volatility": 0.005,
            "mean_reversion": 0.50,  # Very stable
            "min_rate": 0.03,
            "max_rate": 0.055
        }
    },
    "correlation_matrix": {
        # Lending rates are correlated (driven by SOL demand)
        # Ondo is independent (driven by US Treasuries)
        "kamino_marginfi": 0.85,
        "kamino_jupiter": 0.80,
        "marginfi_jupiter": 0.75,
        "kamino_raydium": 0.40,
        "marginfi_raydium": 0.35,
        "lending_ondo": 0.05  # Near-zero correlation (key diversification benefit)
    },
    "protocol_exploit_probability": 0.03,  # 3% per protocol per year
    "rebalance_cost_bps": 5  # 0.05% per rebalance
}
```

## Diversification Rules

1. **Protocol diversification:** Min 3, max 6 protocols. No single protocol >60%.
2. **Strategy diversification:** At least 2 strategy types active (lending + one of CLMM/RWA).
3. **Adaptor diversification:** Use at least 2 of the 3 Voltr adaptors (Lending, Raydium, Trustful).
4. **Correlation limit:** No two positions with >0.7 rolling 30-day correlation can have combined allocation >50%.
5. **New protocol onboarding:** Any new protocol starts at minimum allocation (10%) for 7 days before scaling up.

## Emergency Procedures

### Procedure 1: Protocol Exploit Detected
1. Keeper bot detects anomalous TVL drop (>20% in 1 hour)
2. Immediately withdraw all funds from affected protocol
3. Route withdrawn funds to Ondo USDY (safest)
4. Alert team via webhook
5. Manual review before re-entering any protocol

### Procedure 2: Drawdown Breach (>2%)
1. Automatic halt of all DeFi positions
2. 100% allocation to Ondo USDY
3. Team notification
4. 24-hour cool-down before re-entering DeFi
5. Post-mortem analysis required

### Procedure 3: USDC Depeg (>1%)
1. Monitor USDC/USD price via Pyth and Switchboard
2. If depeg >1%: halt new deposits
3. If depeg >2%: begin unwinding USDC to SOL via Jupiter
4. If depeg >5%: full emergency exit
5. Track Circle communications for recovery timeline

### Procedure 4: Solana Network Degradation
1. If block time >1s: reduce rebalancing frequency
2. If block time >5s: pause non-critical operations
3. If network halt: queue all operations for resume
4. Cobo MPC holds unsigned transactions until network recovery

## Monitoring Dashboard Metrics

| Metric | Frequency | Alert Threshold |
|--------|-----------|-----------------|
| Portfolio NAV | Real-time | >0.5% deviation |
| Per-protocol APY | 5 minutes | >50% change in 1 hour |
| Health factors | 1 minute | <1.30 |
| Protocol TVL | 5 minutes | >20% drop in 1 hour |
| USDC peg | 1 minute | >0.5% depeg |
| Solana block time | 30 seconds | >2s average |
| Rebalance execution | Per event | >30s execution time |
| Keeper uptime | 1 minute | Any downtime |
