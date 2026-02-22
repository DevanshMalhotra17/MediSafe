import { useState } from 'react';
import Sidebar from './components/ui/Sidebar';
import { COLORS, FONTS } from './lib/constants';

export default function App() {
  const [active, setActive] = useState('lab');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg, fontFamily: FONTS.body }}>
      <Sidebar active={active} onSelect={setActive} lastUpdated={null} />
      <main style={{ flex: 1, padding: '32px 36px', color: COLORS.text }}>
        <p>Active tab: {active}</p>
      </main>
    </div>
  );
}