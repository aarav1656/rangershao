"""
Ranger Secure Hybrid Alpha Optimizer - 90-Day Backtest
Monte Carlo simulation with mean-reverting rates (OU process),
realistic operational friction, CLMM IL modeling, and protocol risk events.
"""

import numpy as np
import json
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

np.random.seed(42)

@dataclass
class ProtocolParams:
    name: str
    mean_rate: float
    volatility: float
    mean_reversion: float
    min_rate: float
    max_rate: float
    incentive_rate: float
    daily_friction_bps: float  # gas, slippage, rate lag
    exploit_prob_annual: float  # annual exploit probability

PROTOCOLS = {
    "ondo_usdy": ProtocolParams("Ondo USDY", 0.047, 0.003, 0.50, 0.038, 0.055, 0.00, 0.1, 0.005),
    "kamino": ProtocolParams("Kamino", 0.11, 0.045, 0.15, 0.03, 0.45, 0.07, 0.3, 0.03),
    "marginfi": ProtocolParams("Marginfi", 0.10, 0.05, 0.12, 0.025, 0.40, 0.065, 0.3, 0.03),
    "jupiter_lend": ProtocolParams("Jupiter Lend", 0.09, 0.045, 0.15, 0.025, 0.35, 0.06, 0.25, 0.04),
    "raydium_clmm": ProtocolParams("Raydium CLMM", 0.19, 0.07, 0.10, 0.04, 0.40, 0.04, 0.5, 0.025),
}

CORRELATION_MATRIX = {
    ("kamino", "marginfi"): 0.85,
    ("kamino", "jupiter_lend"): 0.80,
    ("marginfi", "jupiter_lend"): 0.75,
    ("kamino", "raydium_clmm"): 0.40,
    ("marginfi", "raydium_clmm"): 0.35,
    ("jupiter_lend", "raydium_clmm"): 0.30,
}

REGIME_ALLOCATIONS = {
    "NORMAL": {
        "ondo_usdy": 0.28, "kamino": 0.22, "marginfi": 0.18,
        "jupiter_lend": 0.12, "raydium_clmm": 0.20
    },
    "HIGH_DEMAND": {
        "ondo_usdy": 0.20, "kamino": 0.28, "marginfi": 0.22,
        "jupiter_lend": 0.12, "raydium_clmm": 0.18
    },
    "RATE_COMPRESSION": {
        "ondo_usdy": 0.38, "kamino": 0.15, "marginfi": 0.10,
        "jupiter_lend": 0.10, "raydium_clmm": 0.27
    },
}

MIN_ALLOC = 0.10
MAX_ALLOC = 0.60
REBALANCE_COST_BPS = 5
RATE_DIVERGENCE_THRESHOLD = 0.002
CLMM_IL_DAILY_STD = 0.0008  # ~0.08% daily IL std for tight USDC-USDT range


def build_correlation_matrix() -> np.ndarray:
    protocol_names = list(PROTOCOLS.keys())
    n = len(protocol_names)
    corr = np.eye(n)
    for i, p1 in enumerate(protocol_names):
        for j, p2 in enumerate(protocol_names):
            if i == j:
                continue
            key = (p1, p2) if (p1, p2) in CORRELATION_MATRIX else (p2, p1)
            if key in CORRELATION_MATRIX:
                corr[i, j] = CORRELATION_MATRIX[key]
    return corr


def generate_correlated_noise(n_days: int, n_protocols: int, corr_matrix: np.ndarray) -> np.ndarray:
    L = np.linalg.cholesky(corr_matrix)
    independent_noise = np.random.randn(n_days, n_protocols)
    return independent_noise @ L.T


