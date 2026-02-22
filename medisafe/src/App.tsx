import { callAPI } from './lib/ai';

export default function App() {
  async function test() {
    const res = await callAPI('You are helpful.', 'Say hello in 5 words.');
    console.log('AI says:', res);
  }
  return (
      <div style={{ padding: 40, background: '#0F1117', minHeight: '100vh' }}>
        <h1 style={{ color: 'white' }}>MediSafe</h1>
        <button onClick={test} style={{ color: 'white', background: '#4ADE80', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Test AI
        </button>
      </div>
  );
}