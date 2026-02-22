// Health Profile
export interface HealthProfile {
  labRawText: string;
  labAnalysis: LabAnalysis | null;
  medications: Medication[];
  lastUpdated: string | null;
}

// Lab Results
export interface LabValue {
  name: string;
  value: string;
  unit: string;
  status: "normal" | "low" | "high" | "critical";
  range: string;
  explanation: string;
}

export interface LabAnalysis {
  summary: string;
  values: LabValue[];
  doctorQuestions: string[];
  lifestyleTips: string[];
}

// Medications
export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  explanation?: string;
  interactions?: string[];
}

// Meal
export interface MealAnalysis {
  headline: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  healthScore: number;
  flags: string[];
  personalizedNote: string;
}

// Fitness
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  why: string;
  completed: boolean;
}

export interface WorkoutPlan {
  headline: string;
  rationale: string;
  exercises: Exercise[];
}

// Privacy
export interface PrivacyAnalysis {
  score: number;
  hash: string;
  factors: { label: string; risk: 'low' | 'medium' | 'high'; detail: string }[];
  brokerWarnings: string[];
}

// Chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}