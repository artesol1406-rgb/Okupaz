import { ExerciseLog, ScheduleItem, DementiaTestResult, UserSettings, ChatMessage } from '../types';
import { EXERCISES_DATA } from '../data/exercisesData';

const SETTINGS_KEY = 'ot_senior_settings_v1';
const LOGS_KEY = 'ot_senior_logs_v1';
const SCHEDULE_KEY = 'ot_senior_schedule_v1';
const DEMENTIA_TESTS_KEY = 'ot_senior_dementia_tests_v1';
const CHAT_KEY = 'ot_senior_chat_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  highContrast: false,
  fontSize: 'grande',
  ttsEnabled: true,
  language: 'es',
  patientName: 'Rosa María González',
  patientAge: 78,
  caregiverPhone: '+52 55 1234 5678',
  dailyGoalXp: 50,
  currentStreak: 5,
  totalXp: 340,
  hearts: 5,
};

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.language) parsed.language = 'es';
      return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredLogs(): ExerciseLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  // Initial seed log for history context
  return [
    {
      id: 'log-1',
      exerciseId: 'hand-flex-1',
      exerciseTitle: 'Abrir y Cerrar Puño',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      time: '09:30',
      painLevel: 1,
      completed: true,
      notes: 'Sintió leve rigidez al inicio pero luego mejoró.',
      xpEarned: 20
    },
    {
      id: 'log-2',
      exerciseId: 'pinch-button-2',
      exerciseTitle: 'Pinza Digital con Botón',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: '11:15',
      painLevel: 0,
      completed: true,
      notes: 'Hizo 8 repeticiones sin molestias.',
      xpEarned: 25
    }
  ];
}

export function saveLog(log: ExerciseLog): ExerciseLog[] {
  const current = getStoredLogs();
  const updated = [log, ...current];
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn(e);
  }
  return updated;
}

export function getStoredSchedule(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  // Default Schedule items based on exercises
  return [
    {
      id: 'sch-1',
      exerciseId: 'hand-flex-1',
      exerciseTitle: 'Abrir y Cerrar Puño',
      category: 'manos',
      timeSlot: 'mañana',
      timeString: '09:00 AM',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      completedToday: true
    },
    {
      id: 'sch-2',
      exerciseId: 'pinch-button-2',
      exerciseTitle: 'Pinza Digital con Botón',
      category: 'manos',
      timeSlot: 'mañana',
      timeString: '10:30 AM',
      daysOfWeek: [1, 3, 5],
      completedToday: false
    },
    {
      id: 'sch-3',
      exerciseId: 'pattern-match-6',
      exerciseTitle: 'Secuencia de Toques y Memoria',
      category: 'memoria',
      timeSlot: 'tarde',
      timeString: '03:00 PM',
      daysOfWeek: [1, 2, 3, 4, 5],
      completedToday: false
    },
    {
      id: 'sch-4',
      exerciseId: 'chair-stand-8',
      exerciseTitle: 'Levantarse de la Silla Seguro',
      category: 'autonomia',
      timeSlot: 'noche',
      timeString: '06:30 PM',
      daysOfWeek: [2, 4, 6],
      completedToday: false
    }
  ];
}

export function saveSchedule(items: ScheduleItem[]): void {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredTestResults(): DementiaTestResult[] {
  try {
    const raw = localStorage.getItem(DEMENTIA_TESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return [
    {
      id: 'test-init-1',
      date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      totalScore: 26,
      maxScore: 30,
      scoresBySection: {
        orientation: 5,
        memoryImmediate: 5,
        calculation: 4,
        memoryRecall: 4,
        language: 5,
        spatial: 3
      },
      severityLabel: 'Sin deterioro aparente',
      notes: 'Buen estado general. Pequeña duda en el cálculo diferido.'
    }
  ];
}

export function saveTestResult(result: DementiaTestResult): DementiaTestResult[] {
  const current = getStoredTestResults();
  const updated = [result, ...current];
  try {
    localStorage.setItem(DEMENTIA_TESTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn(e);
  }
  return updated;
}

export function getStoredChat(lang: string = 'es'): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }

  const greeting =
    lang === 'de'
      ? 'Hallo! Ich bin Rita, Ihre Ergotherapie-Begleiterin. Wie fühlen sich Ihre Hände und Gelenke heute an?'
      : lang === 'en'
      ? 'Hello! I am Rita, your occupational therapy guide. How are your hands and joints feeling today?'
      : '¡Hola! Soy Rita, tu guía de terapia ocupacional. ¿Cómo amanecieron hoy tus manos y tus articulaciones?';

  return [
    {
      id: 'chat-1',
      sender: 'assistant',
      text: greeting,
      timestamp: '09:00 AM'
    }
  ];
}

export function saveChat(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn(e);
  }
}
