/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Youtube,
  Search,
  Mail,
  Github,
  MapPin,
  Calculator,
  Clock,
  Maximize2,
  Minimize2,
  VolumeX,
} from 'lucide-react';
import { QUICK_WEBSITES } from '../utils/commandParser';

interface QuickActionsDockProps {
  onTriggerUrl: (url: string, title: string) => void;
  onOpenCalculator: () => void;
  onOpenTimer: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  isSpeaking: boolean;
  onStopSpeech: () => void;
}

export const QuickActionsDock: React.FC<QuickActionsDockProps> = ({
  onTriggerUrl,
  onOpenCalculator,
  onOpenTimer,
  onToggleFullscreen,
  isFullscreen,
  isSpeaking,
  onStopSpeech,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />;
      case 'google':
        return <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />;
      case 'gmail':
        return <Mail className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />;
      case 'github':
        return <Github className="w-4 h-4 text-slate-200 group-hover:scale-110 transition-transform" />;
      case 'maps':
        return <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Search className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-md border-t border-slate-800/80 px-3 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Quick Launch Websites */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
            QUICK ACCESS:
          </span>
          {QUICK_WEBSITES.slice(0, 5).map((site) => (
            <button
              key={site.id}
              onClick={() => onTriggerUrl(site.url, site.name)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              title={`Open ${site.name} (${site.nameHindi})`}
              aria-label={`Open ${site.name}`}
            >
              {getIcon(site.id)}
              <span className="text-xs">{site.name}</span>
            </button>
          ))}
        </div>

        {/* Browser & Assistant Tools */}
        <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-800 pl-2">
          {/* Stop Speech button if speaking */}
          {isSpeaking && (
            <button
              onClick={onStopSpeech}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 hover:bg-red-900 text-xs font-medium transition-all animate-pulse"
              title="Stop voice speech"
              aria-label="Stop speech synthesis"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute Voice</span>
            </button>
          )}

          {/* Calculator modal trigger */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            title="Open Interactive Calculator"
            aria-label="Open Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Calculator</span>
          </button>

          {/* Timer trigger */}
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-purple-300 transition-all active:scale-95"
            title="Set Countdown Timer / Alarm"
            aria-label="Open Timer"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Timer</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
