import { useState } from 'react';
import { COLORS, FONTS, SAMPLE_LAB } from '../lib/constants';
import { callAPI, parseJSON } from '../lib/ai';
import type { HealthProfile, LabAnalysis } from '../lib/types';

const SYSTEM = `You are a medical data interpreter. The user will paste raw lab results.
Return ONLY valid JSON in this exact shape, no markdown, no extra text:
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

interface Props {
  profile: HealthProfile;
  onProfileUpdate: (p: Partial<HealthProfile>) => void;
}

export default function LabModule({ profile, onProfileUpdate }: Props) {
  const [text, setText] = useState(profile.labRawText || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.text,
            fontFamily: FONTS.mono,
            fontSize: 13,
            padding: '12px 14px',
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.7,
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setText(SAMPLE_LAB)}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: 'transparent',
              color: COLORS.textDim,
              fontSize: 13,
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
              background: loading ? COLORS.border : text.trim() ? COLORS.accent : COLORS.border,
              color: loading ? COLORS.textMuted : text.trim() ? '#0F1117' : COLORS.textMuted,
              fontWeight: 700,
              fontSize: 14,
              flex: 1,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Results'}
          </button>
        </div>
        {error && <p style={{ color: COLORS.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      </div>
    </div>
  );
}