'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';

interface FocusSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  actualFocusTime: number; // minutes of actual focus
  interruptions: Interruption[];
  distractions: Distraction[];
  focusScore: number; // 0-100
  flowStateReached: boolean;
  flowStateDuration: number; // minutes
  environment: {
    noiseLevel: number; // 0-100
    lightingQuality: number; // 0-100
    temperature: number; // celsius
    interruptions: number;
  };
  outcomes: {
    tasksCompleted: number;
    productivity: number; // 0-100
    satisfaction: number; // 0-100
    fatigueLevel: number; // 0-100
  };
}

interface Interruption {
  id: string;
  timestamp: Date;
  type: 'notification' | 'call' | 'email' | 'person' | 'external' | 'internal';
  source: string;
  duration: number; // seconds
  handled: 'blocked' | 'deferred' | 'answered' | 'ignored';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impactScore: number; // 0-100
}

interface Distraction {
  id: string;
  timestamp: Date;
  type: 'website' | 'app' | 'thought' | 'environmental' | 'physical';
  description: string;
  duration: number; // seconds
  severity: 'minor' | 'moderate' | 'major';
  recovered: boolean;
  recoveryTime: number; // seconds
}

interface FocusBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  date: Date;
  status: 'scheduled' | 'active' | 'completed' | 'interrupted' | 'cancelled';
  protectionLevel: 'light' | 'medium' | 'heavy' | 'fortress';
  allowedInterruptions: string[];
  blockedApps: string[];
  focusGoal: string;
  estimatedTasks: number;
}

interface FlowState {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  deepnessLevel: number; // 0-100
  productivity: number; // 0-100
  triggers: string[];
  maintainedBy: string[];
  brokenBy?: string;
}

