# Ranger Rebalancing Triggers & Frequency

## Rebalancing Philosophy

Rebalancing is the primary alpha driver. The strategy does not simply allocate and hold. It actively monitors yield opportunities across protocols and shifts capital to maximize risk-adjusted returns while respecting hard constraints.

All rebalance transactions are signed via Cobo MPC, ensuring institutional-grade security and auditability.

## Trigger Types

### 1. Rate Divergence Trigger (Primary)

**Logic:** When the yield spread between the current allocation and the optimal allocation exceeds a threshold, rebalance.

```python
def check_rate_divergence(current_allocations, current_rates):
    optimal = calculate_optimal_allocation(current_rates)
    
    expected_current_apy = sum(
        current_allocations[p] * current_rates[p] for p in protocols
    )
    expected_optimal_apy = sum(
        optimal[p] * current_rates[p] for p in protocols
    )
    
    spread = expected_optimal_apy - expected_current_apy
    
    # Only rebalance if improvement exceeds transaction costs + buffer
    if spread > 0.005:  # 50bps improvement required
        return True, optimal
    return False, current_allocations
```

**Threshold:** 50bps APY improvement required (covers ~5bps rebalance cost with 10x margin).

### 2. Regime Change Trigger

**Logic:** When the weighted average lending rate crosses a regime boundary (and stays there for 3 checks), trigger a full portfolio rebalance to the new regime's target allocation.

```python
REGIME_THRESHOLDS = {
    "NORMAL_TO_HIGH": 0.15,        # >15% avg rate
    "NORMAL_TO_COMPRESSED": 0.06,  # <6% avg rate
    "HYSTERESIS": 0.01             # 1% buffer to prevent oscillation
}

def check_regime_change(current_regime, avg_rate, confirmation_count):
    if current_regime == "NORMAL":
        if avg_rate > REGIME_THRESHOLDS["NORMAL_TO_HIGH"]:
            confirmation_count += 1
        elif avg_rate < REGIME_THRESHOLDS["NORMAL_TO_COMPRESSED"]:
            confirmation_count += 1
        else:
            confirmation_count = 0
    
    if confirmation_count >= 3:
        return True, detect_new_regime(avg_rate)
    return False, current_regime
```

**Frequency:** Checked every 5 minutes. Requires 3 consecutive confirmations (15 min persistence).

### 3. Risk Trigger (Safety)

**Logic:** If any risk metric breaches its threshold, immediately rebalance toward safety.

| Risk Metric | Threshold | Action |
|------------|-----------|--------|
| Portfolio drawdown | >1.0% | Shift 15% to Ondo |
| Health factor | <1.30 | Reduce position 50% |
| Protocol TVL drop | >20% in 1h | Exit that protocol |
| USDC depeg | >0.5% | Halt new positions |
| Single position gain | >200% of expected | Take profit, rebalance |

**Frequency:** Checked every 60 seconds. No confirmation delay (immediate action).

### 4. Scheduled Rebalance (Baseline)

**Logic:** Even if no triggers fire, perform a portfolio optimization check on a fixed schedule.

- **Frequency:** Every 4 hours
- **Purpose:** Catch gradual drift, compound earned yield, adjust for slow rate changes
- **Minimum improvement:** 25bps APY improvement required (lower threshold than event-driven)

### 5. Utilization Spike Trigger

**Logic:** When a protocol's utilization rate spikes (indicating rate increase), proactively shift capital to capture the rate before it normalizes.

```python
def check_utilization_spike(protocol, current_util, prev_util):
    delta = current_util - prev_util
    
    if delta > 0.10:  # >10% utilization increase in one check
        # Rate is about to spike, shift capital here
        return True, "INCREASE_ALLOCATION"
    
    if current_util > 0.90:
        # Near-max utilization, rates high but withdrawal risk increases
        return True, "MONITOR_CLOSELY"  # Don't increase, but don't exit
    
    if current_util > 0.95:
        # Withdrawal risk too high, begin reducing
        return True, "REDUCE_ALLOCATION"
    
    return False, "HOLD"
```

**Frequency:** Checked every 5 minutes.

## Rebalance Execution Flow

```
1. Trigger fires
   ↓
2. Calculate optimal allocation (respect hard constraints)
   ↓
3. Calculate required trades (withdrawals + deposits)
   ↓
4. Estimate gas + slippage costs
   ↓
5. Verify improvement > costs (net positive after fees)
   ↓
6. Build Solana transaction(s) via Voltr SDK
   ↓
7. Submit to Cobo MPC for signing
   ↓
8. Broadcast signed transaction(s) to Solana
   ↓
9. Verify execution (check on-chain state)
   ↓
10. Update internal state + emit event
```

## Transaction Batching

To minimize gas costs on Solana:

- **Multiple withdrawals** from different protocols are batched into a single Solana transaction where possible
- **Deposits** are executed in a separate transaction after withdrawals confirm
- **Maximum 3 transactions** per rebalance event
- **Priority fees** set dynamically based on network congestion (using Solana priority fee API)

## Rebalance Cost Model

```python
REBALANCE_COSTS = {
    "base_gas_sol": 0.00005,          # ~5000 lamports per tx
    "priority_fee_multiplier": 2.0,   # 2x base during congestion
    "slippage_bps": 1,                # 0.01% on stablecoin swaps
    "voltr_fee_bps": 0,               # Voltr takes no rebalance fee
    "opportunity_cost_bps": 2,        # Lost yield during rebalance (~30s)
    "total_estimated_bps": 5          # ~0.05% per rebalance
}

def is_rebalance_profitable(current_apy, optimal_apy, time_to_next_rebalance_hours):
    improvement_bps = (optimal_apy - current_apy) * 10000
    cost_bps = REBALANCE_COSTS["total_estimated_bps"]
    
    # Improvement must exceed cost over the expected holding period
    holding_period_years = time_to_next_rebalance_hours / 8760
    net_benefit = improvement_bps * holding_period_years - cost_bps
    
    return net_benefit > 0
```

## Frequency Summary

| Trigger | Check Interval | Confirmation | Expected Fires/Day |
|---------|---------------|-------------|-------------------|
| Rate divergence | 5 min | None (instant) | 2-4 |
| Regime change | 5 min | 3 checks (15 min) | 0-0.5 |
| Risk trigger | 60 sec | None (instant) | 0-1 |
| Scheduled | 4 hours | N/A | 6 |
| Utilization spike | 5 min | None (instant) | 0-2 |

**Expected total rebalances per day:** 8-14 in normal conditions.
**Estimated daily rebalance cost:** 40-70bps annualized (~0.011-0.019% daily).

## Anti-Churn Safeguards

1. **Minimum hold time:** After rebalancing into a protocol, minimum 30-minute hold before exiting
2. **Rate smoothing:** Use 15-minute TWAP for rates, not spot rates, to avoid noise
3. **Cooldown:** After a risk-triggered rebalance, 1-hour cooldown before rate-based rebalancing
4. **Cost hurdle:** Every rebalance must clear the cost hurdle (net positive after fees)
5. **Daily cap:** Maximum 20 rebalances per day to prevent excessive churn
