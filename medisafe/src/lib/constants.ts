export const COLORS = {
  bg: '#0F1117',
  surface: '#1A1D27',
  surfaceHover: '#222536',
  border: '#2A2D3E',
  accent: '#4ADE80',
  accentCyber: '#38BDF8',
  accentAI: '#A78BFA',
  danger: '#F87171',
  warn: '#FBBF24',
  safe: '#4ADE80',
  text: '#E2E8F0',
  textMuted: '#64748B',
  textDim: '#94A3B8',
};

export const FONTS = {
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const NAV_ITEMS = [
  { id: 'lab', label: 'Lab Results', icon: '🩸', pillar: 'bio' },
  { id: 'privacy', label: 'Privacy', icon: '🔐', pillar: 'cyber' },
  { id: 'meds', label: 'Medications', icon: '💊', pillar: 'bio' },
  { id: 'meal', label: 'Meal Analyzer', icon: '🍽️', pillar: 'bio' },
  { id: 'fitness', label: 'Fitness', icon: '🏃', pillar: 'bio' },
  { id: 'chat', label: 'AI Assistant', icon: '✦', pillar: 'ai' },
];

export const SAMPLE_LAB = `Glucose: 118 mg/dL
HbA1c: 6.1%
Total Cholesterol: 215 mg/dL
LDL: 142 mg/dL
HDL: 38 mg/dL
Triglycerides: 178 mg/dL
Hemoglobin: 13.1 g/dL
WBC: 4.2 K/uL
Creatinine: 1.3 mg/dL
TSH: 3.8 mIU/L`;