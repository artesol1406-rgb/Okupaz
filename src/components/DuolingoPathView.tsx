import React from 'react';
import { Exercise, ExerciseLog, UserSettings } from '../types';
import { getExercisesData } from '../data/exercisesData';
import { getTranslation } from '../lib/i18n';
import { CheckCircle2, Lock, Play, Star, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { speakText } from '../lib/tts';

interface Props {
  onSelectExercise: (exercise: Exercise) => void;
  logs: ExerciseLog[];
  settings: UserSettings;
}

export const DuolingoPathView: React.FC<Props> = ({
  onSelectExercise,
  logs,
  settings,
}) => {
  const { highContrast, ttsEnabled, language = 'es' } = settings;
  const t = getTranslation(language);
  const exercisesData = getExercisesData(language);

  // Group exercises by Unit
  const units = Array.from(new Set(exercisesData.map((e) => e.unit)));

  const isExerciseCompleted = (exerciseId: string) => {
    return logs.some((l) => l.exerciseId === exerciseId && l.completed);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const fullName = settings.patientName || 'Rosa María';
    const name = fullName.trim().split(' ')[0] || 'Rosa María';

    if (language === 'de') {
      if (hour >= 5 && hour < 12) return { text: `Guten Morgen, ${name}! ☀️`, sub: 'Bereit für Ihre heutigen Therapieschritte?' };
      if (hour >= 12 && hour < 18) return { text: `Guten Tag, ${name}! 🌤️`, sub: 'Lassen Sie uns mit Ihrer Therapiemethode fortfahren.' };
      return { text: `Guten Abend, ${name}! 🌙`, sub: 'Eine sanfte Routine vor der Abendruhe.' };
    }
    if (language === 'en') {
      if (hour >= 5 && hour < 12) return { text: `Good morning, ${name}! ☀️`, sub: 'Ready for today’s therapy exercises?' };
      if (hour >= 12 && hour < 18) return { text: `Good afternoon, ${name}! 🌤️`, sub: 'Let’s keep going with your daily mobility routine.' };
      return { text: `Good evening, ${name}! 🌙`, sub: 'A gentle routine to relax your joints before resting.' };
    }
    // Spanish default
    if (hour >= 5 && hour < 12) return { text: `¡Buenos días, ${name}! ☀️`, sub: '¿Listos para los ejercicios terapéuticos de hoy?' };
    if (hour >= 12 && hour < 18) return { text: `¡Buenas tardes, ${name}! 🌤️`, sub: 'Sigamos avanzando con tu rutina de movilidad.' };
    return { text: `¡Buenas noches, ${name}! 🌙`, sub: 'Una rutina suave para relajar tus articulaciones antes de descansar.' };
  };

  const greeting = getGreeting();

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-50 text-slate-800'
    }`}>
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border-4 text-center mb-8 shadow-xl ${
        highContrast
          ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
          : 'bg-white border-green-500 text-slate-800'
      }`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-base font-black uppercase tracking-wide bg-green-600 text-white mb-3">
          <Sparkles size={20} /> {t.pathView.dailyRoutine}
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-2">{greeting.text}</h2>
        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto">
          {greeting.sub}
        </p>

        {/* Listen Button */}
        <button
          onClick={() => speakText(`${greeting.text}. ${greeting.sub}`, ttsEnabled, language)}
          className={`mt-4 px-5 py-2.5 rounded-2xl font-black text-base inline-flex items-center gap-2 border-2 shadow-md transition ${
            highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-green-100 text-green-900 border-green-300 hover:bg-green-200'
          }`}
        >
          <Volume2 size={24} /> {t.pathView.listenIntroBtn}
        </button>
      </div>

      {/* Duolingo Units & Level Nodes */}
      <div className="flex flex-col items-center gap-12 pb-12">
        {units.map((unitName, uIdx) => {
          const unitExercises = exercisesData.filter((e) => e.unit === unitName);

          return (
            <div key={unitName} className="w-full flex flex-col items-center">
              {/* Unit Header Card */}
              <div className={`w-full p-5 rounded-2xl border-4 mb-8 shadow-lg flex items-center justify-between ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-700'
              }`}>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black">{unitName}</h3>
                  <p className="text-base md:text-lg font-bold opacity-90">
                    {unitExercises.length} {t.pathView.guidedExercises}
                  </p>
                </div>
                <div className="hidden sm:flex p-3 bg-white/20 rounded-xl items-center gap-1 font-black text-xl">
                  <Star size={28} className="fill-amber-300 text-amber-300" />
                  <span>{t.pathView.unitLabel} {uIdx + 1}</span>
                </div>
              </div>

              {/* Path Node Sequence (Duolingo Curved Snake) */}
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                {unitExercises.map((exercise, idx) => {
                  const completed = isExerciseCompleted(exercise.id);
                  // Unlock logic: First level unlocked, or previous exercise completed
                  const prevExercise = idx > 0 ? unitExercises[idx - 1] : null;
                  const isUnlocked = idx === 0 || completed || (prevExercise && isExerciseCompleted(prevExercise.id)) || uIdx === 0;

                  // Snake offset for Duolingo curve look (Left, Center, Right, Center)
                  const offsets = ['translate-x-0', 'translate-x-12', 'translate-x-0', '-translate-x-12'];
                  const offsetClass = offsets[idx % offsets.length];

                  return (
                    <div
                      key={exercise.id}
                      className={`flex flex-col items-center transition-all ${offsetClass}`}
                    >
                      {/* Big Circle Node Button */}
                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            speakText(`${t.pathView.startNotice}: ${exercise.title}`, ttsEnabled, language);
                            onSelectExercise(exercise);
                          } else {
                            speakText(t.pathView.lockedNotice, ttsEnabled, language);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`group relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center transition-transform active:scale-95 ${
                          completed
                            ? highContrast
                              ? 'bg-green-400 text-black border-yellow-300 ring-4 ring-green-300'
                              : 'bg-green-500 text-white border-green-700 ring-4 ring-green-200'
                            : isUnlocked
                              ? highContrast
                                ? 'bg-yellow-400 text-black border-yellow-300 animate-pulse ring-4 ring-yellow-200'
                                : 'bg-emerald-600 text-white border-emerald-800 animate-bounce ring-4 ring-emerald-300'
                              : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-70'
                        }`}
                        title={exercise.title}
                      >
                        {completed ? (
                          <CheckCircle2 size={48} className="fill-white text-green-700" />
                        ) : isUnlocked ? (
                          <Play size={44} className="fill-current ml-1" />
                        ) : (
                          <Lock size={40} />
                        )}

                        <span className="text-xs font-black uppercase mt-0.5">
                          Lvl {exercise.level}
                        </span>
                      </button>

                      {/* Title Badge Below Node */}
                      <div className={`mt-2 px-4 py-2 rounded-2xl border-2 text-center max-w-[220px] shadow-sm ${
                        highContrast
                          ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}>
                        <p className="font-black text-lg leading-tight">{exercise.title}</p>
                        <p className="text-xs font-bold text-emerald-700 dark:text-yellow-400 mt-0.5">
                          {exercise.targetJoint} • {exercise.repetitions} reps
                        </p>
                      </div>

                      {/* Connecting Line to next node */}
                      {idx < unitExercises.length - 1 && (
                        <div className={`w-3 h-10 my-1 rounded-full ${
                          completed
                            ? 'bg-green-500'
                            : highContrast ? 'bg-yellow-400' : 'bg-slate-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Medical Safety Banner */}
      <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${
        highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-amber-50 border-amber-300 text-amber-900'
      }`}>
        <ShieldAlert size={36} className="text-amber-600 shrink-0 mt-1" />
        <div>
          <h4 className="font-black text-xl">{t.pathView.safetyTitle}</h4>
          <p className="text-base font-medium mt-1">
            {t.pathView.safetyBody}
          </p>
        </div>
      </div>
    </div>
  );
};

