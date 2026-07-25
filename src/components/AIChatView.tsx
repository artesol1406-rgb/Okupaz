import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserSettings } from '../types';
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Bot,
  User,
  Heart,
  FileText
} from 'lucide-react';
import { speakText } from '../lib/tts';
import { getTranslation, Language } from '../lib/i18n';

import { ECGLandscapeLogoIcon } from './ECGLandscapeLogoIcon';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (userText: string) => Promise<void>;
  settings: UserSettings;
  onGoToReport: () => void;
  isLoading: boolean;
}

export const AIChatView: React.FC<Props> = ({
  messages,
  onSendMessage,
  settings,
  onGoToReport,
  isLoading,
}) => {
  const { highContrast, ttsEnabled, language = 'es' } = settings;
  const t = getTranslation((language || 'es') as Language);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition (Dictation) Setup
  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech dictation is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCodeMap: Record<string, string> = {
        es: 'es-ES',
        en: 'en-US',
        de: 'de-DE',
      };
      recognition.lang = langCodeMap[language || 'es'] || 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Dictation setup error:', e);
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText;
    setInputText('');
    await onSendMessage(textToSend);
  };

  const handleQuickPrompt = async (promptText: string) => {
    setInputText(promptText);
    await onSendMessage(promptText);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl ${
      highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`p-6 rounded-3xl border-4 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-teal-300'
      }`}>
        <div className="flex items-center gap-4">
          <div className="shrink-0 p-1 bg-emerald-100 dark:bg-emerald-950 rounded-2xl">
            <ECGLandscapeLogoIcon size={52} />
          </div>
          <div>
            <h2 className="text-3xl font-black">{t.chatView.title}</h2>
            <p className="text-lg font-bold opacity-80">
              {settings.patientName ? `Atendiendo a ${settings.patientName} (${settings.patientAge} años)` : t.chatView.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onGoToReport}
          className={`px-5 py-3 rounded-2xl font-black text-lg flex items-center gap-2 border-2 shadow-md transition ${
            highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          <FileText size={24} /> {t.chatView.reportBtn}
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className={`w-full h-[420px] overflow-y-auto p-4 rounded-3xl border-4 mb-6 space-y-4 shadow-inner ${
        highContrast ? 'bg-zinc-950 border-yellow-400' : 'bg-white border-slate-200'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`p-1.5 rounded-full shrink-0 flex items-center justify-center ${
                isUser
                  ? 'bg-blue-600 text-white p-2.5'
                  : highContrast ? 'bg-yellow-400 text-black' : 'bg-teal-600 text-white'
              }`}>
                {isUser ? <User size={24} /> : <ECGLandscapeLogoIcon size={32} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] p-4 rounded-2xl border-2 shadow-sm ${
                isUser
                  ? highContrast
                    ? 'bg-zinc-800 text-yellow-200 border-yellow-400'
                    : 'bg-blue-600 text-white border-blue-700'
                  : highContrast
                    ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
                    : 'bg-teal-50 text-teal-950 border-teal-300'
              }`}>
                <p className="font-bold text-xl md:text-2xl leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
                <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-current/20">
                  <span className="text-xs font-bold opacity-70">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, ttsEnabled, language)}
                      className="p-1 hover:opacity-100 opacity-80"
                      title="TTS"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50 border border-teal-300 text-teal-900 font-bold text-lg animate-pulse">
            <Sparkles size={24} className="animate-spin" />
            <span>{t.chatView.typing}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Senior Prompts */}
      <div className="mb-4">
        <p className="font-black text-base mb-2 opacity-80">{t.chatView.quickPromptsLabel}</p>
        <div className="flex flex-wrap gap-2">
          {(t.chatView.quickPrompts || []).map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleQuickPrompt(promptText)}
              className={`px-3 py-2 rounded-xl text-sm md:text-base font-bold border-2 transition ${
                highContrast
                  ? 'bg-zinc-800 text-yellow-300 border-yellow-400 hover:bg-zinc-700'
                  : 'bg-white text-teal-900 border-teal-300 hover:bg-teal-100'
              }`}
            >
              💬 "{promptText}"
            </button>
          ))}
        </div>
      </div>

      {/* Input Box & Giant Voice Dictation Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Voice Dictation Button */}
        <button
          onClick={handleStartListening}
          className={`w-full sm:w-auto p-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 border-4 shadow-lg transition active:scale-95 ${
            isListening
              ? 'bg-rose-600 text-white border-rose-800 animate-bounce'
              : highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-amber-500 text-white border-amber-700 hover:bg-amber-600'
          }`}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
          <span>{isListening ? t.chatView.listening : t.chatView.speakMic}</span>
        </button>

        {/* Text Input */}
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatView.placeholder}
            className={`flex-1 p-4 rounded-2xl border-2 text-xl font-bold ${
              highContrast ? 'bg-zinc-900 border-yellow-400 text-yellow-300' : 'bg-white border-slate-300 text-slate-800'
            }`}
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-4 rounded-2xl font-black border-4 shadow-lg transition ${
              !inputText.trim() || isLoading
                ? 'opacity-40 cursor-not-allowed bg-slate-200 border-slate-300'
                : highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-teal-600 text-white border-teal-800 hover:bg-teal-700'
            }`}
          >
            <Send size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

