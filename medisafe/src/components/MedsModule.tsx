import { useState } from 'react';
import { COLORS, FONTS } from '../lib/constants';
import { callAPI, parseJSON } from '../lib/ai';
import type { HealthProfile, MedAnalysis } from '../lib/types';

const SYSTEM = `You are a clinical pharmacist assistant. The user will provide lab results analysis data.
Return ONLY valid JSON in this exact shape, no markdown, no extra text:
{
  "summary": "2-3 sentence overview of medication recommendations based on the lab findings",
  "medications": [
    {
      "name": "medication name",
      "dose": "recommended dose e.g. 500mg",
      "frequency": "e.g. twice daily with meals",
      "status": "recommended|optional|lifestyle",
      "reason": "1 sentence explaining why this is suggested based on the lab results",
      "warning": "1 sentence on key side effects or interactions to watch"
    }
  ],
  "doctorQuestions": ["Question 1", "Question 2", "Question 3"],
  "lifestyleTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

interface Props {
  profile: HealthProfile;
  onProfileUpdate: (p: Partial<HealthProfile>) => void;
}

export default function MedsModule({ profile, onProfileUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasLabs = !!profile.labAnalysis;
  const analysis = profile.medAnalysis;

  async function suggest() {
    if (!profile.labAnalysis) return;
    setLoading(true);
    setError('');
    try {
      const labSummary = JSON.stringify(profile.labAnalysis);
      const raw = await callAPI(SYSTEM, labSummary);
      const parsed = parseJSON<MedAnalysis>(raw);
      onProfileUpdate({
        medAnalysis: parsed,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch {
      setError('Could not parse response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONTS.body }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>
          Medications
        </h2>
        <p style={{ color: COLORS.textMuted, marginTop: 6, fontSize: 14 }}>
          AI-suggested medications based on your lab results. Edit if your doctor prescribed something different.
        </p>
      </div>

      {!hasLabs && (
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${COLORS.warn}`,
          borderRadius: 10,
          padding: '16px 18px',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.textMuted }}>
            No lab results found. Go to <strong style={{ color: COLORS.text }}>Lab Results</strong> and analyze your labs first.
          </p>
        </div>
      )}

      {hasLabs && (
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${COLORS.accent}`,
          borderRadius: 10,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.text, fontWeight: 600 }}>
              Lab results detected
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: COLORS.textMuted }}>
              {analysis ? 'Suggestions generated — re-run to refresh.' : `Ready to analyze your ${profile.labAnalysis!.values.length} lab values.`}
            </p>
          </div>
          <button
            onClick={suggest}
            disabled={loading}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              background: loading ? COLORS.accent + '80' : COLORS.accent,
              color: '#0F1117',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              transition: 'background 0.2s',
              animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {loading ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Suggest Medications'}
          </button>
        </div>
      )}

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

      {analysis && !loading && (
        <>
          {/* Summary */}
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

          {/* Medication Cards */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              {analysis.medications.length} Medications Suggested
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.medications.map((med, i) => (
                <div key={i} style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{med.name}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: med.status === 'recommended' ? COLORS.safe : med.status === 'optional' ? COLORS.warn : COLORS.accentCyber,
                      background: med.status === 'recommended' ? '#4ADE8018' : med.status === 'optional' ? '#FBBF2418' : '#38BDF818',
                      padding: '2px 8px',
                      borderRadius: 999,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {med.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>💊 {med.dose}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>🕐 {med.frequency}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>{med.reason}</p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.warn, lineHeight: 1.6 }}>⚠ {med.warning}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}