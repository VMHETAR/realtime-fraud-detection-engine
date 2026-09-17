"""
FastAPI Microservice for Real-Time Financial Fraud Scoring.
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from typing import Dict, Any

from src.feature_engineering import FraudFeaturePipeline
from src.models.ensemble import CalibratedEnsemble
from src.api.schemas import (
    TransactionPayload,
    FraudPredictionResponse,
    BatchTransactionPayload,
    BatchFraudPredictionResponse
)

# Global model state
pipeline_artifact: FraudFeaturePipeline = None
lgb_model = None
xgb_model = None
ensemble_model: CalibratedEnsemble = None
decision_threshold: float = 0.50
metrics_cache: Dict[str, Any] = {}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")


def load_artifacts():
    global pipeline_artifact, lgb_model, xgb_model, ensemble_model, decision_threshold, metrics_cache
    
    pipe_path = os.path.join(ARTIFACTS_DIR, "models", "feature_pipeline.pkl")
    lgb_path = os.path.join(ARTIFACTS_DIR, "models", "lightgbm_model.pkl")
    xgb_path = os.path.join(ARTIFACTS_DIR, "models", "xgboost_model.pkl")
    ens_path = os.path.join(ARTIFACTS_DIR, "models", "calibrated_ensemble.pkl")
    metrics_path = os.path.join(ARTIFACTS_DIR, "metrics_summary.json")
    
    if os.path.exists(pipe_path):
        pipeline_artifact = FraudFeaturePipeline.load(pipe_path)
    if os.path.exists(lgb_path):
        lgb_model = joblib.load(lgb_path)
    if os.path.exists(xgb_path):
        xgb_model = joblib.load(xgb_path)
    if os.path.exists(ens_path):
        ensemble_model = CalibratedEnsemble.load(ens_path)
        
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            metrics_cache = json.load(f)
            ens_metrics = metrics_cache.get("models_evaluation", {}).get("Calibrated Ensemble", {})
            decision_threshold = ens_metrics.get("optimal_threshold", 0.50)


# Pre-load on import
load_artifacts()


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield


app = FastAPI(
    title="Real-Time Fraud & Anomaly Scoring Engine",
    description="Production-grade AI inference microservice for sub-millisecond fraud risk evaluation.",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint returning system status and artifact readiness.
    """
    if pipeline_artifact is None:
        load_artifacts()
    ready = pipeline_artifact is not None and (lgb_model is not None or xgb_model is not None)
    return {
        "status": "healthy" if ready else "degraded (models pending training)",
        "models_loaded": {
            "feature_pipeline": pipeline_artifact is not None,
            "lightgbm": lgb_model is not None,
            "xgboost": xgb_model is not None,
            "calibrated_ensemble": ensemble_model is not None
        },
        "decision_threshold": decision_threshold,
        "version": "1.0.0"
    }


@app.post("/v1/predict", response_model=FraudPredictionResponse)
async def predict_single_transaction(payload: TransactionPayload):
    """
    Score a single financial transaction in real-time.
    """
    if pipeline_artifact is None:
        load_artifacts()
    if pipeline_artifact is None:
        raise HTTPException(status_code=503, detail="Pipeline artifacts not yet trained. Run run_pipeline.py first.")
        
    t0 = time.perf_counter()
    data_dict = payload.model_dump()
    X_mat = pipeline_artifact.transform_single(data_dict)
    
    prob_dict = {}
    if lgb_model is not None:
        prob_dict["lgb"] = lgb_model.predict_proba(X_mat)[:, 1]
    if xgb_model is not None:
        prob_dict["xgb"] = xgb_model.predict_proba(X_mat)[:, 1]
        
    if ensemble_model is not None and len(prob_dict) >= 2:
        fraud_prob = float(ensemble_model.predict_proba(prob_dict)[0])
    elif lgb_model is not None:
        fraud_prob = float(prob_dict["lgb"][0])
    elif xgb_model is not None:
        fraud_prob = float(prob_dict["xgb"][0])
    else:
        fraud_prob = 0.0

    t1 = time.perf_counter()
    latency_ms = (t1 - t0) * 1000.0

    is_fraud = bool(fraud_prob >= decision_threshold)
    if fraud_prob >= 0.80:
        risk_level = "CRITICAL"
    elif fraud_prob >= 0.35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return FraudPredictionResponse(
        fraud_probability=round(fraud_prob, 5),
        is_fraud=is_fraud,
        risk_level=risk_level,
        model_version="1.0.0",
        inference_latency_ms=round(latency_ms, 3)
    )


@app.post("/v1/batch-predict", response_model=BatchFraudPredictionResponse)
async def predict_batch_transactions(payload: BatchTransactionPayload):
    """
    High-throughput batch transaction fraud scoring.
    """
    if pipeline_artifact is None:
        load_artifacts()
    if pipeline_artifact is None:
        raise HTTPException(status_code=503, detail="Pipeline artifacts not yet trained.")
        
    t0 = time.perf_counter()
    records = [tx.model_dump() for tx in payload.transactions]
    df = pd.DataFrame(records)
    X_mat, _ = pipeline_artifact.transform(df, target_col="")
    
    prob_dict = {}
    if lgb_model is not None:
        prob_dict["lgb"] = lgb_model.predict_proba(X_mat)[:, 1]
    if xgb_model is not None:
        prob_dict["xgb"] = xgb_model.predict_proba(X_mat)[:, 1]
        
    if ensemble_model is not None and len(prob_dict) >= 2:
        probs = ensemble_model.predict_proba(prob_dict)
    elif lgb_model is not None:
        probs = prob_dict["lgb"]
    elif xgb_model is not None:
        probs = prob_dict["xgb"]
    else:
        probs = np.zeros(len(df))

    t1 = time.perf_counter()
    total_batch_ms = (t1 - t0) * 1000.0

    predictions = []
    frauds_count = 0
    for prob in probs:
        p = float(prob)
        is_f = bool(p >= decision_threshold)
        if is_f:
            frauds_count += 1
        r_lvl = "CRITICAL" if p >= 0.80 else ("MEDIUM" if p >= 0.35 else "LOW")
        predictions.append(
            FraudPredictionResponse(
                fraud_probability=round(p, 5),
                is_fraud=is_f,
                risk_level=r_lvl,
                model_version="1.0.0",
                inference_latency_ms=round(total_batch_ms / len(payload.transactions), 4)
            )
        )

    return BatchFraudPredictionResponse(
        total_processed=len(payload.transactions),
        frauds_detected=frauds_count,
        predictions=predictions,
        total_batch_latency_ms=round(total_batch_ms, 3)
    )


@app.get("/v1/metrics")
async def get_system_metrics():
    """
    Returns benchmark evaluation metrics and latency performance.
    """
    return metrics_cache if metrics_cache else {"message": "Metrics pending pipeline execution"}


if __name__ == "__main__":
    from src.api.server import run_server
    run_server(host="127.0.0.1", port=8000, reload=False, auto_port=True)
