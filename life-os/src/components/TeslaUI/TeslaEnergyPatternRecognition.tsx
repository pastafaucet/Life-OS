'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';

interface EnergyDataPoint {
  timestamp: Date;
  energyLevel: number; // 0-100
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'exhausted';
  focusCapability: number; // 0-100
  physicalEnergy: number; // 0-100
  mentalEnergy: number; // 0-100
  factors: {
    sleep: number; // hours
    sleepQuality: number; // 0-100
    caffeineIntake: number; // mg
    meals: string[]; // meal types
    exercise: boolean;
    exerciseIntensity?: 'light' | 'moderate' | 'intense';
    weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    stress: number; // 0-100
    socialInteraction: number; // 0-100
  };
  activities: string[];
  productivity: number; // 0-100
}

interface EnergyPattern {
  id: string;
  name: string;
  description: string;
  timeOfDay: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  averageEnergy: number;
  consistency: number; // 0-100
  factors: {
    primaryDriver: string;
    secondaryFactors: string[];
    negativeFactors: string[];
  };
  recommendations: string[];
  confidence: number; // 0-100
}

interface EnergyForecast {
  time: string;
  predictedEnergy: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export function TeslaEnergyPatternRecognition() {
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'patterns' | 'factors'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [energyData] = useState<EnergyDataPoint[]>([
    // Monday data
    {
      timestamp: new Date('2024-07-08T07:00:00'),
      energyLevel: 45,
      mood: 'neutral',
      focusCapability: 40,
      physicalEnergy: 35,
      mentalEnergy: 50,
      factors: {
        sleep: 6.5,
        sleepQuality: 60,
        caffeineIntake: 0,
        meals: [],
        exercise: false,
        weather: 'cloudy',
        stress: 30,
        socialInteraction: 10
      },
      activities: ['wake up', 'morning routine'],
      productivity: 35
    },
    {
      timestamp: new Date('2024-07-08T08:00:00'),
      energyLevel: 65,
      mood: 'good',
      focusCapability: 70,
      physicalEnergy: 60,
      mentalEnergy: 70,
      factors: {
        sleep: 6.5,
        sleepQuality: 60,
        caffeineIntake: 150,
        meals: ['breakfast'],
        exercise: false,
        weather: 'cloudy',
        stress: 25,
        socialInteraction: 20
      },
      activities: ['coffee', 'breakfast', 'news'],
      productivity: 60
    },
    {
      timestamp: new Date('2024-07-08T09:00:00'),
      energyLevel: 85,
      mood: 'excellent',
      focusCapability: 90,
      physicalEnergy: 80,
      mentalEnergy: 90,
      factors: {
        sleep: 6.5,
        sleepQuality: 60,
        caffeineIntake: 150,
        meals: ['breakfast'],
        exercise: false,
        weather: 'sunny',
        stress: 20,
        socialInteraction: 30
      },
      activities: ['focused work', 'legal research'],
      productivity: 95
    },
    {
      timestamp: new Date('2024-07-08T13:00:00'),
      energyLevel: 35,
      mood: 'poor',
      focusCapability: 30,
      physicalEnergy: 25,
      mentalEnergy: 40,
      factors: {
        sleep: 6.5,
        sleepQuality: 60,
        caffeineIntake: 150,
        meals: ['breakfast', 'lunch'],
        exercise: false,
        weather: 'sunny',
        stress: 40,
        socialInteraction: 60
      },
      activities: ['meetings', 'email'],
      productivity: 25
    },
    {
      timestamp: new Date('2024-07-08T15:00:00'),
      energyLevel: 70,
      mood: 'good',
      focusCapability: 75,
      physicalEnergy: 65,
      mentalEnergy: 75,
      factors: {
        sleep: 6.5,
        sleepQuality: 60,
        caffeineIntake: 300,
        meals: ['breakfast', 'lunch'],
        exercise: false,
        weather: 'sunny',
        stress: 30,
        socialInteraction: 40
      },
      activities: ['afternoon coffee', 'creative work'],
      productivity: 80
    }
  ]);

  const [energyPatterns] = useState<EnergyPattern[]>([
    {
      id: 'morning-peak',
      name: 'Morning Peak Performance',
      description: 'Consistent high energy and focus in morning hours',
      timeOfDay: { start: '08:30', end: '11:00' },
      averageEnergy: 87,
      consistency: 92,
      factors: {
        primaryDriver: 'Caffeine intake + morning sunlight',
        secondaryFactors: ['Good sleep quality', 'Light breakfast', 'Minimal stress'],
        negativeFactors: ['Poor sleep', 'Heavy breakfast', 'Morning meetings']
      },
      recommendations: [
        'Block 9-11 AM for most important tasks',
        'Maintain consistent morning coffee routine',
        'Avoid scheduling meetings before 11 AM',
        'Get 15 minutes of sunlight exposure'
      ],
      confidence: 94
    },
    {
      id: 'post-lunch-dip',
      name: 'Post-Lunch Energy Crash',
      description: 'Predictable energy drop after lunch',
      timeOfDay: { start: '13:00', end: '14:30' },
      averageEnergy: 38,
      consistency: 89,
      factors: {
        primaryDriver: 'Circadian rhythm + meal size',
        secondaryFactors: ['Carbohydrate intake', 'Meeting fatigue', 'Lack of movement'],
        negativeFactors: ['Large lunch', 'High-stress morning', 'No physical activity']
      },
      recommendations: [
        'Schedule light administrative tasks only',
        'Take a 10-15 minute walk after lunch',
        'Avoid important decisions during this window',
        'Consider a power nap if possible'
      ],
      confidence: 91
    },
    {
      id: 'afternoon-recovery',
      name: 'Afternoon Energy Recovery',
      description: 'Secondary energy peak in mid-afternoon',
      timeOfDay: { start: '15:00', end: '17:00' },
      averageEnergy: 72,
      consistency: 78,
      factors: {
        primaryDriver: 'Natural circadian rise + caffeine',
        secondaryFactors: ['Movement/walking', 'Social interaction', 'Fresh air'],
        negativeFactors: ['Skipping caffeine', 'Sitting too long', 'Poor lighting']
      },
      recommendations: [
        'Perfect time for creative problem-solving',
        'Schedule collaborative work and calls',
        'Strategic caffeine intake around 2:30 PM',
        'Ensure good lighting and ventilation'
      ],
      confidence: 82
    },
    {
      id: 'evening-decline',
      name: 'Evening Wind-Down',
      description: 'Natural energy decline preparing for rest',
      timeOfDay: { start: '18:00', end: '21:00' },
      averageEnergy: 45,
      consistency: 85,
      factors: {
        primaryDriver: 'Circadian rhythm + accumulated fatigue',
        secondaryFactors: ['End of work stress', 'Home environment', 'Meal timing'],
        negativeFactors: ['Late caffeine', 'Blue light exposure', 'Stressful activities']
      },
      recommendations: [
        'Focus on light planning and organization',
        'Avoid stimulating activities after 7 PM',
        'Prepare for next day to reduce morning stress',
        'Begin wind-down routine by 8 PM'
      ],
      confidence: 88
    }
  ]);

  const [todayForecast] = useState<EnergyForecast[]>([
    {
      time: '08:00',
      predictedEnergy: 68,
      confidence: 85,
      factors: ['Morning coffee', 'Good sleep last night', 'Sunny weather'],
      recommendations: ['Start with lighter tasks', 'Get sunlight exposure']
    },
    {
      time: '09:00',
      predictedEnergy: 88,
      confidence: 92,
      factors: ['Peak morning energy', 'Caffeine optimal', 'Minimal stress'],
      recommendations: ['Schedule most important work', 'Deep focus tasks']
    },
    {
      time: '10:00',
      predictedEnergy: 85,
      confidence: 90,
      factors: ['Sustained peak', 'Good momentum', 'Optimal focus'],
      recommendations: ['Continue complex tasks', 'Avoid interruptions']
    },
    {
      time: '13:00',
      predictedEnergy: 42,
      confidence: 89,
      factors: ['Post-lunch dip', 'Natural circadian low', 'Meal digestion'],
      recommendations: ['Light administrative work', 'Take a walk']
    },
    {
      time: '15:00',
      predictedEnergy: 75,
      confidence: 78,
      factors: ['Afternoon recovery', 'Strategic caffeine', 'Movement'],
      recommendations: ['Creative work', 'Team collaboration']
    },
    {
      time: '17:00',
      predictedEnergy: 55,
      confidence: 80,
      factors: ['Natural decline', 'End of work day', 'Accumulated fatigue'],
      recommendations: ['Planning and organization', 'Light tasks only']
    }
  ]);

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'text-green-400';
    if (energy >= 60) return 'text-blue-400';
    if (energy >= 40) return 'text-yellow-400';
    if (energy >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEnergyBg = (energy: number) => {
    if (energy >= 80) return 'bg-green-500/20';
    if (energy >= 60) return 'bg-blue-500/20';
    if (energy >= 40) return 'bg-yellow-500/20';
    if (energy >= 20) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getMoodIcon = (mood: EnergyDataPoint['mood']) => {
    switch (mood) {
      case 'excellent': return '🚀';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'poor': return '😴';
      case 'exhausted': return '😵';
      default: return '⚡';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Chart data preparation
  const hourlyEnergyData = energyData.map(point => ({
    name: point.timestamp.getHours().toString().padStart(2, '0') + ':00',
    energy: point.energyLevel,
    focus: point.focusCapability,
    physical: point.physicalEnergy,
    mental: point.mentalEnergy,
    productivity: point.productivity
  }));

  const weeklyAverageData = [
    { name: 'Mon', morning: 85, afternoon: 65, evening: 45 },
    { name: 'Tue', morning: 82, afternoon: 70, evening: 50 },
    { name: 'Wed', morning: 88, afternoon: 60, evening: 40 },
    { name: 'Thu', morning: 80, afternoon: 68, evening: 48 },
    { name: 'Fri', morning: 75, afternoon: 55, evening: 52 },
    { name: 'Sat', morning: 65, afternoon: 70, evening: 60 },
    { name: 'Sun', morning: 70, afternoon: 65, evening: 55 }
  ];

  const energyFactorsData = [
    { factor: 'Sleep Quality', impact: 85, correlation: 0.87 },
    { factor: 'Caffeine Timing', impact: 72, correlation: 0.74 },
    { factor: 'Exercise', impact: 68, correlation: 0.71 },
    { factor: 'Meal Timing', impact: 55, correlation: 0.62 },
    { factor: 'Sunlight', impact: 48, correlation: 0.58 },
    { factor: 'Stress Level', impact: -65, correlation: -0.69 },
    { factor: 'Social Interaction', impact: 42, correlation: 0.45 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Energy Pattern Recognition</h2>
        <div className="flex space-x-2">
          {(['today', 'week', 'patterns', 'factors'] as const).map((mode) => (
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
          label="Peak Energy Time"
          value="9:15 AM"
          icon="🚀"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Energy Consistency"
          value="87%"
          icon="⚡"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="Pattern Accuracy"
          value="91%"
          icon="🎯"
          color="purple"
          trend="up"
        />
        <TeslaMetric
          label="Optimization Score"
          value="78%"
          icon="📈"
          color="orange"
          trend="neutral"
        />
      </div>

      {viewMode === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Energy Forecast */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Today's Energy Forecast</h3>
            <div className="space-y-3">
              {todayForecast.map((forecast, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-800/30 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-400 font-medium">
                        {formatTime(forecast.time)}
                      </span>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${getEnergyBg(forecast.predictedEnergy)} ${getEnergyColor(forecast.predictedEnergy)}`}>
                        {forecast.predictedEnergy}% Energy
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {forecast.confidence}% confidence
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-300 mb-2">
                    <span className="font-medium">Factors:</span> {forecast.factors.join(', ')}
                  </div>
                  
                  <div className="text-xs text-blue-300">
                    💡 {forecast.recommendations.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>

          {/* Current Energy Status */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Current Energy Analysis</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <TeslaGauge
                  value={75}
                  max={100}
                  color="blue"
                  size="sm"
                />
                <div className="text-sm text-gray-300 mt-2">Overall Energy</div>
                <div className="text-xs text-blue-400">Above Average</div>
              </div>
              <div className="text-center">
                <TeslaGauge
                  value={85}
                  max={100}
                  color="green"
                  size="sm"
                />
                <div className="text-sm text-gray-300 mt-2">Focus Capability</div>
                <div className="text-xs text-green-400">Peak Performance</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Physical Energy</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-blue-400 text-sm">70%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mental Energy</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-green-400 text-sm">85%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Emotional State</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">😊</span>
                  <span className="text-green-400 text-sm">Good</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <h4 className="font-medium text-green-400 mb-1">🎯 Current Recommendation</h4>
              <p className="text-sm text-gray-300">
                You're in a high-energy state perfect for complex tasks. This is optimal time for 
                legal research, case analysis, or strategic planning.
              </p>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Energy Patterns */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Energy Patterns</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyAverageData}
                dataKeys={['morning', 'afternoon', 'evening']}
                colors={['#10B981', '#3B82F6', '#8B5CF6']}
                type="line"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Morning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Afternoon</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Evening</span>
              </div>
            </div>
          </TeslaCard>

          {/* Hourly Energy Today */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Today's Hourly Energy</h3>
            <div className="h-64">
              <TeslaChart
                data={hourlyEnergyData}
                dataKeys={['energy', 'focus', 'productivity']}
                colors={['#F59E0B', '#10B981', '#3B82F6']}
                type="line"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Energy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Focus</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Productivity</span>
              </div>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'patterns' && (
        <div className="space-y-6">
          {/* Identified Energy Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {energyPatterns.map((pattern) => (
              <TeslaCard key={pattern.id}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{pattern.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getEnergyBg(pattern.averageEnergy)} ${getEnergyColor(pattern.averageEnergy)}`}>
                      {pattern.averageEnergy}% avg
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                      {pattern.confidence}% confident
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{pattern.description}</p>
                
                <div className="text-sm text-blue-400 mb-3">
                  ⏰ {formatTime(pattern.timeOfDay.start)} - {formatTime(pattern.timeOfDay.end)}
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Consistency</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${pattern.consistency}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-400 mt-1">{pattern.consistency}% consistent</div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-green-400">✓ Primary Driver:</span>
                    <span className="text-gray-300 ml-2">{pattern.factors.primaryDriver}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-400">+ Helps:</span>
                    <span className="text-gray-300 ml-2">{pattern.factors.secondaryFactors.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-400">- Hurts:</span>
                    <span className="text-gray-300 ml-2">{pattern.factors.negativeFactors.join(', ')}</span>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/30">
                  <div className="font-medium text-blue-400 text-xs mb-1">💡 Recommendations:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {pattern.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </TeslaCard>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'factors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Factor Analysis */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Energy Factor Impact Analysis</h3>
            <div className="space-y-3">
              {energyFactorsData.map((factor, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${factor.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact}%
                      </span>
                      <span className="text-xs text-gray-400">
                        r={factor.correlation.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(factor.impact)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>

          {/* Optimization Suggestions */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Energy Optimization Insights</h3>
            <div className="space-y-4">
              <TeslaAlert
                type="success"
                title="Sleep Quality Impact"
                children={
                  <p className="text-sm text-gray-300">
                    Improving sleep quality by 20% could increase your average energy by 15%. 
                    Consider a consistent sleep schedule and better sleep environment.
                  </p>
                }
              />
              
              <TeslaAlert
                type="info"
                title="Caffeine Timing Optimization"
                children={
                  <p className="text-sm text-gray-300">
                    Strategic caffeine timing (8 AM, 2:30 PM) aligns with your natural energy patterns. 
                    Avoid caffeine after 4 PM for better sleep quality.
                  </p>
                }
              />
              
              <TeslaAlert
                type="warning"
                title="Stress Management"
                children={
                  <p className="text-sm text-gray-300">
                    High stress periods correlate with 65% energy reduction. Implement stress management 
                    techniques during peak work periods.
                  </p>
                }
              />
              
              <TeslaAlert
                type="error"
                title="Exercise Opportunity"
                children={
                  <p className="text-sm text-gray-300">
                    You're missing 68% energy boost from regular exercise. Even 15-minute walks 
                    can significantly improve afternoon energy levels.
                  </p>
                }
              />
            </div>
            
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <h4 className="font-medium text-purple-400 mb-2">🔮 AI Prediction</h4>
              <p className="text-sm text-gray-300">
                Based on your patterns, implementing consistent sleep schedule + strategic exercise 
                could increase your peak energy window from 2.5 hours to 4 hours daily, boosting 
                overall productivity by 35%.
              </p>
            </div>
          </TeslaCard>
        </div>
      )}
    </div>
  );
}
