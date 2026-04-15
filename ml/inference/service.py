"""
FastAPI inference service for APY prediction and allocation.
Wraps the regime-based + LSTM hybrid inference and convex/ensemble allocation.
"""

import logging
import os
import sys
import time
from typing import Any, Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ml.config import AllocationConfig, InferenceConfig
from ml.models.allocator import ConvexAllocator, EnsembleAllocator

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ranger Yield Optimizer",
    description="APY prediction and capital allocation for Solana DeFi lending protocols",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LatencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        latency_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Latency-Ms"] = f"{latency_ms:.2f}"
        return response


app.add_middleware(LatencyMiddleware)


class ModelState:
    model_bundle: Optional[dict] = None
    alloc_config: AllocationConfig = AllocationConfig()
    loaded_at: Optional[float] = None
    model_info: Dict = {}


state = ModelState()


# Pydantic models
class PoolData(BaseModel):
    pool_id: str
    project: str
    symbol: str
    apy: float
    apyBase: Optional[float] = None
    tvlUsd: float
    il7d: Optional[float] = 0.0


class ProtocolDataItem(BaseModel):
    protocol: str
    strategyId: str = ""
    apy: float
    tvl: float = 0.0
    utilizationRate: float = 0.0
    healthFactor: Optional[float] = None
    lastUpdated: Optional[int] = None


STRATEGY_TO_PROTOCOL = {
    "kamino-usdc": "kamino",
    "marginfi-usdc": "marginfi",
    "jupiter-lend-usdc": "jupiter_lend",
    "raydium-usdc-usdt": "raydium_clmm",
    "ondo-usdy": "ondo_usdy",
}

PROTOCOL_TO_STRATEGY = {v: k for k, v in STRATEGY_TO_PROTOCOL.items()}


class PredictRequest(BaseModel):
    rates: Optional[Dict[str, float]] = None
    utilization: Optional[Dict[str, float]] = None
    tvl: Optional[Dict[str, float]] = None
    protocol_data: Optional[List[ProtocolDataItem]] = None


class PredictResponse(BaseModel):
    predictions: Dict[str, float]
    regime: str
    regime_confidence: float
    allocations: Dict[str, float]
    weights: Dict[str, float]
    confidence: float
    risk_metrics: Dict[str, float]
    rebalance_urgency: str
    model_version: str
    latency_ms: float


class AllocateRequest(BaseModel):
    predicted_apys: Dict[str, float]
    cov_matrix: Optional[List[List[float]]] = None
    current_weights: Optional[Dict[str, float]] = None


class AllocateResponse(BaseModel):
    weights: Dict[str, float]
    latency_ms: float
    method: str = "convex"


class FullAllocateRequest(BaseModel):
    rates: Optional[Dict[str, float]] = None
    utilization: Optional[Dict[str, float]] = None
    tvl: Optional[Dict[str, float]] = None
    current_weights: Optional[Dict[str, float]] = None


class FullAllocateResponse(BaseModel):
    predictions: Dict[str, float]
    weights: Dict[str, float]
    regime: str
    confidence: float
    latency_ms: float
    method: str = "regime_hybrid"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    latency_ms: float


class ModelInfoResponse(BaseModel):
    loaded: bool
    loaded_at: Optional[str] = None
    model_version: Optional[str] = None
    info: Optional[Dict] = None


@app.on_event("startup")
async def startup():
    """Load model and scaler on startup."""
    try:
        from models.forecaster import load_model
        state.model_bundle = load_model()
        if state.model_bundle:
            state.loaded_at = time.time()
            state.model_info = state.model_bundle.get("info", {})
            logger.info("LSTM model loaded on startup")
        else:
            logger.warning("No trained model found, will use regime-only inference")
    except Exception as e:
        logger.error("Failed to load model: %s", e)


