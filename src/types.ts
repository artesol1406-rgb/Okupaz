export type ExerciseCategory = 'manos' | 'coordinacion' | 'memoria' | 'fuerza' | 'autonomia';

export interface ExerciseStep {
  stepNumber: number;
  instruction: string;
  visualHint: string;
}

export interface Exercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  level: number;
  unit: string;
  description: string;
  benefit: string;
  steps: ExerciseStep[];
  durationSeconds: number;
  repetitions: number;
  animationType: 'hand_flex' | 'finger_pinch' | 'wrist_rotate' | 'arm_raise' | 'chair_stand' | 'object_match';
  targetJoint: string;
  iconName: string;
  difficulty: 'fácil' | 'medio' | 'avanzado';
  recommendedTimesPerDay: number;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  painLevel: 0 | 1 | 2 | 3; // 0: Sin dolor, 1: Leve, 2: Moderado, 3: Severo
  completed: boolean;
  notes?: string;
  xpEarned: number;
}

export interface ScheduleItem {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  category: ExerciseCategory;
  timeSlot: 'mañana' | 'tarde' | 'noche';
  timeString: string; // e.g. "09:00 AM"
  daysOfWeek: number[]; // 0: Sun, 1: Mon, ...
  completedToday: boolean;
}

export interface DementiaQuestion {
  id: string;
  section: string;
  questionText: string;
  instruction: string;
  type: 'multiple_choice' | 'number_input' | 'memory_words' | 'memory_recall' | 'image_recognition' | 'spatial_pattern';
  options?: string[];
  correctAnswer?: string | number | string[];
  imageUrl?: string;
  wordItems?: { word: string; icon: string }[];
  hint?: string;
}

export interface DementiaTestResult {
  id: string;
  date: string;
  totalScore: number;
  maxScore: number; // 30
  scoresBySection: {
    orientation: number;
    memoryImmediate: number;
    calculation: number;
    memoryRecall: number;
    language: number;
    spatial: number;
  };
  severityLabel: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

export interface UserSettings {
  highContrast: boolean;
  fontSize: 'normal' | 'grande' | 'extra-grande'; // controls rem scale
  ttsEnabled: boolean;
  language: 'es' | 'en' | 'de';
  patientName: string;
  patientAge: number;
  caregiverPhone: string;
  primaryFocus?: string;
  hasCompletedOnboarding?: boolean;
  dailyGoalXp: number;
  currentStreak: number;
  totalXp: number;
  hearts: number;
}
