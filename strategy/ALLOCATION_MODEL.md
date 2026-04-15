# Ranger Allocation Model & Risk Constraints

## Portfolio Construction Rules

### Hard Constraints (Enforced On-Chain)

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Min allocation per protocol | 10% | Ensures meaningful diversification |
| Max allocation per protocol | 60% | Caps single-protocol exposure |
| Min active protocols | 3 | Prevents concentration |
| Max active protocols | 6 | Limits operational complexity |
| Min RWA allocation (Ondo) | 20% | Guarantees yield floor |
| Max DeFi lending allocation | 50% | Bounds lending risk |
| Max CLMM allocation | 30% | Bounds IL risk |
| Health factor floor | 1.20 | Liquidation buffer |
| Max leverage ratio | 1.05x | No aggressive looping |

### Soft Constraints (Strategy Engine Targets)

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Target Sharpe ratio | >2.0 | Risk-adjusted return quality |
| Max daily VaR (95%) | 0.5% | Daily loss limit |
| Max weekly VaR (99%) | 1.5% | Weekly loss limit |
| Max drawdown trigger | 2.0% | Emergency rebalance threshold |
| Correlation cap between positions | 0.7 | Diversification benefit |

## Regime-Based Allocation Model

The strategy uses a 3-regime model to dynamically shift allocations:

### Regime 1: Normal (Lending rates 6-15%)
```
Ondo USDY:       25-30%  (stable floor)
Kamino:           20-25%  (primary lending)
Marginfi:         15-20%  (secondary lending)
Jupiter Lend:     10-15%  (tertiary lending)
Raydium CLMM:    15-20%  (yield boost)
```
**Expected blended APY: 12-16%**

### Regime 2: High Demand (Lending rates >15%)
```
Ondo USDY:       20%     (minimum floor)
Kamino:           25-30%  (max lending exposure)
Marginfi:         20-25%  (elevated lending)
Jupiter Lend:     10-15%  (rate arbitrage)
Raydium CLMM:    10-15%  (reduced, lending more attractive)
```
**Expected blended APY: 16-22%**

### Regime 3: Rate Compression (Lending rates <6%)
```
Ondo USDY:       35-40%  (max safety)
Kamino:           15%     (reduced lending)
Marginfi:         10%     (minimum)
Jupiter Lend:     10%     (minimum)
Raydium CLMM:    25-30%  (CLMM becomes primary alpha)
```
**Expected blended APY: 6-10%**

## Regime Detection Logic

Regime transitions are triggered by a weighted average lending rate across protocols:

```python
def detect_regime(kamino_rate, marginfi_rate, jupiter_rate):
    weighted_avg = (
        kamino_rate * 0.40 +    # Largest market, most signal
        marginfi_rate * 0.35 +  # Second largest
        jupiter_rate * 0.25     # Growing but newer
    )
    
    if weighted_avg > 0.15:
        return "HIGH_DEMAND"
    elif weighted_avg < 0.06:
        return "RATE_COMPRESSION"
    else:
        return "NORMAL"
```

Regime changes require the signal to persist for **3 consecutive checks** (15 minutes at 5-min intervals) to avoid whipsawing.

## Position Sizing Algorithm

For each protocol allocation, position size is determined by:

```python
def calculate_position_size(protocol, regime, total_tvl):
    base_allocation = REGIME_ALLOCATIONS[regime][protocol]
    
    # Risk adjustment: reduce allocation if protocol shows stress
    risk_score = get_risk_score(protocol)  # 0-1, higher = riskier
    risk_adjusted = base_allocation * (1 - risk_score * 0.3)
    
    # Rate adjustment: tilt toward higher-yielding protocols
    rate_premium = (protocol_rate - avg_rate) / avg_rate
    rate_adjusted = risk_adjusted * (1 + rate_premium * 0.15)
    
    # Enforce hard constraints
    final = max(MIN_ALLOCATION, min(MAX_ALLOCATION, rate_adjusted))
    
    return final * total_tvl
```

## Diversification Score

The vault maintains a Herfindahl-Hirschman Index (HHI) below 3000:

```
HHI = sum(allocation_pct^2 for each protocol)

Example (target allocation):
  Ondo 30%: 900
  Kamino 25%: 625
  Marginfi 20%: 400
  Jupiter 10%: 100
  Raydium 15%: 225
  Total HHI: 2250 (well-diversified)

Concentrated (bad):
  Kamino 60%: 3600
  Others 10% each: 400
  Total HHI: 4000 (too concentrated, blocked)
```

## VaR Model

Daily Value-at-Risk calculated using historical simulation:

```python
def calculate_var(portfolio, confidence=0.95, lookback_days=90):
    daily_returns = []
    for day in range(lookback_days):
        portfolio_return = sum(
            allocation[protocol] * protocol_daily_return[protocol][day]
            for protocol in portfolio
        )
        daily_returns.append(portfolio_return)
    
    daily_returns.sort()
    var_index = int((1 - confidence) * lookback_days)
    return abs(daily_returns[var_index])
```

**VaR limits:**
- Daily VaR (95%): max 0.5% of portfolio
- Weekly VaR (99%): max 1.5% of portfolio
- If breached: shift 10% from highest-risk to Ondo USDY

## Protocol Risk Scoring

Each protocol is scored on 5 dimensions (0-1 scale, lower = safer):

| Dimension | Weight | Kamino | Marginfi | Jupiter | Raydium | Ondo |
|-----------|--------|--------|----------|---------|---------|------|
| Smart contract risk | 30% | 0.15 | 0.20 | 0.25 | 0.20 | 0.10 |
| Liquidity risk | 20% | 0.10 | 0.15 | 0.20 | 0.15 | 0.05 |
| Oracle risk | 20% | 0.15 | 0.15 | 0.15 | 0.10 | 0.05 |
| Governance risk | 15% | 0.20 | 0.25 | 0.15 | 0.20 | 0.10 |
| Track record | 15% | 0.10 | 0.15 | 0.30 | 0.10 | 0.05 |
| **Weighted Score** | | **0.14** | **0.18** | **0.21** | **0.15** | **0.07** |

Risk scores inform allocation tilts within regime ranges.