def simulate_rates(n_days: int, dt: float = 1/365) -> Dict[str, np.ndarray]:
    protocol_names = list(PROTOCOLS.keys())
    corr = build_correlation_matrix()
    noise = generate_correlated_noise(n_days, len(protocol_names), corr)
    rates = {}
    for idx, (name, params) in enumerate(PROTOCOLS.items()):
        rate_path = np.zeros(n_days)
        rate_path[0] = params.mean_rate
        for t in range(1, n_days):
            dr = (params.mean_reversion * (params.mean_rate - rate_path[t-1]) * dt +
                  params.volatility * np.sqrt(dt) * noise[t, idx])
            rate_path[t] = np.clip(rate_path[t-1] + dr, params.min_rate, params.max_rate)
        rates[name] = rate_path
    return rates


def detect_regime(rates: Dict[str, np.ndarray], day: int) -> str:
    weighted_avg = (
        rates["kamino"][day] * 0.40 +
        rates["marginfi"][day] * 0.35 +
        rates["jupiter_lend"][day] * 0.25
    )
    if weighted_avg > 0.15:
        return "HIGH_DEMAND"
    elif weighted_avg < 0.06:
        return "RATE_COMPRESSION"
    return "NORMAL"


def optimize_allocation(rates: Dict[str, np.ndarray], day: int, regime: str) -> Dict[str, float]:
    base = REGIME_ALLOCATIONS[regime].copy()
    protocol_names = list(PROTOCOLS.keys())
    current_rates = {p: rates[p][day] + PROTOCOLS[p].incentive_rate for p in protocol_names}
    avg_rate = np.mean(list(current_rates.values()))

    for p in protocol_names:
        if avg_rate > 0:
            rate_premium = (current_rates[p] - avg_rate) / avg_rate
            base[p] = base[p] * (1 + rate_premium * 0.20)

    total = sum(base.values())
    base = {p: v / total for p, v in base.items()}
    for p in base:
        base[p] = max(MIN_ALLOC, min(MAX_ALLOC, base[p]))
    total = sum(base.values())
    base = {p: v / total for p, v in base.items()}
    return base


