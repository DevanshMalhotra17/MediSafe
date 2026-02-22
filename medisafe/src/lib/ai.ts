const GeminiAPI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`;

export async function callAPI(system: string, message: string): Promise<string> {
  const res = await fetch(GeminiAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\n${message}` }] }] }),
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T;
}