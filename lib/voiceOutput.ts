/**
 * Voice output service using Web Speech API
 */

class VoiceOutputService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  
  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Load voices when they change
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }
  
  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }
  
  isSupported(): boolean {
    return this.synth !== null;
  }
  
  speak(text: string, options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      // Cancel any ongoing speech
      this.stop();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if specified
      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Set other options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(event);
      };
      
      this.isSpeaking = true;
      this.synth.speak(utterance);
    });
  }
  
  stop() {
    if (this.synth && this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
  
  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }
  
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }
  
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  
  getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const voiceOutput = new VoiceOutputService();