def run_single_simulation(n_days: int = 90, initial_capital: float = 500000,
                          include_exploits: bool = False) -> Dict:
    rates = simulate_rates(n_days)
    capital = initial_capital
    capital_history = [capital]
    daily_returns = []
    regime_history = []
    allocation_history = []
    daily_apy_history = []
    rebalance_count = 0

    current_regime = "NORMAL"
    current_allocation = REGIME_ALLOCATIONS["NORMAL"].copy()
    regime_confirm_count = 0
    last_regime_signal = "NORMAL"

    for day in range(n_days):
        daily_yield = 0.0
        daily_friction = 0.0

        for p in PROTOCOLS:
            proto = PROTOCOLS[p]
            alloc = current_allocation[p]
            base_yield = (rates[p][day] + proto.incentive_rate) / 365
            friction = proto.daily_friction_bps / 10000
            proto_return = base_yield - friction

            if p == "raydium_clmm":
                il = np.random.normal(0, CLMM_IL_DAILY_STD)
                proto_return += il

            daily_yield += alloc * proto_return

            if include_exploits:
                daily_exploit_prob = proto.exploit_prob_annual / 365
                if np.random.random() < daily_exploit_prob:
                    exploit_loss = alloc * 0.80
                    daily_yield -= exploit_loss
                    current_allocation[p] = 0
                    remaining = {k: v for k, v in current_allocation.items() if v > 0}
                    if remaining:
                        total_r = sum(remaining.values())
                        for k in remaining:
                            current_allocation[k] = remaining[k] / total_r

        execution_noise = np.random.normal(0, 0.00015)
        daily_return = daily_yield + execution_noise

        capital *= (1 + daily_return)
        daily_returns.append(daily_return)
        capital_history.append(capital)
        daily_apy_history.append(daily_yield * 365 * 100)

        new_regime = detect_regime(rates, day)
        if new_regime != current_regime:
            if new_regime == last_regime_signal:
                regime_confirm_count += 1
            else:
                regime_confirm_count = 1
                last_regime_signal = new_regime

            if regime_confirm_count >= 3:
                current_regime = new_regime
                current_allocation = optimize_allocation(rates, day, current_regime)
                capital *= (1 - REBALANCE_COST_BPS / 10000)
                rebalance_count += 1
                regime_confirm_count = 0
        else:
            regime_confirm_count = 0
            last_regime_signal = current_regime

        optimal = optimize_allocation(rates, day, current_regime)
        current_apy = sum(current_allocation[p] * (rates[p][day] + PROTOCOLS[p].incentive_rate) for p in PROTOCOLS)
        optimal_apy = sum(optimal[p] * (rates[p][day] + PROTOCOLS[p].incentive_rate) for p in PROTOCOLS)

        if optimal_apy - current_apy > RATE_DIVERGENCE_THRESHOLD:
            current_allocation = optimal
            capital *= (1 - REBALANCE_COST_BPS / 10000)
            rebalance_count += 1

        regime_history.append(current_regime)
        allocation_history.append({p: round(v, 4) for p, v in current_allocation.items()})

    daily_returns_arr = np.array(daily_returns)
    total_return = (capital - initial_capital) / initial_capital
    annualized_apy = (1 + total_return) ** (365 / n_days) - 1

    cumulative = np.cumprod(1 + daily_returns_arr)
    running_max = np.maximum.accumulate(cumulative)
    drawdowns = (cumulative - running_max) / running_max
    max_drawdown = abs(drawdowns.min())

    excess_returns = daily_returns_arr - (0.045 / 365)  # risk-free = Ondo rate
    sharpe = (excess_returns.mean() / daily_returns_arr.std()) * np.sqrt(365) if daily_returns_arr.std() > 0 else 0
    sortino_denom = np.sqrt(np.mean(np.minimum(excess_returns, 0) ** 2)) * np.sqrt(365)
    sortino = (excess_returns.mean() * 365) / sortino_denom if sortino_denom > 0 else 0

    var_95 = np.percentile(daily_returns_arr, 5)
    var_99 = np.percentile(daily_returns_arr, 1)
    cvar_95 = daily_returns_arr[daily_returns_arr <= var_95].mean() if np.any(daily_returns_arr <= var_95) else var_95

    weekly_returns = []
    for i in range(0, len(daily_returns_arr) - 6, 7):
        weekly_returns.append(np.prod(1 + daily_returns_arr[i:i+7]) - 1)
    weekly_returns_arr = np.array(weekly_returns)
    weekly_var_99 = np.percentile(weekly_returns_arr, 1) if len(weekly_returns_arr) > 0 else 0

    return {
        "total_return_pct": round(total_return * 100, 4),
        "annualized_apy_pct": round(annualized_apy * 100, 4),
        "max_drawdown_pct": round(max_drawdown * 100, 4),
        "sharpe_ratio": round(sharpe, 4),
        "sortino_ratio": round(sortino, 4),
        "daily_var_95_pct": round(var_95 * 100, 6),
        "daily_var_99_pct": round(var_99 * 100, 6),
        "daily_cvar_95_pct": round(cvar_95 * 100, 6),
        "weekly_var_99_pct": round(weekly_var_99 * 100 if weekly_var_99 else 0, 6),
        "rebalance_count": rebalance_count,
        "final_capital": round(capital, 2),
        "capital_history": [round(c, 2) for c in capital_history],
        "daily_returns": [round(r * 100, 6) for r in daily_returns],
        "daily_apy_history": [round(a, 2) for a in daily_apy_history],
        "regime_distribution": {
            r: round(regime_history.count(r) / len(regime_history), 4)
            for r in set(regime_history)
        },
        "allocation_snapshots": {
            "day_0": allocation_history[0],
            "day_30": allocation_history[min(29, len(allocation_history)-1)],
            "day_60": allocation_history[min(59, len(allocation_history)-1)],
            "day_89": allocation_history[-1],
        },
    }


