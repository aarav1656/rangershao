"""
Backtesting engine for evaluating APY forecasting and allocation strategies.
Walk-forward simulation with baseline comparisons.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from ml.config import AllocationConfig, ModelConfig, FEATURE_COLS
from ml.data.features import create_sequences, engineer_features
from ml.models.allocator import ConvexAllocator, EnsembleAllocator
from ml.models.forecaster import LSTMForecaster, predict

logger = logging.getLogger(__name__)


class BacktestEngine:
    """
    Walk-forward backtesting engine.
    Simulates day-by-day prediction and allocation on historical data.
    """

    def __init__(
        self,
        model: LSTMForecaster,
        scaler: Any,
        allocator: Optional[Any] = None,
        model_config: ModelConfig = ModelConfig(),
        alloc_config: AllocationConfig = AllocationConfig(),
    ):
        self.model = model
        self.scaler = scaler
        self.model_config = model_config
        self.alloc_config = alloc_config
        self.allocator = allocator or ConvexAllocator(alloc_config)

    def run(
        self,
        df: pd.DataFrame,
        start_idx: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Run walk-forward backtest.

        Args:
            df: DataFrame with engineered features (output of engineer_features)
            start_idx: Starting index for the test period. If None, uses 70% mark.

        Returns:
            Dict with backtest results and metrics.
        """
        pool_ids = sorted(df["pool_id"].unique())
        n_pools = len(pool_ids)

        if n_pools == 0:
            raise ValueError("No pools found in data")

        # Get unique timestamps sorted
        timestamps = sorted(df["timestamp"].unique())
        total_days = len(timestamps)

        if start_idx is None:
            start_idx = int(total_days * 0.7)

        seq_len = self.model_config.sequence_length

        if start_idx < seq_len:
            start_idx = seq_len
            logger.warning("Adjusted start_idx to %d (need seq_len history)", start_idx)

        # Track results
        daily_returns = []
        daily_weights = []
        daily_predictions = []
        daily_actuals = []
        timestamps_tested = []

        current_weights = np.ones(n_pools) / n_pools

        for t_idx in range(start_idx, total_days - 1):
            current_ts = timestamps[t_idx]
            next_ts = timestamps[t_idx + 1]

            # Get current data up to t_idx for each pool
            predictions = {}
            actuals = {}
            valid_pools = []

            for pool_id in pool_ids:
                pool_df = df[df["pool_id"] == pool_id].sort_values("timestamp")

                # Get data up to current timestamp
                hist = pool_df[pool_df["timestamp"] <= current_ts]

                if len(hist) < seq_len:
                    continue

                # Create input sequence from last seq_len rows
                features = self.scaler.transform(hist[FEATURE_COLS].values[-seq_len:])
                X = features[np.newaxis, ...]  # (1, seq_len, n_features)

                # Predict
                pred = predict(self.model, X)
                predictions[pool_id] = float(pred[0][0])

                # Get actual next-day APY
                next_row = pool_df[pool_df["timestamp"] == next_ts]
                if not next_row.empty:
                    actuals[pool_id] = float(next_row["apy"].iloc[0])
                    valid_pools.append(pool_id)

            if len(valid_pools) < 2:
                continue

            # Get predictions and actuals for valid pools
            pred_arr = np.array([predictions[p] for p in valid_pools])
            actual_arr = np.array([actuals[p] for p in valid_pools])

            # Compute covariance from historical returns
            cov_matrix = self._compute_cov(df, valid_pools, current_ts, lookback=30)

            # Allocate
            weights_dict = self.allocator.allocate(pred_arr, cov_matrix, valid_pools)
            w = np.array([weights_dict[p] for p in valid_pools])

            # Compute portfolio return (weighted average of actual APYs / 365 for daily)
            daily_return = np.dot(w, actual_arr) / 365.0
            daily_returns.append(daily_return)
            daily_weights.append(weights_dict)
            daily_predictions.append({p: predictions[p] for p in valid_pools})
            daily_actuals.append({p: actuals[p] for p in valid_pools})
            timestamps_tested.append(next_ts)

            current_weights = w

        if not daily_returns:
            raise ValueError("No valid test days found for backtesting")

        returns = np.array(daily_returns)

        # Compute baselines
        baselines = self._compute_baselines(df, pool_ids, timestamps, start_idx)

        # Compute metrics
        metrics = self._compute_metrics(returns, "model")
        for name, baseline_returns in baselines.items():
            baseline_metrics = self._compute_metrics(baseline_returns, name)
            metrics[f"baseline_{name}"] = baseline_metrics

        results = {
            "metrics": metrics,
            "daily_returns": returns.tolist(),
            "daily_weights": daily_weights,
            "daily_predictions": daily_predictions,
            "daily_actuals": daily_actuals,
            "timestamps": [str(t) for t in timestamps_tested],
            "n_test_days": len(returns),
            "n_pools": n_pools,
            "pool_ids": pool_ids,
        }

        return results

    def _compute_cov(
        self,
        df: pd.DataFrame,
        pool_ids: List[str],
        current_ts: Any,
        lookback: int = 30,
    ) -> np.ndarray:
        """Compute covariance matrix from historical APY returns."""
        n = len(pool_ids)
        returns_data = []

        for pid in pool_ids:
            pool_df = df[
                (df["pool_id"] == pid) & (df["timestamp"] <= current_ts)
            ].sort_values("timestamp").tail(lookback)

            r = pool_df["apy"].pct_change().dropna().values
            returns_data.append(r)

        # Align lengths
        min_len = min(len(r) for r in returns_data) if returns_data else 0
        if min_len < 2:
            return np.eye(n) * 0.01

        aligned = np.array([r[-min_len:] for r in returns_data])
        cov = np.cov(aligned)

        if cov.ndim == 0:
            cov = np.array([[float(cov)]])

        return cov

    def _compute_baselines(
        self,
        df: pd.DataFrame,
        pool_ids: List[str],
        timestamps: List,
        start_idx: int,
    ) -> Dict[str, np.ndarray]:
        """Compute baseline strategy returns."""
        baselines = {}

        n_pools = len(pool_ids)
        equal_returns = []
        greedy_returns = []
        best_static_returns = {pid: [] for pid in pool_ids}

        for t_idx in range(start_idx, len(timestamps) - 1):
            next_ts = timestamps[t_idx + 1]

            actuals = {}
            for pid in pool_ids:
                pool_df = df[df["pool_id"] == pid]
                row = pool_df[pool_df["timestamp"] == next_ts]
                if not row.empty:
                    actuals[pid] = float(row["apy"].iloc[0])

            if not actuals:
                continue

            valid = list(actuals.keys())
            apy_arr = np.array([actuals[p] for p in valid])

            # Equal weight
            equal_ret = np.mean(apy_arr) / 365.0
            equal_returns.append(equal_ret)

            # Greedy (all-in on highest APY)
            greedy_ret = np.max(apy_arr) / 365.0
            greedy_returns.append(greedy_ret)

            # Static best pool
            for pid in valid:
                best_static_returns[pid].append(actuals[pid] / 365.0)

        baselines["equal_weight"] = np.array(equal_returns) if equal_returns else np.array([0.0])
        baselines["greedy"] = np.array(greedy_returns) if greedy_returns else np.array([0.0])

        # Best static pool (hindsight)
        best_static_total = 0
        best_pid = None
        for pid, rets in best_static_returns.items():
            if rets:
                total = np.sum(rets)
                if total > best_static_total:
                    best_static_total = total
                    best_pid = pid

        if best_pid and best_static_returns[best_pid]:
            baselines["best_static"] = np.array(best_static_returns[best_pid])
        else:
            baselines["best_static"] = np.array([0.0])

        return baselines

    def _compute_metrics(self, returns: np.ndarray, name: str) -> Dict[str, float]:
        """Compute performance metrics for a return series."""
        if len(returns) == 0:
            return {"total_return": 0, "sharpe": 0, "max_drawdown": 0, "win_rate": 0}

        total_return = float(np.sum(returns))
        mean_return = float(np.mean(returns))
        std_return = float(np.std(returns)) if len(returns) > 1 else 1e-6

        # Annualized Sharpe (daily returns)
        sharpe = (mean_return / max(std_return, 1e-8)) * np.sqrt(365)

        # Max drawdown
        cumulative = np.cumsum(returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdowns = running_max - cumulative
        max_drawdown = float(np.max(drawdowns)) if len(drawdowns) > 0 else 0.0

        # Win rate
        win_rate = float(np.mean(returns > 0)) if len(returns) > 0 else 0.0

        metrics = {
            "total_return": total_return,
            "annualized_return": total_return * (365.0 / max(len(returns), 1)),
            "sharpe_ratio": float(sharpe),
            "max_drawdown": max_drawdown,
            "win_rate": win_rate,
            "n_days": len(returns),
        }

        logger.info(
            "[%s] Return: %.4f, Sharpe: %.2f, MaxDD: %.4f, WinRate: %.2f%%",
            name, total_return, sharpe, max_drawdown, win_rate * 100,
        )

        return metrics


def run_backtest(
    df: pd.DataFrame,
    model: LSTMForecaster,
    scaler: Any,
    model_config: ModelConfig = ModelConfig(),
    alloc_config: AllocationConfig = AllocationConfig(),
    plot: bool = False,
) -> Dict[str, Any]:
    """
    Orchestrate a full backtest run.

    Args:
        df: Raw pool data DataFrame
        model: Trained forecaster model
        scaler: Fitted StandardScaler
        model_config: Model hyperparameters
        alloc_config: Allocation constraints
        plot: Whether to generate matplotlib plots

    Returns:
        Backtest results dict
    """
    # Engineer features if not already done
    if "apy_roll_mean_7" not in df.columns:
        df = engineer_features(df)

    engine = BacktestEngine(model, scaler, model_config=model_config, alloc_config=alloc_config)
    results = engine.run(df)

    if plot:
        _plot_results(results)

    return results


def _plot_results(results: Dict[str, Any]):
    """Generate backtest visualization."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, axes = plt.subplots(2, 1, figsize=(14, 8))

        # Cumulative returns
        model_cum = np.cumsum(results["daily_returns"])
        axes[0].plot(model_cum, label="Model", linewidth=2)

        for name in ["equal_weight", "greedy", "best_static"]:
            key = f"baseline_{name}"
            if key in results["metrics"]:
                # We don't store baseline daily returns in results for plotting
                # but we show the metrics
                pass

        axes[0].set_title("Cumulative Returns")
        axes[0].set_xlabel("Day")
        axes[0].set_ylabel("Cumulative Return")
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)

        # Daily returns distribution
        axes[1].hist(results["daily_returns"], bins=50, alpha=0.7, edgecolor="black")
        axes[1].set_title("Daily Returns Distribution")
        axes[1].set_xlabel("Daily Return")
        axes[1].set_ylabel("Frequency")
        axes[1].grid(True, alpha=0.3)

        plt.tight_layout()
        plot_path = "backtest_results.png"
        plt.savefig(plot_path, dpi=150)
        plt.close()
        logger.info("Plot saved to %s", plot_path)
    except ImportError:
        logger.warning("matplotlib not available, skipping plots")
