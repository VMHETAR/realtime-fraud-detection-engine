import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Zap, Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, DollarSign, Layers } from 'lucide-react';
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Realistic Fraud Scenarios &amp; Attack Vectors
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an archetype scenario to test how the Calibrated Ensemble responds to latent pattern anomalies.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={autoEvaluate}
                onChange={e => setAutoEvaluate(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-[11px] font-mono">Real-Time Reactive</span>
            </label>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_SCENARIOS.map(scenario => {
            const isSelected = selectedPresetId === scenario.id;
            const badgeClasses = {
              emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              rose: 'bg-red-500/10 text-red-400 border-red-500/30',
              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            }[scenario.badgeColor];

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectPreset(scenario.id)}
                className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                      {scenario.badge}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">
                      ${scenario.data.Amount.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{scenario.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white font-mono uppercase">Primary Transaction Parameters</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Time: {currentHour}h ({Math.round(currentTx.Time)}s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Amount Slider */}
              <div className="space-y-1.5">
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex space-x-1.5 pt-1">
                  {[4.99, 49.99, 299.00, 1250.00, 3500.00].map(val => (
                    <button
                      key={val}
                      onClick={() => handleInputChange('Amount', val)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slider (0 to 172800s - 48h) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Time of Day (Hour / Cyclic Phase)</label>
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>00:00 (Midnight)</span>
                  <span>12:00 (Noon)</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            {/* Dominant Latent Fraud Indicators (V14, V17, V12, V10, V4, V11) */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 font-mono uppercase flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Latent Embedding Vectors (PCA Risk Components)</span>
                </span>
                <span className="text-[11px] text-slate-500">Range: -10 to +10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'V14', label: 'V14 (Identity Integrity)', desc: 'High negative value indicates severe fraud anomaly' },
                  { key: 'V17', label: 'V17 (Velocity Deviation)', desc: 'Negative indicates unusual burst velocity' },
                  { key: 'V12', label: 'V12 (Account Consistency)', desc: 'Negative indicates sudden credential shifts' },
                  { key: 'V10', label: 'V10 (Behavioral Envelope)', desc: 'Negative indicates abnormal merchant pairing' },
                  { key: 'V4', label: 'V4 (Credit Expansion)', desc: 'High positive indicates aggressive limit probing' },
                  { key: 'V11', label: 'V11 (Risk Signal Intensity)', desc: 'High positive correlates with coordinated attack' },
                ].map(({ key, label, desc }) => {
                  const val = currentTx[key] ?? 0;
                  const isSevere = Math.abs(val) > 4.0;
                  return (
                    <div key={key} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-slate-300">{label}</span>
                        <span className={`text-xs font-mono font-bold ${isSevere ? (val < 0 ? 'text-red-400' : 'text-amber-400') : 'text-slate-400'}`}>
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
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">{desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Toggle for Remaining V1-V28 */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1"
              >
                <span>{showAdvanced ? 'Hide Extended 28 PCA Vectors' : 'Show All 28 PCA Vectors (Latent Space)'}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 animate-fadeIn">
                  {Array.from({ length: 28 }, (_, i) => `V${i + 1}`).map(vKey => {
                    const val = currentTx[vKey] ?? 0;
                    return (
                      <div key={vKey} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
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
                          className="w-full h-1 bg-slate-800 rounded appearance-none accent-slate-400"
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-white font-mono uppercase flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inference Telemetry</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {prediction?.source === 'fastapi_backend' ? 'FastAPI Microservice' : 'Cloudflare Edge Wasm/JS'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Inference SLA</span>
                <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5 block">
                  {prediction?.inference_latency_ms ?? 0.85} ms
                </span>
                <span className="text-[10px] text-slate-500 font-mono">P50 Benchmark: 0.38ms</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Risk Tier</span>
                <span className={`text-lg font-mono font-bold mt-0.5 block ${
                  prediction?.risk_level === 'CRITICAL' ? 'text-red-400' :
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
                <span className="text-xs font-mono font-semibold text-slate-300 block mb-2">
                  Top Risk Contributing Drivers
                </span>
                <div className="space-y-1.5">
                  {prediction.top_features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/80 border border-slate-800/60 font-mono">
                      <div>
                        <span className="text-slate-300 font-medium block">{feat.name}</span>
                        <span className="text-[10px] text-slate-500">{feat.description}</span>
                      </div>
                      <span className={`font-bold ${feat.impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
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
