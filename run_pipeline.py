"""
Master Pipeline Orchestrator for Real-Time Fraud Detection Engine.
Executes ingestion, preprocessing, multi-model training, calibration, benchmarking, and visual generation.
"""

import os
import sys
import yaml
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.data_loader import ensure_dataset, split_data
from src.feature_engineering import FraudFeaturePipeline
from src.models.baseline_model import BaselineModelManager
from src.models.tree_models import TreeModelManager
from src.models.deep_tabular import DeepTabularManager
from src.models.ensemble import CalibratedEnsemble
from src.evaluation.metrics import evaluate_model_performance
from src.evaluation.visualizer import ModelVisualizer
from src.evaluation.latency_benchmark import LatencyProfiler


def load_config(config_path: str = "config/config.yaml") -> dict:
    full_path = os.path.join(BASE_DIR, config_path)
    with open(full_path, "r") as f:
        return yaml.safe_load(f)


def main():
    print("=" * 80)
    print("  [>] REAL-TIME FRAUD & FINANCIAL RISK DETECTION PIPELINE")
    print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    # 1. Load Configurations
    cfg = load_config()
    data_cfg = cfg["data"]
    model_cfg = cfg["models"]
    eval_cfg = cfg["evaluation"]
    
    # 2. Ingestion & Stratified Split
    print("\n--- PHASE 1: DATA INGESTION & PARTITIONING ---")
    raw_path = os.path.join(BASE_DIR, data_cfg["raw_path"])
    df_raw = ensure_dataset(raw_path, data_cfg["download_url"])
    
    train_df, val_df, test_df = split_data(
        df_raw,
        target_col=data_cfg["stratify_col"],
        train_ratio=data_cfg["train_ratio"],
        val_ratio=data_cfg["val_ratio"],
        test_ratio=data_cfg["test_ratio"],
        random_state=cfg["project"]["random_seed"]
    )

    # 3. Feature Pipeline Transformation
    print("\n--- PHASE 2: FEATURE ENGINEERING & SCALING ---")
    pipe = FraudFeaturePipeline(
        cyclic_time=cfg["features"]["cyclic_time"],
        interaction_pairs=cfg["features"]["interaction_pairs"]
    )
    pipe.fit(train_df, target_col=data_cfg["stratify_col"])
    
    X_train, y_train = pipe.transform(train_df, target_col=data_cfg["stratify_col"])
    X_val, y_val = pipe.transform(val_df, target_col=data_cfg["stratify_col"])
    X_test, y_test = pipe.transform(test_df, target_col=data_cfg["stratify_col"])
    
    test_amounts = test_df["Amount"].values
    
    print(f"[+] Feature matrix created: {X_train.shape[1]} features")
    print(f"    Features list: {pipe.feature_names}")

    # 4. Model Training Phase
    print("\n--- PHASE 3: MULTI-ARCHITECTURE MODEL TRAINING ---")
    
    # 4a. Baseline Logistic Regression
    baseline_mgr = BaselineModelManager(model_cfg.get("baseline_logistic"))
    lr_model = baseline_mgr.train_logistic(X_train, y_train)
    
    # 4b. Tree Gradient Boosters
    tree_mgr = TreeModelManager(model_cfg.get("lightgbm"), model_cfg.get("xgboost"))
    lgb_model = tree_mgr.train_lightgbm(X_train, y_train, X_val, y_val)
    xgb_model = tree_mgr.train_xgboost(X_train, y_train, X_val, y_val)
    
    # 4c. Deep Tabular ResNet (PyTorch)
    deep_mgr = DeepTabularManager(model_cfg.get("deep_tabular_resnet"))
    deep_mgr.fit(X_train, y_train, X_val, y_val)

    # 5. Validation Predictions & Ensemble Calibration
    print("\n--- PHASE 4: PROBABILITY CALIBRATION & ENSEMBLE ---")
    val_probs = {
        "Baseline Logistic": lr_model.predict_proba(X_val)[:, 1],
        "LightGBM": lgb_model.predict_proba(X_val)[:, 1],
        "XGBoost": xgb_model.predict_proba(X_val)[:, 1],
        "Deep Tabular ResNet": deep_mgr.predict_proba(X_val)
    }
    
    ensemble = CalibratedEnsemble(weights={"lgb": 0.40, "xgb": 0.35, "deep_resnet": 0.25})
    ensemble.fit_calibration({
        "lgb": val_probs["LightGBM"],
        "xgb": val_probs["XGBoost"],
        "deep_resnet": val_probs["Deep Tabular ResNet"]
    }, y_val)

    # 6. Test Set Evaluation
    print("\n--- PHASE 5: UNBIASED TEST EVALUATION (42,722 TRANSACTIONS) ---")
    test_probs = {
        "Baseline Logistic": lr_model.predict_proba(X_test)[:, 1],
        "LightGBM": lgb_model.predict_proba(X_test)[:, 1],
        "XGBoost": xgb_model.predict_proba(X_test)[:, 1],
        "Deep Tabular ResNet": deep_mgr.predict_proba(X_test)
    }
    test_probs["Calibrated Ensemble"] = ensemble.predict_proba({
        "lgb": test_probs["LightGBM"],
        "xgb": test_probs["XGBoost"],
        "deep_resnet": test_probs["Deep Tabular ResNet"]
    })

    eval_results = {}
    eval_data_for_viz = {}
    
    for name, probs in test_probs.items():
        metrics = evaluate_model_performance(
            model_name=name,
            y_true=y_test,
            y_prob=probs,
            amounts=test_amounts,
            fp_cost=eval_cfg["cost_analysis"]["false_positive_cost"],
            fn_fixed_cost=eval_cfg["cost_analysis"]["default_fixed_fraud_loss"]
        )
        eval_results[name] = metrics
        eval_data_for_viz[name] = {"probs": probs, "metrics": metrics}

    # 7. Latency and Throughput Benchmarking
    print("\n--- PHASE 6: INFERENCE LATENCY & THROUGHPUT BENCHMARKING ---")
    profiler = LatencyProfiler(warmup_runs=50, benchmark_runs=200)
    sample_1 = X_test[:1]
    sample_128 = X_test[:128]
    
    latency_results = {}
    latency_results["LightGBM"] = profiler.profile_model(
        "LightGBM", lambda x: lgb_model.predict_proba(x), sample_1, sample_128
    )
    latency_results["XGBoost"] = profiler.profile_model(
        "XGBoost", lambda x: xgb_model.predict_proba(x), sample_1, sample_128
    )
    latency_results["Deep Tabular ResNet"] = profiler.profile_model(
        "Deep Tabular ResNet", lambda x: deep_mgr.predict_proba(x), sample_1, sample_128
    )
    latency_results["Calibrated Ensemble"] = profiler.profile_model(
        "Calibrated Ensemble", lambda x: ensemble.predict_proba({
            "lgb": lgb_model.predict_proba(x)[:, 1],
            "xgb": xgb_model.predict_proba(x)[:, 1],
            "deep_resnet": deep_mgr.predict_proba(x)
        }), sample_1, sample_128
    )

    # 8. Publication-Grade Visualization Generation
    print("\n--- PHASE 7: GENERATING HIGH-RESOLUTION FIGURES ---")
    fig_dir = os.path.join(BASE_DIR, eval_cfg["figures_dir"])
    visualizer = ModelVisualizer(output_dir=fig_dir)
    
    visualizer.plot_roc_curves(eval_data_for_viz, y_test, filename="roc_curves_comparison.png")
    visualizer.plot_pr_curves(eval_data_for_viz, y_test, filename="pr_curves_comparison.png")
    visualizer.plot_calibration_curves(eval_data_for_viz, y_test, filename="calibration_curves.png")
    
    # Best model confusion matrix
    best_cm = np.array([
        [eval_results["Calibrated Ensemble"]["confusion_matrix"]["TN"], eval_results["Calibrated Ensemble"]["confusion_matrix"]["FP"]],
        [eval_results["Calibrated Ensemble"]["confusion_matrix"]["FN"], eval_results["Calibrated Ensemble"]["confusion_matrix"]["TP"]]
    ])
    visualizer.plot_confusion_matrix(best_cm, "Calibrated Ensemble", filename="confusion_matrix_ensemble.png")
    
    # Feature Importance (LightGBM)
    visualizer.plot_feature_importance(pipe.feature_names, lgb_model.feature_importances_, top_n=15, filename="feature_importance_ranking.png")
    
    # Financial Cost-Benefit Optimization Curve
    visualizer.plot_cost_benefit_curve(
        y_test,
        test_probs["Calibrated Ensemble"],
        test_amounts,
        fp_cost=eval_cfg["cost_analysis"]["false_positive_cost"],
        filename="financial_cost_optimization.png"
    )

    # 9. Artifact Serialization
    print("\n--- PHASE 8: ARTIFACT SERIALIZATION ---")
    models_dir = os.path.join(BASE_DIR, eval_cfg["models_dir"])
    os.makedirs(models_dir, exist_ok=True)
    
    pipe.save(os.path.join(models_dir, "feature_pipeline.pkl"))
    joblib.dump(lr_model, os.path.join(models_dir, "logistic_model.pkl"))
    joblib.dump(lgb_model, os.path.join(models_dir, "lightgbm_model.pkl"))
    joblib.dump(xgb_model, os.path.join(models_dir, "xgboost_model.pkl"))
    deep_mgr.save(os.path.join(models_dir, "tabular_resnet.pt"))
    ensemble.save(os.path.join(models_dir, "calibrated_ensemble.pkl"))
    
    summary_path = os.path.join(BASE_DIR, "artifacts", "metrics_summary.json")
    with open(summary_path, "w") as f:
        json.dump({
            "models_evaluation": eval_results,
            "latency_benchmarks": latency_results,
            "dataset_info": {
                "total_samples": len(df_raw),
                "features_count": X_train.shape[1],
                "train_samples": len(train_df),
                "val_samples": len(val_df),
                "test_samples": len(test_df),
                "test_fraud_count": int((y_test == 1).sum()),
                "test_fraud_volume_usd": float(np.sum(test_amounts[y_test == 1]))
            }
        }, f, indent=2)
    print(f"[+] Performance metrics exported to '{summary_path}'")

    # 10. Summary Terminal Table
    print("\n" + "=" * 95)
    print(f"{'MODEL':<24} | {'PR-AUC':<8} | {'ROC-AUC':<8} | {'F1-SCORE':<9} | {'PRECISION':<10} | {'RECALL':<8} | {'P50 (ms)':<9} | {'NET VALUE ($)':<12}")
    print("-" * 95)
    for name in eval_results:
        m = eval_results[name]
        lat = latency_results.get(name, {}).get("single_sample_p50_ms", "N/A")
        val = m["financial_impact"]["net_financial_value_usd"]
        print(f"{name:<24} | {m['pr_auc']:<8.4f} | {m['roc_auc']:<8.4f} | {m['max_f1_score']:<9.4f} | {m['precision']:<10.4f} | {m['recall (sensitivity)']:<8.4f} | {str(lat):<9} | ${val:<11,.0f}")
    print("=" * 95)
    print("\n[SUCCESS] PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    main()
