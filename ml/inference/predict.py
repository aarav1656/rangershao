#!/usr/bin/env python3
"""
Ranger ML Inference Service (v1: Regime-Based + Rate Optimization)

Called by the TypeScript keeper bot via subprocess:
  echo '{"rates":..., "utilization":..., "tvl":...}' | python3 ml/inference/predict.py

Input (JSON on stdin):
  {
    "rates": {"kamino": 0.12, "marginfi": 0.09, "jupiter_lend": 0.085, "raydium_clmm": 0.19, "ondo_usdy": 0.047},
    "utilization": {"kamino": 0.78, "marginfi": 0.65, ...},
    "tvl": {"kamino": 145000000, ...}
  }

If no stdin, fetches live data from protocol APIs.

Output (JSON on stdout):
  RangerAllocationSignal matching strategy/allocation_signal_schema.json
"""

import sys
import json
import uuid
import time
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Tuple, Optional
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

PROTOCOLS = ["ondo_usdy", "kamino", "marginfi", "jupiter_lend", "raydium_clmm"]

PROTOCOL_PARAMS = {
    "ondo_usdy": {"mean_rate": 0.047, "volatility": 0.003, "incentive": 0.00, "friction_bps": 0.1, "risk_score": 0.07},
    "kamino": {"mean_rate": 0.11, "volatility": 0.045, "incentive": 0.07, "friction_bps": 0.3, "risk_score": 0.14},
    "marginfi": {"mean_rate": 0.10, "volatility": 0.05, "incentive": 0.065, "friction_bps": 0.3, "risk_score": 0.18},
    "jupiter_lend": {"mean_rate": 0.09, "volatility": 0.045, "incentive": 0.06, "friction_bps": 0.25, "risk_score": 0.21},
    "raydium_clmm": {"mean_rate": 0.19, "volatility": 0.07, "incentive": 0.04, "friction_bps": 0.5, "risk_score": 0.15},
}

REGIME_ALLOCATIONS = {
    "NORMAL": {"ondo_usdy": 0.28, "kamino": 0.22, "marginfi": 0.18, "jupiter_lend": 0.12, "raydium_clmm": 0.20},
    "HIGH_DEMAND": {"ondo_usdy": 0.20, "kamino": 0.28, "marginfi": 0.22, "jupiter_lend": 0.12, "raydium_clmm": 0.18},
    "RATE_COMPRESSION": {"ondo_usdy": 0.38, "kamino": 0.15, "marginfi": 0.10, "jupiter_lend": 0.10, "raydium_clmm": 0.27},
}

MIN_ALLOC = 0.10
MAX_ALLOC = 0.60
MIN_ONDO = 0.20
MAX_RAYDIUM = 0.30
MAX_DEFI_LENDING = 0.50

REGIME_THRESHOLDS = {"high": 0.15, "low": 0.06}

RATE_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "rate_history.json")
REGIME_STATE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "regime_state.json")


def detect_regime(rates: Dict[str, float]) -> Tuple[str, float]:
    lending_rates = {
        "kamino": rates.get("kamino", PROTOCOL_PARAMS["kamino"]["mean_rate"]),
        "marginfi": rates.get("marginfi", PROTOCOL_PARAMS["marginfi"]["mean_rate"]),
        "jupiter_lend": rates.get("jupiter_lend", PROTOCOL_PARAMS["jupiter_lend"]["mean_rate"]),
    }

    weighted_avg = (
        lending_rates["kamino"] * 0.40 +
        lending_rates["marginfi"] * 0.35 +
        lending_rates["jupiter_lend"] * 0.25
    )

    regime_state = load_regime_state()
    prev_regime = regime_state.get("regime", "NORMAL")
    confirm_count = regime_state.get("confirm_count", 0)
    last_signal = regime_state.get("last_signal", "NORMAL")

    if weighted_avg > REGIME_THRESHOLDS["high"]:
        new_signal = "HIGH_DEMAND"
    elif weighted_avg < REGIME_THRESHOLDS["low"]:
        new_signal = "RATE_COMPRESSION"
    else:
        new_signal = "NORMAL"

    if new_signal != prev_regime:
        if new_signal == last_signal:
            confirm_count += 1
        else:
            confirm_count = 1

        if confirm_count >= 3:
            regime = new_signal
            confidence = min(0.6 + confirm_count * 0.1, 0.95)
            save_regime_state(regime, 0, regime)
        else:
            regime = prev_regime
            confidence = max(0.5, 0.9 - confirm_count * 0.15)
            save_regime_state(prev_regime, confirm_count, new_signal)
    else:
        regime = prev_regime
        confidence = 0.90
        save_regime_state(prev_regime, 0, prev_regime)

    return regime, confidence


