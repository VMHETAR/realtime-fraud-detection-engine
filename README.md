# 🛡️ Real-Time Financial Fraud & Risk Detection Engine
### *Ultra-Imbalanced Anomaly Detection, Deep Tabular ResNets, Calibrated Ensemble & Cloudflare-Ready UI*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare_Pages-Ready-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.x-brightgreen?style=for-the-badge)](https://lightgbm.readthedocs.io/)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.x-red?style=for-the-badge)](https://xgboost.readthedocs.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

Financial transaction fraud detection presents one of the most demanding challenges in production machine learning due to:
1. **Extreme Class Imbalance:** Fraud represents **< 0.18%** of real-world volume (284,807 transactions, 492 frauds). Standard accuracy metrics are deceptive ($99.82\%$ accuracy can be achieved by predicting all negatives).
2. **Asymmetric Business Costs:** False Negatives (missed frauds) result in direct balance loss; False Positives cause customer friction and manual compliance investigation overhead ($\$50$/case).
3. **Hard Real-Time Latency SLAs:** Inference pipelines must score authorization requests in **$< 10\text{ ms}$** per transaction at scale.

This repository provides an **end-to-end, production-grade fraud risk detection system** combining **Deep Tabular Neural ResNets**, **Focal Loss**, **Gradient Boosted Decision Trees (LightGBM / XGBoost)**, **Platt-Calibrated Soft-Voting Stacking**, an asynchronous **FastAPI** microservice on `localhost`, and a **cyber-styled Cloudflare Pages interactive frontend**.

---

## 🖥️ Interactive Web Frontend (Cloudflare Pages Ready)

The application includes a self-contained, responsive SPA in `frontend/` featuring:
- ⚡ **Live Risk Assessment Simulator:** Real-time sliders for Transaction Amount, Time of Day, and 28 PCA Latent Components with instant visual gauge & driver decomposition.
- 🎯 **Preset Attack Archetypes:** Pre-configured scenarios (*Everyday Coffee POS*, *Midnight Account Drain*, *Micro-Probing Bot Attack*, *Borderline Electronics Checkout*).
- 📁 **Batch CSV/JSON Inspector:** Upload multi-record transaction streams, evaluate in real-time, filter by risk band, and inspect full JSON telemetry.
- 📊 **Scientific Model Benchmark Gallery:** Interactive ROC curves, Precision-Recall diagrams, Platt calibration curves, and feature importance rankings.
- 💰 **Enterprise ROI / Cost Utility Simulator:** Dynamic slider model computing annual dollar savings after factoring in false alarm investigation labor.
- 🌐 **Cloudflare Edge Fallback Engine:** If the backend is not connected, a built-in client-side Edge model simulator evaluates transactions with mathematical fidelity—guaranteeing 100% uptime for public portfolio demos.

---

## 🏗️ System Architecture

```
                                  [ Raw Transaction Ingestion ]
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │      Feature Engineering & Transformation     │
                         │  • Cyclic Time Encoding (sin/cos of hour)    │
                         │  • Robust Outlier Scaling (Amount log1p)     │
                         │  • Latent Feature Cross Interactions         │
                         └──────────────────────┬───────────────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
      ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
      │  LightGBM Classifier │      │  XGBoost Classifier  │      │ Deep Tabular ResNet  │
      │  (Focal / Scale-Pos) │      │ (Sub-ms Tree Engine) │      │ (Skip-Conn + Swish)  │
      └──────────┬───────────┘      └──────────┬───────────┘      └──────────┬───────────┘
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ Calibrated Soft-Voting Meta  │
                                 │   Platt Sigmoid Scaling      │
                                 │   (ECE < 0.0002, Brier Min)  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │   Decision Engine & Cost Utility Optimizer   │
                         │  • F1-Optimal & Cost-Optimal Thresholds      │
                         │  • Real-Time Risk Categorization             │
                         │    [LOW | MEDIUM | CRITICAL]                 │
                         └──────────────────────┬───────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
  ┌──────────────────────────────┐                              ┌──────────────────────────────┐
  │ FastAPI Local Microservice   │                              │   Cloudflare Pages Web UI    │
  │ • Auto Port Scanning         │                              │ • Interactive Live Simulator │
  │ • Sub-ms Single/Batch API    │                              │ • Batch CSV Inspector        │
  │ • Mounted SPA Serving        │                              │ • Autonomous Edge Simulation │
  └──────────────────────────────┘                              └──────────────────────────────┘
```

---

## 📊 Comprehensive Test Set Evaluation (42,722 Unseen Transactions)

Evaluated strictly on the held-out stratified test partition ($N = 42,722$, $N_{\text{fraud}} = 74$, total test fraud volume: $\$8,483.36$):

