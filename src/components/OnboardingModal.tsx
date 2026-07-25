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
  Award
} from 'lucide-react';
import { UserSettings } from '../types';
import { getTranslation, Language } from '../lib/i18n';
import { speakText } from '../lib/tts';

interface Props {
  settings: UserSettings;
  onSaveOnboarding: (updated: Partial<UserSettings>) => void;
  isOpen: boolean;
  onClose?: () => void;
  isEditing?: boolean;
}

export const OnboardingModal: React.FC<Props> = ({
  settings,
  onSaveOnboarding,
  isOpen,
  onClose,
  isEditing = false,
}) => {
  const [patientName, setPatientName] = useState(settings.patientName || '');
  const [patientAge, setPatientAge] = useState<number>(settings.patientAge || 78);
  const [language, setLanguage] = useState<Language>(settings.language || 'es');
  const [primaryFocus, setPrimaryFocus] = useState<string>(settings.primaryFocus || 'todas');
  const [caregiverPhone, setCaregiverPhone] = useState(settings.caregiverPhone || '');
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled ?? true);
  const [fontSize, setFontSize] = useState<'normal' | 'grande' | 'extra-grande'>(settings.fontSize || 'grande');
  const [highContrast, setHighContrast] = useState(settings.highContrast ?? false);

  const t = getTranslation(language);

  // Announce welcome message on mount if TTS enabled
  useEffect(() => {
    if (isOpen) {
      setPatientName(settings.patientName || '');
      setPatientAge(settings.patientAge || 78);
      setLanguage(settings.language || 'es');
      setPrimaryFocus(settings.primaryFocus || 'todas');
      setCaregiverPhone(settings.caregiverPhone || '');
      setTtsEnabled(settings.ttsEnabled ?? true);
      setFontSize(settings.fontSize || 'grande');
      setHighContrast(settings.highContrast ?? false);

      speakText(
        isEditing
          ? 'Pantalla de edición de datos del paciente.'
          : '¡Bienvenido a OcuPaz Senior! Por favor ingresa los datos del paciente para personalizar tus ejercicios.',
        settings.ttsEnabled,
        settings.language || 'es'
      );
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
    const focusNames: Record<string, string> = {
      manos: 'Salud de Manos y Dedos',
      memoria: 'Memoria y Agilidad Mental',
      autonomia: 'Autonomía e Independencia Diaria',
      todas: 'Rutina Completa e Integral',
    };
    speakText(`Enfoque seleccionado: ${focusNames[focusKey] || focusKey}`, ttsEnabled, language);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = patientName.trim() || (language === 'de' ? 'Lieber Nutzer' : language === 'en' ? 'Dear Patient' : 'Paciente Senior');

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
      welcomeGreeting = `Willkommen ${finalName}! Ihre Ergotherapie-Sitzung ist jetzt bereit.`;
    } else if (language === 'en') {
      welcomeGreeting = `Welcome ${finalName}! Your Occupational Therapy path is ready.`;
    } else {
      welcomeGreeting = `¡Bienvenido(a) ${finalName}! Tu rutina personalizada de Terapia Ocupacional está lista.`;
    }

    speakText(welcomeGreeting, ttsEnabled, language);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden border-4 transition-all ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 sm:p-8 text-center relative ${
            highContrast ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-green-600 via-teal-600 to-emerald-700 text-white'
          }`}
        >
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-3 shadow-inner">
            <Activity size={44} className="animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {t.onboarding.welcomeTitle}
          </h2>
          <p className="text-lg sm:text-xl font-medium mt-2 max-w-lg mx-auto opacity-95">
            {t.onboarding.welcomeSubtitle}
          </p>

          {/* Language quick switcher at top */}
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
          {/* Section 1: Patient Details */}
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
                  placeholder={t.onboarding.patientNamePlaceholder}
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
                  color: 'border-amber-500 bg-amber-50 text-amber-900',
                },
                {
                  id: 'memoria',
                  icon: Brain,
                  title: t.onboarding.focusOptions.memoria,
                  color: 'border-purple-500 bg-purple-50 text-purple-900',
                },
                {
                  id: 'autonomia',
                  icon: ShieldCheck,
                  title: t.onboarding.focusOptions.autonomia,
                  color: 'border-blue-500 bg-blue-50 text-blue-900',
                },
                {
                  id: 'todas',
                  icon: Award,
                  title: t.onboarding.focusOptions.todas,
                  color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
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

          {/* Primary Submit Button */}
          <div className="pt-2">
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
          </div>
        </form>
      </div>
    </div>
  );
};