def load_regime_state() -> Dict:
    try:
        with open(REGIME_STATE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"regime": "NORMAL", "confirm_count": 0, "last_signal": "NORMAL"}


def save_regime_state(regime: str, confirm_count: int, last_signal: str):
    os.makedirs(os.path.dirname(REGIME_STATE_FILE), exist_ok=True)
    with open(REGIME_STATE_FILE, "w") as f:
        json.dump({
            "regime": regime,
            "confirm_count": confirm_count,
            "last_signal": last_signal,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, f)


def optimize_allocation(
    rates: Dict[str, float],
    utilization: Dict[str, float],
    tvl: Dict[str, float],
    regime: str,
) -> Dict[str, float]:
    base = REGIME_ALLOCATIONS[regime].copy()

    risk_adjusted_rates = {}
    for p in PROTOCOLS:
        raw_rate = rates.get(p, PROTOCOL_PARAMS[p]["mean_rate"])
        incentive = PROTOCOL_PARAMS[p]["incentive"]
        risk = PROTOCOL_PARAMS[p]["risk_score"]
        friction = PROTOCOL_PARAMS[p]["friction_bps"] / 10000 * 365

        effective_rate = raw_rate + incentive - friction
        risk_adjusted = effective_rate * (1 - risk)
        risk_adjusted_rates[p] = risk_adjusted

    avg_rate = np.mean(list(risk_adjusted_rates.values()))

    for p in PROTOCOLS:
        if avg_rate > 0:
            rate_premium = (risk_adjusted_rates[p] - avg_rate) / max(avg_rate, 0.01)
            base[p] = base[p] * (1 + rate_premium * 0.25)

    for p in PROTOCOLS:
        util = utilization.get(p, 0.5)
        if util > 0.90:
            base[p] *= 0.7
        elif util > 0.80:
            base[p] *= 0.9
        elif util < 0.30 and p != "ondo_usdy":
            base[p] *= 0.85

    for p in PROTOCOLS:
        protocol_tvl = tvl.get(p, 100_000_000)
        if protocol_tvl < 10_000_000:
            base[p] *= 0.5
        elif protocol_tvl < 50_000_000:
            base[p] *= 0.8

    base = enforce_constraints(base)
    return base


def enforce_constraints(weights: Dict[str, float]) -> Dict[str, float]:
    for p in weights:
        weights[p] = max(MIN_ALLOC, min(MAX_ALLOC, weights[p]))

    if weights["ondo_usdy"] < MIN_ONDO:
        deficit = MIN_ONDO - weights["ondo_usdy"]
        weights["ondo_usdy"] = MIN_ONDO
        defi = [p for p in PROTOCOLS if p != "ondo_usdy"]
        defi_total = sum(weights[p] for p in defi)
        if defi_total > 0:
            for p in defi:
                weights[p] -= deficit * (weights[p] / defi_total)

    if weights["raydium_clmm"] > MAX_RAYDIUM:
        excess = weights["raydium_clmm"] - MAX_RAYDIUM
        weights["raydium_clmm"] = MAX_RAYDIUM
        others = [p for p in PROTOCOLS if p not in ("raydium_clmm",)]
        others_total = sum(weights[p] for p in others)
        if others_total > 0:
            for p in others:
                weights[p] += excess * (weights[p] / others_total)

    defi_lending = sum(weights[p] for p in ["kamino", "marginfi", "jupiter_lend"])
    if defi_lending > MAX_DEFI_LENDING:
        scale = MAX_DEFI_LENDING / defi_lending
        for p in ["kamino", "marginfi", "jupiter_lend"]:
            weights[p] *= scale
        remainder = 1.0 - sum(weights.values())
        weights["ondo_usdy"] += remainder * 0.6
        weights["raydium_clmm"] += remainder * 0.4

    for p in weights:
        weights[p] = max(MIN_ALLOC, min(MAX_ALLOC, weights[p]))

    total = sum(weights.values())
    weights = {p: w / total for p, w in weights.items()}

    return weights


def compute_risk_metrics(
    weights: Dict[str, float],
    rates: Dict[str, float],
) -> Dict[str, float]:
    expected_apy = sum(
        weights[p] * (rates.get(p, PROTOCOL_PARAMS[p]["mean_rate"]) + PROTOCOL_PARAMS[p]["incentive"])
        for p in PROTOCOLS
    )

    portfolio_vol = 0.0
    for p in PROTOCOLS:
        portfolio_vol += (weights[p] ** 2) * (PROTOCOL_PARAMS[p]["volatility"] ** 2)
    portfolio_vol = np.sqrt(portfolio_vol)

    daily_vol = portfolio_vol / np.sqrt(365)
    var_95 = 1.645 * daily_vol
    max_dd_7d = 2.33 * daily_vol * np.sqrt(7) * 0.5

    hhi = sum((w * 10000) ** 2 for w in weights.values()) / (10000 ** 2) * 10000

    return {
        "portfolio_var_95": round(var_95, 6),
        "expected_apy": round(expected_apy, 6),
        "max_drawdown_projected": round(max_dd_7d, 6),
        "hhi": round(hhi, 1),
    }


def compute_rebalance_urgency(
    weights: Dict[str, float],
    rates: Dict[str, float],
    regime: str,
) -> str:
    base = REGIME_ALLOCATIONS[regime]
    drift = sum(abs(weights[p] - base[p]) for p in PROTOCOLS)

    rate_divergence = 0
    for p in ["kamino", "marginfi", "jupiter_lend"]:
        rate_divergence += abs(rates.get(p, 0) - PROTOCOL_PARAMS[p]["mean_rate"])

    if drift > 0.15 or rate_divergence > 0.10:
        return "HIGH"
    elif drift > 0.08 or rate_divergence > 0.05:
        return "MEDIUM"
    elif drift > 0.03 or rate_divergence > 0.02:
        return "LOW"
    return "NONE"


def compute_feature_importance(
    rates: Dict[str, float],
    utilization: Dict[str, float],
    tvl: Dict[str, float],
    weights: Dict[str, float],
) -> Dict[str, Dict[str, float]]:
    importance = {}
    for p in PROTOCOLS:
        rate = rates.get(p, PROTOCOL_PARAMS[p]["mean_rate"])
        util = utilization.get(p, 0.5)
        protocol_tvl = tvl.get(p, 100_000_000)
        risk = PROTOCOL_PARAMS[p]["risk_score"]

        rate_signal = (rate - PROTOCOL_PARAMS[p]["mean_rate"]) / max(PROTOCOL_PARAMS[p]["volatility"], 0.001)
        util_signal = -1.0 if util > 0.90 else (0.5 if util < 0.30 else 0.0)
        tvl_signal = -0.5 if protocol_tvl < 50_000_000 else 0.0
        risk_signal = -risk * 2

        total = abs(rate_signal) + abs(util_signal) + abs(tvl_signal) + abs(risk_signal)
        if total > 0:
            importance[p] = {
                "rate_signal": round(rate_signal / total, 3),
                "utilization_signal": round(util_signal / total, 3),
                "tvl_signal": round(tvl_signal / total, 3),
                "risk_signal": round(risk_signal / total, 3),
                "allocation_weight": round(weights[p], 4),
            }
        else:
            importance[p] = {
                "rate_signal": 0.0,
                "utilization_signal": 0.0,
                "tvl_signal": 0.0,
                "risk_signal": 0.0,
                "allocation_weight": round(weights[p], 4),
            }
    return importance


def append_rate_history(rates: Dict[str, float]):
    os.makedirs(os.path.dirname(RATE_HISTORY_FILE), exist_ok=True)
    try:
        with open(RATE_HISTORY_FILE, "r") as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = []

    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rates": rates,
    })

    if len(history) > 10000:
        history = history[-10000:]

    with open(RATE_HISTORY_FILE, "w") as f:
        json.dump(history, f)


