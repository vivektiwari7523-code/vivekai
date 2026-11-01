/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bot,
  User,
  Volume2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Globe,
  Youtube,
  Search,
  Mail,
  Clock,
  Compass,
} from 'lucide-react';
import { ChatMessage, PendingAction } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onReplayVoice: (text: string) => void;
  onSelectSuggestion: (prompt: string) => void;
  onRequestAction: (action: PendingAction) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onReplayVoice,
  onSelectSuggestion,
  onRequestAction,
  isLoading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
    { text: 'Open YouTube and play lo-fi songs', lang: 'en', icon: <Youtube className="w-3.5 h-3.5 text-red-400" /> },
    { text: 'यूट्यूब खोलो और लता मंगेशकर के गाने बजाओ', lang: 'hi', icon: <Youtube className="w-3.5 h-3.5 text-red-400" /> },
    { text: 'Open Gmail and check my emails', lang: 'en', icon: <Mail className="w-3.5 h-3.5 text-amber-400" /> },
    { text: 'Search latest AI and space news with Google', lang: 'en', icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> },
    { text: '5 मिनट का टाइमर सेट करो', lang: 'hi', icon: <Clock className="w-3.5 h-3.5 text-purple-400" /> },
    { text: 'Quantum Computing को आसान हिंदी में समझाइए', lang: 'hi', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
  ];

  // Helper to format basic markdown-like syntax cleanly
  const renderFormattedText = (rawText: string) => {
    // Split into code blocks vs regular text
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        const lang = codeLines[0].match(/^[a-zA-Z0-9_-]+$/) ? codeLines[0] : '';
        const code = lang ? codeLines.slice(1).join('\n') : codeLines.join('\n');

        return (
          <div key={index} className="my-2.5 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-cyan-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bullet points, bold text and paragraphs
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 leading-relaxed">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-2" />;

            // Headings
            if (trimmed.startsWith('### ')) {
              return <h4 key={lIdx} className="font-bold text-cyan-300 text-sm mt-2">{trimmed.slice(4)}</h4>;
            }
            if (trimmed.startsWith('## ')) {
              return <h3 key={lIdx} className="font-bold text-white text-base mt-2.5">{trimmed.slice(3)}</h3>;
            }
            if (trimmed.startsWith('# ')) {
              return <h2 key={lIdx} className="font-extrabold text-white text-lg mt-3">{trimmed.slice(2)}</h2>;
            }

            // Bullet items
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 ml-1">
                  <span className="text-cyan-400 mt-1.5 text-xs">•</span>
                  <span>{formatInline(trimmed.slice(2))}</span>
                </div>
              );
            }

            // Numbered items
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 ml-1">
                  <span className="font-mono text-cyan-400 text-xs mt-0.5">{numMatch[1]}.</span>
                  <span>{formatInline(numMatch[2])}</span>
                </div>
              );
            }

            return <p key={lIdx}>{formatInline(trimmed)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInline = (str: string) => {
    // Simple inline bold replacement (**bold**)
    const tokens = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs font-mono">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-2 pb-8 overflow-y-auto space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mt-4">
            VIVEK AI Personal Assistant
          </h2>
          <p className="text-sm text-slate-400 max-w-md mt-1">
            आवाज़ या टेक्स्ट से कुछ भी पूछें। हिंदी और अंग्रेज़ी दोनों भाषाओं में संपूर्ण नियंत्रण।
          </p>

          {/* Quick Start Suggestions */}
          <div className="mt-6 w-full max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              SUGGESTED COMMANDS / त्वरित सुझाव:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s.text)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all shadow-sm active:scale-98 group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors shrink-0">
                    {s.icon}
                  </div>
                  <span className="truncate">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-cyan-500/20 border border-cyan-400/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm shadow-lg ${
                    isUser
                      ? 'bg-blue-600/90 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Grounding Citations / Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Google Search Grounding Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700/60 hover:border-cyan-400 text-xs text-slate-300 hover:text-cyan-300 transition-colors shadow-sm"
                            title={src.title}
                          >
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                            <span className="truncate max-w-[200px]">{src.title || src.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Browser Action Suggestion Card */}
                  {msg.action && msg.action.url && (
                    <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-600/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-cyan-300 font-mono">
                            {msg.action.title || 'Browser Action'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{msg.action.url}</div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          onRequestAction({
                            id: msg.id,
                            title: msg.action?.title || 'Open Link',
                            url: msg.action?.url,
                            type: msg.action?.action || 'open_url',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs whitespace-nowrap shadow-sm transition-all"
                      >
                        Launch
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Meta & Action Bar */}
                <div
                  className={`flex items-center gap-2 px-1 text-[11px] text-slate-500 font-mono ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {!isUser && (
                    <>
                      <button
                        onClick={() => onReplayVoice(msg.text)}
                        className="p-1 rounded hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Speak in Male Voice"
                        aria-label="Speak in male voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:text-slate-300 hover:bg-slate-800 transition-colors"
                        title="Copy text"
                        aria-label="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>VIVEK AI is processing response...</span>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
