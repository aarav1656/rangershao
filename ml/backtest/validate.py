#!/usr/bin/env python3
"""
Backtest validation: compare ML model allocation vs baselines.
Baselines: equal-weight, static optimal, Ondo-only.
Uses real historical DefiLlama data.
"""

import csv
import json
import os
import sys
from typing import Dict, List

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

PROTOCOLS = ["kamino", "jupiter_lend", "raydium_clmm", "ondo_usdy"]
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
RESULTS_DIR = os.path.dirname(__file__)

MIN_ALLOC = 0.10
MAX_ALLOC = 0.60
MIN_ONDO = 0.20
MAX_RAYDIUM = 0.30

REGIME_ALLOCATIONS = {
    "NORMAL": {"ondo_usdy": 0.28, "kamino": 0.22, "jupiter_lend": 0.12, "raydium_clmm": 0.20, "marginfi": 0.18},
    "HIGH_DEMAND": {"ondo_usdy": 0.20, "kamino": 0.28, "jupiter_lend": 0.12, "raydium_clmm": 0.18, "marginfi": 0.22},
    "RATE_COMPRESSION": {"ondo_usdy": 0.38, "kamino": 0.15, "jupiter_lend": 0.10, "raydium_clmm": 0.27, "marginfi": 0.10},
}


def load_data():
    csv_path = os.path.join(DATA_DIR, "historical_rates.csv")
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    complete = []
    for row in rows:
        if all(row.get(f"{p}_apy") for p in PROTOCOLS):
            entry = {"date": row["date"]}
            for p in PROTOCOLS:
                entry[f"{p}_apy"] = float(row[f"{p}_apy"])
                entry[f"{p}_tvl"] = float(row.get(f"{p}_tvl", 0) or 0)
            complete.append(entry)
    return complete


def equal_weight_strategy(data: List[Dict]) -> List[float]:
    n = len(PROTOCOLS)
    weight = 1.0 / n
    daily_returns = []
    for row in data:
        ret = sum(weight * row[f"{p}_apy"] / 365 for p in PROTOCOLS)
        daily_returns.append(ret)
    return daily_returns


def ondo_only_strategy(data: List[Dict]) -> List[float]:
    return [row["ondo_usdy_apy"] / 365 for row in data]


def static_optimal_strategy(data: List[Dict]) -> List[float]:
    avg_apys = {p: np.mean([r[f"{p}_apy"] for r in data]) for p in PROTOCOLS}
    sorted_protos = sorted(PROTOCOLS, key=lambda p: avg_apys[p], reverse=True)

    weights = {p: MIN_ALLOC for p in PROTOCOLS}
    weights["ondo_usdy"] = max(weights["ondo_usdy"], MIN_ONDO)
    remaining = 1.0 - sum(weights.values())

    for p in sorted_protos:
        add = min(remaining, MAX_ALLOC - weights[p])
        if p == "raydium_clmm":
            add = min(add, MAX_RAYDIUM - weights[p])
        weights[p] += add
        remaining -= add
        if remaining <= 0:
            break

    total = sum(weights.values())
    weights = {p: w / total for p, w in weights.items()}

    daily_returns = []
    for row in data:
        ret = sum(weights[p] * row[f"{p}_apy"] / 365 for p in PROTOCOLS)
        daily_returns.append(ret)
    return daily_returns


def regime_strategy(data: List[Dict]) -> List[float]:
    daily_returns = []
    current_regime = "NORMAL"

    for row in data:
        lending_avg = (
            row.get("kamino_apy", 0) * 0.40 +
            row.get("jupiter_lend_apy", 0) * 0.25
        )
        if lending_avg > 0.15:
            current_regime = "HIGH_DEMAND"
        elif lending_avg < 0.06:
            current_regime = "RATE_COMPRESSION"
        else:
            current_regime = "NORMAL"

        alloc = REGIME_ALLOCATIONS[current_regime]
        ret = sum(alloc.get(p, 0) * row[f"{p}_apy"] / 365 for p in PROTOCOLS)
        daily_returns.append(ret)
    return daily_returns


def ml_strategy(data: List[Dict]) -> List[float]:
    daily_returns = []
    for i, row in enumerate(data):
        apys = {p: row[f"{p}_apy"] for p in PROTOCOLS}
        tvls = {p: row[f"{p}_tvl"] for p in PROTOCOLS}

        risk_adjusted = {}
        risk_scores = {"kamino": 0.14, "jupiter_lend": 0.21, "raydium_clmm": 0.15, "ondo_usdy": 0.07}
        for p in PROTOCOLS:
            risk_adjusted[p] = apys[p] * (1 - risk_scores[p])

        total_ra = sum(risk_adjusted.values())
        if total_ra > 0:
            weights = {p: risk_adjusted[p] / total_ra for p in PROTOCOLS}
        else:
            weights = {p: 1.0 / len(PROTOCOLS) for p in PROTOCOLS}

        if i > 0:
            prev = data[i - 1]
            for p in PROTOCOLS:
                momentum = apys[p] - float(prev[f"{p}_apy"])
                if momentum > 0:
                    weights[p] *= 1.1
                elif momentum < -0.005:
                    weights[p] *= 0.9

        for p in PROTOCOLS:
            weights[p] = max(MIN_ALLOC, min(MAX_ALLOC, weights[p]))
        weights["ondo_usdy"] = max(weights["ondo_usdy"], MIN_ONDO)
        if weights["raydium_clmm"] > MAX_RAYDIUM:
            weights["raydium_clmm"] = MAX_RAYDIUM

        total = sum(weights.values())
        weights = {p: w / total for p, w in weights.items()}

        ret = sum(weights[p] * apys[p] / 365 for p in PROTOCOLS)
        daily_returns.append(ret)
    return daily_returns


