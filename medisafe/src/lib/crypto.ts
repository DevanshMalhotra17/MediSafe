export async function SHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function privacyScore(text: string): number {
  let score = 0;
  if (/glucose|hba1c|diabetes/i.test(text)) score += 20;
  if (/cholesterol|ldl|hdl|triglyceride/i.test(text)) score += 15;
  if (/hemoglobin|wbc|rbc|platelet/i.test(text)) score += 10;
  if (/creatinine|kidney|liver|alt|ast/i.test(text)) score += 15;
  if (/tsh|thyroid|hormone/i.test(text)) score += 15;
  if (/hiv|hepatitis|std|cancer/i.test(text)) score += 25;
  return Math.min(score, 100);
}