import React, { useEffect, useState } from 'react';
import {
  Flame,
  Star,
  Calendar,
  Brain,
  MessageCircle,
  FileText,
  Eye,
  Volume2,
  VolumeX,
  Type,
  Activity,
  Heart,
  Globe,
  Pause,
  Play,
  Square,
  UserCog
} from 'lucide-react';
import { UserSettings } from '../types';
import { getTranslation, Language } from '../lib/i18n';
import {
  subscribeSpeechStatus,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking
} from '../lib/tts';

interface Props {
  activeTab: 'path' | 'schedule' | 'dementia' | 'chat' | 'report';
  setActiveTab: (tab: 'path' | 'schedule' | 'dementia' | 'chat' | 'report') => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  onOpenOnboarding,
}) => {
  const { highContrast, ttsEnabled, currentStreak, totalXp, hearts, fontSize, language = 'es', patientName } = settings;
  const t = getTranslation(language);

  const [speechStatus, setSpeechStatus] = useState<'speaking' | 'paused' | 'idle'>('idle');

  useEffect(() => {
    const unsubscribe = subscribeSpeechStatus((status) => {
      setSpeechStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const cycleFontSize = () => {
    if (fontSize === 'normal') updateSettings({ fontSize: 'grande' });
    else if (fontSize === 'grande') updateSettings({ fontSize: 'extra-grande' });
    else updateSettings({ fontSize: 'normal' });
  };

  const cycleLanguage = () => {
    const langs: Language[] = ['es', 'en', 'de'];
    const currentIndex = langs.indexOf(language);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    updateSettings({ language: nextLang });
  };

  return (
    <header className={`sticky top-0 z-40 w-full shadow-md transition-colors ${
      highContrast ? 'bg-black text-yellow-300 border-b-4 border-yellow-400' : 'bg-white text-slate-800 border-b-2 border-slate-200'
    }`}>
      {/* Dynamic Floating Voice Control Bar when speech is active or paused */}
      {speechStatus !== 'idle' && (
        <div className={`w-full py-2 px-4 flex items-center justify-between gap-3 text-sm font-bold animate-pulse ${
          highContrast ? 'bg-yellow-400 text-black' : 'bg-amber-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <Volume2 size={22} className="animate-bounce" />
            <span>
              {speechStatus === 'speaking' ? t.voiceControl.speaking : t.voiceControl.paused}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Pause / Resume Button */}
            {speechStatus === 'speaking' ? (
              <button
                onClick={pauseSpeaking}
                className="px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-xl flex items-center gap-1 text-white font-black transition border border-white/30"
                title={t.voiceControl.pause}
              >
                <Pause size={18} />
                <span>{t.voiceControl.pause}</span>
              </button>
            ) : (
              <button
                onClick={resumeSpeaking}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-800 rounded-xl flex items-center gap-1 text-white font-black transition shadow"
                title={t.voiceControl.resume}
              >
                <Play size={18} />
                <span>{t.voiceControl.resume}</span>
              </button>
            )}

            {/* Stop Button */}
            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 rounded-xl flex items-center gap-1 text-white font-black transition shadow"
              title={t.voiceControl.stop}
            >
              <Square size={18} />
              <span>{t.voiceControl.stop}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner with Senior Accessibility Controls & Gamification Stats */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Name & Patient Badge */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl flex items-center justify-center font-black ${
            highContrast ? 'bg-yellow-400 text-black' : 'bg-green-600 text-white'
          }`}>
            <Activity size={32} />
          </div>
          <div>
            <h1 className="font-black text-2xl md:text-3xl tracking-tight leading-none flex items-center gap-2">
              <span>{t.brandName}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-800'
              }`}>{t.brandBadge}</span>
            </h1>
            {/* Patient Name Badge & Edit Profile Trigger */}
            {patientName && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="mt-1 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200"
                title={t.onboarding.editProfileBtn}
              >
                <UserCog size={14} className="text-green-600" />
                <span>{patientName} ({settings.patientAge} {t.reportView.years})</span>
              </button>
            )}
          </div>
        </div>

        {/* Duolingo Gamification Counters */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          {/* Streak */}
          <div className="flex items-center gap-1.5 font-black text-lg text-orange-600">
            <Flame size={26} className="fill-orange-500 animate-bounce" />
            <span>{currentStreak} <span className="text-xs text-slate-500 hidden sm:inline">{t.stats.days}</span></span>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700" />

          {/* XP */}
          <div className="flex items-center gap-1.5 font-black text-lg text-amber-500">
            <Star size={26} className="fill-amber-400" />
            <span>{totalXp} <span className="text-xs text-slate-500 hidden sm:inline">{t.stats.xp}</span></span>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700" />

          {/* Hearts */}
          <div className="flex items-center gap-1.5 font-black text-lg text-rose-600">
            <Heart size={26} className="fill-rose-500" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* Senior Accessibility Quick Toggles */}
        <div className="flex items-center gap-2">
          {/* Language Selector Toggle */}
          <button
            onClick={cycleLanguage}
            className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-1.5 border-2 transition ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
            }`}
            title="Cambiar idioma / Switch language / Sprache wechseln"
          >
            <Globe size={20} />
            <span className="uppercase font-black">{language === 'es' ? '🇪🇸 ES' : language === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}</span>
          </button>

          {/* High Contrast Button */}
          <button
            onClick={() => updateSettings({ highContrast: !highContrast })}
            className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 border-2 transition ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title={t.accessibility.contrast}
          >
            <Eye size={20} />
            <span className="hidden md:inline">{highContrast ? t.accessibility.contrastOn : t.accessibility.contrast}</span>
          </button>

          {/* Text to Speech Toggle */}
          <button
            onClick={() => updateSettings({ ttsEnabled: !ttsEnabled })}
            className={`p-2.5 rounded-xl font-bold border-2 transition ${
              ttsEnabled
                ? highContrast ? 'bg-green-400 text-black border-green-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-400 border-slate-300'
            }`}
            title={ttsEnabled ? 'Voz Activada' : 'Voz Desactivada'}
          >
            {ttsEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          {/* Font Size Selector */}
          <button
            onClick={cycleFontSize}
            className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-1 border-2 transition ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
            }`}
            title="Tamaño de letra"
          >
            <Type size={18} />
            <span className="uppercase">{fontSize === 'normal' ? '1x' : fontSize === 'grande' ? '2x' : '3x'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Bar with LARGE Senior-Friendly Buttons */}
      <nav className={`w-full border-t ${highContrast ? 'border-yellow-400 bg-black' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-2 py-2 flex items-center justify-around gap-1 md:gap-3 overflow-x-auto">
          {/* Tab 1: Ejercicios / Ruta */}
          <button
            onClick={() => setActiveTab('path')}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl font-black text-base md:text-lg flex flex-col md:flex-row items-center justify-center gap-1.5 transition border-2 ${
              activeTab === 'path'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-102'
                  : 'bg-green-600 text-white border-green-700 shadow-md scale-102'
                : highContrast
                  ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Activity size={26} />
            <span>{t.tabs.path}</span>
          </button>

          {/* Tab 2: Horario y Agenda */}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl font-black text-base md:text-lg flex flex-col md:flex-row items-center justify-center gap-1.5 transition border-2 ${
              activeTab === 'schedule'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-102'
                  : 'bg-blue-600 text-white border-blue-700 shadow-md scale-102'
                : highContrast
                  ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar size={26} />
            <span>{t.tabs.schedule}</span>
          </button>

          {/* Tab 3: Test Cognitivo (Demencia) */}
          <button
            onClick={() => setActiveTab('dementia')}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl font-black text-base md:text-lg flex flex-col md:flex-row items-center justify-center gap-1.5 transition border-2 ${
              activeTab === 'dementia'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-102'
                  : 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
                : highContrast
                  ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Brain size={26} />
            <span>{t.tabs.dementia}</span>
          </button>

          {/* Tab 4: Chat con Rita (IA) */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl font-black text-base md:text-lg flex flex-col md:flex-row items-center justify-center gap-1.5 transition border-2 ${
              activeTab === 'chat'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-102'
                  : 'bg-teal-600 text-white border-teal-700 shadow-md scale-102'
                : highContrast
                  ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MessageCircle size={26} />
            <span>{t.tabs.chat}</span>
          </button>

          {/* Tab 5: Reporte Médico */}
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-2xl font-black text-base md:text-lg flex flex-col md:flex-row items-center justify-center gap-1.5 transition border-2 ${
              activeTab === 'report'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-102'
                  : 'bg-rose-600 text-white border-rose-700 shadow-md scale-102'
                : highContrast
                  ? 'bg-zinc-900 text-yellow-200 border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText size={26} />
            <span>{t.tabs.report}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
