import { useState } from 'react';
import { COLORS, FONTS, SAMPLE_LAB } from '../lib/constants';
import { callAPI, parseJSON } from '../lib/ai';
import type { HealthProfile, LabAnalysis, LabValue } from '../lib/types';

const SYSTEM = `You are a medical data interpreter. The user will paste raw lab results.
Return ONLY valid JSON in this exact shape. No markdown, no extra text:
{
  "summary": "2-3 sentence plain-English overview of the person's overall health",
  "values": [
    {
      "name": "test name",
      "value": "numeric value",
      "unit": "unit",
      "status": "normal|low|high|critical",
      "range": "reference range e.g. 70-99 mg/dL",
      "explanation": "1 sentence plain-English explanation"
    }
  ],
  "doctorQuestions": ["Question 1", "Question 2", "Question 3"],
  "lifestyleTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

const STATUS_COLOR: Record<string, string> = {
  normal:   COLORS.safe,
  low:      COLORS.warn,
  high:     COLORS.warn,
  critical: COLORS.danger,
};

const STATUS_BG: Record<string, string> = {
  normal:   '#4ADE8018',
  low:      '#FBBF2418',
  high:     '#FBBF2418',
  critical: '#F8717118',
};

function SkeletonCard() {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {[80, 50, 100].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 24 : 12,
          width: `${w}%`,
          borderRadius: 6,
          background: COLORS.border,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

function ValueCard({ v }: { v: LabValue }) {
  const color = STATUS_COLOR[v.status] ?? COLORS.textDim;
  const bg    = STATUS_BG[v.status]    ?? 'transparent';

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = COLORS.border)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{v.name}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          background: bg,
          padding: '2px 8px',
          borderRadius: 999,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {v.status}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: FONTS.mono }}>
          {v.value}
        </span>
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>{v.unit}</span>
        <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' }}>
          ref: {v.range}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>
        {v.explanation}
      </p>
    </div>
  );
}

interface Props {
  profile: HealthProfile;
  onProfileUpdate: (p: Partial<HealthProfile>) => void;
}

export default function LabModule({ profile, onProfileUpdate }: Props) {
  const [text, setText] = useState(profile.labRawText || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analysis = profile.labAnalysis;

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const raw = await callAPI(SYSTEM, text);
      const parsed = parseJSON<LabAnalysis>(raw);
      onProfileUpdate({
        labRawText: text,
        labAnalysis: parsed,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (e) {
      setError('Could not parse response. Make sure your lab results are formatted clearly.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONTS.body }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>
            Lab Results Decoder
          </h2>
          <p style={{ color: COLORS.textMuted, marginTop: 6, fontSize: 14 }}>
            Paste your lab report and get plain-English explanations, flags, and doctor questions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'Paste your lab results here...\nExample:\nGlucose: 118 mg/dL\nLDL: 142 mg/dL'}
            rows={8}
            style={{
              background: '#0F1117',
              border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
              borderRadius: 10,
              color: COLORS.text,
              fontFamily: FONTS.mono,
              fontSize: 13,
              padding: '12px 14px',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.7,
              transition: 'border-color 0.2s',
            }}
          />

          {error && (
            <div style={{
              background: '#F8717112',
              border: `1px solid ${COLORS.danger}40`,
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <p style={{ margin: 0, color: COLORS.danger, fontSize: 13 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setText(SAMPLE_LAB); setError(''); }}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: 'transparent',
                color: COLORS.textDim,
                fontSize: 13,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.textDim;
                e.currentTarget.style.color = COLORS.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.color = COLORS.textDim;
              }}
            >
              Load Sample
            </button>
            <button
              onClick={analyze}
              disabled={loading || !text.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: 8,
                border: 'none',
                background: loading ? COLORS.accent + '80' : text.trim() ? COLORS.accent : COLORS.border,
                color: loading ? '#0F1117' : text.trim() ? '#0F1117' : COLORS.textMuted,
                fontWeight: 700,
                fontSize: 14,
                flex: 1,
                transition: 'background 0.2s',
                animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Results'}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {analysis && !loading && (
          <>
            {/* Summary Card */}
            <div style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${COLORS.accent}`,
              borderRadius: 10,
              padding: '16px 18px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                Summary
              </p>
              <p style={{ margin: 0, color: COLORS.text, fontSize: 14, lineHeight: 1.8 }}>
                {analysis.summary}
              </p>
            </div>

            {/* Value Cards Grid */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                {analysis.values.length} Values Analyzed
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}>
                {analysis.values.map((v, i) => <ValueCard key={i} v={v} />)}
              </div>
            </div>

            {/* Bottom Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${COLORS.accentCyber}`,
                borderRadius: 10,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.accentCyber, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Ask Your Doctor
                </p>
                {analysis.doctorQuestions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: COLORS.accentCyber, fontSize: 13, marginTop: 1, flexShrink: 0 }}>→</span>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>{q}</p>
                  </div>
                ))}
              </div>

              <div style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${COLORS.accentAI}`,
                borderRadius: 10,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.accentAI, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Lifestyle Tips
                </p>
                {analysis.lifestyleTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: COLORS.accentAI, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✦</span>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.textDim, lineHeight: 1.6 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}