def run_monte_carlo(n_simulations: int = 10000, n_days: int = 90) -> Dict:
    results = []
    for i in range(n_simulations):
        np.random.seed(42 + i)
        result = run_single_simulation(n_days)
        results.append(result)

    apys = np.array([r["annualized_apy_pct"] for r in results])
    drawdowns = np.array([r["max_drawdown_pct"] for r in results])
    sharpes = np.array([r["sharpe_ratio"] for r in results])
    sortinos = np.array([r["sortino_ratio"] for r in results])
    total_returns = np.array([r["total_return_pct"] for r in results])

    best_idx = int(np.argmax(apys))
    worst_idx = int(np.argmin(apys))
    median_idx = int(np.argsort(apys)[len(apys)//2])

    return {
        "n_simulations": n_simulations,
        "n_days": n_days,
        "apy_stats": {
            "mean": round(float(np.mean(apys)), 4),
            "median": round(float(np.median(apys)), 4),
            "std": round(float(np.std(apys)), 4),
            "p5": round(float(np.percentile(apys, 5)), 4),
            "p10": round(float(np.percentile(apys, 10)), 4),
            "p25": round(float(np.percentile(apys, 25)), 4),
            "p75": round(float(np.percentile(apys, 75)), 4),
            "p90": round(float(np.percentile(apys, 90)), 4),
            "p95": round(float(np.percentile(apys, 95)), 4),
            "min": round(float(np.min(apys)), 4),
            "max": round(float(np.max(apys)), 4),
            "pct_above_15": round(float(np.mean(apys > 15) * 100), 2),
            "pct_above_10": round(float(np.mean(apys > 10) * 100), 2),
        },
        "return_stats": {
            "mean_90d_return_pct": round(float(np.mean(total_returns)), 4),
            "p5_90d_return_pct": round(float(np.percentile(total_returns, 5)), 4),
            "p95_90d_return_pct": round(float(np.percentile(total_returns, 95)), 4),
        },
        "drawdown_stats": {
            "mean": round(float(np.mean(drawdowns)), 4),
            "median": round(float(np.median(drawdowns)), 4),
            "p95": round(float(np.percentile(drawdowns, 95)), 4),
            "p99": round(float(np.percentile(drawdowns, 99)), 4),
            "max": round(float(np.max(drawdowns)), 4),
            "pct_below_2": round(float(np.mean(drawdowns < 2) * 100), 2),
        },
        "sharpe_stats": {
            "mean": round(float(np.mean(sharpes)), 4),
            "median": round(float(np.median(sharpes)), 4),
            "p5": round(float(np.percentile(sharpes, 5)), 4),
            "p95": round(float(np.percentile(sharpes, 95)), 4),
        },
        "sortino_stats": {
            "mean": round(float(np.mean(sortinos)), 4),
            "median": round(float(np.median(sortinos)), 4),
        },
        "representative_paths": {
            "best": {
                "apy": round(float(apys[best_idx]), 4),
                "capital_history": results[best_idx]["capital_history"],
            },
            "worst": {
                "apy": round(float(apys[worst_idx]), 4),
                "capital_history": results[worst_idx]["capital_history"],
            },
            "median": {
                "apy": round(float(apys[median_idx]), 4),
                "capital_history": results[median_idx]["capital_history"],
            },
        },
    }


def run_stress_tests() -> Dict:
    tests = {}

    # Stress 1: All lending rates at minimum for 90 days
    np.random.seed(42)
    rates = simulate_rates(90)
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rates[p] = np.full(90, PROTOCOLS[p].min_rate)

    capital = 500000.0
    alloc = REGIME_ALLOCATIONS["RATE_COMPRESSION"]
    cap_hist = [capital]
    for day in range(90):
        daily = sum(
            alloc[p] * ((rates[p][day] + PROTOCOLS[p].incentive_rate) / 365 - PROTOCOLS[p].daily_friction_bps / 10000)
            for p in PROTOCOLS
        )
        if "raydium_clmm" in alloc:
            daily += alloc["raydium_clmm"] * np.random.normal(0, CLMM_IL_DAILY_STD)
        capital *= (1 + daily)
        cap_hist.append(round(capital, 2))
    tests["all_rates_minimum"] = {
        "scenario": "All lending rates at protocol minimums for 90 days",
        "final_capital": round(capital, 2),
        "return_pct": round((capital - 500000) / 500000 * 100, 4),
        "annualized_apy": round(((capital / 500000) ** (365/90) - 1) * 100, 4),
        "capital_history": cap_hist,
    }

    # Stress 2: Single protocol exploit (Kamino, 22% allocation lost)
    np.random.seed(42)
    rates = simulate_rates(90)
    exploit_day = 15
    capital = 500000.0
    cap_hist = [capital]
    alloc = REGIME_ALLOCATIONS["NORMAL"].copy()
    for day in range(90):
        if day == exploit_day:
            loss = capital * alloc["kamino"] * 0.80  # 80% of Kamino allocation lost
            capital -= loss
            alloc["kamino"] = 0
            total_r = sum(v for k, v in alloc.items() if v > 0)
            if total_r > 0:
                alloc = {k: v / total_r for k, v in alloc.items()}

        daily = sum(
            alloc.get(p, 0) * ((rates[p][day] + PROTOCOLS[p].incentive_rate) / 365 - PROTOCOLS[p].daily_friction_bps / 10000)
            for p in PROTOCOLS
        )
        capital *= (1 + daily)
        cap_hist.append(round(capital, 2))

    tests["single_exploit_kamino"] = {
        "scenario": "Kamino exploited on day 15 (80% of 22% allocation lost)",
        "exploit_day": exploit_day,
        "immediate_loss_pct": round(REGIME_ALLOCATIONS["NORMAL"]["kamino"] * 80, 2),
        "final_capital": round(capital, 2),
        "net_return_pct": round((capital - 500000) / 500000 * 100, 4),
        "capital_history": cap_hist,
    }

    # Stress 3: Correlated rate crash (10% -> 3% over 90 days)
    np.random.seed(42)
    rates = simulate_rates(90)
    crash_rates = np.linspace(0.10, 0.03, 90)
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rates[p] = crash_rates + np.random.randn(90) * 0.003
        rates[p] = np.clip(rates[p], 0.02, 0.50)

    capital = 500000.0
    cap_hist = [capital]
    for day in range(90):
        regime = detect_regime(rates, day)
        alloc = REGIME_ALLOCATIONS[regime]
        daily = sum(
            alloc[p] * ((rates[p][day] + PROTOCOLS[p].incentive_rate) / 365 - PROTOCOLS[p].daily_friction_bps / 10000)
            for p in PROTOCOLS
        )
        daily += alloc.get("raydium_clmm", 0) * np.random.normal(0, CLMM_IL_DAILY_STD)
        capital *= (1 + daily)
        cap_hist.append(round(capital, 2))

    tests["correlated_rate_crash"] = {
        "scenario": "All lending rates crash from 10% to 3% over 90 days",
        "final_capital": round(capital, 2),
        "return_pct": round((capital - 500000) / 500000 * 100, 4),
        "annualized_apy": round(((capital / 500000) ** (365/90) - 1) * 100, 4),
        "capital_history": cap_hist,
    }

    # Stress 4: High volatility regime (rates whipsaw between 5-25%)
    np.random.seed(42)
    rates = simulate_rates(90)
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rates[p] = 0.15 + 0.10 * np.sin(np.linspace(0, 8*np.pi, 90)) + np.random.randn(90) * 0.02
        rates[p] = np.clip(rates[p], 0.03, 0.35)

    capital = 500000.0
    cap_hist = [capital]
    rebal_count = 0
    prev_regime = "NORMAL"
    for day in range(90):
        regime = detect_regime(rates, day)
        alloc = REGIME_ALLOCATIONS[regime]
        if regime != prev_regime:
            capital *= (1 - REBALANCE_COST_BPS / 10000)
            rebal_count += 1
            prev_regime = regime
        daily = sum(
            alloc[p] * ((rates[p][day] + PROTOCOLS[p].incentive_rate) / 365 - PROTOCOLS[p].daily_friction_bps / 10000)
            for p in PROTOCOLS
        )
        daily += alloc.get("raydium_clmm", 0) * np.random.normal(0, CLMM_IL_DAILY_STD)
        capital *= (1 + daily)
        cap_hist.append(round(capital, 2))

    tests["high_volatility_whipsaw"] = {
        "scenario": "Lending rates whipsaw between 5-25% with 4 full cycles over 90 days",
        "final_capital": round(capital, 2),
        "return_pct": round((capital - 500000) / 500000 * 100, 4),
        "annualized_apy": round(((capital / 500000) ** (365/90) - 1) * 100, 4),
        "rebalance_count": rebal_count,
        "capital_history": cap_hist,
    }

    return tests


def generate_allocation_signal_schema() -> Dict:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "RangerAllocationSignal",
        "description": "Allocation signal from ML model consumed by keeper bot for vault rebalancing",
        "type": "object",
        "required": ["timestamp", "signal_id", "regime", "allocations", "confidence", "risk_metrics"],
        "properties": {
            "timestamp": {
                "type": "string",
                "format": "date-time",
                "description": "ISO 8601 timestamp of signal generation"
            },
            "signal_id": {
                "type": "string",
                "format": "uuid",
                "description": "Unique identifier for this signal"
            },
            "regime": {
                "type": "string",
                "enum": ["NORMAL", "HIGH_DEMAND", "RATE_COMPRESSION"],
                "description": "Detected market regime"
            },
            "regime_confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Confidence in regime classification (0-1)"
            },
            "allocations": {
                "type": "object",
                "description": "Target allocation percentages (must sum to 1.0)",
                "properties": {
                    "ondo_usdy": {"type": "number", "minimum": 0.10, "maximum": 0.60},
                    "kamino": {"type": "number", "minimum": 0.10, "maximum": 0.60},
                    "marginfi": {"type": "number", "minimum": 0.10, "maximum": 0.60},
                    "jupiter_lend": {"type": "number", "minimum": 0.10, "maximum": 0.60},
                    "raydium_clmm": {"type": "number", "minimum": 0.10, "maximum": 0.60},
                },
                "required": ["ondo_usdy", "kamino", "marginfi", "jupiter_lend", "raydium_clmm"],
            },
            "confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Overall signal confidence. Keeper bot should skip rebalance if < 0.6"
            },
            "risk_metrics": {
                "type": "object",
                "required": ["portfolio_var_95", "expected_apy", "max_drawdown_projected", "hhi"],
                "properties": {
                    "portfolio_var_95": {
                        "type": "number",
                        "description": "Projected daily VaR at 95% confidence (as decimal, e.g. 0.005 = 0.5%)"
                    },
                    "expected_apy": {
                        "type": "number",
                        "description": "Projected annualized APY (as decimal, e.g. 0.16 = 16%)"
                    },
                    "max_drawdown_projected": {
                        "type": "number",
                        "description": "Projected max drawdown over next 7 days (decimal)"
                    },
                    "hhi": {
                        "type": "number",
                        "description": "Herfindahl-Hirschman Index of allocation (lower = more diversified)"
                    },
                },
            },
            "rebalance_urgency": {
                "type": "string",
                "enum": ["NONE", "LOW", "MEDIUM", "HIGH", "EMERGENCY"],
                "description": "How urgently the keeper should execute this rebalance"
            },
            "rate_observations": {
                "type": "object",
                "description": "Current observed rates used to generate this signal",
                "properties": {
                    "ondo_usdy": {"type": "number"},
                    "kamino": {"type": "number"},
                    "marginfi": {"type": "number"},
                    "jupiter_lend": {"type": "number"},
                    "raydium_clmm": {"type": "number"},
                },
            },
            "expires_at": {
                "type": "string",
                "format": "date-time",
                "description": "Signal expires after this time (keeper should not execute stale signals)"
            },
        },
        "example": {
            "timestamp": "2026-04-15T14:30:00Z",
            "signal_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "regime": "NORMAL",
            "regime_confidence": 0.87,
            "allocations": {
                "ondo_usdy": 0.28,
                "kamino": 0.22,
                "marginfi": 0.18,
                "jupiter_lend": 0.12,
                "raydium_clmm": 0.20,
            },
            "confidence": 0.82,
            "risk_metrics": {
                "portfolio_var_95": 0.0035,
                "expected_apy": 0.158,
                "max_drawdown_projected": 0.004,
                "hhi": 2250,
            },
            "rebalance_urgency": "LOW",
            "rate_observations": {
                "ondo_usdy": 0.045,
                "kamino": 0.112,
                "marginfi": 0.098,
                "jupiter_lend": 0.087,
                "raydium_clmm": 0.165,
            },
            "expires_at": "2026-04-15T14:35:00Z",
        },
    }


