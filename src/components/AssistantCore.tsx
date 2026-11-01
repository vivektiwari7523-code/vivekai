/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Activity } from 'lucide-react';
import { AssistantState } from '../types';

interface AssistantCoreProps {
  state: AssistantState;
  isMicActive: boolean;
  onToggleMic: () => void;
  onStopSpeech: () => void;
  language: 'auto' | 'hi' | 'en';
  searchEnabled: boolean;
}

export const AssistantCore: React.FC<AssistantCoreProps> = ({
  state,
  isMicActive,
  onToggleMic,
  onStopSpeech,
  language,
  searchEnabled,
}) => {
  // Compute visual colors based on assistant state
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isListening = state === 'listening' || isMicActive;

  const stateColors = {
    idle: 'from-cyan-500/20 via-blue-600/10 to-transparent border-cyan-500/30 text-cyan-400',
    listening: 'from-emerald-500/30 via-cyan-500/20 to-transparent border-emerald-400 text-emerald-400',
    thinking: 'from-purple-500/30 via-indigo-500/20 to-transparent border-purple-400 text-purple-300',
    speaking: 'from-cyan-400/40 via-blue-500/30 to-transparent border-cyan-300 text-cyan-200',
  }[state];

  const statusLabel = {
    idle: language === 'hi' ? 'तैयार • आपकी सेवा में' : 'ONLINE • READY TO ASSIST',
    listening: language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'LISTENING... SPEAK NOW',
    thinking: language === 'hi' ? 'सोच रहा हूँ...' : 'PROCESSING WITH GEMINI 3.8...',
    speaking: language === 'hi' ? 'बोल रहा हूँ (Male Voice)' : 'SPEAKING (MALE SYNTH V1)',
  }[state];

  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      {/* Background ambient glow */}
      <div
        className={`absolute w-72 h-72 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
          isListening
            ? 'bg-emerald-500 scale-110'
            : isThinking
            ? 'bg-purple-600 animate-pulse'
            : isSpeaking
            ? 'bg-cyan-500 scale-125'
            : 'bg-blue-600'
        }`}
      />

      {/* Futuristic Orbit Rings */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
        {/* Outer dashed spinning ring */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed border-cyan-500/40 transition-transform duration-1000 ${
            isThinking
              ? 'animate-spin border-purple-400'
              : isSpeaking
              ? 'animate-[spin_4s_linear_infinite] border-cyan-400'
              : isListening
              ? 'animate-[spin_2s_linear_infinite] border-emerald-400 scale-105'
              : 'animate-[spin_25s_linear_infinite]'
          }`}
          style={{ animationDuration: isThinking ? '3s' : undefined }}
        />

        {/* Counter-rotating segmented ring */}
        <div
          className={`absolute inset-3 rounded-full border border-slate-700/60 border-t-cyan-400/80 border-b-indigo-500/80 transition-all duration-700 ${
            isSpeaking ? 'animate-[spin_6s_linear_infinite_reverse]' : 'animate-[spin_18s_linear_infinite_reverse]'
          }`}
        />

        {/* Pulse ripple when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
        )}

        {/* Central Core Sphere (Interactive Button) */}
        <button
          onClick={() => {
            if (isSpeaking) {
              onStopSpeech();
            } else {
              onToggleMic();
            }
          }}
          type="button"
          aria-label={isSpeaking ? 'Stop speaking' : isListening ? 'Stop listening' : 'Start voice command'}
          className={`relative z-10 w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl backdrop-blur-md border ${
            isListening
              ? 'bg-slate-900/90 border-emerald-400 shadow-emerald-500/40 ring-4 ring-emerald-500/20 scale-105'
              : isThinking
              ? 'bg-slate-900/90 border-purple-400 shadow-purple-500/40 ring-4 ring-purple-500/20'
              : isSpeaking
              ? 'bg-slate-900/90 border-cyan-300 shadow-cyan-400/50 ring-4 ring-cyan-400/30 scale-105'
              : 'bg-slate-950/80 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/20 hover:scale-105'
          }`}
        >
          {/* Inner holographic gradients */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${stateColors}`} />

          {/* Center Dynamic Icon / Waveform */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {isSpeaking ? (
              <div className="flex items-center gap-1 h-8">
                {/* Simulated dynamic voice equalizer bars */}
                {[0.4, 0.8, 0.3, 1.0, 0.6, 0.9, 0.5, 0.7].map((heightScale, i) => (
                  <span
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-bounce"
                    style={{
                      height: `${14 + heightScale * 18}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s',
                    }}
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="flex flex-col items-center">
                <Mic className="w-8 h-8 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-emerald-300 mt-1 uppercase">
                  RECORDING
                </span>
              </div>
            ) : isThinking ? (
              <div className="flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-[10px] font-mono tracking-widest text-purple-300 mt-1 uppercase">
                  GEMINI AI
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform">
                <div className="relative">
                  <Mic className="w-8 h-8 text-cyan-400" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-wider text-slate-300 mt-1 font-semibold">
                  TAP TO SPEAK
                </span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Cyber HUD State readout */}
      <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono shadow-inner">
          <Activity
            className={`w-3.5 h-3.5 ${
              isListening
                ? 'text-emerald-400 animate-pulse'
                : isSpeaking
                ? 'text-cyan-400 animate-pulse'
                : isThinking
                ? 'text-purple-400 animate-spin'
                : 'text-slate-500'
            }`}
          />
          <span
            className={`font-semibold tracking-wide ${
              isListening
                ? 'text-emerald-400'
                : isSpeaking
                ? 'text-cyan-300'
                : isThinking
                ? 'text-purple-300'
                : 'text-slate-300'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Telemetry chips */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
            VOICE: MALE HINDI/EN
          </span>
          {searchEnabled && (
            <span className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-600/40 text-blue-300">
              WEB SEARCH ON
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
            LANG: {language.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
