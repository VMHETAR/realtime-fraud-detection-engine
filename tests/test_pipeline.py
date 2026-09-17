"""
Unit and integration tests for Data Loader, Feature Pipeline, Model Inference, API, and Server.
"""

import os
import pytest
import socket
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from src.feature_engineering import FraudFeaturePipeline
from src.models.baseline_model import BaselineModelManager
from src.models.tree_models import TreeModelManager
from src.models.deep_tabular import TabularResNet, BinaryFocalLoss
from src.models.ensemble import CalibratedEnsemble
from src.api.app import app
from src.api.server import is_port_available, find_available_port


@pytest.fixture
def dummy_data():
    np.random.seed(42)
    n_samples = 200
    data = {f"V{i}": np.random.randn(n_samples) for i in range(1, 29)}
    data["Time"] = np.random.uniform(0, 172800, n_samples)
    data["Amount"] = np.random.exponential(scale=50, size=n_samples)
    # 5% positive class
    data["Class"] = (np.random.rand(n_samples) < 0.05).astype(int)
    return pd.DataFrame(data)


def test_feature_pipeline_fit_transform(dummy_data):
    pipe = FraudFeaturePipeline(cyclic_time=True)
    pipe.fit(dummy_data, target_col="Class")
    X, y = pipe.transform(dummy_data, target_col="Class")
    
    assert X.shape[0] == len(dummy_data)
    assert len(y) == len(dummy_data)
    assert X.shape[1] > 29  # Includes cyclic and interaction features
    assert not np.isnan(X).any()


def test_baseline_and_tree_models(dummy_data):
    pipe = FraudFeaturePipeline()
    pipe.fit(dummy_data, target_col="Class")
    X, y = pipe.transform(dummy_data, target_col="Class")
    
    # Baseline
    b_mgr = BaselineModelManager()
    lr = b_mgr.train_logistic(X, y)
    probs_lr = lr.predict_proba(X)[:, 1]
    assert len(probs_lr) == len(y)
    assert (probs_lr >= 0.0).all() and (probs_lr <= 1.0).all()

    # Tree
    tree_mgr = TreeModelManager()
    lgb_clf = tree_mgr.train_lightgbm(X, y)
    probs_lgb = lgb_clf.predict_proba(X)[:, 1]
    assert len(probs_lgb) == len(y)


def test_deep_tabular_resnet_shape():
    import torch
    model = TabularResNet(in_features=35, hidden_dim=64, num_blocks=2, dropout=0.1)
    dummy_input = torch.randn(16, 35)
    logits = model(dummy_input)
    assert logits.shape == (16, 1)


def test_calibrated_ensemble():
    val_probs = {
        "lgb": np.array([0.1, 0.9, 0.2, 0.8]),
        "xgb": np.array([0.15, 0.85, 0.25, 0.75]),
        "deep_resnet": np.array([0.05, 0.95, 0.3, 0.7])
    }
    y_val = np.array([0, 1, 0, 1])
    
    ensemble = CalibratedEnsemble()
    ensemble.fit_calibration(val_probs, y_val)
    preds = ensemble.predict_proba(val_probs)
    assert len(preds) == 4
    assert preds[1] > preds[0]


def test_fastapi_endpoints():
    client = TestClient(app)
    
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200
    assert "status" in res.json()

    # 2. Predict endpoint
    payload = {
        "Time": 100.0,
        "Amount": 45.5,
        "V1": -0.5, "V2": 0.2, "V3": 1.1, "V4": -0.3, "V5": 0.4,
        "V6": -0.1, "V7": 0.2, "V8": 0.0, "V9": -0.2, "V10": 0.1,
        "V11": -0.5, "V12": 0.3, "V13": -0.4, "V14": 0.2, "V15": 0.8,
        "V16": -0.1, "V17": 0.0, "V18": 0.1, "V19": -0.2, "V20": 0.05,
        "V21": -0.01, "V22": 0.1, "V23": -0.05, "V24": 0.02, "V25": 0.1,
        "V26": -0.1, "V27": 0.02, "V28": -0.01
    }
    res_pred = client.post("/v1/predict", json=payload)
    assert res_pred.status_code == 200
    data = res_pred.json()
    assert "fraud_probability" in data
    assert "is_fraud" in data
    assert "risk_level" in data


def test_port_finder_logic():
    # 1. Test is_port_available on a valid port
    port, was_busy = find_available_port(preferred_port=8990, host="127.0.0.1")
    assert isinstance(port, int)
    assert port >= 8990

    # 2. Test fallback when a port is artificially occupied
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 9123))
    sock.listen(1)
    
    try:
        # Now 9123 is busy, port finder should resolve to 9124 or higher
        new_port, busy_flag = find_available_port(preferred_port=9123, host="127.0.0.1")
        assert busy_flag is True
        assert new_port != 9123
        assert new_port > 9123
    finally:
        sock.close()
