/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedCommand } from './utils/commandParser';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
  action?: ParsedCommand | null;
  detectedLang?: 'hi' | 'en';
}

export interface AssistantSettings {
  language: 'auto' | 'hi' | 'en';
  voicePitch: number;
  voiceRate: number;
  autoSpeak: boolean;
  soundEffects: boolean;
  autoOpenWebsites: boolean;
}

export interface PendingAction {
  id: string;
  title: string;
  url?: string;
  type: string;
  query?: string;
}
