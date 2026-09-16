"""
Feature engineering and preprocessing pipeline.
Zero data-leakage pipeline with cyclic time transforms, robust scaling, and interaction features.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler
from typing import Tuple, List, Dict, Any


class FraudFeaturePipeline:
    """
    Feature transformation pipeline designed for production inference & model training.
    """
    def __init__(self, cyclic_time: bool = True, interaction_pairs: List[List[str]] = None):
        self.cyclic_time = cyclic_time
        self.interaction_pairs = interaction_pairs or [
            ["V14", "V17"],
            ["V12", "V10"],
            ["V11", "V4"],
            ["V16", "V18"]
        ]
        self.amount_scaler = RobustScaler()
        self.pca_scaler = RobustScaler()
        self.is_fitted = False
        self.feature_names: List[str] = []

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # 1. Cyclic time features
        if self.cyclic_time and 'Time' in df.columns:
            hours = (df['Time'] / 3600.0) % 24.0
            df['sin_hour'] = np.sin(2.0 * np.pi * hours / 24.0)
            df['cos_hour'] = np.cos(2.0 * np.pi * hours / 24.0)
            df.drop(columns=['Time'], inplace=True)
            
        # 2. Log-transformed Amount
        if 'Amount' in df.columns:
            df['log1p_Amount'] = np.log1p(np.maximum(0, df['Amount'].values))

        # 3. Domain Interaction Terms
        for pair in self.interaction_pairs:
            f1, f2 = pair[0], pair[1]
            if f1 in df.columns and f2 in df.columns:
                df[f'{f1}_x_{f2}'] = df[f1] * df[f2]

        return df

    def fit(self, train_df: pd.DataFrame, target_col: str = "Class"):
        """
        Fit scalers strictly on training data.
        """
        X = train_df.drop(columns=[target_col]) if target_col in train_df.columns else train_df.copy()
        engineered_X = self._engineer_features(X)
        
        # Scale amount & log amount
        amount_cols = [c for c in ['Amount', 'log1p_Amount'] if c in engineered_X.columns]
        if amount_cols:
            self.amount_scaler.fit(engineered_X[amount_cols])
            
        # Scale PCA & interaction features
        pca_cols = [c for c in engineered_X.columns if c not in amount_cols and c not in ['sin_hour', 'cos_hour']]
        if pca_cols:
            self.pca_scaler.fit(engineered_X[pca_cols])
            
        self.feature_names = list(engineered_X.columns)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame, target_col: str = "Class") -> Tuple[np.ndarray, np.ndarray]:
        """
        Transform raw input dataframe into scaled feature matrix X and label vector y.
        """
        if not self.is_fitted:
            raise RuntimeError("Pipeline must be fitted before transforming data.")
            
        y = None
        if target_col in df.columns:
            y = df[target_col].values.astype(int)
            X = df.drop(columns=[target_col])
        else:
            X = df.copy()

        engineered_X = self._engineer_features(X)
        
        # Ensure column ordering matches training
        for col in self.feature_names:
            if col not in engineered_X.columns:
                engineered_X[col] = 0.0
        engineered_X = engineered_X[self.feature_names]

        # Apply scalers
        amount_cols = [c for c in ['Amount', 'log1p_Amount'] if c in engineered_X.columns]
        if amount_cols:
            engineered_X[amount_cols] = self.amount_scaler.transform(engineered_X[amount_cols])
            
        pca_cols = [c for c in engineered_X.columns if c not in amount_cols and c not in ['sin_hour', 'cos_hour']]
        if pca_cols:
            engineered_X[pca_cols] = self.pca_scaler.transform(engineered_X[pca_cols])

        return engineered_X.values.astype(np.float32), y

    def transform_single(self, record_dict: Dict[str, Any]) -> np.ndarray:
        """
        Transform single record dictionary for real-time inference.
        """
        df = pd.DataFrame([record_dict])
        X_mat, _ = self.transform(df, target_col="")
        return X_mat

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)
        print(f"[+] Feature pipeline saved to '{filepath}'")

    @classmethod
    def load(cls, filepath: str) -> "FraudFeaturePipeline":
        pipeline = joblib.load(filepath)
        return pipeline
