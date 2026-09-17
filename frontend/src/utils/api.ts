import { Transaction, FraudPredictionResponse, BatchFraudPredictionResponse, SystemMetrics } from '../types';
import { scoreTransactionEdge } from './clientScorer';

export const DEFAULT_API_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth(baseUrl: string): Promise<{ online: boolean; threshold?: number; models?: any }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        threshold: data.decision_threshold,
        models: data.models_loaded
      };
    }
  } catch (err) {
    // offline
  }
  return { online: false };
}

export async function scoreSingle(
  tx: Transaction,
  baseUrl: string = DEFAULT_API_URL,
  forceEdge: boolean = false
): Promise<FraudPredictionResponse> {
  if (forceEdge) {
    return scoreTransactionEdge(tx);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      // Calculate top contributing drivers locally to enrich the response
      const edgeInfo = scoreTransactionEdge(tx);
      return {
        ...data,
        source: 'fastapi_backend',
        top_features: edgeInfo.top_features
      };
    }
  } catch (err) {
    // Fallback to client-side Edge scorer
  }

  return scoreTransactionEdge(tx);
}

export async function scoreBatch(
  transactions: Transaction[],
  baseUrl: string = DEFAULT_API_URL,
  forceEdge: boolean = false
): Promise<BatchFraudPredictionResponse> {
  if (!forceEdge) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${baseUrl}/v1/batch-predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          ...data,
          predictions: data.predictions.map((p: any) => ({ ...p, source: 'fastapi_backend' }))
        };
      }
    } catch (err) {
      // Fallback
    }
  }

  const t0 = performance.now();
  let frauds = 0;
  const preds: FraudPredictionResponse[] = transactions.map(tx => {
    const res = scoreTransactionEdge(tx);
    if (res.is_fraud) frauds++;
    return res;
  });
  const t1 = performance.now();

  return {
    total_processed: transactions.length,
    frauds_detected: frauds,
    predictions: preds,
    total_batch_latency_ms: Math.round((t1 - t0) * 100) / 100
  };
}

export async function fetchMetricsSummary(baseUrl: string = DEFAULT_API_URL): Promise<SystemMetrics | null> {
  try {
    const res = await fetch(`${baseUrl}/v1/metrics`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.models_evaluation) return data;
    }
  } catch (err) {
    // Fallback to public asset
  }

  try {
    const localRes = await fetch('/metrics_summary.json');
    if (localRes.ok) {
      return await localRes.json();
    }
  } catch (err) {
    // Ignore
  }

  return null;
}
