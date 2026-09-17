import React, { useState } from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Calculator, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(500000);
  const [fraudRatePercent, setFraudRatePercent] = useState<number>(0.18);
  const [avgTicketSize, setAvgTicketSize] = useState<number>(145);
  const [investigationCost, setInvestigationCost] = useState<number>(50);

  // AegisRisk Calibrated Ensemble Specs
  const ensemblePrecision = 0.9677; // 96.77%
  const ensembleRecall = 0.8108;    // 81.08%

  // Generic Uncalibrated Baseline Specs
  const baselinePrecision = 0.65;
  const baselineRecall = 0.70;

  // Monthly Calculations
  const expectedFraudCount = Math.round(monthlyVolume * (fraudRatePercent / 100));
  const expectedTotalFraudLoss = expectedFraudCount * avgTicketSize;

  // AegisRisk Outcomes
  const aegisInterceptedFrauds = Math.round(expectedFraudCount * ensembleRecall);
  const aegisPreventedDollars = aegisInterceptedFrauds * avgTicketSize;
  const aegisFalsePositives = Math.round(aegisInterceptedFrauds * (1 - ensemblePrecision) / ensemblePrecision);
  const aegisInvestigationOverhead = aegisFalsePositives * investigationCost;
  const aegisNetSavings = Math.max(0, aegisPreventedDollars - aegisInvestigationOverhead);

  // Generic Baseline Outcomes
  const baseInterceptedFrauds = Math.round(expectedFraudCount * baselineRecall);
  const basePreventedDollars = baseInterceptedFrauds * avgTicketSize;
  const baseFalsePositives = Math.round(baseInterceptedFrauds * (1 - baselinePrecision) / baselinePrecision);
  const baseInvestigationOverhead = baseFalsePositives * investigationCost;
  const baseNetSavings = Math.max(0, basePreventedDollars - baseInvestigationOverhead);

  const netAdvantageMonthly = aegisNetSavings - baseNetSavings;
  const annualSavingsGain = netAdvantageMonthly * 12;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Enterprise Financial Cost-Benefit &amp; ROI Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl">
          Simulate bottom-line savings by optimizing for cost asymmetry: balancing intercepted chargeback losses against customer friction &amp; manual compliance review overhead ($50/case).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-2xl space-y-5">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-white/[0.06] pb-3">
            Portfolio Volume &amp; Cost Parameters
          </h3>

          {/* Monthly Volume */}
          <div className="space-y-2 glass-card p-4 rounded-xl">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Monthly Transactions</span>
              <span className="font-bold text-emerald-400">{monthlyVolume.toLocaleString()} tx/mo</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={monthlyVolume}
              onChange={e => setMonthlyVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Fraud Rate */}
          <div className="space-y-2 glass-card p-4 rounded-xl">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Fraud Rate Baseline</span>
              <span className="font-bold text-rose-400">{fraudRatePercent.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.50"
              step="0.01"
              value={fraudRatePercent}
              onChange={e => setFraudRatePercent(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Avg Ticket Size */}
          <div className="space-y-2 glass-card p-4 rounded-xl">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Average Ticket Amount</span>
              <span className="font-bold text-cyan-400">${avgTicketSize} USD</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="5"
              value={avgTicketSize}
              onChange={e => setAvgTicketSize(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Investigation Overhead */}
          <div className="space-y-2 glass-card p-4 rounded-xl">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">False Alarm Review Cost</span>
              <span className="font-bold text-amber-400">${investigationCost} / case</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={investigationCost}
              onChange={e => setInvestigationCost(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-4 rounded-xl glass-card text-xs font-mono space-y-2 border border-white/[0.08]">
            <span className="text-slate-400 block text-[11px]">Gross Baseline Exposure:</span>
            <div className="flex justify-between text-slate-300">
              <span>Expected Monthly Attacks:</span>
              <span className="font-bold text-white">{expectedFraudCount} cases</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gross Fraud Risk Volume:</span>
              <span className="font-bold text-rose-400">
                ${expectedTotalFraudLoss.toLocaleString('en-US', { minimumFractionDigits: 0 })}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Net Savings Card */}
          <div className="glass-panel border border-emerald-500/30 rounded-2xl p-7 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="relative z-10">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
                Net Annual Value Created by AegisRisk
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight mt-2 block">
                +${annualSavingsGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-slate-400 ml-2">/ year</span>
              </span>
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                Outperforms generic uncalibrated heuristics by eliminating 96.8% of false positive investigation labor.
              </p>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AegisRisk */}
            <div className="glass-card border-emerald-500/30 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="font-bold text-emerald-400">AegisRisk AI Ensemble</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  96.77% Precision
                </span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Gross Fraud Intercepted:</span>
                  <span className="font-bold text-emerald-400">+${aegisPreventedDollars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>False Alarm Reviews:</span>
                  <span className="text-slate-400">{aegisFalsePositives} cases</span>
                </div>
                <div className="flex justify-between">
                  <span>Investigation Labor Cost:</span>
                  <span className="text-amber-400">-${aegisInvestigationOverhead.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold text-white text-sm">
                  <span>Net Monthly Benefit:</span>
                  <span className="text-emerald-400">${aegisNetSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Standard Generic Baseline */}
            <div className="glass-card rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="font-bold text-slate-400">Standard Generic Rule/Tree</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                  65.0% Precision
                </span>
              </div>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Fraud Intercepted:</span>
                  <span className="text-slate-200">+${basePreventedDollars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>False Alarm Reviews:</span>
                  <span className="text-rose-400 font-bold">{baseFalsePositives} cases</span>
                </div>
                <div className="flex justify-between">
                  <span>Investigation Labor Cost:</span>
                  <span className="text-rose-400">-${baseInvestigationOverhead.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold text-white text-sm">
                  <span>Net Monthly Benefit:</span>
                  <span className="text-slate-300">${baseNetSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
