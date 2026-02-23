import { COLORS, FONTS, NAV_ITEMS } from '../lib/constants';

interface Props {
  active: string;
  onSelect: (id: string) => void;
  lastUpdated: string | null;
}

export default function Sidebar({ active, onSelect, lastUpdated }: Props) {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: COLORS.surface,
      borderRight: `1px solid ${COLORS.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      fontFamily: FONTS.body
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚕️</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>MediSafe</span>
        </div>
        {lastUpdated && (
          <p style={{ margin: '6px 0 0', fontSize: 11, color: COLORS.textMuted }}>
            Updated {lastUpdated}
          </p>
        )}
      </div>

      <nav style={{ padding: '16px 10px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? COLORS.accent + '18' : 'transparent',
                color: isActive ? COLORS.accent : COLORS.textDim,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                marginBottom: 2,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

    <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}` }}>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>
          NOTE: This app provides general information only and is not a substitute for professional medical advice.
        </p>
      </div>
    </aside>
  );
}