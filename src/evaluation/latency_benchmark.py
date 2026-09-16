"""
Latency and Throughput Benchmarking Engine.
Profiles single-transaction inference SLA (P50, P95, P99) and batch throughput.
"""

import time
import numpy as np
from typing import Dict, Any, Callable


class LatencyProfiler:
    """
    Profiles inference latency percentiles and throughput.
    """
    def __init__(self, warmup_runs: int = 50, benchmark_runs: int = 500):
        self.warmup_runs = warmup_runs
        self.benchmark_runs = benchmark_runs

    def profile_model(self, model_name: str, predict_fn: Callable[[np.ndarray], Any], sample_x: np.ndarray, batch_x: np.ndarray) -> Dict[str, Any]:
        """
        Profiles both single-record latency (ms) and batch throughput (tx/sec).
        """
        # 1. Warm-up
        for _ in range(self.warmup_runs):
            _ = predict_fn(sample_x)
            
        # 2. Single-sample latency profiling
        single_latencies_ms = []
        for _ in range(self.benchmark_runs):
            t0 = time.perf_counter()
            _ = predict_fn(sample_x)
            t1 = time.perf_counter()
            single_latencies_ms.append((t1 - t0) * 1000.0)
            
        # 3. Batch throughput profiling
        batch_size = len(batch_x)
        t0 = time.perf_counter()
        for _ in range(50):
            _ = predict_fn(batch_x)
        t1 = time.perf_counter()
        total_time = t1 - t0
        throughput_qps = (batch_size * 50) / total_time

        return {
            "model_name": model_name,
            "single_sample_p50_ms": round(float(np.percentile(single_latencies_ms, 50)), 3),
            "single_sample_p95_ms": round(float(np.percentile(single_latencies_ms, 95)), 3),
            "single_sample_p99_ms": round(float(np.percentile(single_latencies_ms, 99)), 3),
            "batch_throughput_tx_per_sec": round(float(throughput_qps), 1)
        }
