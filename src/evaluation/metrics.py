"""
Evaluation metrics suite for extreme class imbalance and financial risk scoring.
"""

import numpy as np
from sklearn.metrics import (
    roc_auc_score,
    precision_recall_curve,
    auc,
    confusion_matrix,
    brier_score_loss,
    f1_score,
    precision_score,
    recall_score
)
from typing import Dict, Any, Tuple


def compute_expected_calibration_error(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    """
    Computes Expected Calibration Error (ECE) across confidence bins.
    """
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total_samples = len(y_true)

    for i in range(n_bins):
        bin_lower = bin_boundaries[i]
        bin_upper = bin_boundaries[i + 1]
        
        in_bin = (y_prob >= bin_lower) & (y_prob < bin_upper) if i < n_bins - 1 else (y_prob >= bin_lower) & (y_prob <= bin_upper)
        prop_in_bin = np.mean(in_bin)
        
        if prop_in_bin > 0:
            avg_confidence = np.mean(y_prob[in_bin])
            avg_accuracy = np.mean(y_true[in_bin])
            ece += prop_in_bin * np.abs(avg_accuracy - avg_confidence)
            
    return float(ece)


def find_optimal_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> Tuple[float, float]:
    """
    Finds threshold that maximizes the F1-Score on the Precision-Recall curve.
    """
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)
    # Avoid division by zero
    f1_scores = np.where((precisions + recalls) > 0, 2 * (precisions * recalls) / (precisions + recalls), 0)
    best_idx = np.argmax(f1_scores)
    
    # Precision recall curve returns len(thresholds) = len(precisions) - 1
    best_threshold = float(thresholds[min(best_idx, len(thresholds) - 1)])
    best_f1 = float(f1_scores[best_idx])
    return best_threshold, best_f1


def evaluate_model_performance(
    model_name: str,
    y_true: np.ndarray,
    y_prob: np.ndarray,
    amounts: np.ndarray = None,
    fp_cost: float = 50.0,
    fn_fixed_cost: float = 150.0
) -> Dict[str, Any]:
    """
    Comprehensive evaluation of probability predictions against binary ground truth.
    """
    # 1. Discrimination Metrics
    roc_auc = float(roc_auc_score(y_true, y_prob))
    precisions, recalls, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = float(auc(recalls, precisions))
    
    # 2. Optimal Threshold Selection
    best_threshold, best_f1 = find_optimal_threshold(y_true, y_prob)
    y_pred = (y_prob >= best_threshold).astype(int)
    
    # 3. Confusion Matrix Elements
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    precision = float(precision_score(y_true, y_pred, zero_division=0))
    recall = float(recall_score(y_true, y_pred, zero_division=0))
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    
    # 4. Calibration Metrics
    brier_score = float(brier_score_loss(y_true, y_prob))
    ece = compute_expected_calibration_error(y_true, y_prob)
    
    # 5. Financial Cost / Savings Analysis
    # If amounts provided, calculate exact dollar impact
    if amounts is not None:
        fraud_amounts = amounts[y_true == 1]
        detected_fraud_amounts = amounts[(y_true == 1) & (y_pred == 1)]
        missed_fraud_amounts = amounts[(y_true == 1) & (y_pred == 0)]
        
        total_fraud_volume = float(np.sum(fraud_amounts))
        saved_fraud_volume = float(np.sum(detected_fraud_amounts))
        lost_fraud_volume = float(np.sum(missed_fraud_amounts))
        investigation_costs = float(fp * fp_cost)
        net_financial_benefit = float(saved_fraud_volume - investigation_costs)
    else:
        saved_fraud_volume = tp * fn_fixed_cost
        lost_fraud_volume = fn * fn_fixed_cost
        investigation_costs = fp * fp_cost
        net_financial_benefit = saved_fraud_volume - investigation_costs
        total_fraud_volume = (tp + fn) * fn_fixed_cost

    return {
        "model_name": model_name,
        "roc_auc": round(roc_auc, 5),
        "pr_auc": round(pr_auc, 5),
        "optimal_threshold": round(best_threshold, 4),
        "max_f1_score": round(best_f1, 4),
        "precision": round(precision, 4),
        "recall (sensitivity)": round(recall, 4),
        "specificity": round(specificity, 4),
        "brier_score": round(brier_score, 6),
        "expected_calibration_error (ECE)": round(ece, 5),
        "confusion_matrix": {
            "TP": int(tp), "FP": int(fp), "FN": int(fn), "TN": int(tn)
        },
        "financial_impact": {
            "total_fraud_exposure_usd": round(total_fraud_volume, 2),
            "fraud_prevented_usd": round(saved_fraud_volume, 2),
            "fraud_leakage_usd": round(lost_fraud_volume, 2),
            "investigation_overhead_usd": round(investigation_costs, 2),
            "net_financial_value_usd": round(net_financial_benefit, 2)
        }
    }
