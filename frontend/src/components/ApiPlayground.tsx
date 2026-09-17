import React, { useState } from 'react';
import { Terminal, Copy, Check, Cloud, Globe, Code2, Layers, ArrowUpRight } from 'lucide-react';
import { ApiConfig } from '../types';

interface ApiPlaygroundProps {
  apiConfig: ApiConfig;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ apiConfig }) => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'ts' | 'worker'>('curl');

  const endpointUrl = apiConfig.baseUrl || 'http://127.0.0.1:8000';

  const snippets = {
    curl: `curl -X POST "${endpointUrl}/v1/predict" \\
  -H "Content-Type: application/json" \\
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
  }'`,

    python: `import requests

url = "${endpointUrl}/v1/predict"
payload = {
    "Time": 41400.0,
    "Amount": 149.62,
    "V1": -0.254, "V2": 0.128, "V3": 1.154, "V4": -0.412,
    "V5": 0.285,  "V6": -0.089, "V7": 0.312, "V8": 0.045,
    "V9": -0.198, "V10": 0.085, "V11": -0.450,"V12": 0.280,
    "V13": -0.320,"V14": 0.150, "V15": 0.810, "V16": -0.090,
    "V17": 0.015, "V18": 0.085, "V19": -0.140,"V20": 0.035,
    "V21": -0.020,"V22": 0.080, "V23": -0.040,"V24": 0.015,
    "V25": 0.110, "V26": -0.120,"V27": 0.018, "V28": -0.005
}

response = requests.post(url, json=payload, timeout=2.0)
data = response.json()

print(f"Risk Probability: {data['fraud_probability']:.4f}")
print(f"Decision:         {'BLOCKED' if data['is_fraud'] else 'AUTHORIZED'}")
print(f"Latency:          {data['inference_latency_ms']:.2f} ms")`,

    ts: `const payload = {
  Time: 41400.0,
  Amount: 149.62,
  V1: -0.254, V2: 0.128, V3: 1.154, V4: -0.412,
  V5: 0.285,  V6: -0.089, V7: 0.312, V8: 0.045,
  V9: -0.198, V10: 0.085, V11: -0.450, V12: 0.280,
  V13: -0.320, V14: 0.150, V15: 0.810, V16: -0.090,
  V17: 0.015, V18: 0.085, V19: -0.140, V20: 0.035,
  V21: -0.020, V22: 0.080, V23: -0.040, V24: 0.015,
  V25: 0.110, V26: -0.120, V27: 0.018, V28: -0.005
};

const res = await fetch("${endpointUrl}/v1/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const result = await res.json();
console.log("Decision:", result.is_fraud ? "BLOCKED" : "AUTHORIZED");`,

    worker: `// Cloudflare Worker Proxy or Edge Scoring Handler
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const payload = await request.json();
    const backendUrl = "${endpointUrl}/v1/predict";

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return Response.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};`
  };

  const copyToClipboard = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cloudflare Pages Deployment Step-by-Step Guide */}
      <div className="bg-gradient-to-r from-orange-950/30 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              How to Deploy this Frontend to Cloudflare Pages (Free &amp; Instant)
            </h2>
            <p className="text-xs text-slate-400">
              Zero configuration required. Pure static edge bundle with included <code className="text-orange-300">_headers</code> and <code className="text-orange-300">_redirects</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          {/* Method 1: Wrangler CLI */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-orange-400 font-bold block">Method 1: Wrangler CLI</span>
            <p className="text-[11px] text-slate-400">Deploy from terminal in 10 seconds:</p>
            <div className="bg-slate-900 p-2.5 rounded-lg text-slate-200 text-[11px] overflow-x-auto">
              <code>cd frontend<br/>npm run build<br/>npx wrangler pages deploy dist</code>
            </div>
          </div>

          {/* Method 2: GitHub Integration */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">Method 2: Cloudflare Dashboard</span>
            <p className="text-[11px] text-slate-400">Link GitHub repo in Cloudflare Pages:</p>
            <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
              <li>Framework preset: <b className="text-white">Vite</b></li>
              <li>Build command: <b className="text-white">npm run build</b></li>
              <li>Build output: <b className="text-white">dist</b></li>
              <li>Root directory: <b className="text-white">frontend</b></li>
            </ul>
          </div>

          {/* Method 3: Direct Upload */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block">Method 3: Direct Drag &amp; Drop</span>
            <p className="text-[11px] text-slate-400">Upload the built <code className="text-white">frontend/dist</code> directory directly in Cloudflare Pages UI.</p>
            <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/30">
              ✔ Includes built-in Edge ML client simulation if backend is offline.
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Integration Code Generator
            </h3>
          </div>

          {/* Lang tabs */}
          <div className="flex items-center space-x-1 font-mono text-xs">
            {(['curl', 'python', 'ts', 'worker'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded-lg transition ${
                  activeLang === lang
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : lang === 'ts' ? 'TypeScript' : 'Cloudflare Worker'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-950 relative font-mono text-xs text-slate-300 overflow-x-auto">
          <button
            onClick={() => copyToClipboard(snippets[activeLang], activeLang)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1 text-[11px]"
          >
            {copiedLang === activeLang ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLang === activeLang ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="pr-16 leading-relaxed">{snippets[activeLang]}</pre>
        </div>
      </div>
    </div>
  );
};
