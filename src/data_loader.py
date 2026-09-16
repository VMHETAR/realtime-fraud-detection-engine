"""
Dataset ingestion, validation, and stratified splitting module.
"""

import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.datasets import fetch_openml
from typing import Tuple, Dict, Any


def ensure_dataset(raw_path: str, download_url: str) -> pd.DataFrame:
    """
    Checks if raw dataset exists locally; if not, fetches from URL or OpenML.
    """
    os.makedirs(os.path.dirname(raw_path), exist_ok=True)
    if not os.path.exists(raw_path):
        print(f"[*] Raw dataset not found at '{raw_path}'. Initiating download...")
        try:
            print(f"[*] Fetching from primary mirror: {download_url}")
            urllib.request.urlretrieve(download_url, raw_path)
            print("[+] Primary download complete.")
        except Exception as e:
            print(f"[-] Primary download failed ({e}). Falling back to OpenML repository (data_id=42175)...")
            data = fetch_openml(data_id=42175, as_frame=True)
            df = pd.concat([data.data, data.target], axis=1)
            # Normalize target column name if needed
            if 'Class' not in df.columns and 'class' in df.columns:
                df.rename(columns={'class': 'Class'}, inplace=True)
            df.to_csv(raw_path, index=False)
            print("[+] OpenML fallback download complete.")

    df = pd.read_csv(raw_path)
    # Ensure Class is integer (0 or 1)
    df['Class'] = df['Class'].astype(int)
    print(f"[+] Loaded raw dataset successfully: {df.shape[0]:,} samples, {df.shape[1]} features.")
    print(f"    - Fraudulent transactions (Class=1): {(df['Class'] == 1).sum():,} ({df['Class'].mean():.4%})")
    print(f"    - Legitimate transactions (Class=0): {(df['Class'] == 0).sum():,} ({1 - df['Class'].mean():.4%})")
    return df


def split_data(
    df: pd.DataFrame,
    target_col: str = "Class",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Performs stratified 3-way split (Train / Validation / Test).
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Split ratios must sum to 1.0"
    
    # First split: Train vs Temp (Val + Test)
    temp_ratio = val_ratio + test_ratio
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_ratio,
        stratify=df[target_col],
        random_state=random_state
    )
    
    # Second split: Val vs Test
    val_rel_ratio = val_ratio / temp_ratio
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1.0 - val_rel_ratio),
        stratify=temp_df[target_col],
        random_state=random_state
    )
    
    print(f"[+] Stratified Split Complete:")
    print(f"    - Train Set: {len(train_df):,} samples (Frauds: {(train_df[target_col] == 1).sum()})")
    print(f"    - Val Set:   {len(val_df):,} samples (Frauds: {(val_df[target_col] == 1).sum()})")
    print(f"    - Test Set:  {len(test_df):,} samples (Frauds: {(test_df[target_col] == 1).sum()})")
    
    return train_df.reset_index(drop=True), val_df.reset_index(drop=True), test_df.reset_index(drop=True)
