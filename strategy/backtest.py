"""
Ranger Secure Hybrid Alpha Optimizer - 90-Day Backtest
Monte Carlo simulation with mean-reverting rate model (Ornstein-Uhlenbeck)
"""

import numpy as np
import json
from dataclasses import dataclass
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

PROTOCOLS = {
    "ondo_usdy": ProtocolParams("Ondo USDY", 0.042, 0.005, 0.50, 0.030, 0.055),
    "kamino": ProtocolParams("Kamino", 0.10, 0.05, 0.15, 0.02, 0.50),
    "marginfi": ProtocolParams("Marginfi", 0.09, 0.06, 0.12, 0.02, 0.45),
    "jupiter_lend": ProtocolParams("Jupiter Lend", 0.08, 0.05, 0.15, 0.02, 0.40),
    "raydium_clmm": ProtocolParams("Raydium CLMM", 0.15, 0.08, 0.10, 0.03, 0.35),
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
RATE_DIVERGENCE_THRESHOLD = 0.005


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

    current_rates = {p: rates[p][day] for p in protocol_names}
    avg_rate = np.mean(list(current_rates.values()))

    for p in protocol_names:
        if avg_rate > 0:
            rate_premium = (current_rates[p] - avg_rate) / avg_rate
            base[p] = base[p] * (1 + rate_premium * 0.15)

    total = sum(base.values())
    base = {p: v / total for p, v in base.items()}

    for p in base:
        base[p] = max(MIN_ALLOC, min(MAX_ALLOC, base[p]))

    total = sum(base.values())
    base = {p: v / total for p, v in base.items()}
    return base


def run_single_simulation(n_days: int = 90, initial_capital: float = 500000) -> Dict:
    rates = simulate_rates(n_days)
    capital = initial_capital
    capital_history = [capital]
    daily_returns = []
    regime_history = []
    allocation_history = []
    rebalance_count = 0

    current_regime = "NORMAL"
    current_allocation = REGIME_ALLOCATIONS["NORMAL"].copy()
    regime_confirm_count = 0
    last_regime_signal = "NORMAL"

    for day in range(n_days):
        daily_rate = sum(
            current_allocation[p] * rates[p][day] / 365
            for p in PROTOCOLS
        )
        daily_return = daily_rate
        capital *= (1 + daily_return)
        daily_returns.append(daily_return)
        capital_history.append(capital)

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

        if day % 1 == 0:  # Daily check
            optimal = optimize_allocation(rates, day, current_regime)
            current_apy = sum(current_allocation[p] * rates[p][day] for p in PROTOCOLS)
            optimal_apy = sum(optimal[p] * rates[p][day] for p in PROTOCOLS)

            if optimal_apy - current_apy > RATE_DIVERGENCE_THRESHOLD:
                current_allocation = optimal
                capital *= (1 - REBALANCE_COST_BPS / 10000)
                rebalance_count += 1

        regime_history.append(current_regime)
        allocation_history.append(current_allocation.copy())

    daily_returns_arr = np.array(daily_returns)
    total_return = (capital - initial_capital) / initial_capital
    annualized_apy = (1 + total_return) ** (365 / n_days) - 1

    cumulative = np.cumprod(1 + daily_returns_arr)
    running_max = np.maximum.accumulate(cumulative)
    drawdowns = (cumulative - running_max) / running_max
    max_drawdown = abs(drawdowns.min())

    sharpe = (daily_returns_arr.mean() / daily_returns_arr.std()) * np.sqrt(365) if daily_returns_arr.std() > 0 else 0

    var_95 = np.percentile(daily_returns_arr, 5)
    var_99 = np.percentile(daily_returns_arr, 1)

    return {
        "total_return_pct": round(total_return * 100, 4),
        "annualized_apy_pct": round(annualized_apy * 100, 4),
        "max_drawdown_pct": round(max_drawdown * 100, 4),
        "sharpe_ratio": round(sharpe, 4),
        "daily_var_95_pct": round(var_95 * 100, 6),
        "daily_var_99_pct": round(var_99 * 100, 6),
        "rebalance_count": rebalance_count,
        "final_capital": round(capital, 2),
        "capital_history": [round(c, 2) for c in capital_history],
        "regime_distribution": {
            r: regime_history.count(r) / len(regime_history)
            for r in set(regime_history)
        },
    }


def run_monte_carlo(n_simulations: int = 10000, n_days: int = 90) -> Dict:
    results = []
    for i in range(n_simulations):
        np.random.seed(42 + i)
        result = run_single_simulation(n_days)
        results.append(result)

    apys = [r["annualized_apy_pct"] for r in results]
    drawdowns = [r["max_drawdown_pct"] for r in results]
    sharpes = [r["sharpe_ratio"] for r in results]

    return {
        "n_simulations": n_simulations,
        "n_days": n_days,
        "apy_stats": {
            "mean": round(np.mean(apys), 4),
            "median": round(np.median(apys), 4),
            "std": round(np.std(apys), 4),
            "p5": round(np.percentile(apys, 5), 4),
            "p25": round(np.percentile(apys, 25), 4),
            "p75": round(np.percentile(apys, 75), 4),
            "p95": round(np.percentile(apys, 95), 4),
            "min": round(np.min(apys), 4),
            "max": round(np.max(apys), 4),
            "pct_above_15": round(np.mean(np.array(apys) > 15) * 100, 2),
            "pct_above_10": round(np.mean(np.array(apys) > 10) * 100, 2),
        },
        "drawdown_stats": {
            "mean": round(np.mean(drawdowns), 4),
            "median": round(np.median(drawdowns), 4),
            "p95": round(np.percentile(drawdowns, 95), 4),
            "p99": round(np.percentile(drawdowns, 99), 4),
            "max": round(np.max(drawdowns), 4),
            "pct_below_2": round(np.mean(np.array(drawdowns) < 2) * 100, 2),
        },
        "sharpe_stats": {
            "mean": round(np.mean(sharpes), 4),
            "median": round(np.median(sharpes), 4),
            "p5": round(np.percentile(sharpes, 5), 4),
            "p95": round(np.percentile(sharpes, 95), 4),
        },
    }


def run_stress_tests() -> Dict:
    tests = {}

    # Stress 1: All lending rates at minimum
    np.random.seed(42)
    rates = simulate_rates(90)
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rates[p] = np.full(90, PROTOCOLS[p].min_rate)

    capital = 500000
    alloc = REGIME_ALLOCATIONS["RATE_COMPRESSION"]
    for day in range(90):
        daily = sum(alloc[p] * rates[p][day] / 365 for p in PROTOCOLS)
        capital *= (1 + daily)
    tests["all_rates_minimum"] = {
        "scenario": "All lending rates at protocol minimums for 90 days",
        "final_capital": round(capital, 2),
        "return_pct": round((capital - 500000) / 500000 * 100, 4),
        "annualized_apy": round(((capital / 500000) ** (365/90) - 1) * 100, 4),
    }

    # Stress 2: Single protocol exploit (25% loss)
    capital = 500000 * 0.75  # 25% lost
    alloc_no_kamino = {"ondo_usdy": 0.37, "marginfi": 0.25, "jupiter_lend": 0.15, "raydium_clmm": 0.23}
    np.random.seed(42)
    rates = simulate_rates(90)
    for day in range(90):
        daily = sum(alloc_no_kamino.get(p, 0) * rates[p][day] / 365 for p in PROTOCOLS if p != "kamino")
        capital *= (1 + daily)
    tests["single_exploit_25pct"] = {
        "scenario": "Kamino exploited (25% allocation lost), remaining capital continues",
        "initial_loss_pct": 25,
        "final_capital": round(capital, 2),
        "net_return_pct": round((capital - 500000) / 500000 * 100, 4),
        "recovery_months": round(25 * 500000 / (capital - 375000) / 12, 1) if capital > 375000 else "N/A",
    }

    # Stress 3: Correlation spike (all lending rates crash together)
    np.random.seed(42)
    rates = simulate_rates(90)
    crash_rates = np.linspace(0.10, 0.03, 90)
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rates[p] = crash_rates + np.random.randn(90) * 0.005
        rates[p] = np.clip(rates[p], 0.02, 0.50)

    capital = 500000
    for day in range(90):
        regime = detect_regime(rates, day)
        alloc = REGIME_ALLOCATIONS[regime]
        daily = sum(alloc[p] * rates[p][day] / 365 for p in PROTOCOLS)
        capital *= (1 + daily)
    tests["correlated_rate_crash"] = {
        "scenario": "All lending rates crash from 10% to 3% over 90 days",
        "final_capital": round(capital, 2),
        "return_pct": round((capital - 500000) / 500000 * 100, 4),
        "annualized_apy": round(((capital / 500000) ** (365/90) - 1) * 100, 4),
    }

    return tests


if __name__ == "__main__":
    print("=" * 60)
    print("RANGER SECURE HYBRID ALPHA OPTIMIZER - BACKTEST")
    print("=" * 60)

    print("\n--- Single Simulation (seed=42) ---")
    single = run_single_simulation()
    for k, v in single.items():
        if k not in ("capital_history", "regime_distribution"):
            print(f"  {k}: {v}")
    print(f"  regime_distribution: {json.dumps(single['regime_distribution'], indent=4)}")

    print("\n--- Monte Carlo (10,000 simulations x 90 days) ---")
    mc = run_monte_carlo(n_simulations=10000)
    print(f"  APY Stats:")
    for k, v in mc["apy_stats"].items():
        print(f"    {k}: {v}")
    print(f"  Drawdown Stats:")
    for k, v in mc["drawdown_stats"].items():
        print(f"    {k}: {v}")
    print(f"  Sharpe Stats:")
    for k, v in mc["sharpe_stats"].items():
        print(f"    {k}: {v}")

    print("\n--- Stress Tests ---")
    stress = run_stress_tests()
    for test_name, test_result in stress.items():
        print(f"\n  {test_name}:")
        for k, v in test_result.items():
            print(f"    {k}: {v}")

    print("\n" + "=" * 60)
    print("BACKTEST COMPLETE")
    print("=" * 60)

    full_results = {
        "single_simulation": {k: v for k, v in single.items() if k != "capital_history"},
        "monte_carlo": mc,
        "stress_tests": stress,
    }
    with open("/Users/kamal/Desktop/ranger/strategy/backtest_results.json", "w") as f:
        json.dump(full_results, f, indent=2)
    print(f"\nResults saved to strategy/backtest_results.json")
