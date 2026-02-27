import { useState } from 'react';
import { COLORS, FONTS } from '../lib/constants';
import { callAPI, parseJSON } from '../lib/ai';
import type { HealthProfile, MedAnalysis, Medication } from '../lib/types';

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

const STATUS_COLOR: Record<string, string> = {
  recommended: COLORS.safe,
  optional:    COLORS.warn,
  lifestyle:   COLORS.accentCyber,
};

const STATUS_BG: Record<string, string> = {
  recommended: '#4ADE8018',
  optional:    '#FBBF2418',
  lifestyle:   '#38BDF818',
};

interface EditableMed {
  name: string;
  dose: string;
  frequency: string;
  status: 'recommended' | 'optional' | 'lifestyle';
  reason: string;
  warning: string;
}

interface Props {
  profile: HealthProfile;
  onProfileUpdate: (p: Partial<HealthProfile>) => void;
}

export default function MedsModule({ profile, onProfileUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditableMed | null>(null);

  // Manual add state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDose, setAddDose] = useState('');
  const [addFrequency, setAddFrequency] = useState('');

  const hasLabs = !!profile.labAnalysis;
  const analysis = profile.medAnalysis;

  async function suggest() {
    if (!profile.labAnalysis) return;
    setLoading(true);
    setError('');
    try {
      const raw = await callAPI(SYSTEM, JSON.stringify(profile.labAnalysis));
      const parsed = parseJSON<MedAnalysis>(raw);
      onProfileUpdate({ medAnalysis: parsed, lastUpdated: new Date().toLocaleTimeString() });
    } catch {
      setError('Could not parse response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(i: number) {
    setEditingIndex(i);
    setEditDraft({ ...analysis!.medications[i] });
  }

  function saveEdit() {
    if (!analysis || editDraft === null || editingIndex === null) return;
    const updated = [...analysis.medications];
    updated[editingIndex] = editDraft;
    onProfileUpdate({ medAnalysis: { ...analysis, medications: updated } });
    setEditingIndex(null);
    setEditDraft(null);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditDraft(null);
  }

  function removeMed(i: number) {
    if (!analysis) return;
    const updated = analysis.medications.filter((_, idx) => idx !== i);
    onProfileUpdate({ medAnalysis: { ...analysis, medications: updated } });
  }

  function addManual() {
    if (!addName.trim() || !analysis) return;
    const newMed = {
      name: addName.trim(),
      dose: addDose.trim(),
      frequency: addFrequency.trim(),
      status: 'optional' as const,
      reason: 'Manually added by user.',
      warning: 'Consult your doctor before taking.',
    };
    onProfileUpdate({ medAnalysis: { ...analysis, medications: [...analysis.medications, newMed] } });
    setAddName('');
    setAddDose('');
    setAddFrequency('');
    setShowAdd(false);
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
            <span>⚠️</span>
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

            {/* Med Cards */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  {analysis.medications.length} Medication{analysis.medications.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowAdd(v => !v)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: 'transparent',
                    color: COLORS.textDim,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {showAdd ? 'Cancel' : '+ Add Manually'}
                </button>
              </div>

              {/* Manual Add Form */}
              {showAdd && (
                <div style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Add Medication
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Name (e.g. Metformin)" style={inputStyle} />
                    <input value={addDose} onChange={e => setAddDose(e.target.value)} placeholder="Dose (e.g. 500mg)" style={inputStyle} />
                    <input value={addFrequency} onChange={e => setAddFrequency(e.target.value)} placeholder="Frequency (e.g. 2x/day)" style={inputStyle} />
                  </div>
                  <button
                    onClick={addManual}
                    disabled={!addName.trim()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: addName.trim() ? COLORS.accent : COLORS.border,
                      color: addName.trim() ? '#0F1117' : COLORS.textMuted,
                      fontWeight: 700,
                      fontSize: 13,
                      alignSelf: 'flex-end',
                    }}
                  >
                    Add
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.medications.map((med, i) => {
                  const isEditing = editingIndex === i;
                  const color = STATUS_COLOR[med.status] ?? COLORS.textDim;
                  const bg = STATUS_BG[med.status] ?? 'transparent';

                  return (
                    <div key={i} style={{
                      background: COLORS.surface,
                      border: `1px solid ${isEditing ? color : COLORS.border}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      transition: 'border-color 0.2s',
                    }}>
                      {isEditing && editDraft ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                            <input value={editDraft.name} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} placeholder="Name" style={inputStyle} />
                            <input value={editDraft.dose} onChange={e => setEditDraft({ ...editDraft, dose: e.target.value })} placeholder="Dose" style={inputStyle} />
                            <input value={editDraft.frequency} onChange={e => setEditDraft({ ...editDraft, frequency: e.target.value })} placeholder="Frequency" style={inputStyle} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={cancelEdit} style={{ ...ghostBtn }}>Cancel</button>
                            <button onClick={saveEdit} style={{ ...ghostBtn, background: COLORS.accent, color: '#0F1117', border: 'none', fontWeight: 700 }}>Save</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{med.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, color, background: bg,
                                padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5,
                              }}>
                                {med.status}
                              </span>
                              <button onClick={() => startEdit(i)} style={{ ...ghostBtn, fontSize: 12 }}>Edit</button>
                              <button onClick={() => removeMed(i)} style={{ ...ghostBtn, fontSize: 12, color: COLORS.danger }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.danger}
                                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                              >Remove</button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <span style={{ fontSize: 12, color: COLORS.textMuted }}>💊 {med.dose}</span>
                            <span style={{ fontSize: 12, color: COLORS.textMuted }}>🕐 {med.frequency}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>{med.reason}</p>
                          <p style={{ margin: 0, fontSize: 12, color: COLORS.warn, lineHeight: 1.6 }}>⚠ {med.warning}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#0F1117',
  border: `1px solid #2A2D3E`,
  borderRadius: 8,
  color: '#E2E8F0',
  fontSize: 13,
  padding: '9px 12px',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
};

const ghostBtn: React.CSSProperties = {
  padding: '5px 12px',
  borderRadius: 6,
  border: `1px solid #2A2D3E`,
  background: 'transparent',
  color: '#94A3B8',
  fontSize: 12,
  cursor: 'pointer',
};