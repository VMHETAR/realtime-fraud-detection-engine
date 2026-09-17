import React, { useState } from 'react';
import { X, Server, Wifi, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ApiConfig } from '../types';
import { checkBackendHealth } from '../utils/api';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
}

export const EndpointModal: React.FC<EndpointModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  setApiConfig
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
      setApiConfig(prev => ({
        ...prev,
        baseUrl: tempUrl,
        isOnline: true
      }));
    } else {
      setTestResult({
        status: 'failed',
        msg: `Could not reach ${tempUrl}. Falling back to Cloudflare Edge Client Scorer.`
      });
      setApiConfig(prev => ({
        ...prev,
        baseUrl: tempUrl,
        isOnline: false
      }));
    }
  };

  const handleSetEdgeMode = () => {
    setApiConfig(prev => ({
      ...prev,
      mode: 'edge_simulation',
      isOnline: false
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-mono">Backend Inference Gateway</h3>
            <p className="text-xs text-slate-400">Configure target FastAPI server or standalone Cloudflare edge runtime</p>
          </div>
        </div>

        {/* Current status summary */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${apiConfig.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'}`} />
            <span className="text-xs font-mono text-slate-300">
              {apiConfig.isOnline ? 'Local FastAPI Microservice' : 'Cloudflare Edge Simulator (Autonomous)'}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {apiConfig.isOnline ? 'ONLINE' : 'STANDALONE'}
          </span>
        </div>

        {/* URL Input */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300">FastAPI API Endpoint URL</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tempUrl}
              onChange={e => setTempUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleTestAndSave}
              disabled={testing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{testing ? 'Testing...' : 'Test & Connect'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult.status !== 'idle' && (
          <div className={`mt-3 p-3 rounded-lg text-xs flex items-start space-x-2 ${testResult.status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
            {testResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <span>{testResult.msg}</span>
          </div>
        )}

        {/* Fallback Edge Description */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <span className="text-xs font-medium text-slate-200 block">Cloudflare Edge Simulation Mode</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Executes the exact neural interaction equations in-browser. Zero server needed. Perfect for static Cloudflare Pages preview.
              </span>
            </div>
            <button
              onClick={handleSetEdgeMode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono whitespace-nowrap transition"
            >
              Use Edge Mode
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
