import React, { useState } from 'react';
import { Upload, Play, CheckCircle, AlertTriangle, Search, Filter, Download, FileText, Database, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Transaction, FraudPredictionResponse, ApiConfig } from '../types';
import { SAMPLE_BATCH_DATA } from '../utils/sampleBatch';
import { scoreBatch } from '../utils/api';

interface BatchInspectorProps {
  apiConfig: ApiConfig;
}

interface BatchRow {
  id: string;
  merchant?: string;
  tx: Transaction;
  prediction?: FraudPredictionResponse;
  expectedLabel?: 'Legitimate' | 'Fraud';
}

export const BatchInspector: React.FC<BatchInspectorProps> = ({ apiConfig }) => {
  const [rows, setRows] = useState<BatchRow[]>(
    SAMPLE_BATCH_DATA.map(item => ({
      id: item.id,
      merchant: item.merchant,
      expectedLabel: item.expectedLabel,
      tx: item
    }))
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'ALL' | 'FRAUD' | 'LEGIT'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRow, setSelectedRow] = useState<BatchRow | null>(null);
  const [batchStats, setBatchStats] = useState<{
    total: number;
    frauds: number;
    totalAmount: number;
    fraudAmount: number;
    avgLatency: number;
  } | null>(null);

  const handleRunBatchScoring = async () => {
    setLoading(true);
    const txs = rows.map(r => r.tx);
    const res = await scoreBatch(txs, apiConfig.baseUrl, apiConfig.mode === 'edge_simulation');

    const updatedRows = rows.map((r, idx) => ({
      ...r,
      prediction: res.predictions[idx]
    }));

    setRows(updatedRows);

    // Compute stats
    let totalAmt = 0;
    let fraudAmt = 0;
    let fraudCount = 0;

    updatedRows.forEach(r => {
      totalAmt += r.tx.Amount;
      if (r.prediction?.is_fraud) {
        fraudCount++;
        fraudAmt += r.tx.Amount;
      }
    });

    setBatchStats({
      total: updatedRows.length,
      frauds: fraudCount,
      totalAmount: totalAmt,
      fraudAmount: fraudAmt,
      avgLatency: Math.round((res.total_batch_latency_ms / updatedRows.length) * 100) / 100
    });

    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const newRows = list.map((item, idx) => ({
            id: item.transaction_id || `upload_${idx + 1}`,
            merchant: item.merchant || 'Uploaded Transaction',
            tx: item
          }));
          setRows(newRows);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(l => l.trim().length > 0);
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const newRows: BatchRow[] = [];

          for (let i = 1; i < Math.min(lines.length, 100); i++) {
            const vals = lines[i].split(',').map(v => parseFloat(v.trim()) || 0);
            const tx: Transaction = { Time: 0, Amount: 0 };
            headers.forEach((h, colIdx) => {
              tx[h] = vals[colIdx] || 0;
            });
            newRows.push({
              id: `csv_tx_${i}`,
              merchant: `CSV Batch Record #${i}`,
              tx
            });
          }
          setRows(newRows);
        }
      } catch (err) {
        alert('Failed to parse file. Please upload a standard CSV or JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredRows = rows.filter(r => {
    if (filter === 'FRAUD' && !r.prediction?.is_fraud) return false;
    if (filter === 'LEGIT' && r.prediction?.is_fraud) return false;
    if (searchTerm) {
      const matchId = r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMerchant = r.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAmt = r.tx.Amount.toString().includes(searchTerm);
      return matchId || matchMerchant || matchAmt;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              High-Throughput Batch Inference &amp; CSV Inspector
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Process multi-transaction streams with sub-millisecond pipeline SLA (139,000+ tx/sec capability).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <label className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 cursor-pointer border border-slate-700 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV/JSON</span>
            <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleRunBatchScoring}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Evaluating Batch...' : 'Score Batch Live'}</span>
          </button>
        </div>
      </div>

      {/* Batch Stats KPI Cards */}
      {batchStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-mono block">Transactions Evaluated</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {batchStats.total} Records
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-mono block">Frauds Intercepted</span>
            <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
              {batchStats.frauds} ({((batchStats.frauds / batchStats.total) * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-mono block">Fraud Volume Protected</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              ${batchStats.fraudAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-mono block">Per-Tx Latency Avg</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
              {batchStats.avgLatency} ms
            </span>
          </div>
        </div>
      )}

      {/* Table & Filtering */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Table Header Filter controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter by ID, merchant, amount..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono w-60"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {(['ALL', 'FRAUD', 'LEGIT'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  filter === f
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f === 'ALL' ? 'All (10)' : f === 'FRAUD' ? 'Flagged Frauds' : 'Authorized'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Merchant / Channel</th>
                <th className="py-3 px-4">Amount ($)</th>
                <th className="py-3 px-4">Time (Hour)</th>
                <th className="py-3 px-4">Fraud Probability</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRows.map(row => {
                const pred = row.prediction;
                const isFraud = pred?.is_fraud;
                const prob = pred ? (pred.fraud_probability * 100).toFixed(2) + '%' : 'Pending';
                const hour = ((row.tx.Time % 86400) / 3600).toFixed(1);

                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{row.id}</td>
                    <td className="py-3 px-4 text-slate-400">{row.merchant || 'Standard POS'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      ${row.tx.Amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{hour}h</td>
                    <td className="py-3 px-4">
                      {pred ? (
                        <span className={`font-bold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                          {prob}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Not scored</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {pred ? (
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isFraud
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isFraud ? <ShieldAlert className="w-3 h-3 mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                          <span>{isFraud ? 'BLOCKED' : 'AUTHORIZED'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Inspector Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedRow.id} — Payload Inspector</h3>
                <span className="text-xs text-slate-400">{selectedRow.merchant}</span>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
              <pre>{JSON.stringify({ ...selectedRow.tx, prediction: selectedRow.prediction }, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
