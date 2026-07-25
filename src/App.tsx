import React, { useState, useEffect } from 'react';
import {
  Exercise,
  ExerciseLog,
  ScheduleItem,
  DementiaTestResult,
  ChatMessage,
  UserSettings
} from './types';
import {
  getStoredSettings,
  saveSettings,
  getStoredLogs,
  saveLog,
  getStoredSchedule,
  saveSchedule,
  getStoredTestResults,
  saveTestResult,
  getStoredChat,
  saveChat
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { DuolingoPathView } from './components/DuolingoPathView';
import { ExerciseModal } from './components/ExerciseModal';
import { ScheduleView } from './components/ScheduleView';
import { CognitiveTestView } from './components/CognitiveTestView';
import { AIChatView } from './components/AIChatView';
import { DoctorReportView } from './components/DoctorReportView';
import { OnboardingModal } from './components/OnboardingModal';
import { speakText } from './lib/tts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'path' | 'schedule' | 'dementia' | 'chat' | 'report'>('path');
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [logs, setLogs] = useState<ExerciseLog[]>(getStoredLogs());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(getStoredSchedule());
  const [testResults, setTestResults] = useState<DementiaTestResult[]>(getStoredTestResults());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getStoredChat());
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!settings.hasCompletedOnboarding);

  // Update Settings
  const handleUpdateSettings = (newPartial: Partial<UserSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    saveSettings(updated);
  };

  // Log completion
  const handleCompleteExercise = (log: ExerciseLog) => {
    const updatedLogs = saveLog(log);
    setLogs(updatedLogs);

    // Also mark matching schedule items as completed today
    const updatedSchedule = schedule.map((item) => {
      if (item.exerciseId === log.exerciseId) {
        return { ...item, completedToday: true };
      }
      return item;
    });
    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);

    // Reward XP
    handleUpdateSettings({
      totalXp: settings.totalXp + log.xpEarned,
      currentStreak: settings.currentStreak,
    });

    // Close modal
    setSelectedExercise(null);
  };

  // Toggle Schedule Item Done
  const handleToggleScheduleItem = (id: string) => {
    const updated = schedule.map((item) => {
      if (item.id === id) {
        return { ...item, completedToday: !item.completedToday };
      }
      return item;
    });
    setSchedule(updated);
    saveSchedule(updated);
  };

  // Add Schedule Item
  const handleAddScheduleItem = (newItem: ScheduleItem) => {
    const updated = [...schedule, newItem];
    setSchedule(updated);
    saveSchedule(updated);
  };

  // Save Dementia Test Result
  const handleSaveTestResult = (result: DementiaTestResult) => {
    const updated = saveTestResult(result);
    setTestResults(updated);
  };

  // Send Message to AI Guide (Rita)
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    saveChat(updatedMessages);

    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          chatHistory: updatedMessages,
          language: settings.language || 'es',
          patientContext: {
            patientName: settings.patientName,
            patientAge: settings.patientAge,
            streakDays: settings.currentStreak,
            recentLogs: logs.slice(0, 5),
            latestDementiaScore: testResults[0]?.totalScore,
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Hola, estuve revisando tu caso. Sigue con la rutina con calma.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, botMsg];
      setChatMessages(finalMessages);
      saveChat(finalMessages);

      speakText(replyText, settings.ttsEnabled, settings.language || 'es');
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Disculpa, no pude conectarme al servidor. Revisa tu conexión a internet.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Font size multiplier class applied to main container
  const fontSizeClass =
    settings.fontSize === 'extra-grande'
      ? 'text-2xl'
      : settings.fontSize === 'grande'
        ? 'text-xl'
        : 'text-base';

  return (
    <div className={`min-h-screen transition-colors ${fontSizeClass} ${
      settings.highContrast
        ? 'bg-black text-yellow-300 font-sans'
        : 'bg-slate-100 text-slate-800 font-sans'
    }`}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          const labels: Record<string, string> = {
            path: 'Ruta de ejercicios',
            schedule: 'Agenda y horario',
            dementia: 'Test de memoria y orientación',
            chat: 'Chat con la Guía Rita',
            report: 'Reporte para el médico',
          };
          speakText(`Pestaña: ${labels[tab]}`, settings.ttsEnabled, settings.language || 'es');
        }}
        settings={settings}
        updateSettings={handleUpdateSettings}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 py-6">
        {activeTab === 'path' && (
          <DuolingoPathView
            onSelectExercise={(ex) => setSelectedExercise(ex)}
            logs={logs}
            settings={settings}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            onToggleComplete={handleToggleScheduleItem}
            onAddScheduleItem={handleAddScheduleItem}
            onStartExercise={(ex) => setSelectedExercise(ex)}
            settings={settings}
          />
        )}

        {activeTab === 'dementia' && (
          <CognitiveTestView
            onSaveTestResult={handleSaveTestResult}
            historyResults={testResults}
            settings={settings}
            onGoToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            settings={settings}
            onGoToReport={() => setActiveTab('report')}
            isLoading={isChatLoading}
          />
        )}

        {activeTab === 'report' && (
          <DoctorReportView
            logs={logs}
            schedule={schedule}
            testResults={testResults}
            chatMessages={chatMessages}
            settings={settings}
          />
        )}
      </main>

      {/* Patient Onboarding / Information Screen Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        settings={settings}
        onSaveOnboarding={(updated) => {
          handleUpdateSettings(updated);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
        isEditing={Boolean(settings.hasCompletedOnboarding)}
      />

      {/* Active Exercise Player Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onCompleteExercise={handleCompleteExercise}
          settings={settings}
        />
      )}
    </div>
  );
}
