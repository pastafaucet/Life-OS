'use client';

import React from 'react';
import { Activity, Clock, TrendingUp, Calendar, Brain, BarChart3 } from 'lucide-react';

interface ProductivityPattern {
  id: string;
  category: 'time' | 'energy' | 'focus' | 'efficiency';
  title: string;
  description: string;
  strength: number;
  recommendation: string;
  timeframe: string;
  impact: number;
}

interface TeslaPatternRecognitionProps {
  patterns?: ProductivityPattern[];
  className?: string;
}

const mockPatterns: ProductivityPattern[] = [
  {
    id: '1',
    category: 'time',
    title: 'Morning Peak Performance',
    description: 'Highest task completion rate between 9:00-11:30 AM',
    strength: 92,
    recommendation: 'Schedule complex tasks during this window',
    timeframe: 'Daily pattern over 4 weeks',
    impact: 85
  },
  {
    id: '2',
    category: 'energy',
    title: 'Tuesday Energy Surge',
    description: '40% higher productivity on Tuesdays vs. other weekdays',
    strength: 78,
    recommendation: 'Plan challenging work for Tuesday mornings',
    timeframe: 'Weekly pattern over 12 weeks',
    impact: 70
  },
  {
    id: '3',
    category: 'focus',
    title: 'Deep Work Sessions',
    description: 'Best focus in 90-minute blocks with 15-minute breaks',
    strength: 87,
    recommendation: 'Structure work in 90-minute focused sessions',
    timeframe: 'Session analysis over 6 weeks',
    impact: 75
  },
  {
    id: '4',
    category: 'efficiency',
    title: 'Case Preparation Sequence',
    description: 'Documents-first approach reduces total time by 23%',
    strength: 94,
    recommendation: 'Always prepare documents before client calls',
    timeframe: 'Process analysis over 8 weeks',
    impact: 90
  }
];

const getCategoryIcon = (category: ProductivityPattern['category']) => {
  switch (category) {
    case 'time':
      return <Clock className="w-5 h-5" />;
    case 'energy':
      return <Activity className="w-5 h-5" />;
    case 'focus':
      return <Brain className="w-5 h-5" />;
    case 'efficiency':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <BarChart3 className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: ProductivityPattern['category']) => {
  switch (category) {
    case 'time':
      return 'text-blue-400 bg-blue-500/20';
    case 'energy':
      return 'text-green-400 bg-green-500/20';
    case 'focus':
      return 'text-purple-400 bg-purple-500/20';
    case 'efficiency':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-cyan-400 bg-cyan-500/20';
  }
};

const getStrengthColor = (strength: number) => {
  if (strength >= 90) return 'text-green-400 bg-green-400';
  if (strength >= 75) return 'text-yellow-400 bg-yellow-400';
  if (strength >= 60) return 'text-orange-400 bg-orange-400';
  return 'text-red-400 bg-red-400';
};

export default function TeslaPatternRecognition({ 
  patterns = mockPatterns, 
  className = '' 
}: TeslaPatternRecognitionProps) {
  const averageStrength = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Pattern Recognition</h3>
            <p className="text-sm text-gray-400">Your productivity patterns analyzed</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-indigo-400">
            {Math.round(averageStrength)}%
          </div>
          <div className="text-xs text-gray-400">Pattern Strength</div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="space-y-4">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(pattern.category)}`}>
                  {getCategoryIcon(pattern.category)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {pattern.title}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {pattern.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(pattern.category)}`}>
                  {pattern.category}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getStrengthColor(pattern.strength).split(' ')[0]}`}>
                    {pattern.strength}% strong
                  </div>
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getStrengthColor(pattern.strength).split(' ')[1]} transition-all duration-500`}
                      style={{ width: `${pattern.strength}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gray-800/50 rounded p-3 mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">Recommendation</span>
              </div>
              <p className="text-sm text-gray-200">
                {pattern.recommendation}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>{pattern.timeframe}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Impact:</span>
                <span className={`font-medium ${pattern.impact >= 80 ? 'text-green-400' : pattern.impact >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                  {pattern.impact}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700/30">
        <div className="grid grid-cols-4 gap-4">
          {['time', 'energy', 'focus', 'efficiency'].map((category) => {
            const categoryPatterns = patterns.filter(p => p.category === category);
            const avgStrength = categoryPatterns.length > 0 
              ? categoryPatterns.reduce((sum, p) => sum + p.strength, 0) / categoryPatterns.length 
              : 0;
            
            return (
              <div key={category} className="text-center">
                <div className={`text-sm font-semibold ${getCategoryColor(category as any).split(' ')[0]}`}>
                  {Math.round(avgStrength)}%
                </div>
                <div className="text-xs text-gray-400 capitalize">{category}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
