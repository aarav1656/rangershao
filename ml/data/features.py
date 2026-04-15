"""
Feature engineering for APY forecasting.
Transforms raw pool data into LSTM-ready sequences with normalized features.
"""

import logging
import os
import pickle
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from ml.config import (
    CHECKPOINT_DIR,
    FEATURE_COLS,
    ModelConfig,
    SCALER_PATH,
)

logger = logging.getLogger(__name__)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features for each pool from raw APY/TVL data.
    Operates per-pool and then merges cross-pool features.
    """
    if df.empty:
        raise ValueError("Input DataFrame is empty")

    pool_dfs = []

    for pool_id, group in df.groupby("pool_id"):
        g = group.sort_values("timestamp").copy()

        # Rolling APY statistics
        for window in [7, 14, 30]:
            g[f"apy_roll_mean_{window}"] = (
                g["apy"].rolling(window=window, min_periods=1).mean()
            )
            g[f"apy_roll_std_{window}"] = (
                g["apy"].rolling(window=window, min_periods=1).std().fillna(0)
            )

        # APY momentum
        g["apy_momentum_1"] = g["apy"].diff(1).fillna(0)
        g["apy_momentum_7"] = g["apy"].diff(7).fillna(0)

        # TVL change rate
        g["tvl_pct_change_1"] = g["tvlUsd"].pct_change(1).fillna(0)
        g["tvl_pct_change_7"] = g["tvlUsd"].pct_change(7).fillna(0)

        # TVL log (handle zeros)
        g["tvl_log"] = np.log1p(g["tvlUsd"].clip(lower=0))

        # Day of week cyclical encoding
        day_of_week = g["timestamp"].dt.dayofweek  # 0=Monday
        g["day_sin"] = np.sin(2 * np.pi * day_of_week / 7)
        g["day_cos"] = np.cos(2 * np.pi * day_of_week / 7)

        # Risk-adjusted APY
        epsilon = 1e-6
        g["risk_adjusted_apy"] = g["apy"] / (g["apy_roll_std_7"] + epsilon)

        pool_dfs.append(g)

    combined = pd.concat(pool_dfs, ignore_index=True)

    # APY rank across protocols per timestamp
    combined["apy_rank"] = combined.groupby("timestamp")["apy"].rank(
        method="dense", ascending=False, pct=True
    )

    # Replace infinities and NaN
    combined = combined.replace([np.inf, -np.inf], 0)
    combined = combined.fillna(0)

    return combined


def fit_scaler(df: pd.DataFrame, feature_cols: List[str] = FEATURE_COLS) -> StandardScaler:
    """Fit a StandardScaler on the feature columns and save it."""
    scaler = StandardScaler()
    scaler.fit(df[feature_cols].values)

    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
    logger.info("Scaler fitted and saved to %s", SCALER_PATH)

    return scaler


def load_scaler() -> StandardScaler:
    """Load a previously fitted scaler."""
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"No scaler found at {SCALER_PATH}")
    with open(SCALER_PATH, "rb") as f:
        return pickle.load(f)


def create_sequences(
    df: pd.DataFrame,
    pool_id: str,
    scaler: StandardScaler,
    config: ModelConfig = ModelConfig(),
    feature_cols: List[str] = FEATURE_COLS,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create sliding-window sequences for a single pool.

    Returns:
        X: (n_samples, seq_length, n_features)
        y: (n_samples, forecast_horizon) - target APY values
    """
    pool_df = df[df["pool_id"] == pool_id].sort_values("timestamp").copy()

    if len(pool_df) < config.sequence_length + config.forecast_horizon:
        logger.warning(
            "Pool %s has only %d rows, need %d",
            pool_id,
            len(pool_df),
            config.sequence_length + config.forecast_horizon,
        )
        return np.array([]), np.array([])

    features = scaler.transform(pool_df[feature_cols].values)
    targets = pool_df["apy"].values

    X, y = [], []
    total_len = len(features)

    for i in range(total_len - config.sequence_length - config.forecast_horizon + 1):
        X.append(features[i : i + config.sequence_length])
        y.append(
            targets[
                i + config.sequence_length : i + config.sequence_length + config.forecast_horizon
            ]
        )

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def prepare_all_sequences(
    df: pd.DataFrame,
    scaler: StandardScaler,
    config: ModelConfig = ModelConfig(),
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Create sequences for ALL pools and concatenate.
    Returns combined X and y arrays.
    """
    all_X, all_y = [], []

    for pool_id in df["pool_id"].unique():
        X, y = create_sequences(df, pool_id, scaler, config)
        if X.size > 0:
            all_X.append(X)
            all_y.append(y)

    if not all_X:
        raise ValueError("No valid sequences could be created from the data")

    X_combined = np.concatenate(all_X, axis=0)
    y_combined = np.concatenate(all_y, axis=0)

    logger.info("Total sequences: %d, features: %d", X_combined.shape[0], X_combined.shape[2])
    return X_combined, y_combined


def train_val_test_split(
    X: np.ndarray,
    y: np.ndarray,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
) -> Dict[str, Tuple[np.ndarray, np.ndarray]]:
    """
    Split sequences into train/val/test sets (70/15/15).
    Uses temporal ordering (no shuffling) to prevent data leakage.
    """
    n = len(X)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    splits = {
        "train": (X[:train_end], y[:train_end]),
        "val": (X[train_end:val_end], y[train_end:val_end]),
        "test": (X[val_end:], y[val_end:]),
    }

    for name, (sx, sy) in splits.items():
        logger.info("Split '%s': %d samples", name, len(sx))

    return splits
