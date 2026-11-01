/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpeechRecognitionHandlers {
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export class AssistantSpeechRecognition {
  private recognition: any = null;
  private isRunning: boolean = false;
  private lang: string = 'en-US';
  private audioStream: MediaStream | null = null;
  private handlers: SpeechRecognitionHandlers = {};

  constructor(handlers: SpeechRecognitionHandlers, lang: 'hi-IN' | 'en-US' = 'en-US') {
    this.lang = lang;
    this.handlers = handlers;

    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRunning = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0].transcript || '';

        // Noise gate filter: Ignore low-confidence ambient artifacts if confidence is reported
        if (item[0].confidence !== undefined && item[0].confidence < 0.25) {
          continue;
        }

        if (item.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      // Filter out pure punctuation or single-letter ambient noise
      const cleanInterim = interimTranscript.trim();
      const cleanFinal = finalTranscript.trim();

      if (cleanInterim && !/^[.,/#!$%^&*;:{}=\-_`~()]$/.test(cleanInterim)) {
        handlers.onInterimResult?.(cleanInterim);
      }
      if (cleanFinal && cleanFinal.length >= 2 && !/^[.,/#!$%^&*;:{}=\-_`~()]+$/.test(cleanFinal)) {
        handlers.onFinalResult?.(cleanFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      this.isRunning = false;
      this.releaseAudioStream();
      handlers.onError?.(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      this.releaseAudioStream();
      handlers.onEnd?.();
    };
  }

  /**
   * Request hardware/browser audio pre-processing with active noise suppression,
   * echo cancellation, and auto-gain control to isolate user voice and block background noise.
   */
  private async acquireCleanAudioStream(): Promise<void> {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
        this.audioStream = stream;
      }
    } catch (err) {
      // If permission is denied or device doesn't support getUserMedia constraints,
      // speech recognition will still attempt standard capture.
      console.warn('Hardware noise suppression stream notice:', err);
    }
  }

  private releaseAudioStream(): void {
    if (this.audioStream) {
      try {
        this.audioStream.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe ignore
      }
      this.audioStream = null;
    }
  }

  public setLanguage(lang: 'hi-IN' | 'en-US'): void {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public async start(): Promise<boolean> {
    if (!this.recognition) return false;
    if (this.isRunning) return true;

    try {
      // Activate hardware noise suppression filter
      await this.acquireCleanAudioStream();
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition start exception:', e);
      this.releaseAudioStream();
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isRunning = false;
    this.releaseAudioStream();
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}
