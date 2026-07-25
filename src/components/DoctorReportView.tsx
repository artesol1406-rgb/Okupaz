import React, { useState, useEffect } from 'react';
import {
  ExerciseLog,
  ScheduleItem,
  DementiaTestResult,
  ChatMessage,
  UserSettings
} from '../types';
import {
  FileText,
  Printer,
  Copy,
  Share2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  Volume2
} from 'lucide-react';
import { speakText } from '../lib/tts';
import { getTranslation, Language } from '../lib/i18n';

interface Props {
  logs: ExerciseLog[];
  schedule: ScheduleItem[];
  testResults: DementiaTestResult[];
  chatMessages: ChatMessage[];
  settings: UserSettings;
}

export const DoctorReportView: React.FC<Props> = ({
  logs,
  schedule,
  testResults,
  chatMessages,
  settings,
}) => {
  const { highContrast, ttsEnabled, patientName, patientAge, language = 'es' } = settings;
  const t = getTranslation((language || 'es') as Language);

  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute stats
  const totalScheduled = schedule.length;
  const totalCompletedToday = schedule.filter((s) => s.completedToday).length;
  const complianceRate = totalScheduled > 0 ? Math.round((totalCompletedToday / totalScheduled) * 100) : 100;
  const latestTest = testResults[0] || null;

  // Generate Report from Backend API
  const generateReport = async () => {
    setIsGenerating(true);

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientAge,
          language: language || 'es',
          exerciseLogs: logs.slice(0, 10),
          schedule,
          testResults,
          chatNotes: chatMessages.filter((m) => m.sender === 'user').slice(-10),
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReportMarkdown(data.report);
      } else {
        setReportMarkdown('Error');
      }
    } catch (e: any) {
      console.error(e);
      setReportMarkdown('Error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    speakText(t.reportView.copiedBtn, ttsEnabled, language);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${t.reportView.docTitle}: ${patientName}*\n\n` +
      `*${t.reportView.adherence}:* ${complianceRate}%\n` +
      `*${t.reportView.cognitiveTest}:* ${latestTest ? latestTest.totalScore + '/30' : t.reportView.noTest}\n\n` +
      reportMarkdown.slice(0, 1000) + '...'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border-4 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-rose-300'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${highContrast ? 'bg-yellow-400 text-black' : 'bg-rose-600 text-white'}`}>
            <Stethoscope size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black">{t.reportView.title}</h2>
            <p className="text-lg font-bold opacity-80">
              {t.reportView.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating}
          className={`px-5 py-3 rounded-2xl font-black text-lg flex items-center gap-2 border-2 shadow-md transition ${
            isGenerating
              ? 'opacity-50 cursor-not-allowed bg-slate-300'
              : highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
          }`}
        >
          <RefreshCw size={24} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? t.reportView.generating : t.reportView.updateBtn}</span>
        </button>
      </div>

      {/* Patient Vital Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={`p-5 rounded-2xl border-4 text-center ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-300'
        }`}>
          <p className="text-sm font-bold uppercase opacity-70">{t.reportView.patient}</p>
          <h3 className="text-2xl font-black">{patientName}</h3>
          <p className="text-base font-bold text-rose-600 dark:text-yellow-400">{patientAge} {t.reportView.years}</p>
        </div>

        <div className={`p-5 rounded-2xl border-4 text-center ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-300'
        }`}>
          <p className="text-sm font-bold uppercase opacity-70">{t.reportView.adherence}</p>
          <h3 className="text-3xl font-black text-green-600 dark:text-green-400">{complianceRate}%</h3>
          <p className="text-xs font-bold text-slate-500">{totalCompletedToday} / {totalScheduled} {t.reportView.completedToday}</p>
        </div>

        <div className={`p-5 rounded-2xl border-4 text-center ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-300'
        }`}>
          <p className="text-sm font-bold uppercase opacity-70">{t.reportView.cognitiveTest}</p>
          <h3 className="text-2xl font-black text-purple-600 dark:text-yellow-400">
            {latestTest ? `${latestTest.totalScore}/30` : '-'}
          </h3>
          <p className="text-xs font-bold text-slate-500">{latestTest?.severityLabel || t.reportView.noTest}</p>
        </div>
      </div>

      {/* Printable Report Box */}
      <div id="printable-doctor-report" className={`p-8 rounded-3xl border-4 shadow-2xl mb-8 ${
        highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-slate-300 dark:border-yellow-400">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">{t.reportView.docTitle}</h1>
            <p className="text-base font-bold opacity-75">{t.reportView.docSubTitle}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-base">{t.reportView.date}: {new Date().toLocaleDateString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'es-ES')}</p>
            <p className="text-xs font-bold opacity-70">{t.reportView.streak}: {settings.currentStreak}</p>
          </div>
        </div>

        {isGenerating ? (
          <div className="py-16 text-center space-y-4">
            <Sparkles size={48} className="text-rose-600 mx-auto animate-spin" />
            <p className="text-2xl font-black">{t.reportView.generating}</p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-xl font-medium leading-relaxed whitespace-pre-wrap">
            {reportMarkdown}
          </div>
        )}
      </div>

      {/* Action Buttons for Family/Patient */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className={`px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-2 border-4 shadow-xl transition active:scale-95 ${
            highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700'
          }`}
        >
          <Printer size={26} /> {t.reportView.printBtn}
        </button>

        <button
          onClick={handleCopy}
          className={`px-6 py-4 rounded-2xl font-black text-xl flex items-center gap-2 border-4 shadow-xl transition active:scale-95 ${
            copied
              ? 'bg-green-600 text-white border-green-800'
              : highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-slate-800 text-white border-slate-900 hover:bg-slate-700'
          }`}
        >
          {copied ? <CheckCircle2 size={26} /> : <Copy size={26} />}
          <span>{copied ? t.reportView.copiedBtn : t.reportView.copyBtn}</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="px-6 py-4 rounded-2xl font-black text-xl bg-emerald-600 text-white border-4 border-emerald-800 hover:bg-emerald-700 flex items-center gap-2 shadow-xl transition active:scale-95"
        >
          <Share2 size={26} /> {t.reportView.shareBtn}
        </button>
      </div>
    </div>
  );
};

