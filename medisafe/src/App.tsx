import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContextBanner from './components/ContextBanner';
import LabModule from './components/LabModule';
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

  function renderContent() {
    switch (active) {
      case 'lab':
        return <LabModule profile={profile} onProfileUpdate={updateProfile} />;
      default:
        return (
          <p style={{ color: COLORS.textMuted, fontSize: 15 }}>Coming soon.</p>
        );
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg, fontFamily: FONTS.body }}>
      <Sidebar active={active} onSelect={setActive} lastUpdated={profile.lastUpdated} />
      <main style={{ flex: 1, padding: '32px 36px', color: COLORS.text, maxWidth: 860 }}>
        <ContextBanner profile={profile} />
        {renderContent()}
      </main>
    </div>
  );
}