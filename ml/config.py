"""
Ranger ML Pipeline Configuration
Solana DeFi yield optimization system configuration.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, List

# DefiLlama API endpoints
DEFILLAMA_POOLS_URL = "https://yields.llama.fi/pools"
DEFILLAMA_CHART_URL = "https://yields.llama.fi/chart/{pool_id}"

# Target protocols and their DefiLlama project slugs
# Pool IDs are discovered dynamically from the API based on project + symbol
PROTOCOLS: Dict[str, dict] = {
    "kamino-lend": {
        "slug": "kamino-lend",
        "display_name": "Kamino Lend",
        "target_symbols": ["USDC", "SOL", "JitoSOL"],
    },
    "marginfi-lend": {
        "slug": "marginfi-lend",
        "display_name": "Marginfi",
        "target_symbols": ["USDC", "SOL"],
    },
    "jupiter-lend-borrow": {
        "slug": "jupiter-lend-borrow",
        "display_name": "Jupiter Lend",
        "target_symbols": ["USDC", "SOL", "JLP"],
    },
}

TARGET_CHAIN = "Solana"


@dataclass
class ModelConfig:
    """LSTM forecaster hyperparameters."""
    sequence_length: int = 30
    forecast_horizon: int = 1
    hidden_dim: int = 128
    num_layers: int = 2
    dropout: float = 0.2
    learning_rate: float = 1e-3
    epochs: int = 100
    batch_size: int = 32
    patience: int = 10  # early stopping patience
    loss_fn: str = "huber"  # "mse" or "huber"


@dataclass
class AllocationConfig:
    """Portfolio allocation constraints."""
    max_single: float = 0.60
    min_single: float = 0.10
    min_health: float = 1.2
    risk_lambda: float = 0.5  # risk aversion parameter
    ensemble_blend: float = 0.7  # weight for convex allocator vs RL


@dataclass
class InferenceConfig:
    """Inference service settings."""
    max_latency_ms: int = 1000
    host: str = "0.0.0.0"
    port: int = 8000
    model_dir: str = "checkpoints"


@dataclass
class OpenRouterConfig:
    """OpenRouter LLM fallback settings."""
    base_url: str = "https://openrouter.ai/api/v1"
    model: str = "anthropic/claude-sonnet-4"
    api_key_env: str = "OPENROUTER_API_KEY"
    max_tokens: int = 2048
    temperature: float = 0.2

    @property
    def api_key(self) -> str:
        key = os.environ.get(self.api_key_env, "")
        if not key:
            raise EnvironmentError(
                f"Set {self.api_key_env} environment variable for LLM fallback"
            )
        return key


# Data paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CACHE_CSV = os.path.join(DATA_DIR, "pools_cache.csv")
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints")
SCALER_PATH = os.path.join(CHECKPOINT_DIR, "scaler.pkl")
MODEL_PATH = os.path.join(CHECKPOINT_DIR, "best_model.pt")

# Feature columns produced by feature engineering
FEATURE_COLS: List[str] = [
    "apy_roll_mean_7",
    "apy_roll_mean_14",
    "apy_roll_mean_30",
    "apy_roll_std_7",
    "apy_roll_std_14",
    "apy_roll_std_30",
    "apy_momentum_1",
    "apy_momentum_7",
    "tvl_pct_change_1",
    "tvl_pct_change_7",
    "tvl_log",
    "day_sin",
    "day_cos",
    "apy_rank",
    "risk_adjusted_apy",
]
