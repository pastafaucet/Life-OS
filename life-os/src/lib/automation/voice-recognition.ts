import { 
  SpeechRecognition,
  SpeechRecognitionStatic,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  getAudioContext,
  isAudioContextSupported
} from './voice-types';

export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  noiseThreshold: number;
  autoStart: boolean;
}

export interface VoiceResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: string[];
  timestamp: Date;
}

export interface VoiceError {
  error: string;
  code: string;
  message: string;
  timestamp: Date;
}

export type VoiceEventCallback = (result: VoiceResult) => void;
export type VoiceErrorCallback = (error: VoiceError) => void;
export type VoiceStatusCallback = (status: VoiceRecognitionStatus) => void;

export enum VoiceRecognitionStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  ERROR = 'error',
  PERMISSION_DENIED = 'permission_denied',
  NOT_SUPPORTED = 'not_supported'
}

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private config: VoiceRecognitionConfig;
  private status: VoiceRecognitionStatus = VoiceRecognitionStatus.IDLE;
  private isListening: boolean = false;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;

  // Event callbacks
  private onResultCallback: VoiceEventCallback | null = null;
  private onErrorCallback: VoiceErrorCallback | null = null;
  private onStatusCallback: VoiceStatusCallback | null = null;

  constructor(config: Partial<VoiceRecognitionConfig> = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      noiseThreshold: 0.1,
      autoStart: false,
      ...config
    };

    this.initializeRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeRecognition(): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.updateStatus(VoiceRecognitionStatus.NOT_SUPPORTED);
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Set up event listeners
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateStatus(VoiceRecognitionStatus.LISTENING);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleRecognitionError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.status === VoiceRecognitionStatus.LISTENING) {
        this.updateStatus(VoiceRecognitionStatus.IDLE);
      }
    };

    this.updateStatus(VoiceRecognitionStatus.IDLE);
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      this.updateStatus(VoiceRecognitionStatus.INITIALIZING);
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio analysis for volume monitoring
      this.setupAudioAnalysis();
      
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      this.updateStatus(VoiceRecognitionStatus.PERMISSION_DENIED);
      this.onErrorCallback?.({
        error: 'permission_denied',
        code: 'PERMISSION_DENIED',
        message: 'Microphone access is required for voice commands',
        timestamp: new Date()
      });
      return false;
    }
  }

  /**
   * Set up audio analysis for volume monitoring
   */
  private setupAudioAnalysis(): void {
    if (!this.mediaStream) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      this.startVolumeMonitoring();
    } catch (error) {
      console.warn('Audio analysis setup failed:', error);
    }
  }

  /**
   * Monitor audio volume levels
   */
  private startVolumeMonitoring(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyzeVolume = () => {
      if (!this.analyser || !this.isListening) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = average / 255; // Normalize to 0-1

      this.volumeCallback?.(volume);
      
      requestAnimationFrame(analyzeVolume);
    };

    analyzeVolume();
  }

  /**
   * Start voice recognition
   */
  async start(): Promise<void> {
    if (this.status === VoiceRecognitionStatus.NOT_SUPPORTED) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (this.isListening) {
      return; // Already listening
    }

    // Request permissions if not already granted
    const hasPermissions = this.mediaStream || await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Microphone permissions required');
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.updateStatus(VoiceRecognitionStatus.ERROR);
      throw error;
    }
  }

  /**
   * Stop voice recognition
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.updateStatus(VoiceRecognitionStatus.IDLE);
  }

  /**
   * Toggle voice recognition
   */
  async toggle(): Promise<void> {
    if (this.isListening) {
      this.stop();
    } else {
      await this.start();
    }
  }

  /**
   * Handle recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;

    // Get alternatives
    const alternatives: string[] = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i].transcript !== transcript) {
        alternatives.push(result[i].transcript);
      }
    }

    const voiceResult: VoiceResult = {
      transcript: transcript.trim(),
      confidence,
      isFinal,
      alternatives,
      timestamp: new Date()
    };

    this.onResultCallback?.(voiceResult);

    // Auto-restart if final result and continuous mode
    if (isFinal && this.config.continuous && this.isListening) {
      setTimeout(() => {
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch (error) {
            // Recognition might already be running
          }
        }
      }, 100);
    }
  }

  /**
   * Handle recognition errors
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    console.error('Speech recognition error:', event.error);
    
    let status = VoiceRecognitionStatus.ERROR;
    let message = 'Voice recognition error occurred';

    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        status = VoiceRecognitionStatus.PERMISSION_DENIED;
        message = 'Microphone permission denied';
        break;
      case 'no-speech':
        message = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        message = 'Audio capture failed. Check microphone connection.';
        break;
      case 'network':
        message = 'Network error occurred during voice recognition';
        break;
      case 'not-allowed':
        message = 'Voice recognition not allowed by browser settings';
        break;
      case 'service-not-allowed':
        message = 'Voice recognition service not available';
        break;
    }

    this.updateStatus(status);
    
    this.onErrorCallback?.({
      error: event.error,
      code: event.error.toUpperCase().replace('-', '_'),
      message,
      timestamp: new Date()
    });
  }

  /**
   * Update status and notify callbacks
   */
  private updateStatus(newStatus: VoiceRecognitionStatus): void {
    this.status = newStatus;
    this.onStatusCallback?.(newStatus);
  }

  /**
   * Set event callbacks
   */
  onResult(callback: VoiceEventCallback): void {
    this.onResultCallback = callback;
  }

  onError(callback: VoiceErrorCallback): void {
    this.onErrorCallback = callback;
  }

  onStatusChange(callback: VoiceStatusCallback): void {
    this.onStatusCallback = callback;
  }

  onVolumeChange(callback: (volume: number) => void): void {
    this.volumeCallback = callback;
  }

  /**
   * Get current status
   */
  getStatus(): VoiceRecognitionStatus {
    return this.status;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if voice recognition is supported
   */
  static isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VoiceRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.recognition = null;
    this.analyser = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;
    this.volumeCallback = null;
  }
}

// Export singleton instance
export const voiceRecognitionService = new VoiceRecognitionService({
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  autoStart: false
});

// Example usage
export function testVoiceRecognition() {
  const service = new VoiceRecognitionService();
  
  service.onResult((result) => {
    console.log('Voice result:', result);
  });
  
  service.onError((error) => {
    console.error('Voice error:', error);
  });
  
  service.onStatusChange((status) => {
    console.log('Voice status:', status);
  });
  
  service.onVolumeChange((volume) => {
    console.log('Voice volume:', volume);
  });
  
  return service;
}
