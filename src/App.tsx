/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Globe,
  CornerDownLeft,
  Volume2,
} from 'lucide-react';
import { Header } from './components/Header';
import { AssistantCore } from './components/AssistantCore';
import { ChatInterface } from './components/ChatInterface';
import { QuickActionsDock } from './components/QuickActionsDock';
import { ActionPermissionModal } from './components/ActionPermissionModal';
import { CalculatorModal } from './components/CalculatorModal';
import { TimerWidget } from './components/TimerWidget';
import { SettingsModal } from './components/SettingsModal';
import {
  ChatMessage,
  AssistantState,
  AssistantSettings,
  PendingAction,
} from './types';
import {
  parseQuickCommand,
  hasHindiCharacters,
} from './utils/commandParser';
import {
  speakWithMaleVoice,
  createStreamingVoiceQueue,
  StreamingMaleVoiceQueue,
  stopSpeaking,
  isSpeaking,
  initSpeechVoices,
} from './utils/speechSynthesis';
import {
  AssistantSpeechRecognition,
  isSpeechRecognitionSupported,
} from './utils/speechRecognition';
import { playAudioCue } from './utils/audioFeedback';

const STORAGE_KEY_MESSAGES = 'vivek_ai_chat_history_v1';
const STORAGE_KEY_SETTINGS = 'vivek_ai_settings_v1';

const DEFAULT_SETTINGS: AssistantSettings = {
  language: 'auto',
  voicePitch: 0.88, // Male resonant pitch
  voiceRate: 1.0,
  autoSpeak: true,
  soundEffects: true,
  autoOpenWebsites: false,
};

