/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Globe,
  Volume2,
  VolumeX,
  Settings,
  Languages,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  language: 'auto' | 'hi' | 'en';
  onLanguageChange: (lang: 'auto' | 'hi' | 'en') => void;
  searchEnabled: boolean;
  onToggleSearch: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenSettings: () => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  searchEnabled,
  onToggleSearch,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenSettings,
  onResetChat,
}) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 shrink-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm md:text-base tracking-wider text-white">
                VIVEK <span className="text-cyan-400">AI</span>
              </h1>
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                v2.5 ASSISTANT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono -mt-0.5 hidden md:block">
              Hindi & English Intelligent Male Persona
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => onLanguageChange('auto')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'auto'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Auto-detect Hindi & English"
            >
              AUTO
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="हिंदी मोड"
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English Mode"
            >
              EN
            </button>
          </div>

          {/* Web Search Grounding Toggle */}
          <button
            onClick={onToggleSearch}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              searchEnabled
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/60 shadow-sm shadow-blue-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={searchEnabled ? 'Google Search Grounding Active' : 'Enable Web Search Grounding'}
            aria-label="Toggle Google Search Grounding"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Auto Speak Voice Mute Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`p-2 rounded-xl text-xs transition-all border ${
              autoSpeak
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={autoSpeak ? 'Male Voice Output Enabled' : 'Voice Muted'}
            aria-label={autoSpeak ? 'Disable Voice Auto-speak' : 'Enable Voice Auto-speak'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* New Chat Reset Button */}
          <button
            onClick={onResetChat}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Settings & Voice controls"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
