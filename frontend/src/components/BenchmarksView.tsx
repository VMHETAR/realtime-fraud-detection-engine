import React, { useState } from 'react';
import { BarChart3, TrendingUp, Layers, CheckCircle2, Award, Zap, DollarSign, FileImage, Sparkles } from 'lucide-react';

export const BenchmarksView: React.FC = () => {
  const [selectedFigure, setSelectedFigure] = useState<string>('pr_curves');

  const figures = [
    {
      id: 'pr_curves',
      title: 'Precision-Recall (PR-AUC) Benchmark',
      subtitle: 'Primary evaluation metric for ultra-imbalanced (0.17%) data distributions',
      filename: '/figures/pr_curves_comparison.png',
      badge: 'Gold Standard Metric'
    },
    {
      id: 'roc_curves',
      title: 'Receiver Operating Characteristic (ROC-AUC)',
      subtitle: 'True Positive vs False Positive trade-off comparison across all 5 architectures',
      filename: '/figures/roc_curves_comparison.png',
      badge: 'Global Discriminability'
    },
    {
      id: 'calibration',
      title: 'Reliability Diagram (Probability Calibration)',
      subtitle: 'Platt Scaling alignment with true empirical posterior probability (ECE = 0.0001)',
      filename: '/figures/calibration_curves.png',
      badge: 'Uncertainty Calibration'
    },
    {
      id: 'confusion_matrix',
      title: 'Calibrated Ensemble Confusion Matrix',
      subtitle: '42,722 unseen transactions: 60 TP, 42,646 TN, only 2 FP, 14 FN',
      filename: '/figures/confusion_matrix_ensemble.png',
      badge: '96.77% Precision'
    },
    {
      id: 'feature_importance',
      title: 'Top Predictive Fraud Feature Gain Ranking',
      subtitle: 'Feature importance decomposition highlighting PCA components V14, V10, V17 & V4',
      filename: '/figures/feature_importance_ranking.png',
      badge: 'Interpretability'
    },
    {
      id: 'cost_benefit',
      title: 'Financial Cost-Benefit Optimization Curve',
      subtitle: 'Dollar savings optimization factoring $50 false alarm investigation overhead',
      filename: '/figures/financial_cost_optimization.png',
      badge: '$4,134 Net Profit'
    },
  ];

  const modelsBenchmark = [
    {
      name: 'Calibrated Meta-Ensemble',
      badge: '🏆 Champion',
      prAuc: '0.8384',
      rocAuc: '0.9691',
      f1: '0.8824',
      precision: '96.77%',
      recall: '81.08%',
      ece: '0.0001',
      p50: '3.73 ms',
      netVal: '$4,134',
      color: 'text-emerald-400',
      isBest: true
    },
    {
      name: 'LightGBM Classifier',
      badge: 'High Recall',
      prAuc: '0.8363',
      rocAuc: '0.9562',
      f1: '0.8777',
      precision: '93.85%',
      recall: '82.43%',
      ece: '0.0002',
      p50: '0.88 ms',
      netVal: '$4,035',
      color: 'text-green-400'
    },
    {
      name: 'XGBoost Classifier',
      badge: '⚡ Ultra Fast',
      prAuc: '0.8399',
      rocAuc: '0.9519',
      f1: '0.8696',
      precision: '93.75%',
      recall: '81.08%',
      ece: '0.0007',
      p50: '0.38 ms',
      netVal: '$4,010',
      color: 'text-cyan-400'
    },
    {
      name: 'Deep Tabular ResNet (PyTorch)',
      badge: 'Deep Learning',
      prAuc: '0.7904',
      rocAuc: '0.9621',
      f1: '0.8286',
      precision: '87.88%',
      recall: '78.38%',
      ece: '0.0448',
      p50: '0.96 ms',
      netVal: '$3,833',
      color: 'text-indigo-400'
    },
    {
      name: 'Baseline Logistic (ElasticNet)',
      badge: 'Linear',
      prAuc: '0.7992',
      rocAuc: '0.9718',
      f1: '0.8485',
      precision: '96.55%',
      recall: '75.68%',
      ece: '0.0624',
      p50: 'N/A',
      netVal: '$3,485',
      color: 'text-slate-400'
    },
  ];

  const currentFig = figures.find(f => f.id === selectedFigure) || figures[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Rigorous Out-Of-Sample Benchmark (42,722 Unseen Transactions)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Strictly evaluated on held-out stratified test partitions with 74 true fraud cases ($8,483.36 exposure).
              Optimized for PR-AUC and cost-utility with Expected Calibration Error (ECE) minimization.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="glass-card px-3.5 py-2 rounded-xl">
              <span className="text-slate-500 block text-[10px]">Total Partition</span>
              <span className="text-slate-200 font-bold">284,807 tx</span>
            </div>
            <div className="glass-card px-3.5 py-2 rounded-xl">
              <span className="text-slate-500 block text-[10px]">Fraud Skew</span>
              <span className="text-rose-400 font-bold">0.1727%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Model Architecture Leaderboard</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Stratified 70/15/15 Partition</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/[0.02] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4 font-medium">Architecture</th>
                <th className="py-3.5 px-4 font-medium">PR-AUC (AUPRC) 🎯</th>
                <th className="py-3.5 px-4 font-medium">ROC-AUC</th>
                <th className="py-3.5 px-4 font-medium">Max F1</th>
                <th className="py-3.5 px-4 font-medium">Precision</th>
                <th className="py-3.5 px-4 font-medium">Recall (Sens.)</th>
                <th className="py-3.5 px-4 font-medium">ECE (Calib.)</th>
                <th className="py-3.5 px-4 font-medium">P50 Latency</th>
                <th className="py-3.5 px-4 font-medium text-right">Net Financial Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {modelsBenchmark.map((m, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-white/[0.03] transition-colors ${m.isBest ? 'bg-emerald-500/[0.04] font-semibold' : ''}`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${m.color}`}>{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 font-normal">
                        {m.badge}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">{m.prAuc}</td>
                  <td className="py-3.5 px-4">{m.rocAuc}</td>
                  <td className="py-3.5 px-4">{m.f1}</td>
                  <td className="py-3.5 px-4">{m.precision}</td>
                  <td className="py-3.5 px-4">{m.recall}</td>
                  <td className="py-3.5 px-4 text-slate-400">{m.ece}</td>
                  <td className="py-3.5 px-4 text-cyan-400">{m.p50}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">{m.netVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Scientific Figures Gallery */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileImage className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Model Visualizations &amp; Calibration Curves
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vector plots generated from the automated training and validation run.
            </p>
          </div>

          {/* Figure selector buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {figures.map(fig => (
              <button
                key={fig.id}
                onClick={() => setSelectedFigure(fig.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  selectedFigure === fig.id
                    ? 'bg-white/[0.12] text-white font-semibold shadow-sm border border-white/[0.15]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {fig.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Display Selected Figure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 glass-card p-3 rounded-2xl flex items-center justify-center min-h-[420px]">
            <img
              src={currentFig.filename}
              alt={currentFig.title}
              className="max-h-[480px] w-auto object-contain rounded-xl shadow-2xl"
              onError={e => {
                (e.target as HTMLImageElement).src = `figures/${currentFig.filename.split('/').pop()}`;
              }}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-5 rounded-xl space-y-3">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentFig.badge}
              </span>
              <h4 className="text-sm font-bold text-white font-mono">{currentFig.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentFig.subtitle}</p>
            </div>

            <div className="glass-card p-5 rounded-xl space-y-2 text-xs font-mono text-slate-400">
              <span className="text-white font-semibold block">Key Research Insight:</span>
              <p className="text-[11px] leading-relaxed">
                By pairing Focal Loss ($\gamma=2.0$) with Platt logistic sigmoid calibration, the meta-ensemble achieves extreme specificity ($100.00\%$) and suppresses false alarms while preserving $81.08\%$ recall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
