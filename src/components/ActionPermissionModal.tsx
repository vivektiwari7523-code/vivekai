/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, AlertCircle, X, Check } from 'lucide-react';
import { PendingAction } from '../types';

interface ActionPermissionModalProps {
  action: PendingAction | null;
  onApprove: (alwaysAllow: boolean) => void;
  onCancel: () => void;
}

export const ActionPermissionModal: React.FC<ActionPermissionModalProps> = ({
  action,
  onApprove,
  onCancel,
}) => {
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!action) return null;

  let domain = '';
  if (action.url) {
    try {
      domain = new URL(action.url).hostname;
    } catch {
      domain = action.url;
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow header bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        {/* Close icon */}
        <button
          onClick={onCancel}
          aria-label="Close permission dialog"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                BROWSER ACTION PERMISSION
              </span>
            </div>
            <h2 id="permission-dialog-title" className="text-lg font-bold text-white mt-1">
              Permission Required
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              अनुमति आवश्यक: VIVEK AI आपके ब्राउज़र में निम्नलिखित लिंक या क्रिया खोलना चाहता है:
            </p>
          </div>
        </div>

        {/* Target details card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Target Action:</span>
            <span className="text-xs font-semibold text-cyan-300 font-mono">{action.title}</span>
          </div>

          {action.url && (
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <span className="text-xs text-slate-400 shrink-0">Destination:</span>
              <span className="text-xs text-slate-300 truncate font-mono" title={action.url}>
                {action.url}
              </span>
            </div>
          )}

          {domain && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Host verified: {domain}</span>
            </div>
          )}
        </div>

        {/* Notice for iframe sandbox */}
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <span>
            Clicking <b>"Allow & Open"</b> directly grants browser consent and navigates to the requested site.
          </span>
        </div>

        {/* Session consent checkbox */}
        <label className="mt-4 flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400"
          />
          <span>Always allow website actions during this session (इस सत्र के लिए याद रखें)</span>
        </label>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel (रद्द करें)
          </button>

          {/* If URL exists, also provide direct open in target _blank */}
          {action.url ? (
            <a
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onApprove(rememberChoice)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Allow & Open (खोलें)</span>
            </a>
          ) : (
            <button
              onClick={() => onApprove(rememberChoice)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Allow Action</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
