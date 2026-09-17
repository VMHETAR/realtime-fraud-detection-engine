import React from 'react';
import { Shield, Activity, Terminal, Cpu, ShieldAlert, Globe, Github, Settings, Zap } from 'lucide-react';
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
    { id: 'simulator', label: 'Live Simulator', icon: Activity },
    { id: 'batch', label: 'Batch Inspector', icon: Terminal },
    { id: 'benchmarks', label: 'Model Benchmarks', icon: Cpu },
    { id: 'roi', label: 'ROI Calculator', icon: ShieldAlert },
    { id: 'api', label: 'API & Deploy', icon: Globe },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#030712]/70 backdrop-blur-2xl transition-all">
      {/* Micro-Telemetry Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-b border-white/[0.04] flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono font-medium">AegisRisk v1.0</span>
          </div>
          <span className="text-white/10 hidden sm:inline">/</span>
          <span className="text-slate-400 hidden sm:inline font-mono">
            Meta-Ensemble (LightGBM + XGBoost + PyTorch ResNet)
          </span>
          <span className="text-white/10 hidden md:inline">/</span>
          <span className="hidden md:inline text-emerald-400/90 font-mono">
            PR-AUC 0.8384 • SLA &lt;1.0ms
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Capsule */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition text-slate-300 font-mono text-[11px] group"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${apiConfig.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'}`}></span>
            <span>
              {apiConfig.isOnline ? `127.0.0.1:${apiConfig.activePort}` : 'Edge ML Simulator'}
            </span>
            <Settings className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition" />
          </button>

          <a
            href="https://github.com/VMHETAR/realtime-fraud-detection-engine"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-white/[0.04]"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Icon & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/15 p-0.5 shadow-lg shadow-emerald-500/5 flex items-center justify-center backdrop-blur-md">
            <Shield className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Aegis<span className="text-emerald-400 font-bold">Risk</span>
              </h1>
              <span className="px-2 py-0.2 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                Production Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight">
              Real-Time Financial Anomaly &amp; Imbalance Risk Scoring
            </p>
          </div>
        </div>

        {/* Minimalist Segmented Pill Navigation */}
        <nav className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12] backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
