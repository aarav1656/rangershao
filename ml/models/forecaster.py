#!/usr/bin/env python3
"""
Time-series forecasting model for DeFi protocol APYs.
Uses LSTM with attention for predicting next-day risk-adjusted returns.
Trains on historical DefiLlama data.
"""

import json
import os
import sys
import csv
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    print("[forecaster] PyTorch not available, using numpy-only mode", flush=True)

PROTOCOLS = ["kamino", "jupiter_lend", "raydium_clmm", "ondo_usdy"]
FEATURES_PER_PROTOCOL = 4  # apy, apy_base, apy_reward, tvl
N_FEATURES = len(PROTOCOLS) * FEATURES_PER_PROTOCOL
SEQUENCE_LEN = 7
FORECAST_HORIZON = 1

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "forecaster_weights.pt")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler_params.json")


def load_training_data() -> Tuple[np.ndarray, List[str]]:
    csv_path = os.path.join(DATA_DIR, "historical_rates.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"No historical data at {csv_path}. Run download_historical.py first.")

    with open(csv_path) as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    dates = []
    features = []

    for row in rows:
        has_all = all(row.get(f"{p}_apy") for p in PROTOCOLS)
        if not has_all:
            continue

        feat = []
        for p in PROTOCOLS:
            feat.append(float(row.get(f"{p}_apy", 0) or 0))
            feat.append(float(row.get(f"{p}_apy_base", 0) or 0))
            feat.append(float(row.get(f"{p}_apy_reward", 0) or 0))
            tvl = float(row.get(f"{p}_tvl", 0) or 0)
            feat.append(np.log1p(tvl))

        features.append(feat)
        dates.append(row["date"])

    return np.array(features, dtype=np.float32), dates


def compute_derived_features(data: np.ndarray) -> np.ndarray:
    n_rows, n_cols = data.shape
    derived = []

    for i in range(n_rows):
        row = data[i]
        apys = [row[j * FEATURES_PER_PROTOCOL] for j in range(len(PROTOCOLS))]
        avg_apy = np.mean(apys)
        std_apy = np.std(apys) if len(apys) > 1 else 0
        max_apy = np.max(apys)
        min_apy = np.min(apys)
        spread = max_apy - min_apy

        if i > 0:
            prev_apys = [data[i-1][j * FEATURES_PER_PROTOCOL] for j in range(len(PROTOCOLS))]
            momentum = [apys[j] - prev_apys[j] for j in range(len(PROTOCOLS))]
        else:
            momentum = [0.0] * len(PROTOCOLS)

        derived.append([avg_apy, std_apy, spread] + momentum)

    return np.array(derived, dtype=np.float32)


class RateScaler:
    def __init__(self):
        self.mean = None
        self.std = None

    def fit(self, data: np.ndarray):
        self.mean = data.mean(axis=0)
        self.std = data.std(axis=0)
        self.std[self.std < 1e-8] = 1.0

    def transform(self, data: np.ndarray) -> np.ndarray:
        return (data - self.mean) / self.std

    def inverse_transform(self, data: np.ndarray) -> np.ndarray:
        return data * self.std + self.mean

    def save(self, path: str):
        with open(path, "w") as f:
            json.dump({"mean": self.mean.tolist(), "std": self.std.tolist()}, f)

    def load(self, path: str):
        with open(path) as f:
            params = json.load(f)
        self.mean = np.array(params["mean"], dtype=np.float32)
        self.std = np.array(params["std"], dtype=np.float32)


def create_sequences(data: np.ndarray, seq_len: int = SEQUENCE_LEN, horizon: int = FORECAST_HORIZON):
    X, y = [], []
    for i in range(len(data) - seq_len - horizon + 1):
        X.append(data[i:i + seq_len])
        target_apys = [data[i + seq_len + horizon - 1][j * FEATURES_PER_PROTOCOL] for j in range(len(PROTOCOLS))]
        y.append(target_apys)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


if HAS_TORCH:
    class RateDataset(Dataset):
        def __init__(self, X, y):
            self.X = torch.FloatTensor(X)
            self.y = torch.FloatTensor(y)

        def __len__(self):
            return len(self.X)

        def __getitem__(self, idx):
            return self.X[idx], self.y[idx]


    class RateForecaster(nn.Module):
        def __init__(self, input_dim: int, hidden_dim: int = 64, n_layers: int = 2,
                     n_outputs: int = len(PROTOCOLS), dropout: float = 0.2):
            super().__init__()
            self.lstm = nn.LSTM(
                input_size=input_dim,
                hidden_size=hidden_dim,
                num_layers=n_layers,
                batch_first=True,
                dropout=dropout if n_layers > 1 else 0,
            )
            self.attention = nn.Sequential(
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.Tanh(),
                nn.Linear(hidden_dim // 2, 1),
            )
            self.head = nn.Sequential(
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(hidden_dim // 2, n_outputs),
            )

        def forward(self, x):
            lstm_out, _ = self.lstm(x)
            attn_weights = torch.softmax(self.attention(lstm_out).squeeze(-1), dim=1)
            context = torch.bmm(attn_weights.unsqueeze(1), lstm_out).squeeze(1)
            return self.head(context)


def train_model(epochs: int = 200, lr: float = 0.001, patience: int = 30):
    if not HAS_TORCH:
        print("PyTorch required for training. Install with: pip install torch")
        return None

    print("Loading training data...")
    raw_data, dates = load_training_data()
    print(f"Loaded {len(raw_data)} complete rows from {dates[0]} to {dates[-1]}")

    if len(raw_data) < SEQUENCE_LEN + FORECAST_HORIZON + 5:
        print(f"WARNING: Only {len(raw_data)} rows. Need at least {SEQUENCE_LEN + FORECAST_HORIZON + 5}.")
        print("Training with augmented data...")
        raw_data = augment_data(raw_data)
        print(f"Augmented to {len(raw_data)} rows")

    derived = compute_derived_features(raw_data)
    full_data = np.concatenate([raw_data, derived], axis=1)

    scaler = RateScaler()
    scaler.fit(full_data)
    scaled = scaler.transform(full_data)

    X, y = create_sequences(scaled)
    print(f"Created {len(X)} sequences (seq_len={SEQUENCE_LEN}, horizon={FORECAST_HORIZON})")

    split = max(1, int(len(X) * 0.8))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    train_ds = RateDataset(X_train, y_train)
    val_ds = RateDataset(X_val, y_val)
    train_dl = DataLoader(train_ds, batch_size=min(16, len(train_ds)), shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=len(val_ds)) if len(val_ds) > 0 else None

    input_dim = full_data.shape[1]
    model = RateForecaster(input_dim=input_dim, hidden_dim=64, n_layers=2)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)
    criterion = nn.MSELoss()

    best_val_loss = float("inf")
    patience_counter = 0

    print(f"Training for up to {epochs} epochs...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for batch_X, batch_y in train_dl:
            optimizer.zero_grad()
            pred = model(batch_X)
            loss = criterion(pred, batch_y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item()

        train_loss /= len(train_dl)

        if val_dl:
            model.eval()
            with torch.no_grad():
                val_loss = 0
                for batch_X, batch_y in val_dl:
                    pred = model(batch_X)
                    val_loss += criterion(pred, batch_y).item()
                val_loss /= len(val_dl)

            scheduler.step(val_loss)

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                torch.save(model.state_dict(), MODEL_PATH)
            else:
                patience_counter += 1

            if (epoch + 1) % 20 == 0:
                print(f"  Epoch {epoch+1}: train_loss={train_loss:.6f} val_loss={val_loss:.6f}")

            if patience_counter >= patience:
                print(f"  Early stopping at epoch {epoch+1}")
                break
        else:
            if (epoch + 1) % 20 == 0:
                print(f"  Epoch {epoch+1}: train_loss={train_loss:.6f}")
            torch.save(model.state_dict(), MODEL_PATH)

    scaler.save(SCALER_PATH)

    model_info = {
        "trained_at": datetime.utcnow().isoformat(),
        "epochs_run": epoch + 1,
        "best_val_loss": best_val_loss if best_val_loss != float("inf") else None,
        "n_training_samples": len(X_train),
        "n_validation_samples": len(X_val),
        "input_dim": input_dim,
        "sequence_length": SEQUENCE_LEN,
        "protocols": PROTOCOLS,
        "date_range": {"start": dates[0], "end": dates[-1]},
    }
    with open(os.path.join(MODEL_DIR, "model_info.json"), "w") as f:
        json.dump(model_info, f, indent=2)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")
    return model


def augment_data(data: np.ndarray, factor: int = 2) -> np.ndarray:
    print(f"WARNING: Augmenting {len(data)} samples by {factor}x with synthetic noise")
    augmented = [data]
    for _ in range(factor - 1):
        noise = np.random.normal(0, 0.001, data.shape).astype(np.float32)
        shifted = data + noise
        for j in range(len(PROTOCOLS)):
            col = j * FEATURES_PER_PROTOCOL
            shifted[:, col] = np.clip(shifted[:, col], 0, 1)
        augmented.append(shifted)
    return np.concatenate(augmented, axis=0)


def load_model() -> Optional[object]:
    if not HAS_TORCH:
        return None
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        return None

    scaler = RateScaler()
    scaler.load(SCALER_PATH)

    with open(os.path.join(MODEL_DIR, "model_info.json")) as f:
        info = json.load(f)

    model = RateForecaster(input_dim=info["input_dim"], hidden_dim=64, n_layers=2)
    model.load_state_dict(torch.load(MODEL_PATH, weights_only=True))
    model.eval()

    return {"model": model, "scaler": scaler, "info": info}


def predict_rates(model_bundle: Dict, recent_data: np.ndarray) -> np.ndarray:
    model = model_bundle["model"]
    scaler = model_bundle["scaler"]

    derived = compute_derived_features(recent_data)
    full = np.concatenate([recent_data, derived], axis=1)
    scaled = scaler.transform(full)

    if len(scaled) < SEQUENCE_LEN:
        pad = np.zeros((SEQUENCE_LEN - len(scaled), scaled.shape[1]), dtype=np.float32)
        scaled = np.concatenate([pad, scaled], axis=0)

    seq = scaled[-SEQUENCE_LEN:]
    with torch.no_grad():
        x = torch.FloatTensor(seq).unsqueeze(0)
        pred = model(x).numpy()[0]

    return pred


if __name__ == "__main__":
    model = train_model()
    if model:
        print("\nTraining complete. Testing inference...")
        bundle = load_model()
        if bundle:
            data, dates = load_training_data()
            pred = predict_rates(bundle, data[-SEQUENCE_LEN:])
            print(f"\nPredicted next-day scaled APYs:")
            for i, p in enumerate(PROTOCOLS):
                print(f"  {p}: {pred[i]:.6f}")
