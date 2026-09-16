"""
Gradient Boosted Decision Tree models: LightGBM and XGBoost.
Tuned specifically for extreme class imbalance scenarios.
"""

import numpy as np
import lightgbm as lgb
import xgboost as xgb
from typing import Dict, Any, Tuple


class TreeModelManager:
    """
    Manages training and evaluation for LightGBM and XGBoost.
    """
    def __init__(self, lgb_cfg: Dict[str, Any] = None, xgb_cfg: Dict[str, Any] = None):
        self.lgb_cfg = lgb_cfg or {
            "n_estimators": 300,
            "learning_rate": 0.03,
            "max_depth": 6,
            "num_leaves": 31,
            "scale_pos_weight": 15.0,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "min_child_weight": 5,
            "random_state": 42,
            "n_jobs": -1,
            "verbose": -1
        }
        self.xgb_cfg = xgb_cfg or {
            "n_estimators": 250,
            "learning_rate": 0.03,
            "max_depth": 5,
            "scale_pos_weight": 15.0,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "random_state": 42,
            "n_jobs": -1,
            "eval_metric": "aucpr"
        }
        self.lgb_model = None
        self.xgb_model = None

    def train_lightgbm(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray = None,
        y_val: np.ndarray = None
    ) -> lgb.LGBMClassifier:
        print("[*] Training LightGBM Classifier with scale_pos_weight...")
        self.lgb_model = lgb.LGBMClassifier(**self.lgb_cfg)
        
        callbacks = []
        eval_set = None
        if X_val is not None and y_val is not None:
            eval_set = [(X_val, y_val)]
            callbacks = [lgb.early_stopping(stopping_rounds=30, verbose=False)]
            
        self.lgb_model.fit(
            X_train,
            y_train,
            eval_set=eval_set,
            callbacks=callbacks
        )
        print("[+] LightGBM training completed.")
        return self.lgb_model

    def train_xgboost(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray = None,
        y_val: np.ndarray = None
    ) -> xgb.XGBClassifier:
        print("[*] Training XGBoost Classifier with scale_pos_weight...")
        self.xgb_model = xgb.XGBClassifier(**self.xgb_cfg)
        
        eval_set = None
        if X_val is not None and y_val is not None:
            eval_set = [(X_val, y_val)]
            
        self.xgb_model.fit(
            X_train,
            y_train,
            eval_set=eval_set,
            verbose=False
        )
        print("[+] XGBoost training completed.")
        return self.xgb_model
