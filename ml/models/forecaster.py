"""
LSTM-based APY forecaster for Solana DeFi lending pools.
"""

import logging
import os
import time
from typing import Dict, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from ml.config import CHECKPOINT_DIR, MODEL_PATH, ModelConfig

logger = logging.getLogger(__name__)


class LSTMForecaster(nn.Module):
    """
    Multi-layer LSTM for APY time-series forecasting.
    Input: (batch, seq_len, n_features)
    Output: (batch, forecast_horizon)
    """

    def __init__(
        self,
        n_features: int,
        hidden_dim: int = 128,
        num_layers: int = 2,
        dropout: float = 0.2,
        forecast_horizon: int = 1,
    ):
        super().__init__()
        self.n_features = n_features
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.forecast_horizon = forecast_horizon

        self.lstm = nn.LSTM(
            input_size=n_features,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, forecast_horizon)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch, seq_len, n_features)
        Returns:
            predictions: (batch, forecast_horizon)
        """
        # LSTM output: (batch, seq_len, hidden_dim)
        lstm_out, _ = self.lstm(x)
        # Take the last time step
        last_hidden = lstm_out[:, -1, :]
        out = self.dropout(last_hidden)
        predictions = self.fc(out)
        return predictions


def _get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def train_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    config: ModelConfig = ModelConfig(),
) -> Tuple[LSTMForecaster, Dict[str, list]]:
    """
    Train the LSTM forecaster with early stopping and LR scheduling.

    Returns:
        model: trained LSTMForecaster
        history: dict with 'train_loss' and 'val_loss' lists
    """
    device = _get_device()
    logger.info("Training on device: %s", device)

    n_features = X_train.shape[2]

    model = LSTMForecaster(
        n_features=n_features,
        hidden_dim=config.hidden_dim,
        num_layers=config.num_layers,
        dropout=config.dropout,
        forecast_horizon=config.forecast_horizon,
    ).to(device)

    # Datasets
    train_ds = TensorDataset(
        torch.tensor(X_train, dtype=torch.float32),
        torch.tensor(y_train, dtype=torch.float32),
    )
    val_ds = TensorDataset(
        torch.tensor(X_val, dtype=torch.float32),
        torch.tensor(y_val, dtype=torch.float32),
    )

    train_loader = DataLoader(train_ds, batch_size=config.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=config.batch_size, shuffle=False)

    # Optimizer and loss
    optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", factor=0.5, patience=5, verbose=True
    )

    if config.loss_fn == "huber":
        criterion = nn.HuberLoss(delta=1.0)
    else:
        criterion = nn.MSELoss()

    # Training loop
    history = {"train_loss": [], "val_loss": []}
    best_val_loss = float("inf")
    patience_counter = 0

    os.makedirs(CHECKPOINT_DIR, exist_ok=True)

    for epoch in range(config.epochs):
        # Train
        model.train()
        train_losses = []
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            preds = model(X_batch)
            loss = criterion(preds, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_losses.append(loss.item())

        # Validate
        model.eval()
        val_losses = []
        with torch.no_grad():
            for X_batch, y_batch in val_loader:
                X_batch, y_batch = X_batch.to(device), y_batch.to(device)
                preds = model(X_batch)
                loss = criterion(preds, y_batch)
                val_losses.append(loss.item())

        train_loss = np.mean(train_losses)
        val_loss = np.mean(val_losses)
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)

        scheduler.step(val_loss)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "config": {
                        "n_features": n_features,
                        "hidden_dim": config.hidden_dim,
                        "num_layers": config.num_layers,
                        "dropout": config.dropout,
                        "forecast_horizon": config.forecast_horizon,
                    },
                    "epoch": epoch,
                    "val_loss": best_val_loss,
                    "timestamp": time.time(),
                },
                MODEL_PATH,
            )
            logger.info(
                "Epoch %d/%d - train_loss: %.6f, val_loss: %.6f [BEST]",
                epoch + 1, config.epochs, train_loss, val_loss,
            )
        else:
            patience_counter += 1
            if (epoch + 1) % 10 == 0:
                logger.info(
                    "Epoch %d/%d - train_loss: %.6f, val_loss: %.6f (patience: %d/%d)",
                    epoch + 1, config.epochs, train_loss, val_loss,
                    patience_counter, config.patience,
                )

        if patience_counter >= config.patience:
            logger.info("Early stopping at epoch %d", epoch + 1)
            break

    # Load best model
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    logger.info("Best model loaded (val_loss: %.6f)", checkpoint["val_loss"])

    return model, history


def load_model(path: str = MODEL_PATH, device: Optional[torch.device] = None) -> LSTMForecaster:
    """Load a trained model from checkpoint."""
    if device is None:
        device = _get_device()

    checkpoint = torch.load(path, map_location=device)
    cfg = checkpoint["config"]

    model = LSTMForecaster(
        n_features=cfg["n_features"],
        hidden_dim=cfg["hidden_dim"],
        num_layers=cfg["num_layers"],
        dropout=cfg["dropout"],
        forecast_horizon=cfg["forecast_horizon"],
    ).to(device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    logger.info("Model loaded from %s (epoch %d, val_loss %.6f)", path, checkpoint["epoch"], checkpoint["val_loss"])
    return model


def predict(
    model: LSTMForecaster,
    X: np.ndarray,
    device: Optional[torch.device] = None,
) -> np.ndarray:
    """
    Run inference on input sequences.

    Args:
        model: trained LSTMForecaster
        X: (n_samples, seq_len, n_features) or (seq_len, n_features)

    Returns:
        predictions: (n_samples, forecast_horizon)
    """
    if device is None:
        device = _get_device()

    model.eval()

    if X.ndim == 2:
        X = X[np.newaxis, ...]

    X_tensor = torch.tensor(X, dtype=torch.float32).to(device)

    with torch.no_grad():
        preds = model(X_tensor).cpu().numpy()

    return preds