if __name__ == "__main__":
    print("=" * 60)
    print("RANGER SECURE HYBRID ALPHA OPTIMIZER - BACKTEST")
    print("=" * 60)

    print("\n--- Single Simulation (seed=42) ---")
    single = run_single_simulation()
    for k, v in single.items():
        if k not in ("capital_history", "daily_returns", "daily_apy_history", "allocation_snapshots"):
            print(f"  {k}: {v}")
    print(f"  allocation_snapshots: {json.dumps(single['allocation_snapshots'], indent=4)}")

    print("\n--- Monte Carlo (10,000 simulations x 90 days) ---")
    mc = run_monte_carlo(n_simulations=10000)
    print(f"  APY Stats:")
    for k, v in mc["apy_stats"].items():
        print(f"    {k}: {v}")
    print(f"  90-Day Return Stats:")
    for k, v in mc["return_stats"].items():
        print(f"    {k}: {v}")
    print(f"  Drawdown Stats:")
    for k, v in mc["drawdown_stats"].items():
        print(f"    {k}: {v}")
    print(f"  Sharpe Stats:")
    for k, v in mc["sharpe_stats"].items():
        print(f"    {k}: {v}")
    print(f"  Sortino Stats:")
    for k, v in mc["sortino_stats"].items():
        print(f"    {k}: {v}")

    print("\n--- Stress Tests ---")
    stress = run_stress_tests()
    for test_name, test_result in stress.items():
        print(f"\n  {test_name}:")
        for k, v in test_result.items():
            if k != "capital_history":
                print(f"    {k}: {v}")

    print("\n" + "=" * 60)
    print("BACKTEST COMPLETE")
    print("=" * 60)

    full_results = {
        "metadata": {
            "run_date": "2026-04-15",
            "initial_capital": 500000,
            "n_days": 90,
            "protocols": list(PROTOCOLS.keys()),
            "seed": 42,
        },
        "single_simulation": {k: v for k, v in single.items()},
        "monte_carlo": mc,
        "stress_tests": {
            k: {sk: sv for sk, sv in v.items()}
            for k, v in stress.items()
        },
        "allocation_signal_schema": generate_allocation_signal_schema(),
    }

    with open("/Users/kamal/Desktop/ranger/strategy/backtest_results.json", "w") as f:
        json.dump(full_results, f, indent=2)
    print(f"\nResults saved to strategy/backtest_results.json")

    with open("/Users/kamal/Desktop/ranger/strategy/allocation_signal_schema.json", "w") as f:
        json.dump(generate_allocation_signal_schema(), f, indent=2)
    print(f"Allocation signal schema saved to strategy/allocation_signal_schema.json")
