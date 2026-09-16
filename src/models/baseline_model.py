"""
Baseline Models: Cost-Sensitive Logistic Regression and Random Forest.
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any


class BaselineModelManager:
    """
    Manages baseline model training and probability estimation.
    """
    def __init__(self, config: Dict[str, Any] = None):
        cfg = config or {}
        self.logistic_clf = LogisticRegression(
            penalty=cfg.get("penalty", "l2"),
            C=cfg.get("C", 0.1),
            class_weight=cfg.get("class_weight", "balanced"),
            max_iter=cfg.get("max_iter", 1000),
            solver=cfg.get("solver", "lbfgs"),
            random_state=42
        )
        self.rf_clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            class_weight="balanced_subsample",
            n_jobs=-1,
            random_state=42
        )

    def train_logistic(self, X_train: np.ndarray, y_train: np.ndarray) -> LogisticRegression:
        print("[*] Training Cost-Sensitive ElasticNet/L2 Logistic Regression...")
        self.logistic_clf.fit(X_train, y_train)
        print("[+] Logistic Regression training completed.")
        return self.logistic_clf

    def train_rf(self, X_train: np.ndarray, y_train: np.ndarray) -> RandomForestClassifier:
        print("[*] Training Balanced Random Forest Classifier...")
        self.rf_clf.fit(X_train, y_train)
        print("[+] Random Forest training completed.")
        return self.rf_clf
