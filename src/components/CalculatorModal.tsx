/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Delete, Equal } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? d : prev + d));
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = () => {
    try {
      const fullExpr = equation + display;
      // Sanitize input: only digits, spaces, and math operators
      if (!/^[0-9+\-*/. ()]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }
      // Safe evaluation using Function
      const result = new Function(`return (${fullExpr})`)();
      setDisplay(String(Number(result.toFixed(6))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 id="calculator-modal-title" className="text-sm font-semibold text-cyan-300 font-mono tracking-wider">
            VIVEK AI CALCULATOR
          </h2>
          <button
            onClick={onClose}
            aria-label="Close calculator"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-right font-mono">
          <div className="h-4 text-[11px] text-slate-500 overflow-hidden">{equation}</div>
          <div className="text-2xl font-bold text-white tracking-tight truncate">{display}</div>
        </div>

        {/* Buttons Grid */}
        <div className="mt-4 grid grid-cols-4 gap-2 font-mono text-sm">
          <button
            onClick={handleClear}
            className="p-3 rounded-xl bg-red-950/60 border border-red-900/50 text-red-300 hover:bg-red-900/80 font-bold col-span-2 transition-colors active:scale-95"
          >
            AC
          </button>
          <button
            onClick={() => setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'))}
            aria-label="Backspace"
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors active:scale-95"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOp('/')}
            aria-label="Divide"
            className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 font-bold transition-colors active:scale-95"
          >
            ÷
          </button>

          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOp('*')}
            className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 font-bold transition-colors active:scale-95"
          >
            ×
          </button>

          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 font-bold transition-colors active:scale-95"
          >
            -
          </button>

          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n)}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 font-bold transition-colors active:scale-95"
          >
            +
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium col-span-2 transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            aria-label="Calculate result"
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
          >
            <Equal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
