"""
PyTorch Deep Tabular ResNet with Focal Loss for Extreme Class Imbalance.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
from sklearn.metrics import precision_recall_curve, auc
from typing import Dict, Any, Optional, Tuple


class BinaryFocalLoss(nn.Module):
    """
    Focal Loss: FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    Down-weights well-classified easy negative examples to focus on hard fraud instances.
    """
    def __init__(self, alpha: float = 0.85, gamma: float = 2.0, reduction: str = "mean"):
        super(BinaryFocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        p = torch.sigmoid(logits)
        targets = targets.view(-1, 1).float()
        
        # Binary cross entropy per sample
        bce_loss = F.binary_cross_entropy_with_logits(logits, targets, reduction='none')
        
        # p_t calculation
        p_t = p * targets + (1.0 - p) * (1.0 - targets)
        
        # alpha_t calculation
        alpha_t = self.alpha * targets + (1.0 - self.alpha) * (1.0 - targets)
        
        # Focal weight
        focal_weight = alpha_t * torch.pow((1.0 - p_t), self.gamma)
        
        loss = focal_weight * bce_loss
        
        if self.reduction == "mean":
            return loss.mean()
        elif self.reduction == "sum":
            return loss.sum()
        return loss


class TabularResidualBlock(nn.Module):
    """
    Residual Block for tabular representations with LayerNorm and SiLU (Swish).
    """
    def __init__(self, hidden_dim: int, dropout: float = 0.2):
        super(TabularResidualBlock, self).__init__()
        self.block = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
        )
        self.activation = nn.SiLU()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = self.block(x)
        out = self.activation(out + residual)
        return self.dropout(out)


class TabularResNet(nn.Module):
    """
    Deep Tabular ResNet Architecture.
    """
    def __init__(self, in_features: int, hidden_dim: int = 128, num_blocks: int = 3, dropout: float = 0.25):
        super(TabularResNet, self).__init__()
        self.input_layer = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout / 2.0)
        )
        self.res_blocks = nn.ModuleList([
            TabularResidualBlock(hidden_dim, dropout=dropout) for _ in range(num_blocks)
        ])
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.LayerNorm(hidden_dim // 2),
            nn.SiLU(),
            nn.Dropout(dropout / 2.0),
            nn.Linear(hidden_dim // 2, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.input_layer(x)
        for block in self.res_blocks:
            h = block(h)
        logits = self.head(h)
        return logits


class DeepTabularManager:
    """
    Handles training, validation, early stopping, and PyTorch inference.
    """
    def __init__(self, config: Dict[str, Any] = None):
        self.cfg = config or {
            "hidden_dim": 128,
            "num_blocks": 3,
            "dropout": 0.25,
            "learning_rate": 0.001,
            "weight_decay": 0.0001,
            "batch_size": 512,
            "epochs": 20,
            "patience": 5,
            "focal_loss_gamma": 2.0,
            "focal_loss_alpha": 0.85
        }
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[TabularResNet] = None
        self.best_state = None

    def fit(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray
    ) -> "DeepTabularManager":
        in_features = X_train.shape[1]
        self.model = TabularResNet(
            in_features=in_features,
            hidden_dim=self.cfg.get("hidden_dim", 128),
            num_blocks=self.cfg.get("num_blocks", 3),
            dropout=self.cfg.get("dropout", 0.25)
        ).to(self.device)

        criterion = BinaryFocalLoss(
            alpha=self.cfg.get("focal_loss_alpha", 0.85),
            gamma=self.cfg.get("focal_loss_gamma", 2.0)
        )
        optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=self.cfg.get("learning_rate", 0.001),
            weight_decay=self.cfg.get("weight_decay", 0.0001)
        )
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            optimizer, T_max=self.cfg.get("epochs", 20), eta_min=1e-5
        )

        train_dataset = TensorDataset(
            torch.from_numpy(X_train).float(),
            torch.from_numpy(y_train).float()
        )
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.cfg.get("batch_size", 512),
            shuffle=True
        )

        print(f"[*] Training Tabular ResNet on {self.device} for {self.cfg.get('epochs', 20)} epochs...")
        best_pr_auc = 0.0
        patience_counter = 0

        for epoch in range(1, self.cfg.get("epochs", 20) + 1):
            self.model.train()
            train_loss = 0.0
            for batch_x, batch_y in train_loader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                optimizer.zero_grad()
                logits = self.model(batch_x)
                loss = criterion(logits, batch_y)
                loss.backward()
                nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=2.0)
                optimizer.step()
                train_loss += loss.item() * len(batch_y)

            train_loss /= len(train_dataset)
            scheduler.step()

            # Validation PR-AUC
            val_probs = self.predict_proba(X_val)
            precision, recall, _ = precision_recall_curve(y_val, val_probs)
            val_pr_auc = auc(recall, precision)

            if epoch % 2 == 0 or epoch == 1 or epoch == self.cfg.get("epochs", 20):
                print(f"    Epoch {epoch:02d} | Train Loss: {train_loss:.5f} | Val PR-AUC: {val_pr_auc:.4f}")

            if val_pr_auc > best_pr_auc:
                best_pr_auc = val_pr_auc
                self.best_state = {k: v.cpu().clone() for k, v in self.model.state_dict().items()}
                patience_counter = 0
            else:
                patience_counter += 1
                if patience_counter >= self.cfg.get("patience", 5):
                    print(f"    [!] Early stopping triggered at epoch {epoch}. Best Val PR-AUC: {best_pr_auc:.4f}")
                    break

        if self.best_state is not None:
            self.model.load_state_dict(self.best_state)
            self.model.to(self.device)

        print(f"[+] Tabular ResNet training completed. Optimal Val PR-AUC: {best_pr_auc:.4f}")
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        self.model.eval()
        with torch.no_grad():
            tensor_x = torch.from_numpy(X).float().to(self.device)
            logits = self.model(tensor_x)
            probs = torch.sigmoid(logits).cpu().numpy().flatten()
        return probs

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        torch.save({
            "model_state_dict": self.model.state_dict(),
            "config": self.cfg,
            "in_features": self.model.input_layer[0].in_features
        }, filepath)
        print(f"[+] Tabular ResNet saved to '{filepath}'")

    def load(self, filepath: str):
        checkpoint = torch.load(filepath, map_location=self.device)
        self.cfg = checkpoint["config"]
        in_features = checkpoint["in_features"]
        self.model = TabularResNet(
            in_features=in_features,
            hidden_dim=self.cfg.get("hidden_dim", 128),
            num_blocks=self.cfg.get("num_blocks", 3),
            dropout=self.cfg.get("dropout", 0.25)
        ).to(self.device)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()
        return self
