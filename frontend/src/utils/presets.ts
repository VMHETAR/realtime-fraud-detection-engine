import { PresetScenario, Transaction } from '../types';

export const createBlankTransaction = (): Transaction => {
  const tx: Transaction = {
    Time: 43200, // 12:00 PM (midday)
    Amount: 49.99,
  };
  for (let i = 1; i <= 28; i++) {
    tx[`V${i}`] = 0.0;
  }
  return tx;
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'normal-coffee',
    title: 'Everyday Coffee Purchase',
    subtitle: 'Point-of-Sale (POS) Contactless',
    badge: 'Legitimate',
    badgeColor: 'emerald',
    description: 'Routine midday merchant charge ($4.75) within regular geographical proximity and typical PCA cluster behavior.',
    expectedRisk: 0.0008,
    data: {
      Time: 41400, // 11:30 AM
      Amount: 4.75,
      V1: -0.254, V2: 0.128, V3: 1.154, V4: -0.412, V5: 0.285,
      V6: -0.089, V7: 0.312, V8: 0.045, V9: -0.198, V10: 0.085,
      V11: -0.450, V12: 0.280, V13: -0.320, V14: 0.150, V15: 0.810,
      V16: -0.090, V17: 0.015, V18: 0.085, V19: -0.140, V20: 0.035,
      V21: -0.020, V22: 0.080, V23: -0.040, V24: 0.015, V25: 0.110,
      V26: -0.120, V27: 0.018, V28: -0.005
    }
  },
  {
    id: 'account-takeover',
    title: 'Midnight Account Takeover & Wire',
    subtitle: 'High-Value Sudden Outlier',
    badge: 'High Risk Fraud',
    badgeColor: 'rose',
    description: 'Sudden $2,850.00 fund drain at 3:17 AM accompanied by extreme latent distortions on key fraud indicators (V14 < -6.5, V17 < -5.2, V12 < -4.8).',
    expectedRisk: 0.9842,
    data: {
      Time: 11820, // 03:17 AM
      Amount: 2850.00,
      V1: -4.892, V2: 3.841, V3: -6.421, V4: 5.120, V5: -3.950,
      V6: -1.890, V7: -5.780, V8: 2.910, V9: -3.810, V10: -6.240,
      V11: 4.950, V12: -6.120, V13: 0.840, V14: -7.890, V15: -0.450,
      V16: -4.320, V17: -7.410, V18: -2.850, V19: 1.890, V20: 0.890,
      V21: 1.150, V22: -0.420, V23: -0.380, V24: -0.150, V25: 0.420,
      V26: 0.380, V27: 0.890, V28: 0.310
    }
  },
  {
    id: 'borderline-electronics',
    title: 'Unusual Electronics Checkout',
    subtitle: 'High Dollar Value Spike',
    badge: 'Suspicious',
    badgeColor: 'amber',
    description: 'High-ticket e-commerce electronics purchase ($899.99) with mild PCA anomalies (V14 = -1.8, V10 = -1.4). Recommended for step-up 2FA.',
    expectedRisk: 0.4820,
    data: {
      Time: 68400, // 07:00 PM
      Amount: 899.99,
      V1: -1.120, V2: 0.850, V3: -0.920, V4: 1.840, V5: -0.650,
      V6: 0.410, V7: -0.890, V8: 0.520, V9: -0.910, V10: -1.450,
      V11: 1.250, V12: -1.350, V13: 0.210, V14: -1.820, V15: 0.350,
      V16: -0.980, V17: -1.120, V18: -0.450, V19: 0.620, V20: 0.280,
      V21: 0.280, V22: 0.450, V23: -0.120, V24: -0.220, V25: 0.180,
      V26: -0.210, V27: 0.140, V28: 0.040
    }
  },
  {
    id: 'card-testing-attack',
    title: 'Automated Bot Card Testing',
    subtitle: 'Micro-Transaction Burst',
    badge: 'High Risk Fraud',
    badgeColor: 'rose',
    description: 'Rapid-fire $0.99 credential-stuffing probe at 04:20 AM with synthetic fingerprint signature (V4 > 4.2, V11 > 3.8, V14 < -5.1).',
    expectedRisk: 0.9415,
    data: {
      Time: 15600, // 04:20 AM
      Amount: 0.99,
      V1: -3.210, V2: 2.650, V3: -4.120, V4: 4.310, V5: -2.850,
      V6: -1.210, V7: -3.920, V8: 1.950, V9: -2.750, V10: -4.820,
      V11: 3.910, V12: -4.720, V13: 0.420, V14: -5.450, V15: -0.280,
      V16: -3.120, V17: -5.190, V18: -1.950, V19: 1.340, V20: 0.620,
      V21: 0.850, V22: -0.310, V23: -0.220, V24: 0.080, V25: 0.310,
      V26: 0.240, V27: 0.610, V28: 0.220
    }
  },
  {
    id: 'legit-payroll',
    title: 'Salary Direct Deposit',
    subtitle: 'Standard Automated ACH',
    badge: 'Legitimate',
    badgeColor: 'emerald',
    description: 'Regular high-value payroll deposit ($3,450.00) during normal banking hours with clean latent PCA parameters.',
    expectedRisk: 0.0002,
    data: {
      Time: 32400, // 09:00 AM
      Amount: 3450.00,
      V1: 1.180, V2: -0.220, V3: 0.890, V4: -0.150, V5: -0.350,
      V6: 0.220, V7: -0.280, V8: 0.120, V9: 0.450, V10: 0.180,
      V11: -0.620, V12: 0.410, V13: 0.150, V14: 0.280, V15: 0.950,
      V16: 0.110, V17: -0.050, V18: 0.120, V19: -0.180, V20: -0.080,
      V21: -0.090, V22: 0.140, V23: 0.050, V24: 0.110, V25: 0.220,
      V26: -0.080, V27: 0.020, V28: 0.010
    }
  }
];
