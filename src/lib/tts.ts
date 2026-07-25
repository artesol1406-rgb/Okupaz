// Text-to-Speech utility with Pause, Resume, Stop controls and German/English/Spanish support

type SpeechStatus = 'speaking' | 'paused' | 'idle';
type Listener = (status: SpeechStatus) => void;

let currentStatus: SpeechStatus = 'idle';
const listeners: Set<Listener> = new Set();

function notifyListeners(status: SpeechStatus) {
  currentStatus = status;
  listeners.forEach((listener) => listener(status));
}

export function subscribeSpeechStatus(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

export function getSpeechStatus(): SpeechStatus {
  return currentStatus;
}

export function speakText(text: string, enabled: boolean = true, lang: 'es' | 'en' | 'de' = 'es') {
  if (!enabled) return;
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop current speaking if any

    const utterance = new SpeechSynthesisUtterance(text);

    // Map language code
    const langCodeMap: Record<string, string> = {
      es: 'es-ES',
      en: 'en-US',
      de: 'de-DE',
    };

    const targetLang = langCodeMap[lang] || 'es-ES';
    utterance.lang = targetLang;
    utterance.rate = 0.88; // Slightly slower, clear pace for senior comprehension
    utterance.pitch = 1.0;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang;
    const matchedVoice =
      voices.find((v) => v.lang.startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Natural'))) ||
      voices.find((v) => v.lang.startsWith(langPrefix));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      notifyListeners('speaking');
    };

    utterance.onend = () => {
      notifyListeners('idle');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      notifyListeners('idle');
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis error:', e);
    notifyListeners('idle');
  }
}

export function pauseSpeaking() {
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      notifyListeners('paused');
    }
  }
}

export function resumeSpeaking() {
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      notifyListeners('speaking');
    }
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    notifyListeners('idle');
  }
}
