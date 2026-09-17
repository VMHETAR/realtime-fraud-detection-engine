import React, { useState } from 'react';
import { X, Server, Wifi, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ApiConfig } from '../types';
import { checkBackendHealth } from '../utils/api';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onSaveConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
}

export const EndpointModal: React.FC<EndpointModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onSaveConfig
}) => {
  const [tempUrl, setTempUrl] = useState(apiConfig.baseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'failed'; msg?: string }>({ status: 'idle' });

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult({ status: 'idle' });
    const res = await checkBackendHealth(tempUrl);
    setTesting(false);

    if (res.online) {
      setTestResult({
        status: 'success',
        msg: `Successfully connected! Threshold: ${res.threshold ?? 0.5878}`
      });
      onSaveConfig(prev => ({
        ...prev,
        baseUrl: tempUrl,
        isOnline: true
      }));
    } else {
      setTestResult({
        status: 'failed',
        msg: `Could not reach ${tempUrl}. Falling back to Cloudflare Edge Client Scorer.`
      });
      onSaveConfig(prev => ({
        ...prev,
        baseUrl: tempUrl,
        isOnline: false
      }));
    }
  };

  const handleSetEdgeMode = () => {
    onSaveConfig(prev => ({
      ...prev,
      mode: 'edge_simulation',
      isOnline: false
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel border border-white/[0.12] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-mono">Backend Gateway &amp; Edge Target</h3>
            <p className="text-xs text-slate-400">Configure target FastAPI server or standalone Edge ML runtime</p>
          </div>
        </div>

        {/* Current status summary */}
        <div className="p-3.5 glass-card rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`w-2 h-2 rounded-full ${apiConfig.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'}`} />
            <span className="text-xs font-mono text-slate-300">
              {apiConfig.isOnline ? 'FastAPI Microservice (Localhost)' : 'Cloudflare Edge Simulator (Autonomous)'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
            {apiConfig.isOnline ? 'CONNECTED' : 'STANDALONE'}
          </span>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">FastAPI API Endpoint URL</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tempUrl}
              onChange={e => setTempUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 glass-input rounded-xl px-3 py-2 text-xs font-mono text-white"
            />
            <button
              onClick={handleTestAndSave}
              disabled={testing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{testing ? 'Probing...' : 'Test & Save'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult.status !== 'idle' && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-start space-x-2 ${testResult.status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
            {testResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <span>{testResult.msg}</span>
          </div>
        )}

        {/* Fallback Edge Description */}
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <span className="text-xs font-medium text-slate-200 block">Autonomous Edge Simulation</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Executes the neural and calibrated interaction equations client-side with 100% portfolio demo uptime.
              </span>
            </div>
            <button
              onClick={handleSetEdgeMode}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-mono whitespace-nowrap transition"
            >
              Use Edge Mode
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 rounded-xl text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
