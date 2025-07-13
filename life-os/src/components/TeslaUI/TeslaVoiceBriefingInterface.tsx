'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Settings, Clock, MessageSquare } from 'lucide-react';
import { TeslaCard, TeslaButton, TeslaAlert } from './index';

interface VoiceBriefing {
  id: string;
  type: 'status_update' | 'deadline_alert' | 'emergency_briefing' | 'daily_summary';
  title: string;
  content: string;
  timestamp: string;
  duration: number; // in seconds
  priority: 'low' | 'medium' | 'high' | 'critical';
  isPlaying?: boolean;
}

interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
}

const mockVoiceBriefings: VoiceBriefing[] = [
  {
    id: '1',
    type: 'emergency_briefing',
    title: 'Critical Deadline Alert',
    content: 'Emergency briefing: Motion response due in 4 hours for case Johnson vs. State. All required documents are prepared and ready for filing. Senior Partner has been notified and is available for consultation.',
    timestamp: '2025-07-12T20:30:00Z',
    duration: 25,
    priority: 'critical'
  },
  {
    id: '2',
    type: 'daily_summary',
    title: 'Daily Status Update',
    content: 'Daily briefing for July 12th: You have 3 priority tasks remaining, 2 cases requiring follow-up, and 1 MCLE deadline approaching in 180 days. All critical deadlines are on track. Productivity is up 23% compared to last week.',
    timestamp: '2025-07-12T08:00:00Z',
    duration: 30,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'deadline_alert',
    title: 'MCLE Reminder',
    content: 'Nevada MCLE reminder: 10 hours remaining to complete by December 31st, 2025. Current progress: 0 hours completed. Recommended action: Schedule continuing education courses within the next 30 days.',
    timestamp: '2025-07-12T12:00:00Z',
    duration: 20,
    priority: 'high'
  },
  {
    id: '4',
    type: 'status_update',
    title: 'SOS System Status',
    content: 'SOS Communication System status: All emergency contacts are available. Average response time is 3.2 minutes. Success rate is 98.5%. System is fully operational and ready for emergency activation.',
    timestamp: '2025-07-12T16:00:00Z',
    duration: 18,
    priority: 'low'
  }
];

export function TeslaVoiceBriefingInterface() {
  const [isListening, setIsListening] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'en-US-Standard-A',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoPlay: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [briefings, setBriefings] = useState(mockVoiceBriefings);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  const startListening = () => {
    setIsListening(true);
    // Simulate voice command listening
    setTimeout(() => {
      setIsListening(false);
      // Add a mock voice command result
      const newBriefing: VoiceBriefing = {
        id: Date.now().toString(),
        type: 'status_update',
        title: 'Voice Command Processed',
        content: 'Voice command received: "Give me a status update on all critical deadlines." Processing your request now...',
        timestamp: new Date().toISOString(),
        duration: 15,
        priority: 'medium'
      };
      setBriefings(prev => [newBriefing, ...prev]);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const playBriefing = (briefing: VoiceBriefing) => {
    if (speechSynthesis.current) {
      // Stop any currently playing speech
      speechSynthesis.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(briefing.content);
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      
      utterance.onstart = () => {
        setCurrentlyPlaying(briefing.id);
      };
      
      utterance.onend = () => {
        setCurrentlyPlaying(null);
      };
      
      currentUtterance.current = utterance;
      speechSynthesis.current.speak(utterance);
    }
  };

  const pauseBriefing = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setCurrentlyPlaying(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-100';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-100';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-100';
      case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-100';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency_briefing': return '🚨';
      case 'deadline_alert': return '⏰';
      case 'daily_summary': return '📊';
      case 'status_update': return '📢';
      default: return '🎤';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Voice Control Header */}
      <TeslaCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h2 className="text-xl font-bold text-white">
              🎤 Voice Briefing Interface
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <TeslaButton
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TeslaButton>
          </div>
        </div>

        {/* Voice Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Mic className="w-5 h-5 mr-2 text-blue-400" />
              Voice Commands
            </h3>
            
            <div className="flex space-x-2">
              <TeslaButton
                onClick={isListening ? stopListening : startListening}
                disabled={currentlyPlaying !== null}
                className={`flex-1 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Listening
                  </>
                )}
              </TeslaButton>
            </div>

            {isListening && (
              <TeslaAlert type="info" title="Listening for Voice Commands">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Say: "Status update", "Emergency briefing", or "Daily summary"</span>
                </div>
              </TeslaAlert>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-green-400" />
              Playback Control
            </h3>
            
            <div className="flex space-x-2">
              <TeslaButton
                onClick={() => pauseBriefing()}
                disabled={currentlyPlaying === null}
                variant="secondary"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop All
              </TeslaButton>
              
              <TeslaButton
                onClick={() => {
                  if (briefings.length > 0) {
                    playBriefing(briefings[0]);
                  }
                }}
                disabled={currentlyPlaying !== null || briefings.length === 0}
                variant="secondary"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Latest
              </TeslaButton>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">Voice Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Speech Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">{voiceSettings.speed}x</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">{Math.round(voiceSettings.volume * 100)}%</div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={voiceSettings.autoPlay}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Auto-play new briefings</span>
              </label>
            </div>
          </div>
        )}
      </TeslaCard>

      {/* Voice Briefings List */}
      <TeslaCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
          Recent Voice Briefings
        </h3>

        <div className="space-y-4">
          {briefings.map((briefing) => (
            <div
              key={briefing.id}
              className={`border-l-4 ${getPriorityColor(briefing.priority)} p-4 rounded-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(briefing.type)}</div>
                  <div>
                    <h4 className="font-semibold text-white">{briefing.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{briefing.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{getPriorityIcon(briefing.priority)} {briefing.priority}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(briefing.duration)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TeslaButton
                    onClick={() => currentlyPlaying === briefing.id ? pauseBriefing() : playBriefing(briefing)}
                    size="sm"
                    variant={currentlyPlaying === briefing.id ? "danger" : "primary"}
                  >
                    {currentlyPlaying === briefing.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </TeslaButton>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3">{briefing.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(briefing.timestamp).toLocaleString()}</span>
                {currentlyPlaying === briefing.id && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Playing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {briefings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🎤</div>
            <p className="text-gray-400 mb-4">No voice briefings available</p>
            <TeslaButton onClick={startListening}>
              <Mic className="w-4 h-4 mr-2" />
              Request Voice Briefing
            </TeslaButton>
          </div>
        )}
      </TeslaCard>

      {/* Voice Commands Reference */}
      <TeslaCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
          Available Voice Commands
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-white mb-3">Status Commands</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• "Status update" - Current system status</li>
              <li>• "Daily summary" - Today's overview</li>
              <li>• "Deadline check" - Upcoming deadlines</li>
              <li>• "Case status" - Active case summary</li>
              <li>• "MCLE status" - Continuing education progress</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Emergency Commands</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• "Emergency briefing" - Critical alerts</li>
              <li>• "SOS status" - Emergency system check</li>
              <li>• "Contact status" - Emergency contacts</li>
              <li>• "Crisis update" - Active emergency info</li>
              <li>• "Help" - System assistance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-400 mb-2">
            <Volume2 className="w-4 h-4" />
            <span className="font-semibold">Voice Briefing Tips</span>
          </div>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Speak clearly and pause between commands</li>
            <li>• Use the exact command phrases listed above</li>
            <li>• Voice briefings are automatically saved for replay</li>
            <li>• Adjust speed and volume in settings for optimal listening</li>
            <li>• Emergency briefings have highest priority and auto-play</li>
          </ul>
        </div>
      </TeslaCard>
    </div>
  );
}
