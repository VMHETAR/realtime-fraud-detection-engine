export interface Transaction {
  Time: number;
  Amount: number;
  [key: string]: any;
}

export interface FraudPredictionResponse {
  transaction_id?: string | null;
  fraud_probability: number;
  is_fraud: boolean;
  risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
  model_version: string;
  inference_latency_ms: number;
  source?: 'fastapi_backend' | 'edge_simulation';
  top_features?: Array<{ name: string; impact: number; description: string }>;
}

export interface BatchFraudPredictionResponse {
  total_processed: number;
  frauds_detected: number;
  predictions: FraudPredictionResponse[];
  total_batch_latency_ms: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  badge: 'Legitimate' | 'High Risk Fraud' | 'Suspicious' | 'Adversarial';
  badgeColor: 'emerald' | 'rose' | 'amber' | 'purple';
  description: string;
  expectedRisk: number;
  data: Transaction;
}

export interface ModelMetricItem {
  model_name: string;
  roc_auc: number;
  pr_auc: number;
  optimal_threshold: number;
  max_f1_score: number;
  precision: number;
  recall: number;
  specificity: number;
  brier_score: number;
  expected_calibration_error: number;
  confusion_matrix: {
    TP: number;
    FP: number;
    FN: number;
    TN: number;
  };
  financial_impact: {
    total_fraud_exposure_usd: number;
    fraud_prevented_usd: number;
    fraud_leakage_usd: number;
    investigation_overhead_usd: number;
    net_financial_value_usd: number;
  };
}

export interface SystemMetrics {
  models_evaluation: Record<string, any>;
  latency_benchmarks: Record<string, {
    model_name: string;
    single_sample_p50_ms: number;
    single_sample_p95_ms: number;
    single_sample_p99_ms: number;
    batch_throughput_tx_per_sec: number;
  }>;
  dataset_info: {
    total_samples: number;
    features_count: number;
    train_samples: number;
    val_samples: number;
    test_samples: number;
    test_fraud_count: number;
    test_fraud_volume_usd: number;
  };
}

export interface ApiConfig {
  baseUrl: string;
  mode: 'auto' | 'backend' | 'edge_simulation';
  isOnline: boolean;
  activePort: number;
}
