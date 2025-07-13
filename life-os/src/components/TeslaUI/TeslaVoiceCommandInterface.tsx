'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  Play,
  Pause,
  Square
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaAlert from './TeslaAlert';

// Speech Recognition types - using any to avoid conflicts with lib.dom.d.ts

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  result?: string;
  status: 'processing' | 'completed' | 'failed';
}

interface VoiceResponse {
  text: string;
  audioUrl?: string;
  duration?: number;
}

interface TeslaVoiceCommandInterfaceProps {
  onVoiceCommand?: (command: VoiceCommand) => Promise<void>;
  onTaskCreated?: (task: any) => void;
  className?: string;
}

export const TeslaVoiceCommandInterface: React.FC<TeslaVoiceCommandInterfaceProps> = ({
  onVoiceCommand,
  onTaskCreated,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
  const [voiceActivation, setVoiceActivation] = useState(true);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (voiceActivation && !isProcessing) {
            // Restart listening for wake word
            setTimeout(() => startListening(), 1000);
          }
        };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          setCurrentTranscript(interimTranscript || finalTranscript);
          
          if (finalTranscript) {
            handleVoiceInput(finalTranscript.trim());
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentUtteranceRef.current && synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-start listening if voice activation is enabled
  useEffect(() => {
    if (voiceActivation && recognitionRef.current && !isListening && !isProcessing) {
      startListening();
    }
  }, [voiceActivation]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for wake words
    const wakeWords = ['hey tesla', 'tesla', 'life os', 'hey life os'];
    const hasWakeWord = wakeWords.some(word => lowerTranscript.includes(word));
    
    if (voiceActivation && !hasWakeWord && !wakeWordDetected) {
      return; // Ignore commands without wake word
    }
    
    if (hasWakeWord) {
      setWakeWordDetected(true);
      speakResponse("I'm listening. How can I help?");
      return;
    }

    // Process the command
    setIsProcessing(true);
    setCurrentTranscript('');
    
    const command: VoiceCommand = {
      id: Date.now().toString(),
      command: transcript,
      intent: detectIntent(transcript),
      confidence: 0.85, // Mock confidence score
      timestamp: new Date(),
      status: 'processing'
    };
    
    setRecentCommands(prev => [command, ...prev.slice(0, 4)]);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await processVoiceCommand(command);
      
      const completedCommand = {
        ...command,
        result: result.text,
        status: 'completed' as const
      };
      
      setRecentCommands(prev => 
        prev.map(cmd => cmd.id === command.id ? completedCommand : cmd)
      );
      
      if (audioEnabled) {
        speakResponse(result.text);
      }
      
      if (onVoiceCommand) {
        await onVoiceCommand(completedCommand);
      }
      
    } catch (error) {
      const failedCommand = {
        ...command,
        result: 'Sorry, I couldn\'t process that command.',
        status: 'failed' as const
      };
      
      setRecentCommands(prev => 
        prev.map(cmd => cmd.id === command.id ? failedCommand : cmd)
      );
      
      if (audioEnabled) {
        speakResponse("Sorry, I couldn't process that command. Please try again.");
      }
    }
    
    setIsProcessing(false);
    setWakeWordDetected(false);
  };

  const detectIntent = (transcript: string): string => {
    const lower = transcript.toLowerCase();
    
    if (lower.includes('create') || lower.includes('add') || lower.includes('new')) {
      if (lower.includes('task')) return 'create_task';
      if (lower.includes('case') || lower.includes('legal')) return 'create_case';
      if (lower.includes('meeting') || lower.includes('appointment')) return 'create_meeting';
      return 'create_item';
    }
    
    if (lower.includes('status') || lower.includes('how') || lower.includes('what')) {
      return 'get_status';
    }
    
    if (lower.includes('deadline') || lower.includes('due') || lower.includes('urgent')) {
      return 'check_deadlines';
    }
    
    if (lower.includes('schedule') || lower.includes('calendar')) {
      return 'schedule_item';
    }
    
    if (lower.includes('summary') || lower.includes('brief') || lower.includes('overview')) {
      return 'get_summary';
    }
    
    return 'general_query';
  };

  const processVoiceCommand = async (command: VoiceCommand): Promise<VoiceResponse> => {
    const { intent, command: text } = command;
    
    switch (intent) {
      case 'create_task':
        const taskText = text.replace(/create|add|new|task/gi, '').trim();
        if (onTaskCreated) {
          onTaskCreated({
            title: taskText,
            priority: 'medium',
            status: 'todo',
            created_via: 'voice_command'
          });
        }
        return { text: `I've created a new task: "${taskText}". It's been added to your task list.` };
        
      case 'create_case':
        const caseText = text.replace(/create|add|new|case|legal/gi, '').trim();
        return { text: `I've created a new legal case: "${caseText}". You can find it in your cases module.` };
        
      case 'get_status':
        return { 
          text: "You have 3 active tasks, 2 urgent deadlines this week, and your productivity score is 92%. Everything looks good!" 
        };
        
      case 'check_deadlines':
        return { 
          text: "You have a motion response due tomorrow and discovery responses due next week. I recommend focusing on the motion response first." 
        };
        
      case 'get_summary':
        return { 
          text: "Today you've completed 4 tasks, spent 6.5 hours in focused work, and you're on track for all deadlines. Your AI assistant suggests blocking time tomorrow morning for the Johnson case motion." 
        };
        
      default:
        return { 
          text: "I understand you want help with your Life OS. You can ask me to create tasks, check deadlines, get status updates, or schedule items." 
        };
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !audioEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthRef.current.getVoices().find(voice => 
      voice.name.includes('Female') || voice.name.includes('Samantha')
    ) || synthRef.current.getVoices()[0];
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setVoiceActivation(false);
    } else {
      startListening();
      setVoiceActivation(true);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'orange';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Loader className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Header */}
      <TeslaCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">🎙️ Voice Command Center</h2>
              <p className="text-gray-400 text-sm">Tesla-style voice-activated task management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TeslaStatusIndicator 
              status={isListening ? 'online' : 'offline'} 
              size="sm" 
            />
            <div className="text-xs text-gray-400">
              {isListening ? 'Listening' : 'Idle'}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <TeslaButton
            variant={isListening ? "danger" : "primary"}
            onClick={toggleListening}
            className="flex items-center justify-center space-x-2"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop' : 'Listen'}</span>
          </TeslaButton>

          <TeslaButton
            variant={audioEnabled ? "secondary" : "danger"}
            onClick={toggleAudio}
            className="flex items-center justify-center space-x-2"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Audio</span>
          </TeslaButton>

          <TeslaButton
            variant="secondary"
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            className="flex items-center justify-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </TeslaButton>

          <TeslaButton
            variant="secondary"
            onClick={() => setVoiceActivation(!voiceActivation)}
            className="flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{voiceActivation ? 'Auto' : 'Manual'}</span>
          </TeslaButton>
        </div>

        {/* Current Status */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Current Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isProcessing ? 'bg-orange-900 text-orange-300' :
              isListening ? 'bg-green-900 text-green-300' :
              isSpeaking ? 'bg-blue-900 text-blue-300' :
              'bg-gray-600 text-gray-300'
            }`}>
              {isProcessing ? 'Processing' : 
               isListening ? 'Listening' : 
               isSpeaking ? 'Speaking' : 'Idle'}
            </span>
          </div>
          
          {currentTranscript && (
            <div className="text-white text-sm mb-2">
              <span className="text-gray-400">Heard: </span>
              "{currentTranscript}"
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            Say "Hey Tesla" or "Life OS" followed by your command
          </div>
        </div>

        {/* Voice Activation Help */}
        <TeslaAlert type="info" title="Voice Commands">
          <div className="text-sm space-y-1">
            <div>• "Create task [description]" - Add new task</div>
            <div>• "What's my status?" - Get productivity summary</div>
            <div>• "Check deadlines" - Review upcoming deadlines</div>
            <div>• "Give me a summary" - Daily briefing</div>
          </div>
        </TeslaAlert>
      </TeslaCard>

      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <TeslaCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">📝 Recent Voice Commands</h3>
          <div className="space-y-3">
            {recentCommands.map((command) => (
              <div key={command.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(command.status)}
                      <span className="text-white font-medium text-sm">
                        "{command.command}"
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Intent: {command.intent} • Confidence: {(command.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {command.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {command.result && (
                  <div className="bg-gray-600 rounded p-2 mt-2">
                    <div className="text-sm text-gray-200">
                      <span className="text-purple-400">AI Response: </span>
                      {command.result}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TeslaCard>
      )}
    </div>
  );
};

export default TeslaVoiceCommandInterface;