| Model Architecture | PR-AUC (AUPRC) 🎯 | ROC-AUC | Max F1-Score | Precision | Recall (Sens.) | Specificity | ECE | P50 Latency | Net Value Created ($) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline Logistic** | `0.7992` | `0.9718` | `0.8485` | `96.55%` | `75.68%` | `99.99%` | `0.0624` | *N/A* | $\$3,485` |
| **Deep Tabular ResNet (PyTorch)** | `0.7904` | `0.9621` | `0.8286` | `87.88%` | `78.38%` | `99.98%` | `0.0448` | `0.957 ms` | $\$3,833` |
| **XGBoost Classifier** | `0.8399` | `0.9519` | `0.8696` | `93.75%` | `81.08%` | `99.99%` | `0.0007` | **`0.375 ms`** | $\$4,010` |
| **LightGBM Classifier** | `0.8363` | `0.9562` | `0.8777` | `93.85%` | `82.43%` | `99.99%` | `0.0002` | `0.877 ms` | $\$4,035` |
| 🏆 **Calibrated Meta-Ensemble** | **`0.8384`** | **`0.9691`** | **`0.8824`** | **`96.77%`** | **`81.08%`** | **`100.00%`** | **`0.0001`** | `3.732 ms` | **`$4,134`** |

---

## 📁 Repository Structure

```
realtime-fraud-detection-engine/
├── README.md                           # Documentation & benchmarks
├── requirements.txt                    # Pinned Python dependencies
├── serve.py                            # Full-stack launcher (FastAPI + React UI)
├── run_pipeline.py                     # Master training & evaluation pipeline
├── config/
│   └── config.yaml                     # Model & server configurations
├── frontend/                           # Cloudflare Pages React / Vite App
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── wrangler.toml                   # Cloudflare configuration
│   ├── public/
│   │   ├── _headers                    # Cloudflare security & cache headers
│   │   ├── _redirects                  # Cloudflare SPA redirect
│   │   └── figures/                    # High-resolution benchmark figures
│   ├── src/
│   │   ├── App.tsx                     # Main dashboard orchestrator
│   │   ├── components/                 # UI Views (Simulator, Batch, Benchmarks, ROI, API)
│   │   └── utils/                      # Edge Scorer, API client, Presets
│   └── dist/                           # Pre-built production web bundle
├── src/
│   ├── data_loader.py                  # Stratified data partitioning
│   ├── feature_engineering.py          # Leak-free scalers & feature crosses
│   ├── models/                         # Logistic, LightGBM, XGBoost, PyTorch ResNet, Ensemble
│   ├── evaluation/                     # PR-AUC, ECE, latency profiler, visualizer
│   └── api/                            # FastAPI microservice with dynamic localhost binding
└── tests/
    └── test_pipeline.py                # Pytest test suite (6/6 passing)
```

---

## 🚀 Quickstart & Reproduction

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/VMHETAR/realtime-fraud-detection-engine.git
cd realtime-fraud-detection-engine
pip install -r requirements.txt
```

### 2. Run the Master Machine Learning Pipeline
Downloads benchmark dataset, trains PyTorch ResNet & Tree Boosters, performs Platt calibration, and exports visual figures:
```bash
python run_pipeline.py
```

### 3. Launch Full-Stack Server on Localhost
Starts FastAPI with dynamic port collision resolution and serves both the API and the interactive React Frontend simultaneously:
```bash
python serve.py
```
Open **`http://127.0.0.1:8000`** in your browser to interact with the full UI.

---

## ☁️ Deploying to Cloudflare Pages

### Method 1: Using Cloudflare Wrangler CLI
```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name aegis-fraud-detector
```

### Method 2: Via Cloudflare Dashboard (GitHub Connected)
1. Go to **Cloudflare Dashboard > Pages > Create a Project > Connect to Git**.
2. Select your repository `VMHETAR/realtime-fraud-detection-engine`.
3. Set build settings:
   - **Framework preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. Your site will be live instantly on a `*.pages.dev` domain with sub-second global edge CDN speed.

---

## 🔌 API Usage Examples

### Single Transaction Real-Time Scoring (`POST /v1/predict`)
```bash
curl -X POST "http://127.0.0.1:8000/v1/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "Time": 41400.0,
       "Amount": 149.62,
       "V1": -0.254, "V2": 0.128, "V3": 1.154, "V4": -0.412,
       "V5": 0.285,  "V6": -0.089, "V7": 0.312, "V8": 0.045,
       "V9": -0.198, "V10": 0.085, "V11": -0.450,"V12": 0.280,
       "V13": -0.320,"V14": 0.150, "V15": 0.810, "V16": -0.090,
       "V17": 0.015, "V18": 0.085, "V19": -0.140,"V20": 0.035,
       "V21": -0.020,"V22": 0.080, "V23": -0.040,"V24": 0.015,
       "V25": 0.110, "V26": -0.120,"V27": 0.018, "V28": -0.005
     }'
```

#### Sample Response:
```json
{
  "transaction_id": null,
  "fraud_probability": 0.00114,
  "is_fraud": false,
  "risk_level": "LOW",
  "model_version": "1.0.0",
  "inference_latency_ms": 1.15
}
```

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
