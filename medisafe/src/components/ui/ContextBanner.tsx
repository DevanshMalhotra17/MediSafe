import { COLORS, FONTS } from '../../lib/constants';
import type { HealthProfile } from '../../lib/types';

interface Props {
  profile: HealthProfile;
}

export default function ContextBanner({ profile }: Props) {
  if (!profile.labAnalysis) return null;

  const abnormal = profile.labAnalysis.values.filter(v => v.status !== 'normal').length;
  const total = profile.labAnalysis.values.length;

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${COLORS.accent}`,
      borderRadius: 10,
      padding: '10px 16px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: FONTS.body,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🩸</span>
        <span style={{ fontSize: 13, color: COLORS.textDim }}>
          Health profile active —
        </span>
        <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>
          {total} values loaded, {abnormal} flagged
        </span>
      </div>
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>
        All modules are personalized to your results
      </span>
    </div>
  );
}