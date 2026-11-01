/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { playAudioCue } from '../utils/audioFeedback';

interface TimerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  isOpen,
  onClose,
  initialSeconds = 300,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (initialSeconds) {
      setTotalSeconds(initialSeconds);
      setRemaining(initialSeconds);
      setIsRunning(true);
    }
  }, [initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            playAudioCue('timer_done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const setPreset = (secs: number) => {
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <h2 id="timer-modal-title" className="text-sm font-semibold text-purple-300 font-mono">
              VIVEK AI TIMER
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close timer"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Display */}
        <div className="mt-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-purple-500 transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                {remaining === 0 ? 'COMPLETE!' : isRunning ? 'COUNTING DOWN' : 'PAUSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {[
            { label: '1m', secs: 60 },
            { label: '3m', secs: 180 },
            { label: '5m', secs: 300 },
            { label: '10m', secs: 600 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setPreset(preset.secs)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-mono text-slate-300 hover:text-purple-300 border border-slate-700/60 transition-colors"
            >
              +{preset.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setRemaining(totalSeconds);
              setIsRunning(false);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors active:scale-95"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{remaining === 0 ? 'Restart' : 'Start'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
