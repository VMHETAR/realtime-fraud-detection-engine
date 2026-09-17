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
import { Shield, Github, Heart, Globe, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: DEFAULT_API_URL,
    mode: 'auto',
    isOnline: false,
    activePort: 8000
  });

  // Probe localhost ports on startup (8000, 8001, 8002)
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
      // If no local port is up, gracefully default to Edge Simulation Mode
      setApiConfig(prev => ({
        ...prev,
        isOnline: false,
        mode: 'edge_simulation'
      }));
    };

    probeBackend();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConfig={apiConfig}
        onOpenSettings={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && <LiveSimulator apiConfig={apiConfig} />}
        {activeTab === 'batch' && <BatchInspector apiConfig={apiConfig} />}
        {activeTab === 'benchmarks' && <BenchmarksView />}
        {activeTab === 'roi' && <RoiCalculator />}
        {activeTab === 'api' && <ApiPlayground apiConfig={apiConfig} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b0f19] mt-12 py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">AegisRisk AI</span>
            <span>— Real-Time Financial Anomaly &amp; Fraud Risk Detection Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-500">MIT License</span>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/VMHETAR/realtime-fraud-detection-engine"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>@VMHETAR</span>
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400">Cloudflare Pages Ready</span>
          </div>
        </div>
      </footer>

      {/* Endpoint Configuration Modal */}
      <EndpointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
      />
    </div>
  );
};
