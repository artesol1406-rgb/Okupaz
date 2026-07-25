import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseLog, UserSettings } from '../types';
import { ExerciseAnimationCanvas } from './ExerciseAnimationCanvas';
import { getTranslation } from '../lib/i18n';
import { getExercisesData } from '../data/exercisesData';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { speakText } from '../lib/tts';

interface Props {
  exercise: Exercise;
  onClose: () => void;
  onCompleteExercise: (log: ExerciseLog) => void;
  settings: UserSettings;
}

export const ExerciseModal: React.FC<Props> = ({
  exercise,
  onClose,
  onCompleteExercise,
  settings,
}) => {
  const { highContrast, ttsEnabled, language = 'es' } = settings;
  const t = getTranslation(language);

  // Retrieve localized exercise based on current language setting
  const localizedExercise = getExercisesData(language).find((e) => e.id === exercise.id) || exercise;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(localizedExercise.durationSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [showPainSurvey, setShowPainSurvey] = useState(false);
  const [selectedPainLevel, setSelectedPainLevel] = useState<0 | 1 | 2 | 3>(0);
  const [notesText, setNotesText] = useState('');

  // Read exercise overview on open in selected language
  useEffect(() => {
    speakText(`${localizedExercise.title}. ${localizedExercise.description}`, ttsEnabled, language);
  }, [localizedExercise, ttsEnabled, language]);

  // Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      const promptText = (t.exerciseModal as any).timerFinishedPrompt ||
        (language === 'de'
          ? 'Zeit abgelaufen! Bitte gehen Sie zum nächsten Schritt.'
          : language === 'en'
          ? 'Time is up! Please move to the next step.'
          : '¡Tiempo completado! Pasa al siguiente paso.');
      speakText(`${t.exerciseModal.completedTitle}. ${promptText}`, ttsEnabled, language);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, ttsEnabled, language, t.exerciseModal.completedTitle]);

  const handleNextStep = () => {
    if (currentStepIndex < localizedExercise.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached last step, prompt pain survey
      setShowPainSurvey(true);
      speakText(`${t.exerciseModal.completedTitle}. ${t.exerciseModal.howFeel}`, ttsEnabled, language);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    const newLog: ExerciseLog = {
      id: `log-${Date.now()}`,
      exerciseId: localizedExercise.id,
      exerciseTitle: localizedExercise.title,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      painLevel: selectedPainLevel,
      completed: true,
      notes: notesText || (selectedPainLevel === 0 ? t.exerciseModal.noPain : t.exerciseModal.mildPain),
      xpEarned: 25,
    };

    speakText(t.exerciseModal.saveSuccess, ttsEnabled, language);
    onCompleteExercise(newLog);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border-4 shadow-2xl p-6 transition-all ${
        highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-white text-slate-800 border-blue-500'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-3 rounded-full border-2 font-black transition ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Close"
        >
          <X size={28} />
        </button>

        {!showPainSurvey ? (
          /* STEP-BY-STEP EXERCISE PLAYER */
          <div className="flex flex-col items-center">
            {/* Header Title */}
            <div className="text-center mb-4 pr-10">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-blue-900'
              }`}>
                {localizedExercise.unit}
              </span>
              <h2 className="text-3xl font-black">{localizedExercise.title}</h2>
              <p className="text-base font-bold opacity-80 mt-1">
                {t.exerciseModal.targetZone}: {localizedExercise.targetJoint} • {localizedExercise.repetitions} reps
              </p>
            </div>

            {/* Animation Demonstrator Canvas */}
            <div className="w-full mb-6">
              <ExerciseAnimationCanvas
                exercise={localizedExercise}
                currentStepIndex={currentStepIndex}
                highContrast={highContrast}
                ttsEnabled={ttsEnabled}
                language={language}
              />
            </div>

            {/* Benefit Note */}
            <div className={`w-full p-4 rounded-2xl border-2 mb-6 ${
              highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <p className="font-bold text-base flex items-center gap-2">
                <Sparkles size={22} className="text-amber-500 shrink-0" />
                <span><strong className="underline">{t.exerciseModal.benefitTitle}:</strong> {localizedExercise.benefit}</span>
              </p>
            </div>

            {/* Timer & Controls Bar */}
            <div className={`w-full flex items-center justify-between gap-3 mb-6 p-4 rounded-3xl border-4 shadow-lg ${
              highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-blue-50 border-blue-300 text-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-black text-2xl md:text-3xl">
                <Clock size={36} className={highContrast ? 'text-yellow-400' : 'text-blue-600'} />
                <span>{timerSeconds}s</span>
              </div>

              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`py-3.5 px-6 rounded-2xl font-black text-lg md:text-xl border-4 shadow-xl flex items-center gap-2.5 transition active:scale-95 ${
                  timerActive
                    ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                    : highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                }`}
              >
                {timerActive ? <Pause size={28} /> : <Play size={28} />}
                <span>{timerActive ? t.exerciseModal.pauseTimer : t.exerciseModal.startTimer}</span>
              </button>

              <button
                onClick={() => {
                  setTimerSeconds(localizedExercise.durationSeconds);
                  setTimerActive(false);
                }}
                className={`p-3.5 rounded-2xl border-2 font-bold transition flex items-center justify-center ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-200 bg-white'
                }`}
                title="Reset timer"
              >
                <RotateCcw size={26} />
              </button>
            </div>

            {/* Navigation Buttons for Steps (HUGE BUTTONS) */}
            <div className="w-full flex items-center justify-between gap-4">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className={`flex-1 py-4 px-4 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-2 border-2 transition ${
                  currentStepIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-200 border-slate-300 text-slate-500'
                    : highContrast
                      ? 'bg-zinc-800 text-yellow-300 border-yellow-400 hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft size={28} /> {t.exerciseModal.prevStep}
              </button>

              <button
                onClick={handleNextStep}
                className={`flex-1 py-4 px-4 rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-2 border-2 shadow-xl transition active:scale-95 ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                    : 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                }`}
              >
                {currentStepIndex < localizedExercise.steps.length - 1 ? (
                  <>{t.exerciseModal.nextStep} <ChevronRight size={28} /></>
                ) : (
                  <>{t.exerciseModal.finishExercise} <CheckCircle size={28} /></>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* POST-EXERCISE PAIN & FEEDBACK SURVEY */
          <div className="flex flex-col items-center text-center p-2">
            <div className={`p-4 rounded-full mb-4 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-700'}`}>
              <CheckCircle size={64} />
            </div>

            <h3 className="text-3xl font-black mb-2">{t.exerciseModal.completedTitle}</h3>
            <p className="text-xl font-bold mb-6 opacity-90">
              {t.exerciseModal.howFeel} <span className="underline">{exercise.title}</span>?
            </p>

            {/* Pain Rating Emojis (BIG BUTTONS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
              {/* Option 0: Sin Dolor */}
              <button
                onClick={() => setSelectedPainLevel(0)}
                className={`p-4 rounded-2xl border-4 font-black text-lg flex flex-col items-center gap-2 transition ${
                  selectedPainLevel === 0
                    ? 'bg-green-500 text-white border-green-700 ring-4 ring-green-300 scale-102'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Smile size={48} className="text-green-300 fill-current" />
                <span>{t.exerciseModal.noPain}</span>
              </button>

              {/* Option 1: Poco Dolor */}
              <button
                onClick={() => setSelectedPainLevel(1)}
                className={`p-4 rounded-2xl border-4 font-black text-lg flex flex-col items-center gap-2 transition ${
                  selectedPainLevel === 1
                    ? 'bg-amber-500 text-white border-amber-700 ring-4 ring-amber-300 scale-102'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Meh size={48} className="text-amber-200 fill-current" />
                <span>{t.exerciseModal.mildPain}</span>
              </button>

              {/* Option 2: Dolor Moderado */}
              <button
                onClick={() => setSelectedPainLevel(2)}
                className={`p-4 rounded-2xl border-4 font-black text-lg flex flex-col items-center gap-2 transition ${
                  selectedPainLevel === 2
                    ? 'bg-orange-600 text-white border-orange-800 ring-4 ring-orange-300 scale-102'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Frown size={48} className="text-orange-200 fill-current" />
                <span>{t.exerciseModal.moderatePain}</span>
              </button>

              {/* Option 3: Dolor Severo */}
              <button
                onClick={() => setSelectedPainLevel(3)}
                className={`p-4 rounded-2xl border-4 font-black text-lg flex flex-col items-center gap-2 transition ${
                  selectedPainLevel === 3
                    ? 'bg-rose-600 text-white border-rose-800 ring-4 ring-rose-300 scale-102'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <AlertCircle size={48} className="text-rose-200 fill-current" />
                <span>{t.exerciseModal.severePain}</span>
              </button>
            </div>

            {/* Optional Notes */}
            <div className="w-full mb-6">
              <label className="block text-left font-black text-lg mb-2">
                {t.exerciseModal.commentsLabel}
              </label>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="..."
                rows={3}
                className={`w-full p-4 rounded-2xl border-2 text-xl font-medium ${
                  highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Submit Log Button */}
            <button
              onClick={handleFinalSubmit}
              className={`w-full py-5 px-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 border-4 shadow-xl transition active:scale-95 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-green-600 text-white border-green-800 hover:bg-green-700'
              }`}
            >
              <Sparkles size={32} /> {t.exerciseModal.saveBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

