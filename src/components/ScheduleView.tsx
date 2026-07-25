import React, { useState } from 'react';
import { ScheduleItem, Exercise, UserSettings } from '../types';
import { getExercisesData } from '../data/exercisesData';
import { getTranslation, Language } from '../lib/i18n';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Sun,
  Sunset,
  Moon,
  Play
} from 'lucide-react';
import { speakText } from '../lib/tts';

interface Props {
  schedule: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onAddScheduleItem: (newItem: ScheduleItem) => void;
  onStartExercise: (exercise: Exercise) => void;
  settings: UserSettings;
}

export const ScheduleView: React.FC<Props> = ({
  schedule,
  onToggleComplete,
  onAddScheduleItem,
  onStartExercise,
  settings,
}) => {
  const { highContrast, ttsEnabled, language = 'es' } = settings;
  const t = getTranslation(language);
  const exercisesData = getExercisesData(language);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercisesData[0]?.id || 'hand-flex-1');
  const [timeSlot, setTimeSlot] = useState<'mañana' | 'tarde' | 'noche'>('mañana');
  const [timeString, setTimeString] = useState('09:00 AM');

  const localeMap: Record<Language, string> = {
    es: 'es-ES',
    en: 'en-US',
    de: 'de-DE',
  };

  const todayDateStr = new Date().toLocaleDateString(localeMap[language] || 'es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAdd = () => {
    const exercise = exercisesData.find((e) => e.id === selectedExerciseId);
    if (!exercise) return;

    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      category: exercise.category,
      timeSlot,
      timeString,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      completedToday: false,
    };

    onAddScheduleItem(newItem);
    setShowAddModal(false);

    const slotLabel = timeSlot === 'mañana' ? t.scheduleView.slots.mañana : timeSlot === 'tarde' ? t.scheduleView.slots.tarde : t.scheduleView.slots.noche;
    speakText(`${t.scheduleView.formTitle}: ${exercise.title} (${slotLabel})`, ttsEnabled, language);
  };

  const getSlotItems = (slot: 'mañana' | 'tarde' | 'noche') => {
    return schedule.filter((s) => s.timeSlot === slot);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`p-6 rounded-3xl border-4 mb-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-blue-300'
      }`}>
        <div>
          <div className="flex items-center gap-2 font-black text-blue-600 dark:text-yellow-400 text-lg uppercase tracking-wide mb-1">
            <CalendarIcon size={26} /> {t.scheduleView.title}
          </div>
          <h2 className="text-3xl md:text-4xl font-black">{t.scheduleView.subtitle}</h2>
          <p className="text-lg font-bold capitalize text-slate-600 dark:text-zinc-300 mt-1">
            {todayDateStr}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-2 border-4 shadow-xl transition active:scale-95 ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300'
              : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700'
          }`}
        >
          <Plus size={28} /> {t.scheduleView.addReminder}
        </button>
      </div>

      {/* Schedule Sections by Time Slot */}
      <div className="space-y-8">
        {/* MAÑANA 🌅 */}
        <ScheduleSlotGroup
          title={t.scheduleView.slots.mañana}
          timeRange="08:00 AM - 12:00 PM"
          icon={<Sun size={32} className="text-amber-500" />}
          items={getSlotItems('mañana')}
          onToggleComplete={onToggleComplete}
          onStartExercise={onStartExercise}
          highContrast={highContrast}
          ttsEnabled={ttsEnabled}
          language={language}
          exercisesData={exercisesData}
          t={t}
        />

        {/* TARDE ☀️ */}
        <ScheduleSlotGroup
          title={t.scheduleView.slots.tarde}
          timeRange="01:00 PM - 05:00 PM"
          icon={<Sunset size={32} className="text-orange-500" />}
          items={getSlotItems('tarde')}
          onToggleComplete={onToggleComplete}
          onStartExercise={onStartExercise}
          highContrast={highContrast}
          ttsEnabled={ttsEnabled}
          language={language}
          exercisesData={exercisesData}
          t={t}
        />

        {/* NOCHE 🌙 */}
        <ScheduleSlotGroup
          title={t.scheduleView.slots.noche}
          timeRange="06:00 PM - 09:00 PM"
          icon={<Moon size={32} className="text-indigo-500" />}
          items={getSlotItems('noche')}
          onToggleComplete={onToggleComplete}
          onStartExercise={onStartExercise}
          highContrast={highContrast}
          ttsEnabled={ttsEnabled}
          language={language}
          exercisesData={exercisesData}
          t={t}
        />
      </div>

      {/* ADD SCHEDULE ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border-4 p-6 shadow-2xl ${
            highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-white text-slate-800 border-blue-400'
          }`}>
            <h3 className="text-2xl md:text-3xl font-black mb-4">{t.scheduleView.formTitle}</h3>

            {/* Select Exercise */}
            <div className="mb-4">
              <label className="block font-black text-lg mb-2">{t.scheduleView.exerciseName}:</label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 text-xl font-bold ${
                  highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {exercisesData.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Time Slot */}
            <div className="mb-4">
              <label className="block font-black text-lg mb-2">{t.scheduleView.timeSlot}:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setTimeSlot('mañana'); setTimeString('09:00 AM'); }}
                  className={`p-3 rounded-2xl font-black border-2 text-base ${
                    timeSlot === 'mañana'
                      ? 'bg-amber-500 text-white border-amber-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  🌅 {t.scheduleView.slots.mañana}
                </button>
                <button
                  type="button"
                  onClick={() => { setTimeSlot('tarde'); setTimeString('03:00 PM'); }}
                  className={`p-3 rounded-2xl font-black border-2 text-base ${
                    timeSlot === 'tarde'
                      ? 'bg-orange-500 text-white border-orange-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  ☀️ {t.scheduleView.slots.tarde}
                </button>
                <button
                  type="button"
                  onClick={() => { setTimeSlot('noche'); setTimeString('07:00 PM'); }}
                  className={`p-3 rounded-2xl font-black border-2 text-base ${
                    timeSlot === 'noche'
                      ? 'bg-indigo-600 text-white border-indigo-800'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  🌙 {t.scheduleView.slots.noche}
                </button>
              </div>
            </div>

            {/* Time String */}
            <div className="mb-6">
              <label className="block font-black text-lg mb-2">{t.scheduleView.timeString}:</label>
              <input
                type="text"
                value={timeString}
                onChange={(e) => setTimeString(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 text-xl font-bold ${
                  highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 rounded-2xl font-black text-xl bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                {t.scheduleView.cancel}
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-4 rounded-2xl font-black text-xl border-2 ${
                  highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-green-600 text-white border-green-700'
                }`}
              >
                {t.scheduleView.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SlotProps {
  title: string;
  timeRange: string;
  icon: React.ReactNode;
  items: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onStartExercise: (exercise: Exercise) => void;
  highContrast: boolean;
  ttsEnabled: boolean;
  language: Language;
  exercisesData: Exercise[];
  t: any;
}

const ScheduleSlotGroup: React.FC<SlotProps> = ({
  title,
  timeRange,
  icon,
  items,
  onToggleComplete,
  onStartExercise,
  highContrast,
  ttsEnabled,
  language,
  exercisesData,
  t,
}) => {
  return (
    <div className={`p-6 rounded-3xl border-4 shadow-md ${
      highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-zinc-800">
        {icon}
        <div>
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="text-sm font-bold opacity-75">{timeRange}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-lg font-bold text-slate-400 dark:text-zinc-500 py-3 italic">
          {t.scheduleView.noScheduled}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const exercise = exercisesData.find((e) => e.id === item.exerciseId);
            const exTitle = exercise ? exercise.title : item.exerciseTitle;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  item.completedToday
                    ? highContrast
                      ? 'bg-zinc-800 border-green-400 text-green-300'
                      : 'bg-green-50 border-green-300 text-green-900'
                    : highContrast
                      ? 'bg-black border-yellow-400 text-yellow-300'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {/* Info */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onToggleComplete(item.id);
                      speakText(
                        item.completedToday
                          ? `${exTitle}`
                          : `${exTitle} - ${t.exerciseModal.completedTitle}`,
                        ttsEnabled,
                        language
                      );
                    }}
                    className="p-1 text-green-600 dark:text-green-400"
                    title="Toggle"
                  >
                    {item.completedToday ? (
                      <CheckCircle2 size={40} className="fill-green-600 text-white" />
                    ) : (
                      <Circle size={40} className="text-slate-400 hover:text-green-600" />
                    )}
                  </button>

                  <div>
                    <h4 className={`text-xl font-black ${item.completedToday ? 'line-through opacity-80' : ''}`}>
                      {exTitle}
                    </h4>
                    <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                      <Clock size={16} /> {item.timeString}
                    </p>
                  </div>
                </div>

                {/* Launch Button */}
                {exercise && (
                  <button
                    onClick={() => onStartExercise(exercise)}
                    className={`px-4 py-2.5 rounded-xl font-black text-base flex items-center gap-2 border-2 transition ${
                      highContrast
                        ? 'bg-yellow-400 text-black border-yellow-300'
                        : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                    }`}
                  >
                    <Play size={20} /> {t.scheduleView.startNowBtn}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
