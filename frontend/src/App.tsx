import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveSimulator } from './components/LiveSimulator';
import { BatchInspector } from './components/BatchInspector';
import { BenchmarksView } from './components/BenchmarksView';
import { RoiCalculator } from './components/RoiCalculator';
import { ApiPlayground } from './components/ApiPlayground';
import { EndpointModal } from './components/EndpointModal';
import { ApiConfig } from './types';
import { checkBackendHealth, DEFAULT_API_URL } from './utils/api';
import { Shield, Github, Sparkles, Terminal, Activity, Cpu, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: DEFAULT_API_URL,
    mode: 'auto',
    isOnline: false,
    activePort: 8000
  });

  // Probe localhost ports on startup (8000, 8001, 8002, 8080)
  useEffect(() => {
    const probeBackend = async () => {
      const candidatePorts = [8000, 8001, 8002, 8080];
      for (const port of candidatePorts) {
        const url = `http://127.0.0.1:${port}`;
        const res = await checkBackendHealth(url);
        if (res.online) {
          setApiConfig({
            baseUrl: url,
            mode: 'backend',
            isOnline: true,
            activePort: port
          });
          return;
        }
      }
      setApiConfig(prev => ({
        ...prev,
        isOnline: false,
        mode: 'edge_simulation'
      }));
    };

    probeBackend();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Background Decorative Ambient Gradients (Glassmorphism Depth) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px] animate-pulse-slow" />
        <div className="absolute top-[30%] right-[-5%] w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[700px] h-[500px] rounded-full bg-indigo-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      </div>

      {/* Glass Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConfig={apiConfig}
        onOpenSettings={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'simulator' && <LiveSimulator apiConfig={apiConfig} />}
        {activeTab === 'batch' && <BatchInspector apiConfig={apiConfig} />}
        {activeTab === 'benchmarks' && <BenchmarksView />}
        {activeTab === 'roi' && <RoiCalculator />}
        {activeTab === 'api' && <ApiPlayground apiConfig={apiConfig} />}
      </main>

      {/* Glass Minimal Footer */}
      <footer className="border-t border-white/[0.06] bg-[#030712]/70 backdrop-blur-xl mt-16 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-slate-200 font-medium tracking-tight">AegisRisk Intelligence</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Calibrated Soft-Voting Stacking &amp; Real-Time Imbalanced Risk Scoring</span>
          </div>

          <div className="flex items-center space-x-5 text-xs">
            <span className="text-slate-500 font-mono">MIT License</span>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/VMHETAR/realtime-fraud-detection-engine"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white transition flex items-center space-x-1.5 font-medium group"
            >
              <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              <span>VMHETAR</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
            </a>
          </div>
        </div>
      </footer>

      {/* Endpoint Configuration Modal */}
      <EndpointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiConfig={apiConfig}
        onSaveConfig={setApiConfig}
      />
    </div>
  );
};
