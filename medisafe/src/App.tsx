import { useState } from 'react';
import Sidebar from './components/ui/Sidebar';
import ContextBanner from './components/ui/ContextBanner';
import { COLORS, FONTS } from './lib/constants';
import type { HealthProfile } from './lib/types';

const INITIAL_PROFILE: HealthProfile = {
  labRawText: '',
  labAnalysis: null,
  medications: [],
  lastUpdated: null,
};

export default function App() {
  const [active, setActive] = useState('lab');
  const [profile, setProfile] = useState<HealthProfile>(INITIAL_PROFILE);

  function updateProfile(partial: Partial<HealthProfile>) {
    setProfile(prev => ({ ...prev, ...partial }));
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg, fontFamily: FONTS.body }}>
      <Sidebar active={active} onSelect={setActive} lastUpdated={profile.lastUpdated} />
      <main style={{ flex: 1, padding: '32px 36px', color: COLORS.text, maxWidth: 860 }}>
        <ContextBanner profile={profile} />
        <p style={{ color: COLORS.textMuted }}>Select a module from the sidebar.</p>
      </main>
    </div>
  );
}