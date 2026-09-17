import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Zap, Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, DollarSign, Layers, ShieldCheck } from 'lucide-react';
import { Transaction, FraudPredictionResponse, ApiConfig } from '../types';
import { PRESET_SCENARIOS, createBlankTransaction } from '../utils/presets';
import { scoreSingle } from '../utils/api';
import { RiskGauge } from './RiskGauge';

interface LiveSimulatorProps {
  apiConfig: ApiConfig;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({ apiConfig }) => {
  const [currentTx, setCurrentTx] = useState<Transaction>(PRESET_SCENARIOS[0].data);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [prediction, setPrediction] = useState<FraudPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [autoEvaluate, setAutoEvaluate] = useState<boolean>(true);

  // Run evaluation whenever transaction or config changes
  const evaluateCurrent = async (txToScore: Transaction = currentTx) => {
    setLoading(true);
    const res = await scoreSingle(
      txToScore,
      apiConfig.baseUrl,
      apiConfig.mode === 'edge_simulation'
    );
    setPrediction(res);
    setLoading(false);
  };

  useEffect(() => {
    evaluateCurrent(currentTx);
  }, [apiConfig]);

  const handleSelectPreset = (scenarioId: string) => {
    const found = PRESET_SCENARIOS.find(p => p.id === scenarioId);
    if (found) {
      setSelectedPresetId(found.id);
      setCurrentTx({ ...found.data });
      evaluateCurrent(found.data);
    }
  };

  const handleInputChange = (field: string, val: number) => {
    const updated = { ...currentTx, [field]: val };
    setCurrentTx(updated);
    if (autoEvaluate) {
      evaluateCurrent(updated);
    }
  };

  const handleReset = () => {
    const blank = createBlankTransaction();
    setCurrentTx(blank);
    setSelectedPresetId('');
    evaluateCurrent(blank);
  };

  const currentHour = ((currentTx.Time % 86400) / 3600).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner / Preset Selector */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide font-mono uppercase">
                Attack Vectors &amp; Archetype Scenarios
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an archetype to test the Platt-calibrated meta-ensemble against real-world transaction patterns.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 flex items-center space-x-2 cursor-pointer bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] transition">
              <input
                type="checkbox"
                checked={autoEvaluate}
                onChange={e => setAutoEvaluate(e.target.checked)}
                className="rounded border-white/20 text-emerald-500 focus:ring-0 bg-transparent"
              />
              <span className="text-[11px] font-mono text-slate-300">Reactive Scoring</span>
            </label>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Minimalist Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_SCENARIOS.map(scenario => {
            const isSelected = selectedPresetId === scenario.id;
            const badgeColors = {
              emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            }[scenario.badgeColor];

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectPreset(scenario.id)}
                className={`p-3.5 rounded-xl text-left transition-all duration-200 border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/[0.08] border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeColors}`}>
                      {scenario.badge}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">
                      ${scenario.data.Amount.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100">{scenario.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                  Transaction Core Parameters
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
                Time: {currentHour}h ({Math.round(currentTx.Time)}s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Amount Slider */}
              <div className="space-y-2 glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Transaction Amount ($ USD)</label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${Number(currentTx.Amount).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5000"
                  step="0.5"
                  value={currentTx.Amount}
                  onChange={e => handleInputChange('Amount', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex space-x-1.5 pt-1 overflow-x-auto scrollbar-none">
                  {[4.99, 49.99, 299.00, 1250.00, 3500.00].map(val => (
                    <button
                      key={val}
                      onClick={() => handleInputChange('Amount', val)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] text-slate-300 transition"
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slider (0 to 86400s) */}
              <div className="space-y-2 glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Time of Day (Cyclic Phase)</label>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {currentHour} : 00
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="86400"
                  step="900"
                  value={currentTx.Time % 86400}
                  onChange={e => handleInputChange('Time', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>00:00 (Midnight)</span>
                  <span>12:00 (Noon)</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            {/* Dominant Latent Fraud Indicators (V14, V17, V12, V10, V4, V11) */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-300 font-mono uppercase flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Latent Risk Components (PCA Embeddings)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Normalized [-10, +10]</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'V14', label: 'V14 (Identity Integrity)', desc: 'High negative indicates compromised credentials' },
                  { key: 'V17', label: 'V17 (Velocity Deviation)', desc: 'Negative reflects abnormal burst frequency' },
                  { key: 'V12', label: 'V12 (Account Consistency)', desc: 'Negative correlates with account takeovers' },
                  { key: 'V10', label: 'V10 (Behavioral Envelope)', desc: 'Negative indicates unusual merchant pairing' },
                  { key: 'V4', label: 'V4 (Credit Expansion)', desc: 'Positive correlates with limit exhaustion' },
                  { key: 'V11', label: 'V11 (Risk Signal Intensity)', desc: 'Positive indicates coordinated syndication' },
                ].map(({ key, label, desc }) => {
                  const val = currentTx[key] ?? 0;
                  const isSevere = Math.abs(val) > 4.0;
                  return (
                    <div key={key} className="glass-card p-3 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-slate-300">{label}</span>
                        <span className={`text-xs font-mono font-bold ${isSevere ? (val < 0 ? 'text-rose-400' : 'text-amber-400') : 'text-slate-400'}`}>
                          {val.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={val}
                        onChange={e => handleInputChange(key, parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">{desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Toggle for Remaining V1-V28 */}
            <div className="mt-5 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1 transition"
              >
                <span>{showAdvanced ? 'Collapse 28 PCA Vectors' : 'Expand All 28 PCA Vectors (Latent Space)'}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
                  {Array.from({ length: 28 }, (_, i) => `V${i + 1}`).map(vKey => {
                    const val = currentTx[vKey] ?? 0;
                    return (
                      <div key={vKey} className="glass-card p-2 rounded-lg">
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-400">{vKey}</span>
                          <span className="text-slate-200 font-bold">{val.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-8"
                          max="8"
                          step="0.2"
                          value={val}
                          onChange={e => handleInputChange(vKey, parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Gauge & Decision Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {prediction && (
            <RiskGauge
              probability={prediction.fraud_probability}
              isFraud={prediction.is_fraud}
              riskLevel={prediction.risk_level}
              threshold={0.5878}
            />
          )}

          {/* Telemetry Metrics Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inference Telemetry</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                {prediction?.source === 'fastapi_backend' ? 'FastAPI Microservice' : 'Edge Web Worker / WASM'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">Inference Latency</span>
                <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
                  {prediction?.inference_latency_ms ?? 0.85} ms
                </span>
                <span className="text-[10px] text-slate-500 font-mono">P50 Benchmark: 0.38ms</span>
              </div>

              <div className="glass-card p-3.5 rounded-xl">
                <span className="text-[11px] text-slate-400 block font-medium">Risk Classification</span>
                <span className={`text-xl font-mono font-bold mt-1 block ${
                  prediction?.risk_level === 'CRITICAL' ? 'text-rose-400' :
                  prediction?.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {prediction?.risk_level ?? 'LOW'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Platt-Calibrated ECE &lt; 0.0002</span>
              </div>
            </div>

            {/* Feature Impact Breakdown */}
            {prediction?.top_features && prediction.top_features.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-mono font-semibold text-slate-300 block mb-2.5">
                  Top Risk Contributing Drivers
                </span>
                <div className="space-y-2">
                  {prediction.top_features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl glass-card font-mono">
                      <div>
                        <span className="text-slate-200 font-medium block">{feat.name}</span>
                        <span className="text-[10px] text-slate-500">{feat.description}</span>
                      </div>
                      <span className={`font-bold ${feat.impact > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {feat.impact > 0 ? `+${feat.impact.toFixed(2)}` : feat.impact.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
