"""
Publication-grade visualizer for ML performance, calibration, and financial cost-benefit curves.
"""

import os
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.metrics import roc_curve, precision_recall_curve, auc
from sklearn.calibration import calibration_curve
from typing import Dict, List, Any

# Set modern scientific aesthetic
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Helvetica, Arial, DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cccccc'
plt.rcParams['axes.linewidth'] = 0.8


class ModelVisualizer:
    """
    Generates and saves publication-quality evaluation figures.
    """
    def __init__(self, output_dir: str = "artifacts/figures"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.palette = {
            "Baseline Logistic": "#7f8c8d",
            "LightGBM": "#2ecc71",
            "XGBoost": "#e67e22",
            "Deep Tabular ResNet": "#9b59b6",
            "Calibrated Ensemble": "#e74c3c"
        }

    def plot_roc_curves(self, results: Dict[str, Dict[str, Any]], y_true: np.ndarray, filename: str = "roc_curves.png"):
        plt.figure(figsize=(9, 7), dpi=300)
        
        for name, data in results.items():
            y_prob = data["probs"]
            fpr, tpr, _ = roc_curve(y_true, y_prob)
            roc_auc = auc(fpr, tpr)
            color = self.palette.get(name, None)
            lw = 2.5 if "Ensemble" in name else 1.8
            plt.plot(fpr, tpr, color=color, lw=lw, label=f"{name} (AUC = {roc_auc:.4f})")

        plt.plot([0, 1], [0, 1], color='#95a5a6', lw=1.5, linestyle='--', label='Chance Line (AUC = 0.5000)')
        plt.xlim([-0.01, 1.0])
        plt.ylim([0.0, 1.02])
        plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12, fontweight='bold')
        plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=12, fontweight='bold')
        plt.title('Receiver Operating Characteristic (ROC) Comparison', fontsize=14, fontweight='bold', pad=15)
        plt.legend(loc="lower right", frameon=True, fontsize=10)
        plt.tight_layout()
        
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved ROC curves to '{save_path}'")

    def plot_pr_curves(self, results: Dict[str, Dict[str, Any]], y_true: np.ndarray, filename: str = "pr_curves.png"):
        plt.figure(figsize=(9, 7), dpi=300)
        baseline_rate = np.mean(y_true)

        for name, data in results.items():
            y_prob = data["probs"]
            precision, recall, _ = precision_recall_curve(y_true, y_prob)
            pr_auc = auc(recall, precision)
            color = self.palette.get(name, None)
            lw = 2.5 if "Ensemble" in name else 1.8
            plt.plot(recall, precision, color=color, lw=lw, label=f"{name} (AUPRC = {pr_auc:.4f})")

        plt.plot([0, 1], [baseline_rate, baseline_rate], color='#95a5a6', lw=1.5, linestyle='--',
                 label=f'Random Guess (AUPRC = {baseline_rate:.4f})')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.02])
        plt.xlabel('Recall (Detection Rate)', fontsize=12, fontweight='bold')
        plt.ylabel('Precision (True Positive Rate)', fontsize=12, fontweight='bold')
        plt.title('Precision-Recall (PR) Curves (Imbalanced Target Benchmark)', fontsize=14, fontweight='bold', pad=15)
        plt.legend(loc="lower left", frameon=True, fontsize=10)
        plt.tight_layout()
        
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved Precision-Recall curves to '{save_path}'")

    def plot_calibration_curves(self, results: Dict[str, Dict[str, Any]], y_true: np.ndarray, filename: str = "calibration_curves.png"):
        plt.figure(figsize=(9, 7), dpi=300)
        plt.plot([0, 1], [0, 1], color='#95a5a6', linestyle='--', lw=1.5, label='Perfect Calibration')

        for name, data in results.items():
            y_prob = data["probs"]
            prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=10, strategy='quantile')
            color = self.palette.get(name, None)
            plt.plot(prob_pred, prob_true, marker='o', lw=1.8, color=color, label=f"{name}")

        plt.xlabel('Mean Predicted Probability', fontsize=12, fontweight='bold')
        plt.ylabel('Fraction of True Positives', fontsize=12, fontweight='bold')
        plt.title('Reliability Diagram (Probability Calibration Curves)', fontsize=14, fontweight='bold', pad=15)
        plt.legend(loc="upper left", frameon=True, fontsize=10)
        plt.tight_layout()
        
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved Calibration curves to '{save_path}'")

    def plot_confusion_matrix(self, cm: np.ndarray, model_name: str, filename: str = "confusion_matrix.png"):
        plt.figure(figsize=(7, 6), dpi=300)
        labels = ['Legitimate (0)', 'Fraudulent (1)']
        
        # Normalized percentages
        cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        annot = np.empty_like(cm).astype(str)
        for i in range(2):
            for j in range(2):
                annot[i, j] = f"{cm[i, j]:,}\n({cm_norm[i, j]:.2%})"

        sns.heatmap(cm, annot=annot, fmt='', cmap='Blues', cbar=False,
                    xticklabels=labels, yticklabels=labels, annot_kws={'fontsize': 13, 'fontweight': 'bold'})
        
        plt.xlabel('Predicted Label', fontsize=12, fontweight='bold', labelpad=10)
        plt.ylabel('True Ground Truth', fontsize=12, fontweight='bold', labelpad=10)
        plt.title(f'Confusion Matrix — {model_name}', fontsize=14, fontweight='bold', pad=15)
        plt.tight_layout()
        
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved Confusion matrix to '{save_path}'")

    def plot_feature_importance(self, feature_names: List[str], importances: np.ndarray, top_n: int = 15, filename: str = "feature_importance.png"):
        plt.figure(figsize=(10, 7), dpi=300)
        
        indices = np.argsort(importances)[::-1][:top_n]
        top_features = [feature_names[i] for i in indices][::-1]
        top_values = importances[indices][::-1]
        
        bars = plt.barh(range(top_n), top_values, color='#3498db', edgecolor='#2980b9')
        plt.yticks(range(top_n), top_features, fontsize=11)
        plt.xlabel('Feature Importance Gain / Split Weight', fontsize=12, fontweight='bold')
        plt.title(f'Top {top_n} Predictive Fraud Indicators', fontsize=14, fontweight='bold', pad=15)
        
        # Add value annotations
        for bar in bars:
            plt.text(bar.get_width() * 1.01, bar.get_y() + bar.get_height() / 2,
                     f'{bar.get_width():.1f}', va='center', ha='left', fontsize=9, color='#333333')
                     
        plt.tight_layout()
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved Feature Importance to '{save_path}'")

    def plot_cost_benefit_curve(
        self,
        y_true: np.ndarray,
        y_prob: np.ndarray,
        amounts: np.ndarray,
        fp_cost: float = 50.0,
        filename: str = "cost_benefit_curve.png"
    ):
        thresholds = np.linspace(0.01, 0.99, 100)
        net_benefits = []
        prevented_frauds = []
        investigation_costs = []

        total_fraud_volume = float(np.sum(amounts[y_true == 1]))

        for th in thresholds:
            y_pred = (y_prob >= th).astype(int)
            tp_amount = np.sum(amounts[(y_true == 1) & (y_pred == 1)])
            fp_count = np.sum((y_true == 0) & (y_pred == 1))
            inv_cost = fp_count * fp_cost
            net_benefit = tp_amount - inv_cost
            
            prevented_frauds.append(tp_amount)
            investigation_costs.append(inv_cost)
            net_benefits.append(net_benefit)

        optimal_idx = np.argmax(net_benefits)
        optimal_th = thresholds[optimal_idx]
        max_net_val = net_benefits[optimal_idx]

        plt.figure(figsize=(10, 6), dpi=300)
        plt.plot(thresholds, net_benefits, label='Net Dollar Benefit ($ Saved - Investigation Cost)', color='#27ae60', lw=2.5)
        plt.plot(thresholds, prevented_frauds, label='Total Fraud Volume Intercepted ($)', color='#2980b9', lw=1.8, linestyle='--')
        plt.plot(thresholds, investigation_costs, label='False Positive Investigation Cost ($)', color='#c0392b', lw=1.8, linestyle=':')

        plt.axvline(x=optimal_th, color='#8e44ad', linestyle='-.', lw=1.5,
                    label=f'Optimal Threshold = {optimal_th:.2f} (Max Benefit: ${max_net_val:,.0f})')
        
        plt.xlabel('Classification Decision Threshold', fontsize=12, fontweight='bold')
        plt.ylabel('Financial Impact ($ USD)', fontsize=12, fontweight='bold')
        plt.title('Business Impact & Cost Optimization Curve', fontsize=14, fontweight='bold', pad=15)
        plt.legend(loc="best", frameon=True, fontsize=10)
        plt.tight_layout()
        
        save_path = os.path.join(self.output_dir, filename)
        plt.savefig(save_path)
        plt.close()
        print(f"[+] Saved Cost-Benefit curve to '{save_path}'")
