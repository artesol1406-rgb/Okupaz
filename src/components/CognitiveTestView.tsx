import React, { useState } from 'react';
import { DementiaQuestion, DementiaTestResult, UserSettings } from '../types';
import { getDementiaTestQuestions } from '../data/dementiaTestData';
import { getTranslation } from '../lib/i18n';
import {
  Brain,
  Volume2,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  FileText,
  Apple,
  Armchair,
  Coins,
  Clock,
  Square
} from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/tts';

interface Props {
  onSaveTestResult: (result: DementiaTestResult) => void;
  historyResults: DementiaTestResult[];
  settings: UserSettings;
  onGoToReport: () => void;
}

export const CognitiveTestView: React.FC<Props> = ({
  onSaveTestResult,
  historyResults,
  settings,
  onGoToReport,
}) => {
  const { highContrast, ttsEnabled, language = 'es' } = settings;
  const t = getTranslation(language);
  const questions = getDementiaTestQuestions(language);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [selectedRecallWords, setSelectedRecallWords] = useState<string[]>([]);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [latestResult, setLatestResult] = useState<DementiaTestResult | null>(null);

  const question = questions[currentIdx];

  // Speak question
  const speakCurrentQuestion = () => {
    if (!question) return;
    speakText(`${question.questionText}. ${question.instruction}`, ttsEnabled, language);
  };

  const handleSelectMultipleChoice = (answer: string) => {
    const newAnswers = { ...userAnswers, [question.id]: answer };
    setUserAnswers(newAnswers);
  };

  const handleToggleRecallWord = (word: string) => {
    if (selectedRecallWords.includes(word)) {
      const updated = selectedRecallWords.filter((w) => w !== word);
      setSelectedRecallWords(updated);
      setUserAnswers({ ...userAnswers, [question.id]: updated });
    } else if (selectedRecallWords.length < 3) {
      const updated = [...selectedRecallWords, word];
      setSelectedRecallWords(updated);
      setUserAnswers({ ...userAnswers, [question.id]: updated });
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      calculateAndFinishTest();
    }
  };

  const calculateAndFinishTest = () => {
    let orientationScore = 0;
    let memoryImmediateScore = 5; // Immediate memory section completion
    let calculationScore = 0;
    let memoryRecallScore = 0;
    let languageScore = 0;
    let spatialScore = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (q.section === 'Orientación' || q.section === 'Orientation' || q.section === 'Orientierung') {
        if (ans === q.correctAnswer) orientationScore += 2;
      } else if (q.section === 'Atención y Cálculo' || q.section === 'Attention & Calculation' || q.section === 'Aufmerksamkeit & Rechnen') {
        if (ans === q.correctAnswer) calculationScore += 3;
      } else if (q.section === 'Recuerdo Diferido' || q.section === 'Delayed Recall' || q.section === 'Verzögertes Erinnern') {
        if (Array.isArray(ans)) {
          const matchCount = ans.filter((w: string) => (q.correctAnswer as string[]).includes(w)).length;
          memoryRecallScore += matchCount * 2;
        }
      } else if (q.section === 'Lenguaje e Imágenes' || q.section === 'Language & Recognition' || q.section === 'Sprache & Erkennung') {
        if (ans === q.correctAnswer) languageScore += 3;
      } else if (q.section === 'Coordinación Espacial' || q.section === 'Spatial Coordination' || q.section === 'Räumliche Koordination') {
        if (ans === q.correctAnswer) spatialScore += 3;
      }
    });

    const total = orientationScore + memoryImmediateScore + calculationScore + memoryRecallScore + languageScore + spatialScore;

    let severityLabel: DementiaTestResult['severityLabel'] = t.cognitiveView.noImpairment as any;
    if (total < 18) severityLabel = t.cognitiveView.moderateImpairment as any;
    else if (total < 25) severityLabel = t.cognitiveView.mildImpairment as any;

    const result: DementiaTestResult = {
      id: `test-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      totalScore: total,
      maxScore: 30,
      scoresBySection: {
        orientation: orientationScore,
        memoryImmediate: memoryImmediateScore,
        calculation: calculationScore,
        memoryRecall: memoryRecallScore,
        language: languageScore,
        spatial: spatialScore,
      },
      severityLabel,
      notes: `Evaluación cognitiva completada. ${total}/30.`,
    };

    setLatestResult(result);
    onSaveTestResult(result);
    setIsTestFinished(true);

    speakText(`${t.cognitiveView.resultsTitle}. ${total}/30. ${severityLabel}`, ttsEnabled, language);
  };

  const restartTest = () => {
    setCurrentIdx(0);
    setUserAnswers({});
    setSelectedRecallWords([]);
    setIsTestFinished(false);
    setLatestResult(null);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`p-6 rounded-3xl border-4 mb-8 shadow-xl text-center ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-purple-300'
      }`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-base font-black uppercase tracking-wide bg-purple-600 text-white mb-2">
          <Brain size={24} /> {t.cognitiveView.title}
        </div>
        <h2 className="text-3xl md:text-4xl font-black">{t.cognitiveView.sub}</h2>
        <p className="text-lg font-bold opacity-85 max-w-2xl mx-auto mt-1">
          {t.cognitiveView.desc}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={speakCurrentQuestion}
            className={`px-5 py-2.5 rounded-2xl font-black text-base inline-flex items-center gap-2 border-2 shadow-md transition ${
              highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
            }`}
          >
            <Volume2 size={24} /> {t.cognitiveView.listenQuestionBtn}
          </button>

          <button
            onClick={stopSpeaking}
            className="px-5 py-2.5 rounded-2xl font-black text-base inline-flex items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 shadow-md transition border-2 border-rose-300"
            title="Detener Voz"
          >
            <Square size={20} className="fill-current" /> {t.voiceControl.stop}
          </button>
        </div>
      </div>

      {!isTestFinished ? (
        /* QUESTION RUNNER */
        <div className={`p-6 rounded-3xl border-4 shadow-2xl ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200'
        }`}>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-zinc-800">
            <span className="font-black text-lg md:text-xl text-purple-600 dark:text-yellow-400 uppercase">
              {question.section}
            </span>
            <span className="font-black text-lg md:text-xl bg-slate-100 dark:bg-zinc-800 px-4 py-1.5 rounded-full border">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          {/* Question Prompt */}
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-black mb-2">{question.questionText}</h3>
            <p className="text-lg font-bold opacity-80">{question.instruction}</p>
          </div>

          {/* QUESTION TYPE: MULTIPLE CHOICE */}
          {question.type === 'multiple_choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {question.options.map((opt) => {
                const isSelected = userAnswers[question.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectMultipleChoice(opt)}
                    className={`p-5 rounded-2xl font-black text-xl md:text-2xl text-left border-4 transition active:scale-95 ${
                      isSelected
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-200'
                          : 'bg-purple-600 text-white border-purple-800 ring-4 ring-purple-200 shadow-xl'
                        : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* QUESTION TYPE: MEMORY WORDS DISPLAY */}
          {question.type === 'memory_words' && question.wordItems && (
            <div className="flex flex-wrap justify-center gap-6 my-8">
              {question.wordItems.map((item) => (
                <div
                  key={item.word}
                  className={`p-6 rounded-3xl border-4 text-center min-w-[160px] shadow-lg ${
                    highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-purple-50 border-purple-400 text-purple-900'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    {(item.word === 'MANZANA' || item.word === 'APPLE' || item.word === 'APFEL') && <Apple size={64} className="text-rose-500 fill-rose-100" />}
                    {(item.word === 'MESA' || item.word === 'TABLE' || item.word === 'TISCH') && <Armchair size={64} className="text-amber-600 fill-amber-100" />}
                    {(item.word === 'MONEDA' || item.word === 'COIN' || item.word === 'MÜNZE') && <Coins size={64} className="text-amber-500 fill-amber-200" />}
                  </div>
                  <span className="font-black text-3xl tracking-wider uppercase">{item.word}</span>
                </div>
              ))}
            </div>
          )}

          {/* QUESTION TYPE: RECALL WORDS */}
          {question.type === 'memory_recall' && question.options && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {question.options.map((w) => {
                const isChecked = selectedRecallWords.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => handleToggleRecallWord(w)}
                    className={`p-5 rounded-2xl font-black text-xl border-4 text-center transition ${
                      isChecked
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-yellow-300'
                          : 'bg-green-600 text-white border-green-800 shadow-lg'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {isChecked ? '✓ ' : ''}{w}
                  </button>
                );
              })}
            </div>
          )}

          {/* QUESTION TYPE: IMAGE RECOGNITION */}
          {question.type === 'image_recognition' && question.options && (
            <div className="flex flex-col items-center gap-6 mb-8">
              {/* High visibility illustration box */}
              <div className={`p-8 rounded-3xl border-4 text-center shadow-inner ${
                highContrast ? 'bg-black border-yellow-400' : 'bg-blue-50 border-blue-300'
              }`}>
                <Clock size={120} className="text-blue-600 dark:text-yellow-400 mx-auto" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {question.options.map((opt) => {
                  const isSelected = userAnswers[question.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectMultipleChoice(opt)}
                      className={`p-5 rounded-2xl font-black text-xl text-left border-4 transition ${
                        isSelected
                          ? highContrast
                            ? 'bg-yellow-400 text-black border-yellow-300'
                            : 'bg-purple-600 text-white border-purple-800'
                          : 'bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              className={`py-4 px-8 rounded-2xl font-black text-xl md:text-2xl flex items-center gap-3 border-4 shadow-xl transition active:scale-95 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-purple-600 text-white border-purple-800 hover:bg-purple-700'
              }`}
            >
              {currentIdx < questions.length - 1 ? (
                <>{t.cognitiveView.nextBtn} <ArrowRight size={28} /></>
              ) : (
                <>{t.cognitiveView.finishBtn} <CheckCircle size={28} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* RESULTS VIEW */
        <div className={`p-8 rounded-3xl border-4 text-center shadow-2xl ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-purple-300'
        }`}>
          <div className="inline-flex p-5 rounded-full bg-purple-100 text-purple-700 mb-4">
            <Brain size={72} />
          </div>

          <h3 className="text-3xl md:text-4xl font-black mb-2">{t.cognitiveView.resultsTitle}</h3>

          {/* Big Score Dial */}
          <div className={`max-w-md mx-auto p-6 rounded-3xl border-4 mb-6 ${
            highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-purple-50 border-purple-300 text-purple-900'
          }`}>
            <span className="text-6xl font-black">{latestResult?.totalScore} / 30</span>
            <p className="text-2xl font-black mt-2 underline">{latestResult?.severityLabel}</p>
          </div>

          <p className="text-lg font-bold max-w-xl mx-auto mb-8 text-slate-600 dark:text-zinc-300">
            {t.cognitiveView.resultsNote}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={restartTest}
              className="py-4 px-6 rounded-2xl font-black text-xl bg-slate-200 text-slate-800 hover:bg-slate-300 flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} /> {t.cognitiveView.repeatBtn}
            </button>

            <button
              onClick={onGoToReport}
              className={`py-4 px-8 rounded-2xl font-black text-xl flex items-center justify-center gap-2 border-4 shadow-xl ${
                highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-rose-600 text-white border-rose-800'
              }`}
            >
              <FileText size={28} /> {t.cognitiveView.viewReportBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

