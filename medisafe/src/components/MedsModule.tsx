import { COLORS, FONTS } from '../lib/constants';
import type { HealthProfile } from '../lib/types';

interface Props {
  profile: HealthProfile;
  onProfileUpdate: (p: Partial<HealthProfile>) => void;
}

export default function MedsModule({ profile, onProfileUpdate }: Props) {
  const hasLabs = !!profile.labAnalysis;

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
            No lab results found. Go to <strong style={{ color: COLORS.text }}>Lab Results</strong> and analyze your labs first — medications will be suggested based on your findings.
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
              Ready to suggest medications based on your {profile.labAnalysis!.values.length} lab values.
            </p>
          </div>
          <button
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              background: COLORS.accent,
              color: '#0F1117',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            Suggest Medications
          </button>
        </div>
      )}
    </div>
  );
}