export function TeslaFocusTimeProtection() {
  const [viewMode, setViewMode] = useState<'today' | 'session' | 'analytics' | 'protection'>('today');
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [focusSessions] = useState<FocusSession[]>([
    {
      id: 'session-001',
      title: 'Deep Legal Research',
      startTime: new Date('2024-07-08T09:00:00'),
      endTime: new Date('2024-07-08T11:30:00'),
      duration: 150,
      actualFocusTime: 127,
      interruptions: [
        {
          id: 'int-001',
          timestamp: new Date('2024-07-08T09:45:00'),
          type: 'notification',
          source: 'Slack',
          duration: 30,
          handled: 'blocked',
          priority: 'low',
          impactScore: 10
        },
        {
          id: 'int-002',
          timestamp: new Date('2024-07-08T10:30:00'),
          type: 'call',
          source: 'Client',
          duration: 180,
          handled: 'deferred',
          priority: 'high',
          impactScore: 70
        }
      ],
      distractions: [
        {
          id: 'dist-001',
          timestamp: new Date('2024-07-08T09:30:00'),
          type: 'website',
          description: 'Checked news website',
          duration: 120,
          severity: 'moderate',
          recovered: true,
          recoveryTime: 60
        }
      ],
      focusScore: 85,
      flowStateReached: true,
      flowStateDuration: 45,
      environment: {
        noiseLevel: 25,
        lightingQuality: 85,
        temperature: 22,
        interruptions: 2
      },
      outcomes: {
        tasksCompleted: 3,
        productivity: 90,
        satisfaction: 88,
        fatigueLevel: 35
      }
    },
    {
      id: 'session-002',
      title: 'Case Documentation',
      startTime: new Date('2024-07-08T14:00:00'),
      endTime: new Date('2024-07-08T15:30:00'),
      duration: 90,
      actualFocusTime: 65,
      interruptions: [
        {
          id: 'int-003',
          timestamp: new Date('2024-07-08T14:20:00'),
          type: 'person',
          source: 'Colleague',
          duration: 300,
          handled: 'answered',
          priority: 'medium',
          impactScore: 50
        }
      ],
      distractions: [
        {
          id: 'dist-002',
          timestamp: new Date('2024-07-08T14:45:00'),
          type: 'thought',
          description: 'Worried about deadline',
          duration: 90,
          severity: 'minor',
          recovered: true,
          recoveryTime: 30
        }
      ],
      focusScore: 72,
      flowStateReached: false,
      flowStateDuration: 0,
      environment: {
        noiseLevel: 45,
        lightingQuality: 70,
        temperature: 24,
        interruptions: 1
      },
      outcomes: {
        tasksCompleted: 2,
        productivity: 75,
        satisfaction: 70,
        fatigueLevel: 50
      }
    }
  ]);

  const [todayFocusBlocks] = useState<FocusBlock[]>([
    {
      id: 'block-001',
      title: 'Morning Deep Work',
      startTime: '09:00',
      endTime: '11:00',
      date: new Date(),
      status: 'completed',
      protectionLevel: 'heavy',
      allowedInterruptions: ['Emergency contacts'],
      blockedApps: ['Social media', 'News', 'Entertainment'],
      focusGoal: 'Complete case analysis for Johnson v. Smith',
      estimatedTasks: 3
    },
    {
      id: 'block-002',
      title: 'Client Work Session',
      startTime: '14:00',
      endTime: '16:00',
      date: new Date(),
      status: 'scheduled',
      protectionLevel: 'medium',
      allowedInterruptions: ['Client calls', 'Court notifications'],
      blockedApps: ['Social media', 'Entertainment'],
      focusGoal: 'Draft motion for Williams case',
      estimatedTasks: 2
    },
    {
      id: 'block-003',
      title: 'Administrative Focus',
      startTime: '16:30',
      endTime: '17:30',
      date: new Date(),
      status: 'scheduled',
      protectionLevel: 'light',
      allowedInterruptions: ['All urgent communications'],
      blockedApps: ['Entertainment'],
      focusGoal: 'Process emails and update case statuses',
      estimatedTasks: 5
    }
  ]);

  const [currentSession] = useState<FocusSession>({
    id: 'current-session',
    title: 'Active Focus Session',
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    endTime: new Date(Date.now() + 75 * 60 * 1000), // 75 minutes from now
    duration: 120,
    actualFocusTime: 42,
    interruptions: [
      {
        id: 'int-current',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'notification',
        source: 'Email',
        duration: 45,
        handled: 'blocked',
        priority: 'medium',
        impactScore: 25
      }
    ],
    distractions: [],
    focusScore: 88,
    flowStateReached: true,
    flowStateDuration: 25,
    environment: {
      noiseLevel: 20,
      lightingQuality: 90,
      temperature: 21,
      interruptions: 1
    },
    outcomes: {
      tasksCompleted: 1,
      productivity: 85,
      satisfaction: 90,
      fatigueLevel: 25
    }
  });

  const getProtectionColor = (level: FocusBlock['protectionLevel']) => {
    switch (level) {
      case 'fortress': return 'text-red-400 bg-red-500/20';
      case 'heavy': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'light': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: FocusBlock['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'active': return 'text-blue-400 bg-blue-500/20';
      case 'scheduled': return 'text-purple-400 bg-purple-500/20';
      case 'interrupted': return 'text-orange-400 bg-orange-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getInterruptionIcon = (type: Interruption['type']) => {
    switch (type) {
      case 'notification': return '🔔';
      case 'call': return '📞';
      case 'email': return '📧';
      case 'person': return '👤';
      case 'external': return '🌐';
      case 'internal': return '🧠';
      default: return '⚠️';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Analytics data
  const weeklyFocusData = [
    { name: 'Mon', planned: 240, actual: 210, flow: 85, interruptions: 3 },
    { name: 'Tue', planned: 180, actual: 165, flow: 90, interruptions: 2 },
    { name: 'Wed', planned: 300, actual: 245, flow: 75, interruptions: 5 },
    { name: 'Thu', planned: 240, actual: 220, flow: 88, interruptions: 3 },
    { name: 'Fri', planned: 120, actual: 95, flow: 65, interruptions: 4 },
    { name: 'Sat', planned: 60, actual: 60, flow: 95, interruptions: 0 },
    { name: 'Sun', planned: 90, actual: 85, flow: 80, interruptions: 1 }
  ];

  const interruptionTypesData = [
    { type: 'Notifications', count: 12, blocked: 10, impact: 30 },
    { type: 'Calls', count: 5, blocked: 2, impact: 75 },
    { type: 'People', count: 3, blocked: 1, impact: 60 },
    { type: 'Email', count: 8, blocked: 6, impact: 25 },
    { type: 'Internal', count: 4, blocked: 0, impact: 40 }
  ];

  const focusScoreData = [
    { time: '9:00', score: 65, flow: false },
    { time: '9:15', score: 75, flow: false },
    { time: '9:30', score: 85, flow: true },
    { time: '9:45', score: 90, flow: true },
    { time: '10:00', score: 95, flow: true },
    { time: '10:15', score: 88, flow: true },
    { time: '10:30', score: 45, flow: false }, // Interruption
    { time: '10:45', score: 70, flow: false },
    { time: '11:00', score: 85, flow: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Focus Time Protection</h2>
        <div className="flex space-x-2">
          {(['today', 'session', 'analytics', 'protection'] as const).map((mode) => (
            <TeslaButton
              key={mode}
              variant={viewMode === mode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </TeslaButton>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TeslaMetric
          label="Focus Efficiency"
          value="87%"
          icon="🎯"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Flow State Time"
          value="2.3h"
          icon="🌊"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="Interruptions Blocked"
          value="8/11"
          icon="🛡️"
          color="purple"
          trend="up"
        />
        <TeslaMetric
          label="Deep Work Streaks"
          value="4 days"
          icon="🔥"
          color="orange"
          trend="up"
        />
      </div>

      {viewMode === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Focus Blocks */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Today's Focus Blocks</h3>
            <div className="space-y-3">
              {todayFocusBlocks.map((block) => (
                <div 
                  key={block.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{block.title}</h4>
                      <div className="text-sm text-blue-400">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(block.status)}`}>
                        {block.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getProtectionColor(block.protectionLevel)}`}>
                        {block.protectionLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{block.focusGoal}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>📝 {block.estimatedTasks} tasks</span>
                    <span>🛡️ {block.allowedInterruptions.length} exceptions</span>
                    <span>🚫 {block.blockedApps.length} apps blocked</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <TeslaButton variant="primary" size="sm">
                🎯 Start Focus Session
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm">
                ⚙️ Configure Protection
              </TeslaButton>
            </div>
          </TeslaCard>

          {/* Active Session Monitor */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Current Focus Session</h3>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                45:23
              </div>
              <div className="text-sm text-gray-300">Active Focus Time</div>
              <div className="text-xs text-gray-400">out of 120 minutes planned</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Focus Progress</span>
                  <span className="text-blue-400">38%</span>
                </div>
                <TeslaProgressBar value={38} color="blue" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <TeslaGauge
                    value={88}
                    max={100}
                    color="green"
                    size="sm"
                  />
                  <div className="text-sm text-gray-300 mt-2">Focus Score</div>
                  <div className="text-xs text-green-400">Excellent</div>
                </div>
                <div className="text-center">
                  <TeslaGauge
                    value={75}
                    max={100}
                    color="purple"
                    size="sm"
                  />
                  <div className="text-sm text-gray-300 mt-2">Flow State</div>
                  <div className="text-xs text-purple-400">Deep Flow</div>
                </div>
              </div>

              <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-green-400 font-medium">🌊 Flow State Active</span>
                  <span className="text-xs text-gray-400">for 25 minutes</span>
                </div>
                <p className="text-sm text-gray-300">
                  You're in deep focus! 3 interruptions blocked automatically.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-white">Environment Status</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Noise Level</span>
                    <span className="text-green-400">20dB (Excellent)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lighting</span>
                    <span className="text-blue-400">90% (Optimal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temperature</span>
                    <span className="text-green-400">21°C (Perfect)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interruptions</span>
                    <span className="text-orange-400">1 (Low)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <TeslaButton variant="secondary" size="sm">
                ⏸️ Pause
              </TeslaButton>
              <TeslaButton variant="error" size="sm">
                ⏹️ End Session
              </TeslaButton>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Focus Sessions</h3>
            <div className="space-y-4">
              {focusSessions.map((session) => (
                <div 
                  key={session.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{session.title}</h4>
                      <div className="text-sm text-gray-400">
                        {session.startTime.toLocaleDateString()} • {formatDuration(session.duration)}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      session.focusScore >= 80 ? 'bg-green-500/20 text-green-400' :
                      session.focusScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {session.focusScore}% Focus
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-gray-400">Actual Focus</div>
                      <div className="text-blue-400">{formatDuration(session.actualFocusTime)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Flow State</div>
                      <div className={session.flowStateReached ? 'text-green-400' : 'text-gray-400'}>
                        {session.flowStateReached ? `${formatDuration(session.flowStateDuration)}` : 'None'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Interruptions</div>
                      <div className="text-orange-400">{session.interruptions.length}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex space-x-4 text-xs">
                      <span className="text-green-400">✅ {session.outcomes.tasksCompleted} tasks</span>
                      <span className="text-blue-400">😊 {session.outcomes.satisfaction}% satisfied</span>
                    </div>
                    <TeslaButton variant="secondary" size="xs">
                      View Details
                    </TeslaButton>
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>

          {/* Session Details */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Session Deep Dive</h3>
            
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Focus Score Timeline</h4>
              <div className="h-32">
                <TeslaChart
                  data={focusScoreData}
                  dataKeys={['score']}
                  colors={['#3B82F6']}
                  type="line"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Interruptions Analysis</h4>
                <div className="space-y-2">
                  {currentSession.interruptions.map((interruption) => (
                    <div 
                      key={interruption.id}
                      className="p-2 bg-orange-500/10 rounded border border-orange-500/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getInterruptionIcon(interruption.type)}</span>
                          <span className="text-sm text-white">{interruption.source}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            interruption.handled === 'blocked' ? 'bg-green-500/20 text-green-400' :
                            interruption.handled === 'deferred' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {interruption.handled}
                          </span>
                          <span className="text-xs text-gray-400">
                            {interruption.duration}s
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-300">
                        Impact: {interruption.impactScore}% • Priority: {interruption.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Environment Optimization</h4>
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Optimal Noise Level</span>
                      <span className="text-green-400">✓ 20dB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Lighting Quality</span>
                      <span className="text-green-400">✓ 90%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Temperature</span>
                      <span className="text-green-400">✓ 21°C</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    💡 Current environment is optimized for deep focus
                  </div>
                </div>
              </div>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Weekly Focus Analytics */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Focus Performance</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyFocusData}
                dataKeys={['planned', 'actual', 'flow']}
                colors={['#6B7280', '#3B82F6', '#10B981']}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Planned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Flow State</span>
              </div>
            </div>
          </TeslaCard>

          {/* Interruption Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Interruption Breakdown</h3>
              <div className="space-y-3">
                {interruptionTypesData.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{item.type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-400">{item.count} total</span>
                        <span className="text-xs text-green-400">{item.blocked} blocked</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(item.count / 15) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-orange-400">{item.impact}% impact</span>
                    </div>
                  </div>
                ))}
              </div>
            </TeslaCard>

            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Focus Insights</h3>
              <div className="space-y-4">
                <TeslaAlert
                  type="success"
                  title="Peak Focus Window"
                  children={
                    <p className="text-sm text-gray-300">
                      Your best focus time is 9:30-11:00 AM with 92% average score. 
                      Flow state achieved 80% of the time.
                    </p>
                  }
                />
                
                <TeslaAlert
                  type="warning"
                  title="Interruption Pattern"
                  children={
                    <p className="text-sm text-gray-300">
                      Most interruptions occur between 10:30-11:00 AM. Consider 
                      adjusting notification settings during this period.
                    </p>
                  }
                />
                
                <TeslaAlert
                  type="info"
                  title="Environment Optimization"
                  children={
                    <p className="text-sm text-gray-300">
                      Your focus improves 35% with noise levels below 25dB. 
                      Consider noise-canceling headphones for optimal performance.
                    </p>
                  }
                />
                
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h4 className="font-medium text-purple-400 mb-2">🎯 Weekly Goal Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Deep Focus Hours</span>
                      <span className="text-purple-400">18.5 / 20h</span>
                    </div>
                    <TeslaProgressBar value={92} color="purple" />
                    <div className="text-xs text-gray-400">92% complete • 1.5h remaining</div>
                  </div>
                </div>
              </div>
            </TeslaCard>
          </div>
        </div>
      )}

      {viewMode === 'protection' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Protection Settings */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Protection Configuration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Protection Levels</h4>
                <div className="space-y-2">
                  {[
                    { level: 'light', description: 'Basic notification filtering', blocked: 'Entertainment apps' },
                    { level: 'medium', description: 'Advanced blocking with exceptions', blocked: 'Social media, News' },
                    { level: 'heavy', description: 'Minimal interruptions allowed', blocked: 'All non-essential apps' },
                    { level: 'fortress', description: 'Emergency contacts only', blocked: 'Everything except emergencies' }
                  ].map((item) => (
                    <div 
                      key={item.level}
                      className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 cursor-pointer hover:border-blue-500/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${getProtectionColor(item.level as any).split(' ')[0]}`}>
                          {item.level.toUpperCase()}
                        </span>
                        <div className="w-4 h-4 border border-gray-600 rounded"></div>
                      </div>
                      <div className="text-sm text-gray-300 mb-1">{item.description}</div>
                      <div className="text-xs text-gray-400">Blocks: {item.blocked}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Smart Features</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Auto-defer notifications', enabled: true },
                    { name: 'Flow state detection', enabled: true },
                    { name: 'Break reminders', enabled: false },
                    { name: 'Environment monitoring', enabled: true },
                    { name: 'Distraction alerts', enabled: true }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                      <span className="text-sm text-gray-300">{feature.name}</span>
                      <div className={`w-8 h-4 rounded-full ${feature.enabled ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${feature.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TeslaCard>

          {/* Focus Environment */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Environment Optimization</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Current Environment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <TeslaGauge
                      value={20}
                      max={60}
                      color="green"
                      size="sm"
                    />
                    <div className="text-sm text-gray-300 mt-2">Noise Level</div>
                    <div className="text-xs text-green-400">20dB - Excellent</div>
                  </div>
                  <div className="text-center">
                    <TeslaGauge
                      value={90}
                      max={100}
                      color="blue"
                      size="sm"
                    />
                    <div className="text-sm text-gray-300 mt-2">Lighting</div>
                    <div className="text-xs text-blue-400">90% - Optimal</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Optimization Suggestions</h4>
                <div className="space-y-2">
                  <TeslaAlert
                    type="success"
                    title="Perfect Environment"
                    children={
                      <p className="text-sm text-gray-300">
                        Current conditions are optimal for deep focus work.
                      </p>
                    }
                  />
                  
                  <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                    <h5 className="text-blue-400 font-medium text-sm mb-1">💡 Pro Tips</h5>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Keep temperature between 20-22°C for optimal focus</li>
                      <li>• Use noise-canceling headphones in noisy environments</li>
                      <li>• Position screen to avoid glare and eye strain</li>
                      <li>• Take breaks every 25-30 minutes to maintain focus</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Focus Triggers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300">🎵 Focus Music Playlist</span>
                    <TeslaButton variant="secondary" size="xs">Start</TeslaButton>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300">🕯️ Ambient Lighting Mode</span>
                    <TeslaButton variant="secondary" size="xs">Enable</TeslaButton>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300">📱 Do Not Disturb Mode</span>
                    <TeslaButton variant="primary" size="xs">Active</TeslaButton>
                  </div>
                </div>
              </div>
            </div>
          </TeslaCard>
        </div>
      )}
    </div>
  );
}
