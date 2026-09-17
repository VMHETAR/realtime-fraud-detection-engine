import React from 'react';

interface RiskGaugeProps {
  probability: number;
  isFraud: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
  threshold?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  probability,
  isFraud,
  riskLevel,
  threshold = 0.5878
}) => {
  const percent = Math.min(100, Math.max(0, probability * 100));
  const radius = 72;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Semicircle gauge: 220 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percent) / 100;

  // Determine colors & glowing styles
  let colorHex = '#10b981'; // green
  let glowClass = 'glow-emerald';
  let badgeText = 'LEGITIMATE';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (probability >= 0.80) {
    colorHex = '#f43f5e'; // rose red
    glowClass = 'glow-rose';
    badgeText = 'CRITICAL FRAUD';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (probability >= 0.35) {
    colorHex = '#f59e0b'; // amber
    glowClass = 'glow-amber';
    badgeText = 'SUSPICIOUS / REVIEW';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card relative overflow-hidden group">
      {/* Ambient background light blur */}
      <div
        className="absolute w-44 h-44 rounded-full blur-[70px] opacity-25 pointer-events-none transition-colors duration-700 -top-10"
        style={{ backgroundColor: colorHex }}
      />

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Posterior Risk
          </span>
          <span className="text-3xl font-bold font-mono tracking-tight text-white my-0.5">
            {percent.toFixed(1)}%
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full font-mono mt-1 ${badgeBg}`}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Decision threshold indicator */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="text-slate-400">Threshold:</span>
        <span className="text-slate-200 font-semibold">{(threshold * 100).toFixed(1)}%</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">Calibrated:</span>
        <span className="text-emerald-400 font-semibold">Platt Sigmoid</span>
      </div>
    </div>
  );
};
