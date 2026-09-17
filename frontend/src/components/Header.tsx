import React from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Globe, Github, Terminal, Settings } from 'lucide-react';
import { ApiConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiConfig: ApiConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  apiConfig,
  onOpenSettings
}) => {
  const tabs = [
    { id: 'simulator', label: 'Live Risk Simulator', icon: Activity },
    { id: 'batch', label: 'Batch Inspector', icon: Terminal },
    { id: 'benchmarks', label: 'Model Benchmarks & ROC', icon: Cpu },
    { id: 'roi', label: 'Financial ROI Calculator', icon: ShieldAlert },
    { id: 'api', label: 'API & Cloudflare Integration', icon: Globe },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center space-x-1.5 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">AegisRisk Core v1.0.0</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Stack: LightGBM + XGBoost + PyTorch ResNet
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden md:inline text-emerald-400 font-mono">
            PR-AUC: 0.8384 • SLA: &lt;1.0ms
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status Pill */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 transition text-slate-300 font-mono text-[11px]"
            title="Configure API Endpoint"
          >
            <span className={`w-2 h-2 rounded-full ${apiConfig.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'}`}></span>
            <span>
              {apiConfig.isOnline
                ? `Localhost:${apiConfig.activePort} (Connected)`
                : 'Cloudflare Edge Mode'}
            </span>
            <Settings className="w-3 h-3 text-slate-400" />
          </button>

          <a
            href="https://github.com/VMHETAR/realtime-fraud-detection-engine"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-800"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                AegisRisk<span className="text-emerald-400">.AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono uppercase">
                Production Fraud Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Calibrated Soft-Voting Inference &amp; Real-Time Imbalance Risk Guard
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
