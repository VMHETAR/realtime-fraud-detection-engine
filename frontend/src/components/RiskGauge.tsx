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
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Semicircle gauge: 220 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percent) / 100;

  // Determine colors
  let colorHex = '#10b981'; // green
  let glowClass = 'glow-emerald';
  let badgeText = 'LOW RISK';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (probability >= 0.80) {
    colorHex = '#ef4444'; // red
    glowClass = 'glow-rose';
    badgeText = 'CRITICAL FRAUD';
    badgeBg = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (probability >= 0.35) {
    colorHex = '#f59e0b'; // amber
    glowClass = 'glow-amber';
    badgeText = 'MEDIUM SUSPICION';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800 relative overflow-hidden">
      {/* Ambient background light */}
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: colorHex }}
      />

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 180 180">
          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#1e293b"
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
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {percent.toFixed(2)}%
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">
            Fraud Probability
          </span>
        </div>
      </div>

      {/* Decision Pill */}
      <div className="mt-3 flex flex-col items-center space-y-2">
        <div className={`px-3.5 py-1 rounded-full text-xs font-mono font-semibold border ${badgeBg} flex items-center space-x-1.5`}>
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: colorHex }} />
          <span>{badgeText}</span>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
          <span>Decision:</span>
          <span className={`font-bold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
            {isFraud ? 'BLOCKED / INTERCEPTED' : 'AUTHORIZED'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">Threshold: {(threshold * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