export default function App() {
  // Settings & configuration state
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    // Default initial welcome greeting
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        text: 'नमस्ते! मैं **VIVEK AI** हूँ — आपका आधुनिक पर्सनल असिस्टेंट।\n\nआप मुझसे हिंदी या अंग्रेज़ी में बात कर सकते हैं। आप मुझे सीधे आवाज़ में निर्देश दे सकते हैं, जैसे: *"Open YouTube"*, *"Gmail खोलो"*, *"आज की मुख्य खबरें खोजो"*, या कोई भी सवाल पूछ सकते हैं।\n\nमैं आपकी क्या मदद करूँ?',
        timestamp: Date.now(),
        detectedLang: 'hi',
      },
    ];
  });

  // Input & Assistant Execution State
  const [inputText, setInputText] = useState('');
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals & Action Controls
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [sessionAllowedActions, setSessionAllowedActions] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerInitialSecs, setTimerInitialSecs] = useState(300);
  const [showSettings, setShowSettings] = useState(false);

  // Speech Recognition Reference
  const recognitionRef = useRef<AssistantSpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Persist messages & settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {
      // safe ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // safe ignore
    }
  }, [settings]);

  // Initialize Speech Voices
  useEffect(() => {
    initSpeechVoices();
  }, []);

  // Monitor Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Speech Recognition setup
  const initRecognition = () => {
    if (!isSpeechRecognitionSupported()) return null;

    const langTarget =
      settings.language === 'hi' ? 'hi-IN' : settings.language === 'en' ? 'en-US' : 'en-US';

    const rec = new AssistantSpeechRecognition(
      {
        onStart: () => {
          setIsMicActive(true);
          setAssistantState('listening');
          if (settings.soundEffects) playAudioCue('mic_start');
        },
        onInterimResult: (transcript) => {
          setInputText(transcript);
        },
        onFinalResult: (transcript) => {
          setInputText(transcript);
          setIsMicActive(false);
          setAssistantState('idle');
          if (settings.soundEffects) playAudioCue('mic_stop');
          // Auto-send once speech recognition finalizes
          handleSendMessage(transcript);
        },
        onError: (err) => {
          console.warn('Speech error:', err);
          setIsMicActive(false);
          setAssistantState('idle');
          if (settings.soundEffects) playAudioCue('mic_stop');
        },
        onEnd: () => {
          setIsMicActive(false);
          if (assistantState === 'listening') {
            setAssistantState('idle');
          }
        },
      },
      langTarget
    );

    return rec;
  };

  // Toggle Voice Input
  const handleToggleMic = () => {
    // If currently speaking, stop voice speech first
    if (isSpeaking() || assistantState === 'speaking') {
      stopSpeaking();
      setAssistantState('idle');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert(
        'Speech Recognition is not supported by your browser. Please use Google Chrome or Microsoft Edge for microphone input.'
      );
      return;
    }

    if (isMicActive) {
      recognitionRef.current?.stop();
      setIsMicActive(false);
      setAssistantState('idle');
      if (settings.soundEffects) playAudioCue('mic_stop');
    } else {
      stopSpeaking();
      const rec = initRecognition();
      if (rec) {
        recognitionRef.current = rec;
        rec.start();
      }
    }
  };

  // Stop Male Speech Synthesis
  const handleStopSpeech = () => {
    stopSpeaking();
    setAssistantState('idle');
    if (settings.soundEffects) playAudioCue('mic_stop');
  };

  // Speak response in Male Voice
  const speakText = (text: string) => {
    setAssistantState('speaking');
    speakWithMaleVoice(text, {
      pitch: settings.voicePitch,
      rate: settings.voiceRate,
      preferredLang: settings.language,
      onStart: () => setAssistantState('speaking'),
      onEnd: () => setAssistantState('idle'),
      onError: () => setAssistantState('idle'),
    });
  };

  // Execute or Request Chrome Browser Action
  const executeBrowserAction = (url: string, title: string) => {
    if (sessionAllowedActions || settings.autoOpenWebsites) {
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Fallback popup open
        window.location.href = url;
      }
    } else {
      setPendingAction({
        id: 'action-' + Date.now(),
        title,
        url,
        type: 'open_url',
      });
    }
  };

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Main User Message Submission
  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : inputText;
    const prompt = raw.trim();
    if (!prompt || isLoading) return;

    // Reset input box
    setInputText('');
    stopSpeaking();

    // Check for quick direct actions before sending to Gemini
    const quickCmd = parseQuickCommand(prompt);

    if (quickCmd) {
      if (quickCmd.action === 'fullscreen') {
        handleToggleFullscreen();
        const actionMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: quickCmd.displayText || 'Fullscreen mode toggled.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, { id: 'u-' + Date.now(), role: 'user', text: prompt, timestamp: Date.now() }, actionMsg]);
        if (settings.autoSpeak) speakText(actionMsg.text);
        return;
      }

      if (quickCmd.action === 'stop_speech') {
        handleStopSpeech();
        return;
      }

      if (quickCmd.action === 'open_calculator') {
        setShowCalculator(true);
        const actionMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: 'Opening Calculator for you. (कैलकुलेटर खोल दिया गया है)',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, { id: 'u-' + Date.now(), role: 'user', text: prompt, timestamp: Date.now() }, actionMsg]);
        if (settings.autoSpeak) speakText(actionMsg.text);
        return;
      }

      if (quickCmd.action === 'timer' && quickCmd.seconds) {
        setTimerInitialSecs(quickCmd.seconds);
        setShowTimer(true);
        const actionMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: quickCmd.displayText || `Timer set for ${quickCmd.seconds} seconds.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, { id: 'u-' + Date.now(), role: 'user', text: prompt, timestamp: Date.now() }, actionMsg]);
        if (settings.autoSpeak) speakText(actionMsg.text);
        return;
      }

      if (quickCmd.action === 'open_url' && quickCmd.url) {
        const userMsg: ChatMessage = {
          id: 'u-' + Date.now(),
          role: 'user',
          text: prompt,
          timestamp: Date.now(),
        };
        const assistantMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          text: quickCmd.displayText || `Opening ${quickCmd.title}...`,
          timestamp: Date.now(),
          action: quickCmd,
        };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        if (settings.autoSpeak) speakText(assistantMsg.text);
        executeBrowserAction(quickCmd.url, quickCmd.title || 'Browser Action');
        return;
      }
    }

    // Normal Gemini Chat Flow with Real-Time Streaming
    const userMessage: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      text: prompt,
      timestamp: Date.now(),
      detectedLang: hasHindiCharacters(prompt) ? 'hi' : 'en',
    };

    const assistantMsgId = 'msg-' + Date.now();
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMsg]);
    setIsLoading(true);
    setAssistantState('thinking');

    // Create streaming male voice queue for instant sentence audio output
    let voiceQueue: StreamingMaleVoiceQueue | null = null;
    if (settings.autoSpeak) {
      voiceQueue = createStreamingVoiceQueue({
        pitch: settings.voicePitch,
        rate: settings.voiceRate,
        preferredLang: settings.language,
        onStart: () => setAssistantState('speaking'),
        onEnd: () => setAssistantState('idle'),
        onError: () => setAssistantState('idle'),
      });
    }

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text,
      }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: historyPayload,
          language: settings.language,
          searchEnabled,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server stream status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let accumulatedSources: Array<{ title: string; url: string }> = [];
      let receivedAnyChunk = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmedLine.slice(6));

              if (payload.text) {
                if (!receivedAnyChunk) {
                  receivedAnyChunk = true;
                  setIsLoading(false);
                }
                accumulatedText += payload.text;
                voiceQueue?.pushChunk(payload.text);

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          text: accumulatedText,
                          detectedLang: hasHindiCharacters(accumulatedText) ? 'hi' : 'en',
                        }
                      : m
                  )
                );
              }

              if (payload.sources && Array.isArray(payload.sources)) {
                accumulatedSources = payload.sources;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, sources: accumulatedSources } : m
                  )
                );
              }

              if (payload.done) {
                setIsLoading(false);
              }
            } catch {
              // Ignore partial JSON parse chunks
            }
          }
        }
      }

      // Finalize audio sentence buffer
      voiceQueue?.finish();
      setIsLoading(false);

      if (!settings.autoSpeak) {
        setAssistantState('idle');
      }
    } catch (err: any) {
      console.warn('Stream failed or fallback needed:', err);
      // Fallback to standard chat endpoint if SSE fails
      try {
        const historyPayload = messages.slice(-8).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          text: m.text,
        }));

        const fbResp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            history: historyPayload,
            language: settings.language,
            searchEnabled,
          }),
        });

        const fbData = await fbResp.json();
        const assistantText = fbData.text || 'I am ready to assist you.';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: assistantText,
                  sources: fbData.sources || [],
                  detectedLang: hasHindiCharacters(assistantText) ? 'hi' : 'en',
                }
              : m
          )
        );
        setIsLoading(false);

        if (settings.autoSpeak) {
          speakText(assistantText);
        } else {
          setAssistantState('idle');
        }
      } catch (fbErr) {
        setIsLoading(false);
        setAssistantState('idle');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: 'क्षमा करें विवेक जी, सर्वर से संपर्क करने में समस्या आई। कृपया अपनी इंटरनेट कनेक्टिविटी और API Key जांचें।',
                }
              : m
          )
        );
      }
    }
  };

  // Clear conversation
  const handleClearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        text: 'बातचीत रीसेट कर दी गई है। मैं आपकी अगली क्या सहायता कर सकता हूँ?',
        timestamp: Date.now(),
        detectedLang: 'hi',
      },
    ]);
    setShowSettings(false);
  };

  // Export conversation as Markdown
  const handleExportChat = () => {
    const exportText = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? '👤 User' : '🤖 VIVEK AI'} (${new Date(
            m.timestamp
          ).toLocaleString()})\n\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VIVEK_AI_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090d] text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        language={settings.language}
        onLanguageChange={(lang) => {
          setSettings((prev) => ({ ...prev, language: lang }));
          if (recognitionRef.current) {
            recognitionRef.current.setLanguage(lang === 'hi' ? 'hi-IN' : 'en-US');
          }
        }}
        searchEnabled={searchEnabled}
        onToggleSearch={() => setSearchEnabled((prev) => !prev)}
        autoSpeak={settings.autoSpeak}
        onToggleAutoSpeak={() =>
          setSettings((prev) => ({ ...prev, autoSpeak: !prev.autoSpeak }))
        }
        onOpenSettings={() => setShowSettings(true)}
        onResetChat={handleClearChat}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col items-center overflow-hidden relative">
        {/* Holographic Assistant Core visualizer */}
        <div className="shrink-0 w-full pt-1 pb-1">
          <AssistantCore
            state={assistantState}
            isMicActive={isMicActive}
            onToggleMic={handleToggleMic}
            onStopSpeech={handleStopSpeech}
            language={settings.language}
            searchEnabled={searchEnabled}
          />
        </div>

        {/* Scrollable Conversation History Stream */}
        <ChatInterface
          messages={messages}
          onReplayVoice={(text) => speakText(text)}
          onSelectSuggestion={(prompt) => {
            setInputText(prompt);
            handleSendMessage(prompt);
          }}
          onRequestAction={(act) => setPendingAction(act)}
          isLoading={isLoading}
        />
      </main>

      {/* Input Console Bar */}
      <div className="w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-800/90 px-4 py-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          {/* Microphone Quick Voice Trigger Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
              isMicActive
                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 animate-pulse'
                : 'bg-slate-900 border border-slate-700/80 text-cyan-400 hover:border-cyan-400 hover:text-white'
            }`}
            title={isMicActive ? 'Listening... click to stop' : 'Voice Input (Microphone)'}
            aria-label={isMicActive ? 'Stop listening' : 'Start voice input'}
          >
            {isMicActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isMicActive
                  ? 'Listening to your voice... (बोलिए...)'
                  : settings.language === 'hi'
                  ? 'विवेक AI से कुछ भी पूछें... (उदा. "YouTube खोलो", "मौसम बताओ")'
                  : 'Ask VIVEK AI anything, or say "Open YouTube", "Gmail kholo"...'
              }
              aria-label="Ask VIVEK AI message"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all pr-12 shadow-inner"
            />

            {/* Google Search Grounding indicator pill inside input */}
            {searchEnabled && (
              <span className="absolute right-3 hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-800/60">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>SEARCH</span>
              </span>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:shadow-none active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Send Message"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      {/* Quick Launch Websites & Tools Dock */}
      <QuickActionsDock
        onTriggerUrl={(url, title) => executeBrowserAction(url, title)}
        onOpenCalculator={() => setShowCalculator(true)}
        onOpenTimer={() => setShowTimer(true)}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        isSpeaking={assistantState === 'speaking'}
        onStopSpeech={handleStopSpeech}
      />

      {/* Chrome Browser Action Permission Modal */}
      <ActionPermissionModal
        action={pendingAction}
        onApprove={(alwaysAllow) => {
          if (alwaysAllow) setSessionAllowedActions(true);
          if (pendingAction?.url) {
            window.open(pendingAction.url, '_blank', 'noopener,noreferrer');
          }
          setPendingAction(null);
        }}
        onCancel={() => setPendingAction(null)}
      />

      {/* Interactive Calculator Modal */}
      <CalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />

      {/* Timer / Countdown Widget Modal */}
      <TimerWidget
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
        initialSeconds={timerInitialSecs}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
      />
    </div>
  );
}
