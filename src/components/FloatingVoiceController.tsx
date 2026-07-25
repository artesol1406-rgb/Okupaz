import React, { useEffect, useState } from 'react';
import { Volume2, Square, Pause, Play } from 'lucide-react';
import {
  subscribeSpeechStatus,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
} from '../lib/tts';
import { getTranslation, Language } from '../lib/i18n';

interface Props {
  language?: Language;
  highContrast?: boolean;
}

export const FloatingVoiceController: React.FC<Props> = ({
  language = 'es',
  highContrast = false,
}) => {
  const [speechStatus, setSpeechStatus] = useState<'speaking' | 'paused' | 'idle'>('idle');
  const t = getTranslation((language || 'es') as Language);

  useEffect(() => {
    const unsubscribe = subscribeSpeechStatus((status) => {
      setSpeechStatus(status);
    });
    return () => unsubscribe();
  }, []);

  if (speechStatus === 'idle') return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] p-4 rounded-3xl shadow-2xl border-4 flex items-center gap-3 animate-fade-in ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-slate-900 text-white border-rose-500'
      }`}
      style={{ maxWidth: '90vw' }}
    >
      <div className="flex items-center gap-2 pr-2 border-r border-white/20">
        <Volume2 size={28} className="text-rose-400 animate-pulse shrink-0" />
        <span className="font-black text-base hidden sm:inline">
          {speechStatus === 'speaking' ? t.voiceControl.speaking : t.voiceControl.paused}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Pause / Resume Button */}
        {speechStatus === 'speaking' ? (
          <button
            onClick={pauseSpeaking}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base flex items-center gap-1.5 shadow-md active:scale-95 transition"
            title={t.voiceControl.pause}
          >
            <Pause size={22} />
            <span className="hidden xs:inline">{t.voiceControl.pause}</span>
          </button>
        ) : (
          <button
            onClick={resumeSpeaking}
            className="px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-base flex items-center gap-1.5 shadow-md active:scale-95 transition"
            title={t.voiceControl.resume}
          >
            <Play size={22} />
            <span className="hidden xs:inline">{t.voiceControl.resume}</span>
          </button>
        )}

        {/* STOP VOICE BUTTON - BIG & PROMINENT */}
        <button
          onClick={stopSpeaking}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base md:text-lg flex items-center gap-2 shadow-lg active:scale-95 transition border-2 border-rose-300"
          title={t.voiceControl.stop}
        >
          <Square size={22} className="fill-current" />
          <span>{t.voiceControl.stop}</span>
        </button>
      </div>
    </div>
  );
};
