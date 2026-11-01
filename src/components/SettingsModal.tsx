/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Languages,
  Sliders,
  Volume2,
  Trash2,
  Download,
  Shield,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AssistantSettings } from '../types';
import { speakWithMaleVoice } from '../utils/speechSynthesis';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  onClearChat: () => void;
  onExportChat: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearChat,
  onExportChat,
}) => {
  if (!isOpen) return null;

  const testVoiceSample = () => {
    const sample =
      settings.language === 'hi'
        ? 'नमस्ते विवेक जी! मैं VIVEK AI हूँ। यह मेरा मेल वॉयस ऑडियो टेस्ट है।'
        : 'Hello Vivek! This is VIVEK AI, testing my synthesized male voice profile.';
    speakWithMaleVoice(sample, {
      pitch: settings.voicePitch,
      rate: settings.voiceRate,
      preferredLang: settings.language,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-white">
                VIVEK AI Settings & Voice Configuration
              </h2>
              <p className="text-xs text-slate-400">Personalize language, male voice, and browser permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Language Selection */}
          <section className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              <Languages className="w-4 h-4 text-cyan-400" />
              <span>Language Preference (भाषा प्राथमिकता)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'Auto Detect (स्वतः)', desc: 'Detects Hindi & English' },
                { id: 'hi', label: 'हिंदी (Hindi)', desc: 'Pure Hindi responses' },
                { id: 'en', label: 'English', desc: 'Standard English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onUpdateSettings({ language: lang.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.language === lang.id
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-500/15'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{lang.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lang.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Male Voice Synthesis Controls */}
          <section className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span>Male Voice Pitch & Tone</span>
              </div>
              <button
                onClick={testVoiceSample}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-600/50 hover:bg-blue-900 text-blue-300 text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Male Voice</span>
              </button>
            </div>

            {/* Pitch slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Voice Pitch (0.85 = Deep Male Baritone)</span>
                <span className="font-mono text-cyan-300">{settings.voicePitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.2"
                step="0.05"
                value={settings.voicePitch}
                onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Rate slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Speech Speed / Rate</span>
                <span className="font-mono text-cyan-300">{settings.voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.4"
                step="0.05"
                value={settings.voiceRate}
                onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => onUpdateSettings({ voicePitch: 0.88, voiceRate: 1.0 })}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to default male voice profile</span>
              </button>
            </div>
          </section>

          {/* Behavior Toggles */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Automation & Privacy
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-xs font-medium text-slate-200">Auto-speak assistant responses</div>
                <div className="text-[11px] text-slate-400">Automatically read answers in male voice</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-xs font-medium text-slate-200">Synthesized audio cues</div>
                <div className="text-[11px] text-slate-400">Play pleasant sound effects for mic start, stop and alarms</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-xs font-medium text-slate-200">Skip prompt for website launching</div>
                <div className="text-[11px] text-slate-400">Directly navigate without permission modal confirmation</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoOpenWebsites}
                onChange={(e) => onUpdateSettings({ autoOpenWebsites: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
              />
            </label>
          </section>

          {/* Conversation Data Actions */}
          <section className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onExportChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Conversation</span>
            </button>

            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-xs font-medium text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat History</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