@app.post("/predict", response_model=PredictResponse)
async def predict_endpoint(req: PredictRequest):
    """Predict APYs and allocations using the hybrid regime+LSTM model."""
    start = time.perf_counter()

    from inference.predict import run_inference

    input_data = None

    if req.protocol_data:
        rates, utilization, tvl = {}, {}, {}
        strategy_ids = {}
        for item in req.protocol_data:
            proto = STRATEGY_TO_PROTOCOL.get(item.strategyId, item.protocol)
            rates[proto] = item.apy
            utilization[proto] = item.utilizationRate
            tvl[proto] = item.tvl
            strategy_ids[proto] = item.strategyId or PROTOCOL_TO_STRATEGY.get(proto, proto)
        input_data = {"rates": rates, "utilization": utilization, "tvl": tvl}
    elif req.rates:
        input_data = {
            "rates": req.rates,
            "utilization": req.utilization or {},
            "tvl": req.tvl or {},
        }
        strategy_ids = {p: PROTOCOL_TO_STRATEGY.get(p, p) for p in req.rates}
    else:
        strategy_ids = PROTOCOL_TO_STRATEGY.copy()

    signal = run_inference(input_data)

    raw_allocs = signal.get("allocations", {})
    weights_by_strategy = {
        strategy_ids.get(proto, PROTOCOL_TO_STRATEGY.get(proto, proto)): w
        for proto, w in raw_allocs.items()
    }

    latency = (time.perf_counter() - start) * 1000

    return PredictResponse(
        predictions=signal.get("rate_observations", {}),
        regime=signal.get("regime", "NORMAL"),
        regime_confidence=signal.get("regime_confidence", 0.0),
        allocations=raw_allocs,
        weights=weights_by_strategy,
        confidence=signal.get("confidence", 0.0),
        risk_metrics=signal.get("risk_metrics", {}),
        rebalance_urgency=signal.get("rebalance_urgency", "NONE"),
        model_version=signal.get("model_version", "unknown"),
        latency_ms=latency,
    )


@app.post("/allocate", response_model=AllocateResponse)
async def allocate_endpoint(req: AllocateRequest):
    """Allocate capital given predicted APYs using convex optimizer."""
    start = time.perf_counter()

    pool_ids = list(req.predicted_apys.keys())
    predicted = np.array([req.predicted_apys[p] for p in pool_ids])
    n = len(pool_ids)

    if req.cov_matrix is not None:
        cov = np.array(req.cov_matrix)
    else:
        cov = np.eye(n) * 0.01

    allocator = ConvexAllocator(state.alloc_config)
    weights = allocator.allocate(predicted, cov, pool_ids)

    latency = (time.perf_counter() - start) * 1000
    return AllocateResponse(weights=weights, latency_ms=latency, method="convex")


@app.post("/allocate/full", response_model=FullAllocateResponse)
async def full_allocate_endpoint(req: FullAllocateRequest):
    """End-to-end: fetch/use provided data, predict, and allocate."""
    start = time.perf_counter()

    from inference.predict import run_inference

    input_data = None
    if req.rates:
        input_data = {
            "rates": req.rates,
            "utilization": req.utilization or {},
            "tvl": req.tvl or {},
        }

    signal = run_inference(input_data)
    allocations = signal.get("allocations", {})

    # Optionally overlay with convex optimization
    if req.current_weights:
        pool_ids = list(allocations.keys())
        predicted = np.array([signal.get("rate_observations", {}).get(p, 0) for p in pool_ids])
        n = len(pool_ids)
        cov = np.eye(n) * 0.01

        ensemble = EnsembleAllocator(n, state.alloc_config)
        current_w = np.array([req.current_weights.get(p, 1.0 / n) for p in pool_ids])
        risk_metrics = np.ones(n) * 0.01
        allocations = ensemble.allocate(
            predicted, cov,
            current_weights=current_w,
            risk_metrics=risk_metrics,
            pool_ids=pool_ids,
        )

    latency = (time.perf_counter() - start) * 1000
    return FullAllocateResponse(
        predictions=signal.get("rate_observations", {}),
        weights=allocations,
        regime=signal.get("regime", "NORMAL"),
        confidence=signal.get("confidence", 0.0),
        latency_ms=latency,
        method="regime_hybrid" if not req.current_weights else "ensemble",
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check with model status."""
    start = time.perf_counter()
    latency = (time.perf_counter() - start) * 1000
    return HealthResponse(
        status="healthy" if state.model_bundle is not None else "degraded",
        model_loaded=state.model_bundle is not None,
        latency_ms=latency,
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    """Model metadata and performance metrics."""
    loaded_at_str = None
    if state.loaded_at:
        from datetime import datetime, timezone
        loaded_at_str = datetime.fromtimestamp(state.loaded_at, tz=timezone.utc).isoformat()

    return ModelInfoResponse(
        loaded=state.model_bundle is not None,
        loaded_at=loaded_at_str,
        model_version=state.model_info.get("trained_at"),
        info=state.model_info,
    )


@app.post("/model/reload")
async def reload_model():
    """Hot-reload the model from disk."""
    try:
        from models.forecaster import load_model
        state.model_bundle = load_model()
        if state.model_bundle:
            state.loaded_at = time.time()
            state.model_info = state.model_bundle.get("info", {})
            return {"status": "reloaded"}
        else:
            raise HTTPException(status_code=500, detail="No model found on disk")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload: {e}")


if __name__ == "__main__":
    import uvicorn

    inf_config = InferenceConfig()
    uvicorn.run(
        "ml.inference.service:app",
        host=inf_config.host,
        port=inf_config.port,
        reload=True,
    )
