/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cleanTextForSpeech, detectSpeechLanguage } from './commandParser';

export interface VoiceOptions {
  pitch?: number;
  rate?: number;
  preferredLang?: 'auto' | 'hi' | 'en';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

/**
 * Initializes and listens for available speech synthesis voices
 */
export function initSpeechVoices(callback?: (voices: SpeechSynthesisVoice[]) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const update = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    if (callback) callback(cachedVoices);
  };

  update();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
  }
}

/**
 * Intelligent voice selection tailored for a Male Persona in Hindi or English
 */
export function pickMaleVoice(
  langTarget: 'hi-IN' | 'en-US',
  voices: SpeechSynthesisVoice[] = getAvailableVoices()
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const isHindi = langTarget.startsWith('hi');

  if (isHindi) {
    // Look for male Hindi voices
    const hindiMale = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        lang.includes('hi') &&
        (name.includes('male') ||
          name.includes('ravi') ||
          name.includes('madhav') ||
          name.includes('hemant') ||
          name.includes('neerja') === false)
      );
    });
    if (hindiMale) return hindiMale;

    const anyHindi = voices.find((v) => v.lang.toLowerCase().includes('hi'));
    if (anyHindi) return anyHindi;

    const indianEnglish = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('en-in') &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi'))
    );
    if (indianEnglish) return indianEnglish;
  }

  // English Male selection
  const englishMale = voices.find((v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    const isEn = lang.startsWith('en');
    const isMaleName =
      name.includes('male') ||
      name.includes('david') ||
      name.includes('george') ||
      name.includes('mark') ||
      name.includes('guy') ||
      name.includes('natural') ||
      name.includes('james') ||
      name.includes('daniel');
    return isEn && isMaleName;
  });
  if (englishMale) return englishMale;

  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeStreamingQueue: StreamingMaleVoiceQueue | null = null;

/**
 * Streaming sentence-by-sentence male voice speaker
 * Enables speech playback as soon as the first sentence is generated!
 */
export class StreamingMaleVoiceQueue {
  private queue: string[] = [];
  private isProcessing: boolean = false;
  private buffer: string = '';
  private options: VoiceOptions = {};
  private stopped: boolean = false;

  constructor(options: VoiceOptions = {}) {
    this.options = options;
  }

  public updateOptions(options: Partial<VoiceOptions>) {
    this.options = { ...this.options, ...options };
  }

  public pushChunk(chunk: string) {
    if (this.stopped || !chunk) return;
    this.buffer += chunk;

    // Match sentence boundaries: Hindi '।' or '.', '?', '!', or newline followed by space
    const boundaryRegex = /([।?!.\n]+[\s]+)/;
    const parts = this.buffer.split(boundaryRegex);

    if (parts.length > 2) {
      let i = 0;
      for (; i < parts.length - 2; i += 2) {
        const sentence = (parts[i] + (parts[i + 1] || '')).trim();
        if (sentence) {
          const cleaned = cleanTextForSpeech(sentence);
          if (cleaned && cleaned.length > 1) {
            this.enqueueSentence(cleaned);
          }
        }
      }
      this.buffer = parts.slice(i).join('');
    }
  }

  public finish() {
    if (this.stopped) return;
    if (this.buffer.trim()) {
      const cleaned = cleanTextForSpeech(this.buffer.trim());
      if (cleaned && cleaned.length > 1) {
        this.enqueueSentence(cleaned);
      }
      this.buffer = '';
    }
    if (!this.isProcessing && this.queue.length === 0) {
      this.options.onEnd?.();
    }
  }

  private enqueueSentence(sentence: string) {
    this.queue.push(sentence);
    if (!this.isProcessing) {
      this.playNext();
    }
  }

  private playNext() {
    if (this.stopped) return;
    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.options.onEnd?.();
      return;
    }

    this.isProcessing = true;
    const sentence = this.queue.shift()!;
    const voices = getAvailableVoices();
    const langCode = detectSpeechLanguage(sentence, this.options.preferredLang || 'auto');
    const selectedVoice = pickMaleVoice(langCode, voices);

    const utterance = new SpeechSynthesisUtterance(sentence);
    activeUtterance = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || langCode;
    } else {
      utterance.lang = langCode;
    }

    utterance.pitch = this.options.pitch ?? 0.88;
    // Set a crisp responsive speed (1.05x)
    utterance.rate = this.options.rate ?? 1.05;

    utterance.onstart = () => {
      this.options.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      this.playNext();
    };

    utterance.onerror = (e) => {
      console.warn('Utterance error:', e);
      activeUtterance = null;
      this.playNext();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      this.playNext();
    }
  }

  public stop() {
    this.stopped = true;
    this.queue = [];
    this.buffer = '';
    this.isProcessing = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    this.options.onEnd?.();
  }
}

/**
 * Creates and tracks an active streaming voice queue
 */
export function createStreamingVoiceQueue(options: VoiceOptions = {}): StreamingMaleVoiceQueue {
  stopSpeaking();
  const queue = new StreamingMaleVoiceQueue(options);
  activeStreamingQueue = queue;
  return queue;
}

/**
 * Speaks full text using a natural male voice profile
 */
export function speakWithMaleVoice(
  rawText: string,
  options: VoiceOptions = {}
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();

  const textToSpeak = cleanTextForSpeech(rawText);
  if (!textToSpeak) {
    options.onEnd?.();
    return;
  }

  const voices = getAvailableVoices();
  const langCode = detectSpeechLanguage(rawText, options.preferredLang || 'auto');
  const selectedVoice = pickMaleVoice(langCode, voices);

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  activeUtterance = utterance;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || langCode;
  } else {
    utterance.lang = langCode;
  }

  utterance.pitch = options.pitch ?? 0.88;
  utterance.rate = options.rate ?? 1.05;

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis event:', e);
    activeUtterance = null;
    options.onError?.(e);
    options.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Failed to speak with male voice:', err);
    activeUtterance = null;
    options.onEnd?.();
  }
}

/**
 * Stops any ongoing speech synthesis immediately
 */
export function stopSpeaking(): void {
  if (activeStreamingQueue) {
    activeStreamingQueue.stop();
    activeStreamingQueue = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}