_lstm_bundle = None


def get_lstm_bundle():
    global _lstm_bundle
    if _lstm_bundle is not None:
        return _lstm_bundle
    try:
        from models.forecaster import load_model
        _lstm_bundle = load_model()
        if _lstm_bundle:
            print("[predict] LSTM model loaded", file=sys.stderr)
    except Exception as e:
        print(f"[predict] LSTM load failed, using regime-only: {e}", file=sys.stderr)
        _lstm_bundle = None
    return _lstm_bundle


def lstm_adjusted_rates(rates: Dict[str, float], tvl: Dict[str, float]) -> Optional[Dict[str, float]]:
    bundle = get_lstm_bundle()
    if bundle is None:
        return None
    try:
        from models.forecaster import predict_rates, PROTOCOLS as LSTM_PROTOCOLS, FEATURES_PER_PROTOCOL, SEQUENCE_LEN
        row = []
        for p in LSTM_PROTOCOLS:
            row.append(rates.get(p, 0))
            row.append(rates.get(p, 0))
            row.append(0.0)
            row.append(np.log1p(tvl.get(p, 100_000_000)))
        recent = np.array([row] * SEQUENCE_LEN, dtype=np.float32)
        pred_scaled = predict_rates(bundle, recent)
        scaler = bundle["scaler"]
        pred_apys = {}
        for i, p in enumerate(LSTM_PROTOCOLS):
            col_idx = i * FEATURES_PER_PROTOCOL
            pred_val = pred_scaled[i] * scaler.std[col_idx] + scaler.mean[col_idx]
            pred_apys[p] = float(np.clip(pred_val, 0, 1))
        return pred_apys
    except Exception as e:
        print(f"[predict] LSTM inference failed: {e}", file=sys.stderr)
        return None


