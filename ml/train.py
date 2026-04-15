#!/usr/bin/env python3
"""
Training orchestrator for the Ranger yield optimization pipeline.
Downloads historical data, trains the LSTM forecaster, runs backtest validation.
"""

import json
import logging
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    start_time = time.time()

    # Step 1: Download historical data
    logger.info("=" * 60)
    logger.info("STEP 1: Downloading Historical Data from DefiLlama")
    logger.info("=" * 60)

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    csv_path = os.path.join(data_dir, "historical_rates.csv")

    if not os.path.exists(csv_path):
        logger.info("No cached data found, downloading from DefiLlama...")
        from data.download_historical import main as download_main
        download_main()
    else:
        import csv
        with open(csv_path) as f:
            row_count = sum(1 for _ in csv.reader(f)) - 1
        logger.info("Using cached data (%d rows) at %s", row_count, csv_path)

    # Step 2: Train the LSTM forecaster
    logger.info("=" * 60)
    logger.info("STEP 2: Training LSTM Forecaster")
    logger.info("=" * 60)

    from models.forecaster import train_model, load_model, predict_rates, SEQUENCE_LEN, PROTOCOLS
    model = train_model()

    if model is None:
        logger.error("Training failed. Ensure PyTorch is installed.")
        sys.exit(1)

    # Step 3: Evaluate model
    logger.info("=" * 60)
    logger.info("STEP 3: Model Evaluation")
    logger.info("=" * 60)

    bundle = load_model()
    if bundle:
        from models.forecaster import load_training_data
        raw_data, dates = load_training_data()
        pred = predict_rates(bundle, raw_data[-SEQUENCE_LEN:])
        logger.info("Predicted next-day scaled APYs:")
        for i, p in enumerate(PROTOCOLS):
            logger.info("  %s: %.6f", p, pred[i])
    else:
        logger.warning("Could not load model for evaluation")

    # Step 4: Run backtest validation
    logger.info("=" * 60)
    logger.info("STEP 4: Backtesting")
    logger.info("=" * 60)

    try:
        from backtest.validate import main as validate_main
        validate_main()
    except Exception as e:
        logger.error("Backtest failed: %s", e)

    # Step 5: Test live inference
    logger.info("=" * 60)
    logger.info("STEP 5: Live Inference Test")
    logger.info("=" * 60)

    try:
        from inference.predict import run_inference
        signal = run_inference()
        logger.info("Regime: %s (confidence: %.2f)", signal["regime"], signal["regime_confidence"])
        logger.info("Model version: %s", signal["model_version"])
        logger.info("Allocations:")
        for p, w in signal["allocations"].items():
            logger.info("  %s: %.4f (%.1f%%)", p, w, w * 100)
        logger.info("Risk metrics:")
        for k, v in signal["risk_metrics"].items():
            logger.info("  %s: %s", k, v)
        logger.info("Inference time: %.1fms", signal.get("inference_time_ms", 0))
    except Exception as e:
        logger.error("Live inference test failed: %s", e)

    elapsed = time.time() - start_time

    # Summary
    logger.info("=" * 60)
    logger.info("TRAINING PIPELINE COMPLETE")
    logger.info("=" * 60)
    logger.info("Total time: %.1f seconds", elapsed)
    logger.info("Model: ml/models/forecaster_weights.pt")
    logger.info("Scaler: ml/models/scaler_params.json")
    logger.info("Data: ml/data/historical_rates.csv")
    logger.info("Backtest: ml/backtest/backtest_results.json")


if __name__ == "__main__":
    main()
