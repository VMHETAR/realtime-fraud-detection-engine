"""
Calibrated Soft-Voting Meta-Ensemble Pipeline.
Blends tree gradient boosters with Deep Tabular ResNet and applies Platt Scaling calibration.
"""

import os
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from typing import Dict, Any, List


class CalibratedEnsemble:
    """
    Weighted Soft-Voting Meta-Learner with Platt probability calibration.
    """
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "lgb": 0.40,
            "xgb": 0.35,
            "deep_resnet": 0.25
        }
        # Normalize weights
        total_w = sum(self.weights.values())
        self.weights = {k: v / total_w for k, v in self.weights.items()}
        self.calibrator = LogisticRegression(C=1.0, solver="lbfgs")
        self.is_calibrated = False

    def combine_raw_probabilities(self, prob_dict: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Computes weighted average of predicted probabilities.
        """
        combined = np.zeros(len(next(iter(prob_dict.values()))), dtype=np.float32)
        for name, weight in self.weights.items():
            if name in prob_dict:
                combined += weight * prob_dict[name]
        return np.clip(combined, 1e-7, 1.0 - 1e-7)

    def fit_calibration(self, val_prob_dict: Dict[str, np.ndarray], y_val: np.ndarray):
        """
        Fits Platt Scaling on validation ensemble predictions.
        """
        combined_val_probs = self.combine_raw_probabilities(val_prob_dict)
        # Logit transformation
        logits = np.log(combined_val_probs / (1.0 - combined_val_probs)).reshape(-1, 1)
        self.calibrator.fit(logits, y_val)
        self.is_calibrated = True
        print("[+] Ensemble probability calibration (Platt Scaling) fitted successfully.")
        return self

    def predict_proba(self, prob_dict: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Returns calibrated fraud probability.
        """
        raw_probs = self.combine_raw_probabilities(prob_dict)
        if not self.is_calibrated:
            return raw_probs
        logits = np.log(raw_probs / (1.0 - raw_probs)).reshape(-1, 1)
        calibrated_probs = self.calibrator.predict_proba(logits)[:, 1]
        return calibrated_probs

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)
        print(f"[+] Calibrated Ensemble saved to '{filepath}'")

    @classmethod
    def load(cls, filepath: str) -> "CalibratedEnsemble":
        return joblib.load(filepath)