def run_inference(input_data: Optional[Dict] = None) -> Dict:
    if input_data is None:
        from data.fetcher import fetch_all_rates
        snapshots = fetch_all_rates()
        rates = {p: s.supply_apy for p, s in snapshots.items()}
        utilization = {p: s.utilization for p, s in snapshots.items()}
        tvl = {p: s.tvl_usd for p, s in snapshots.items()}
    else:
        rates = input_data.get("rates", {})
        utilization = input_data.get("utilization", {})
        tvl = input_data.get("tvl", {})

    for p in PROTOCOLS:
        if p not in rates:
            rates[p] = PROTOCOL_PARAMS[p]["mean_rate"]
        if p not in utilization:
            utilization[p] = 0.5
        if p not in tvl:
            tvl[p] = 100_000_000

    append_rate_history(rates)

    model_version = "v1.0-regime-optimizer"
    predicted_rates = lstm_adjusted_rates(rates, tvl)
    if predicted_rates:
        blend = {}
        for p in PROTOCOLS:
            current = rates.get(p, 0)
            predicted = predicted_rates.get(p, current)
            blend[p] = 0.6 * current + 0.4 * predicted
        effective_rates = blend
        model_version = "v2.0-lstm-regime-hybrid"
    else:
        effective_rates = rates

    regime, regime_confidence = detect_regime(effective_rates)
    weights = optimize_allocation(effective_rates, utilization, tvl, regime)
    risk_metrics = compute_risk_metrics(weights, rates)
    urgency = compute_rebalance_urgency(weights, rates, regime)
    feature_importance = compute_feature_importance(rates, utilization, tvl, weights)

    overall_confidence = min(
        regime_confidence,
        0.95 if risk_metrics["portfolio_var_95"] < 0.005 else 0.7,
        0.90 if risk_metrics["hhi"] < 3000 else 0.6,
    )
    if predicted_rates:
        overall_confidence = min(overall_confidence + 0.05, 0.98)

    now = datetime.now(timezone.utc)

    signal = {
        "timestamp": now.isoformat(),
        "signal_id": str(uuid.uuid4()),
        "regime": regime,
        "regime_confidence": round(regime_confidence, 4),
        "allocations": {p: round(w, 6) for p, w in weights.items()},
        "confidence": round(overall_confidence, 4),
        "risk_metrics": risk_metrics,
        "rebalance_urgency": urgency,
        "rate_observations": {p: round(r, 6) for p, r in rates.items()},
        "expires_at": (now + timedelta(minutes=5)).isoformat(),
        "model_version": model_version,
        "feature_importance": feature_importance,
    }

    if predicted_rates:
        signal["predicted_rates"] = {p: round(r, 6) for p, r in predicted_rates.items()}

    return signal


def main():
    stdin_data = None
    if not sys.stdin.isatty():
        try:
            raw = sys.stdin.read().strip()
            if raw:
                stdin_data = json.loads(raw)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON input: {e}"}), file=sys.stderr)
            sys.exit(1)

    start = time.time()
    signal = run_inference(stdin_data)
    elapsed_ms = (time.time() - start) * 1000

    signal["inference_time_ms"] = round(elapsed_ms, 1)

    print(json.dumps(signal, indent=2))

    if elapsed_ms > 1000:
        print(f"WARNING: Inference took {elapsed_ms:.0f}ms (target <1000ms)", file=sys.stderr)


if __name__ == "__main__":
    main()
