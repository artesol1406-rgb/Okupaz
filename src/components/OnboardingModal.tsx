import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Heart,
  Globe,
  Phone,
  CheckCircle2,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Sparkles,
  ArrowRight,
  Hand,
  Brain,
  ShieldCheck,
  Award,
  RotateCcw,
  Bot,
  Play
} from 'lucide-react';
import { UserSettings } from '../types';
import { getTranslation, Language } from '../lib/i18n';
import { speakText } from '../lib/tts';
import { IntroAnimationCanvas } from './IntroAnimationCanvas';
import { ECGLandscapeLogoIcon } from './ECGLandscapeLogoIcon';

interface Props {
  settings: UserSettings;
  onSaveOnboarding: (updated: Partial<UserSettings>) => void;
  isOpen: boolean;
  onClose?: () => void;
  isEditing?: boolean;
  onResetApp?: () => void;
}

export const OnboardingModal: React.FC<Props> = ({
  settings,
  onSaveOnboarding,
  isOpen,
  onClose,
  isEditing = false,
  onResetApp,
}) => {
  // Wizard steps: 'intro' | 'voice' | 'form'
  const [step, setStep] = useState<'intro' | 'voice' | 'form'>(isEditing ? 'form' : 'intro');

  const [patientName, setPatientName] = useState(settings.patientName || '');
  const [patientAge, setPatientAge] = useState<number>(settings.patientAge || 78);
  const [language, setLanguage] = useState<Language>(settings.language || 'es');
  const [primaryFocus, setPrimaryFocus] = useState<string>(settings.primaryFocus || 'todas');
  const [caregiverPhone, setCaregiverPhone] = useState(settings.caregiverPhone || '');
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled ?? true);
  const [fontSize, setFontSize] = useState<'normal' | 'grande' | 'extra-grande'>(settings.fontSize || 'grande');
  const [highContrast, setHighContrast] = useState(settings.highContrast ?? false);

  const t = getTranslation(language);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(isEditing ? 'form' : 'intro');
      setPatientName(settings.patientName || '');
      setPatientAge(settings.patientAge || 78);
      setLanguage(settings.language || 'es');
      setPrimaryFocus(settings.primaryFocus || 'todas');
      setCaregiverPhone(settings.caregiverPhone || '');
      setTtsEnabled(settings.ttsEnabled ?? true);
      setFontSize(settings.fontSize || 'grande');
      setHighContrast(settings.highContrast ?? false);
    }
  }, [isOpen, isEditing]);

  if (!isOpen) return null;

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    speakText(
      newLang === 'es'
        ? 'Idioma seleccionado: Español'
        : newLang === 'en'
        ? 'Selected language: English'
        : 'Ausgewählte Sprache: Deutsch',
      ttsEnabled,
      newLang
    );
  };

  const handleFocusSelect = (focusKey: string) => {
    setPrimaryFocus(focusKey);
    const focusNames: Record<Language, Record<string, string>> = {
      es: {
        manos: 'Salud de Manos y Dedos',
        memoria: 'Memoria y Agilidad Mental',
        autonomia: 'Autonomía e Independencia Diaria',
        todas: 'Rutina Completa e Integral',
      },
      en: {
        manos: 'Hand & Finger Health',
        memoria: 'Memory & Mental Agility',
        autonomia: 'Daily Independence',
        todas: 'Comprehensive Routine',
      },
      de: {
        manos: 'Hand- und Fingergesundheit',
        memoria: 'Gedächtnis und mentale Agilität',
        autonomia: 'Tägliche Selbstständigkeit',
        todas: 'Umfassende Routine',
      },
    };
    const langDict = focusNames[language] || focusNames['es'];
    const focusLabel = langDict[focusKey] || focusKey;
    const prefix = language === 'de' ? 'Ausgewählter Schwerpunkt' : language === 'en' ? 'Selected focus' : 'Enfoque seleccionado';
    speakText(`${prefix}: ${focusLabel}`, ttsEnabled, language);
  };

  const handleSelectVoiceOption = (enableVoice: boolean) => {
    setTtsEnabled(enableVoice);
    if (enableVoice) {
      const voiceGreet =
        language === 'de'
          ? 'Hallo! Ich bin Rita, Ihre Sprachassistentin. Ich begleite Sie Schritt für Schritt bei jeder Übung.'
          : language === 'en'
          ? 'Hello! I am Rita, your voice guide. I will accompany you step by step through every exercise.'
          : '¡Hola! Soy Rita, tu asistente de voz. Estaré a tu lado para guiarte en cada ejercicio con calma y paciencia.';
      speakText(voiceGreet, true, language);
    }
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = patientName.trim() || (language === 'de' ? 'Lieber Nutzer' : language === 'en' ? 'Dear Patient' : 'Rosa María');

    const updated: Partial<UserSettings> = {
      patientName: finalName,
      patientAge: Number(patientAge) || 75,
      language,
      primaryFocus,
      caregiverPhone,
      ttsEnabled,
      fontSize,
      highContrast,
      hasCompletedOnboarding: true,
    };

    onSaveOnboarding(updated);

    let welcomeGreeting = "";
    if (language === 'de') {
      welcomeGreeting = `Es ist mir eine große Freude, Sie kennenzulernen, ${finalName}! Ihre Ergotherapie ist bereit.`;
    } else if (language === 'en') {
      welcomeGreeting = `It is a pleasure to meet you, ${finalName}! Your occupational therapy path is ready.`;
    } else {
      welcomeGreeting = `¡Es un verdadero gusto conocerte, ${finalName}! Tu rutina personalizada de Terapia Ocupacional está lista.`;
    }

    speakText(welcomeGreeting, ttsEnabled, language);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden border-4 transition-all ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {/* STEP 1: ANIMATED INTRO CANVAS (ECG Mandala -> Landscape Logo) */}
        {step === 'intro' && (
          <div className="p-4 sm:p-6 space-y-4">
            <IntroAnimationCanvas
              onComplete={() => setStep('voice')}
              language={language}
              ttsEnabled={ttsEnabled}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {(['es', 'en', 'de'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 rounded-xl font-black text-sm transition ${
                      language === lang
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {lang === 'es' ? '🇪🇸 ES' : lang === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep('voice')}
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg flex items-center gap-2 shadow-lg transition transform active:scale-95"
              >
                <span>{language === 'de' ? 'Weiter' : language === 'en' ? 'Continue' : 'Continuar'}</span>
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VOICE ASSISTANT QUESTION */}
        {step === 'voice' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Logo Badge */}
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-3xl mb-2">
              <ECGLandscapeLogoIcon size={64} />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                {language === 'de'
                  ? 'Willkommen bei OcuPaz Senior'
                  : language === 'en'
                  ? 'Welcome to OcuPaz Senior'
                  : '¡Te Damos la Bienvenida a OcuPaz Senior!'}
              </h2>
              <p className="text-lg sm:text-xl font-medium max-w-lg mx-auto opacity-90">
                {language === 'de'
                  ? 'Möchten Sie den Sprachassistenten (Rita) aktivieren, um alle Übungen vorgelesen zu bekommen?'
                  : language === 'en'
                  ? 'Would you like to activate the Voice Assistant (Rita) to guide you out loud through every exercise?'
                  : '¿Deseas activar el Asistente de Voz (Rita) para que te lea las instrucciones y te acompañe en tus ejercicios?'}
              </p>
            </div>

            {/* Big Voice Assistant Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
              {/* Option A: YES Voice */}
              <button
                type="button"
                onClick={() => handleSelectVoiceOption(true)}
                className={`p-6 rounded-3xl border-4 text-left font-black flex flex-col justify-between transition shadow-xl transform active:scale-95 ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 hover:from-emerald-700 hover:to-teal-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Volume2 size={40} className="animate-bounce" />
                  <span className="px-3 py-1 rounded-full text-xs bg-white/20 uppercase tracking-wider font-extrabold">
                    {language === 'de' ? 'Empfohlen' : language === 'en' ? 'Recommended' : 'Recomendado'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1">
                    {language === 'de' ? 'JA, Sprachassistent' : language === 'en' ? 'YES, Voice Assistant' : 'SÍ, Activar Asistente de Voz'}
                  </h3>
                  <p className="text-sm font-medium opacity-90">
                    {language === 'de'
                      ? 'Rita spricht mit Ihnen und leitet Sie freundlich an.'
                      : language === 'en'
                      ? 'Rita will speak to you and guide you step by step.'
                      : 'Rita te hablará con voz clara, paciente y pausada.'}
                  </p>
                </div>
              </button>

              {/* Option B: NO Voice */}
              <button
                type="button"
                onClick={() => handleSelectVoiceOption(false)}
                className={`p-6 rounded-3xl border-4 text-left font-black flex flex-col justify-between transition shadow-md transform active:scale-95 ${
                  highContrast
                    ? 'bg-zinc-900 text-yellow-300 border-zinc-700 hover:bg-zinc-800'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <VolumeX size={40} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1">
                    {language === 'de' ? 'NEIN, Ohne Sprache' : language === 'en' ? 'NO, Without Voice' : 'NO, Continuar sin Voz'}
                  </h3>
                  <p className="text-sm font-medium opacity-75">
                    {language === 'de'
                      ? 'Sie können die Übungen in Ruhe lesen.'
                      : language === 'en'
                      ? 'You can read instructions silently.'
                      : 'Podrás leer las instrucciones tranquilamente en pantalla.'}
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="text-sm font-bold opacity-75 hover:opacity-100 underline flex items-center justify-center gap-1 mx-auto"
              >
                <RotateCcw size={16} />
                <span>{language === 'de' ? 'Intro-Animation erneut abspielen' : language === 'en' ? 'Replay intro animation' : 'Volver a ver animación de intro'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PATIENT INFORMATION FORM */}
        {step === 'form' && (
          <div>
            {/* Header */}
            <div
              className={`p-6 sm:p-8 text-center relative ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-700 text-white'
              }`}
            >
              <div className="inline-flex p-3 bg-white/20 rounded-3xl mb-2 shadow-inner">
                <ECGLandscapeLogoIcon size={52} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {patientName ? `¡Hola, ${patientName.split(' ')[0]}!` : t.onboarding.welcomeTitle}
              </h2>
              <p className="text-lg sm:text-xl font-medium mt-1 max-w-lg mx-auto opacity-95">
                {language === 'de'
                  ? 'Bitte geben Sie Ihren Namen ein, damit Rita Sie persönlich ansprechen kann.'
                  : language === 'en'
                  ? 'Please enter your name so Rita and the app can address you warmly.'
                  : 'Ingresa tus datos para que Rita y la app se dirijan a ti por tu nombre con calidez.'}
              </p>

              {/* Language switcher */}
              <div className="mt-4 flex justify-center gap-2">
                {(['es', 'en', 'de'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1 transition ${
                      language === lang
                        ? highContrast
                          ? 'bg-black text-yellow-300 ring-2 ring-yellow-400'
                          : 'bg-white text-slate-900 shadow-md font-extrabold'
                        : 'bg-black/20 text-white/80 hover:bg-black/30'
                    }`}
                  >
                    <span>{lang === 'es' ? '🇪🇸 Español' : lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Patient Name Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex items-start gap-3">
                <Bot size={28} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  <p className="font-bold text-base mb-0.5">
                    {language === 'de' ? 'Herzlicher & Persönlicher Umgang' : language === 'en' ? 'Warm Personal Care' : 'Trato Cálido y Humano'}
                  </p>
                  <p>
                    {language === 'de'
                      ? 'Der Sprachassistent und Rita werden Ihren Namen verwenden, um Sie jederzeit freundlich zu begrüßen.'
                      : language === 'en'
                      ? 'Rita and the voice assistant will use your name to greet and encourage you warmly.'
                      : 'Rita y el asistente de voz usarán tu nombre para saludarte, motivarte y acompañarte con todo el respeto y afecto que mereces.'}
                  </p>
                </div>
              </div>

              {/* Section 1: Patient Name & Age */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 pb-2 border-slate-200 dark:border-zinc-800">
                  <User size={26} className={highContrast ? 'text-yellow-400' : 'text-green-600'} />
                  <h3 className="font-black text-xl sm:text-2xl">
                    1. {t.onboarding.patientNameLabel}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold mb-1 opacity-90">
                      {t.onboarding.patientNameLabel}
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={language === 'de' ? 'z.B. Rosa Maria' : language === 'en' ? 'e.g. Rosa Maria' : 'Ej: Rosa María / Don Juan'}
                      required
                      className={`w-full p-4 rounded-2xl text-lg font-bold border-2 transition focus:outline-none ${
                        highContrast
                          ? 'bg-zinc-900 text-yellow-300 border-yellow-400 focus:ring-2 focus:ring-yellow-300'
                          : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-green-600 focus:bg-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 opacity-90">
                      {t.onboarding.patientAgeLabel}
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      required
                      className={`w-full p-4 rounded-2xl text-lg font-bold border-2 transition focus:outline-none ${
                        highContrast
                          ? 'bg-zinc-900 text-yellow-300 border-yellow-400 focus:ring-2 focus:ring-yellow-300'
                          : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-green-600 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Therapy Focus */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 pb-2 border-slate-200 dark:border-zinc-800">
                  <Heart size={26} className={highContrast ? 'text-yellow-400' : 'text-teal-600'} />
                  <h3 className="font-black text-xl sm:text-2xl">
                    2. {t.onboarding.primaryFocusLabel}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'manos',
                      icon: Hand,
                      title: t.onboarding.focusOptions.manos,
                    },
                    {
                      id: 'memoria',
                      icon: Brain,
                      title: t.onboarding.focusOptions.memoria,
                    },
                    {
                      id: 'autonomia',
                      icon: ShieldCheck,
                      title: t.onboarding.focusOptions.autonomia,
                    },
                    {
                      id: 'todas',
                      icon: Award,
                      title: t.onboarding.focusOptions.todas,
                    },
                  ].map((opt) => {
                    const IconComponent = opt.icon;
                    const isSelected = primaryFocus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleFocusSelect(opt.id)}
                        className={`p-4 rounded-2xl border-3 text-left font-bold flex items-start gap-3 transition shadow-sm ${
                          isSelected
                            ? highContrast
                              ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400'
                              : 'bg-green-600 text-white border-green-700 ring-2 ring-green-500 shadow-md scale-101'
                            : highContrast
                            ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <IconComponent size={28} className="shrink-0 mt-0.5" />
                        <span className="text-base sm:text-lg leading-snug">{opt.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Caregiver Contact & Emergency */}
              <div className="space-y-3">
                <label className="block text-sm font-bold opacity-90 flex items-center gap-2">
                  <Phone size={20} className="text-rose-500" />
                  <span>{t.onboarding.caregiverPhoneLabel}</span>
                </label>
                <input
                  type="text"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder={t.onboarding.caregiverPhonePlaceholder}
                  className={`w-full p-4 rounded-2xl text-lg font-bold border-2 transition focus:outline-none ${
                    highContrast
                      ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
                      : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-green-600 focus:bg-white'
                  }`}
                />
              </div>

              {/* Section 4: Accessibility Quick Settings */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-black text-lg flex items-center gap-2">
                  <Sparkles size={22} className="text-amber-500" />
                  <span>Ajustes de Lectura y Voz Senior</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold">
                  {/* Voice toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextTts = !ttsEnabled;
                      setTtsEnabled(nextTts);
                      speakText(nextTts ? 'Voz guiada activada' : 'Voz desactivada', true, language);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition ${
                      ttsEnabled
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-yellow-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {ttsEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                      <span>{t.onboarding.ttsLabel}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/40 font-black">
                      {ttsEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* High Contrast toggle */}
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition ${
                      highContrast
                        ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Eye size={22} />
                      <span>{t.onboarding.highContrastLabel}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/40 font-black">
                      {highContrast ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Navigation Back / Replay Animation & Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className={`w-full py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3 transition shadow-xl transform active:scale-98 ${
                    highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-4 border-yellow-300'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/30'
                  }`}
                >
                  <CheckCircle2 size={32} />
                  <span>{t.onboarding.startBtn}</span>
                  <ArrowRight size={28} />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('intro')}
                    className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:underline flex items-center gap-1"
                  >
                    <Play size={14} />
                    <span>Ver animación de intro otra vez</span>
                  </button>

                  {onResetApp && (
                    <button
                      type="button"
                      onClick={onResetApp}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      <span>Reiniciar app por completo</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
