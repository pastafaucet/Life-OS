'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';

interface ProductivityPattern {
  hour: number;
  dayOfWeek: number;
  productivity: number; // 0-100
  focusLevel: number; // 0-100
  tasksCompleted: number;
  averageTaskDuration: number; // minutes
  energyLevel: 'low' | 'medium' | 'high' | 'peak';
}

interface WorkTimeRecommendation {
  id: string;
  title: string;
  description: string;
  recommendedTime: {
    start: string; // HH:MM
    end: string; // HH:MM
    date?: Date;
  };
  confidence: number; // 0-100
  reasoning: string[];
  taskType: 'focused' | 'routine' | 'creative' | 'administrative' | 'collaborative';
  priority: 'low' | 'medium' | 'high' | 'critical';
  blockers: string[];
  energyRequirement: 'low' | 'medium' | 'high';
}

interface TimeBlock {
  start: string;
  end: string;
  type: 'optimal' | 'good' | 'fair' | 'poor' | 'unavailable';
  availability: number; // 0-100
  predictedProductivity: number; // 0-100
  conflicts: string[];
}

export function TeslaOptimalWorkTime() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'pattern'>('today');
  
  const [productivityData] = useState<ProductivityPattern[]>([
    // Monday patterns
    { hour: 8, dayOfWeek: 1, productivity: 85, focusLevel: 90, tasksCompleted: 3, averageTaskDuration: 45, energyLevel: 'peak' },
    { hour: 9, dayOfWeek: 1, productivity: 92, focusLevel: 95, tasksCompleted: 4, averageTaskDuration: 38, energyLevel: 'peak' },
    { hour: 10, dayOfWeek: 1, productivity: 88, focusLevel: 85, tasksCompleted: 3, averageTaskDuration: 42, energyLevel: 'high' },
    { hour: 11, dayOfWeek: 1, productivity: 75, focusLevel: 70, tasksCompleted: 2, averageTaskDuration: 55, energyLevel: 'high' },
    { hour: 13, dayOfWeek: 1, productivity: 45, focusLevel: 40, tasksCompleted: 1, averageTaskDuration: 65, energyLevel: 'low' },
    { hour: 14, dayOfWeek: 1, productivity: 60, focusLevel: 55, tasksCompleted: 2, averageTaskDuration: 50, energyLevel: 'medium' },
    { hour: 15, dayOfWeek: 1, productivity: 70, focusLevel: 65, tasksCompleted: 2, averageTaskDuration: 45, energyLevel: 'medium' },
    { hour: 16, dayOfWeek: 1, productivity: 80, focusLevel: 75, tasksCompleted: 3, averageTaskDuration: 40, energyLevel: 'high' },
    // Tuesday patterns  
    { hour: 8, dayOfWeek: 2, productivity: 78, focusLevel: 82, tasksCompleted: 2, averageTaskDuration: 50, energyLevel: 'high' },
    { hour: 9, dayOfWeek: 2, productivity: 85, focusLevel: 88, tasksCompleted: 3, averageTaskDuration: 42, energyLevel: 'peak' },
    { hour: 10, dayOfWeek: 2, productivity: 90, focusLevel: 92, tasksCompleted: 4, averageTaskDuration: 35, energyLevel: 'peak' },
    { hour: 11, dayOfWeek: 2, productivity: 82, focusLevel: 78, tasksCompleted: 3, averageTaskDuration: 40, energyLevel: 'high' }
  ]);

  const [recommendations] = useState<WorkTimeRecommendation[]>([
    {
      id: 'rec-001',
      title: 'Deep Work: Case Research',
      description: 'Best time for complex legal research and case analysis',
      recommendedTime: { start: '09:00', end: '11:00' },
      confidence: 92,
      reasoning: [
        'Highest focus levels historically at 9-11 AM',
        'Average 4 tasks completed per hour during this window',
        'Peak energy levels consistently recorded',
        'No calendar conflicts detected'
      ],
      taskType: 'focused',
      priority: 'high',
      blockers: [],
      energyRequirement: 'high'
    },
    {
      id: 'rec-002',
      title: 'Client Calls & Meetings',
      description: 'Optimal time for important client communications',
      recommendedTime: { start: '14:00', end: '16:00' },
      confidence: 78,
      reasoning: [
        'Good energy recovery post-lunch',
        'Collaborative tasks perform 25% better at this time',
        'Client availability peaks in afternoon',
        'Voice clarity and communication skills optimal'
      ],
      taskType: 'collaborative',
      priority: 'medium',
      blockers: ['Potential calendar conflicts'],
      energyRequirement: 'medium'
    },
    {
      id: 'rec-003',
      title: 'Administrative Tasks',
      description: 'Perfect for routine tasks and email processing',
      recommendedTime: { start: '13:00', end: '14:00' },
      confidence: 85,
      reasoning: [
        'Post-lunch low energy suited for routine work',
        'Email response time 40% faster at this hour',
        'Lower cognitive load requirements',
        'Good transition time between focused work blocks'
      ],
      taskType: 'administrative',
      priority: 'low',
      blockers: [],
      energyRequirement: 'low'
    },
    {
      id: 'rec-004',
      title: 'Creative Problem Solving',
      description: 'Ideal for strategy and creative legal solutions',
      recommendedTime: { start: '16:00', end: '17:30' },
      confidence: 75,
      reasoning: [
        'Secondary productivity peak identified',
        'Creative thinking scores 30% higher',
        'Relaxed state enhances lateral thinking',
        'Good time for case strategy development'
      ],
      taskType: 'creative',
      priority: 'medium',
      blockers: ['May conflict with court deadlines'],
      energyRequirement: 'medium'
    }
  ]);

  const [todaySchedule] = useState<TimeBlock[]>([
    { start: '08:00', end: '09:00', type: 'good', availability: 80, predictedProductivity: 85, conflicts: [] },
    { start: '09:00', end: '10:00', type: 'optimal', availability: 100, predictedProductivity: 92, conflicts: [] },
    { start: '10:00', end: '11:00', type: 'optimal', availability: 100, predictedProductivity: 88, conflicts: [] },
    { start: '11:00', end: '12:00', type: 'good', availability: 75, predictedProductivity: 75, conflicts: ['Weekly team meeting (possible)'] },
    { start: '12:00', end: '13:00', type: 'unavailable', availability: 0, predictedProductivity: 0, conflicts: ['Lunch break'] },
    { start: '13:00', end: '14:00', type: 'fair', availability: 90, predictedProductivity: 45, conflicts: [] },
    { start: '14:00', end: '15:00', type: 'good', availability: 85, predictedProductivity: 60, conflicts: [] },
    { start: '15:00', end: '16:00', type: 'good', availability: 90, predictedProductivity: 70, conflicts: [] },
    { start: '16:00', end: '17:00', type: 'good', availability: 95, predictedProductivity: 80, conflicts: [] },
    { start: '17:00', end: '18:00', type: 'fair', availability: 70, predictedProductivity: 65, conflicts: ['Potential client calls'] }
  ]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-blue-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500/20';
    if (confidence >= 75) return 'bg-blue-500/20';
    if (confidence >= 60) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
  };

  const getBlockTypeColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'optimal': return 'bg-green-500/30 border-green-500';
      case 'good': return 'bg-blue-500/30 border-blue-500';
      case 'fair': return 'bg-yellow-500/30 border-yellow-500';
      case 'poor': return 'bg-orange-500/30 border-orange-500';
      case 'unavailable': return 'bg-gray-500/30 border-gray-500';
      default: return 'bg-gray-500/30 border-gray-500';
    }
  };

  const getTaskTypeIcon = (type: WorkTimeRecommendation['taskType']) => {
    switch (type) {
      case 'focused': return '🎯';
      case 'routine': return '📋';
      case 'creative': return '💡';
      case 'administrative': return '📊';
      case 'collaborative': return '🤝';
      default: return '⚡';
    }
  };

  const getPriorityColor = (priority: WorkTimeRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const weeklyProductivityData = [
    { name: 'Mon', morning: 90, afternoon: 65, evening: 70 },
    { name: 'Tue', morning: 85, afternoon: 70, evening: 75 },
    { name: 'Wed', morning: 88, afternoon: 60, evening: 65 },
    { name: 'Thu', morning: 82, afternoon: 75, evening: 80 },
    { name: 'Fri', morning: 75, afternoon: 55, evening: 60 },
    { name: 'Sat', morning: 60, afternoon: 40, evening: 45 },
    { name: 'Sun', morning: 45, afternoon: 35, evening: 40 }
  ];

  const hourlyProductivityData = productivityData
    .filter(p => p.dayOfWeek === 1) // Monday data
    .map(p => ({
      name: `${p.hour}:00`,
      productivity: p.productivity,
      focus: p.focusLevel,
      energy: p.energyLevel === 'peak' ? 100 : p.energyLevel === 'high' ? 80 : p.energyLevel === 'medium' ? 60 : 40
    }));

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Optimal Work Time Intelligence</h2>
        <div className="flex space-x-2">
          {(['today', 'week', 'pattern'] as const).map((mode) => (
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
          label="Peak Productivity"
          value="9-11 AM"
          icon="🎯"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Focus Duration"
          value="2.3 hrs"
          icon="⏱️"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="Optimal Energy"
          value="92%"
          icon="⚡"
          color="orange"
          trend="stable"
        />
        <TeslaMetric
          label="Prediction Accuracy"
          value="87%"
          icon="📊"
          color="purple"
          trend="up"
        />
      </div>

      {viewMode === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Today's Optimal Schedule</h3>
            <div className="space-y-2">
              {todaySchedule.map((block, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getBlockTypeColor(block.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {formatTime(block.start)} - {formatTime(block.end)}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {block.type.replace('_', ' ')} time
                      </div>
                      {block.conflicts.length > 0 && (
                        <div className="text-xs text-yellow-400 mt-1">
                          ⚠️ {block.conflicts[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-400">
                        {block.predictedProductivity}% productivity
                      </div>
                      <div className="text-xs text-gray-400">
                        {block.availability}% available
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>

          {/* AI Recommendations */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getTaskTypeIcon(rec.taskType)}</span>
                      <h4 className="font-medium text-white">{rec.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBg(rec.confidence)} ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                  
                  <div className="text-sm text-blue-400 mb-2">
                    ⏰ {formatTime(rec.recommendedTime.start)} - {formatTime(rec.recommendedTime.end)}
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    <span className="font-medium">Why this time:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {rec.reasoning.slice(0, 2).map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {rec.blockers.length > 0 && (
                    <div className="text-xs text-yellow-400">
                      ⚠️ Potential issues: {rec.blockers.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Productivity Pattern */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Productivity Patterns</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyProductivityData}
                dataKeys={['morning', 'afternoon', 'evening']}
                colors={['#10B981', '#3B82F6', '#8B5CF6']}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Morning (8-12)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Afternoon (12-17)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Evening (17-20)</span>
              </div>
            </div>
          </TeslaCard>

          {/* Optimization Suggestions */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Optimization Suggestions</h3>
            <div className="space-y-4">
              <TeslaAlert
                type="success"
                title="Peak Performance Window"
                message="Your 9-11 AM window shows 92% productivity. Consider blocking this time for your most important tasks."
              />
              <TeslaAlert
                type="warning"
                title="Energy Dip Detected"
                message="Productivity drops 45% at 1 PM. Schedule lighter tasks or consider a power nap."
              />
              <TeslaAlert
                type="info"
                title="Secondary Peak Identified"
                message="4-5 PM shows 80% productivity - good for creative problem solving."
              />
              <TeslaAlert
                type="error"
                title="Weekend Efficiency"
                message="Weekend productivity is 35% lower. Consider batch processing routine tasks."
              />
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h4 className="font-medium text-blue-400 mb-2">💡 Smart Scheduling Tip</h4>
              <p className="text-sm text-gray-300">
                Based on your patterns, scheduling focused work from 9-11 AM and administrative tasks from 1-2 PM 
                could increase your overall productivity by 23%.
              </p>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'pattern' && (
        <div className="space-y-6">
          {/* Hourly Productivity Analysis */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Hourly Productivity Analysis (Monday Pattern)</h3>
            <div className="h-64">
              <TeslaChart
                data={hourlyProductivityData}
                dataKeys={['productivity', 'focus', 'energy']}
                colors={['#10B981', '#3B82F6', '#F59E0B']}
                type="line"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Productivity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Focus Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Energy Level</span>
              </div>
            </div>
          </TeslaCard>

          {/* Pattern Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TeslaCard>
              <h4 className="text-lg font-semibold text-green-400 mb-3">🎯 Peak Performance</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Best Hour</div>
                  <div className="text-xl font-bold text-white">9:00 AM</div>
                  <div className="text-xs text-green-400">92% productivity</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Duration</div>
                  <div className="text-lg font-semibold text-white">2-3 hours</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Task Completion</div>
                  <div className="text-lg font-semibold text-white">4 tasks/hour</div>
                </div>
              </div>
            </TeslaCard>

            <TeslaCard>
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">⚡ Energy Patterns</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Peak Energy</div>
                  <div className="text-xl font-bold text-white">8-10 AM</div>
                  <div className="text-xs text-yellow-400">95% focus level</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Low Point</div>
                  <div className="text-lg font-semibold text-white">1-2 PM</div>
                  <div className="text-xs text-orange-400">40% energy</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Recovery</div>
                  <div className="text-lg font-semibold text-white">3-4 PM</div>
                </div>
              </div>
            </TeslaCard>

            <TeslaCard>
              <h4 className="text-lg font-semibold text-blue-400 mb-3">📊 Optimization Score</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Current Efficiency</div>
                  <div className="text-xl font-bold text-white">78%</div>
                  <div className="text-xs text-blue-400">Above average</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Potential Gain</div>
                  <div className="text-lg font-semibold text-white">+23%</div>
                  <div className="text-xs text-green-400">With optimization</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Prediction Accuracy</div>
                  <div className="text-lg font-semibold text-white">87%</div>
                </div>
              </div>
            </TeslaCard>
          </div>
        </div>
      )}
    </div>
  );
}