def compute_metrics(daily_returns: List[float], name: str) -> Dict:
    arr = np.array(daily_returns)
    total_return = np.prod(1 + arr) - 1
    n_days = len(arr)
    annualized = (1 + total_return) ** (365 / max(n_days, 1)) - 1

    cumulative = np.cumprod(1 + arr)
    running_max = np.maximum.accumulate(cumulative)
    drawdowns = (cumulative - running_max) / running_max
    max_dd = abs(drawdowns.min()) if len(drawdowns) > 0 else 0

    var_95 = np.percentile(arr, 5) if len(arr) > 5 else 0

    win_rate = float(np.mean(arr > 0)) if len(arr) > 0 else 0.0
    avg_daily = float(arr.mean())
    cumulative_growth = float(cumulative[-1]) if len(cumulative) > 0 else 1.0

    risk_free_daily = 0.035 / 365
    excess = arr - risk_free_daily
    sharpe = (excess.mean() / arr.std() * np.sqrt(365)) if arr.std() > 1e-10 else float("nan")

    return {
        "strategy": name,
        "total_return_pct": round(total_return * 100, 4),
        "annualized_apy_pct": round(annualized * 100, 4),
        "cumulative_growth": round(cumulative_growth, 6),
        "max_drawdown_pct": round(max_dd * 100, 4),
        "win_rate_pct": round(win_rate * 100, 2),
        "daily_var_95_pct": round(var_95 * 100, 6),
        "sharpe_ratio": round(sharpe, 4) if not np.isnan(sharpe) else None,
        "n_days": n_days,
        "avg_daily_return_pct": round(avg_daily * 100, 6),
    }


def main():
    data = load_data()
    print(f"Loaded {len(data)} complete data points")
    print(f"Date range: {data[0]['date']} to {data[-1]['date']}")

    strategies = {
        "Equal Weight": equal_weight_strategy(data),
        "Ondo Only (Safe)": ondo_only_strategy(data),
        "Static Optimal": static_optimal_strategy(data),
        "Regime-Based": regime_strategy(data),
        "ML Risk-Adjusted": ml_strategy(data),
    }

    results = []
    print(f"\n{'Strategy':<25} {'APY%':>8} {'Growth':>8} {'MaxDD%':>8} {'WinRate%':>9} {'Return%':>10}")
    print("-" * 75)

    for name, returns in strategies.items():
        metrics = compute_metrics(returns, name)
        results.append(metrics)
        print(
            f"{name:<25} {metrics['annualized_apy_pct']:>8.2f} "
            f"{metrics['cumulative_growth']:>8.4f} "
            f"{metrics['max_drawdown_pct']:>8.4f} "
            f"{metrics['win_rate_pct']:>8.1f}% "
            f"{metrics['total_return_pct']:>10.4f}"
        )

    ml_metrics = results[-1]
    equal_metrics = results[0]
    static_metrics = results[2]

    print(f"\n--- ML Advantage ---")
    print(f"ML vs Equal-Weight: {ml_metrics['annualized_apy_pct'] - equal_metrics['annualized_apy_pct']:+.2f}% APY")
    print(f"ML vs Static Optimal: {ml_metrics['annualized_apy_pct'] - static_metrics['annualized_apy_pct']:+.2f}% APY")
    print(f"ML Win Rate: {ml_metrics['win_rate_pct']:.1f}%")
    print(f"ML Max Drawdown: {ml_metrics['max_drawdown_pct']:.4f}%")

    if len(data) < 90:
        print(f"\nNote: {len(data)}-day sample. Sharpe ratios omitted (insufficient data for statistical significance).")
        print("Focus metrics: cumulative return, max drawdown, win rate.")

    output = {
        "backtest_date": data[-1]["date"],
        "data_points": len(data),
        "date_range": {"start": data[0]["date"], "end": data[-1]["date"]},
        "results": results,
        "ml_beats_equal_weight": bool(ml_metrics["annualized_apy_pct"] > equal_metrics["annualized_apy_pct"]),
        "ml_beats_static": bool(ml_metrics["annualized_apy_pct"] > static_metrics["annualized_apy_pct"]),
        "sample_size_note": f"{len(data)}-day sample" if len(data) < 90 else None,
    }

    output_path = os.path.join(RESULTS_DIR, "backtest_results.json")
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to {output_path}")


if __name__ == "__main__":
    main()
