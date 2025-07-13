'use client';

import React from 'react';
import { Zap, Clock, Target, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface EfficiencyOpportunity {
  id: string;
  type: 'time_saving' | 'process_improvement' | 'automation' | 'optimization';
  title: string;
  description: string;
  potential_savings: {
    time: string;
    percentage: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
  actionable_steps: string[];
  estimated_implementation: string;
  confidence: number;
}

interface TeslaEfficiencyAlertsProps {
  opportunities?: EfficiencyOpportunity[];
  className?: string;
}

const mockOpportunities: EfficiencyOpportunity[] = [
  {
    id: '1',
    type: 'automation',
    title: 'Automate Case Status Updates',
    description: 'Automatically update case statuses based on document uploads and calendar events',
    potential_savings: { time: '2.5 hours/week', percentage: 35 },
    difficulty: 'medium',
    priority: 'high',
    actionable_steps: [
      'Set up document upload triggers',
      'Create status update rules',
      'Test automation workflow'
    ],
    estimated_implementation: '3-4 hours',
    confidence: 87
  },
  {
    id: '2',
    type: 'process_improvement',
    title: 'Batch Client Communications',
    description: 'Group similar client calls and emails into dedicated time blocks',
    potential_savings: { time: '1.8 hours/week', percentage: 22 },
    difficulty: 'easy',
    priority: 'high',
    actionable_steps: [
      'Block 2-hour communication windows',
      'Queue non-urgent client items',
      'Create communication templates'
    ],
    estimated_implementation: '1 hour setup',
    confidence: 94
  },
  {
    id: '3',
    type: 'time_saving',
    title: 'Template Legal Documents',
    description: 'Create smart templates for common legal documents with auto-fill capabilities',
    potential_savings: { time: '3.2 hours/week', percentage: 45 },
    difficulty: 'medium',
    priority: 'medium',
    actionable_steps: [
      'Identify most common documents',
      'Create dynamic templates',
      'Set up auto-fill data sources'
    ],
    estimated_implementation: '5-6 hours',
    confidence: 78
  },
  {
    id: '4',
    type: 'optimization',
    title: 'Optimize Meeting Preparation',
    description: 'Streamline meeting prep by auto-gathering relevant case files and notes',
    potential_savings: { time: '1.5 hours/week', percentage: 30 },
    difficulty: 'hard',
    priority: 'medium',
    actionable_steps: [
      'Integrate calendar with case system',
      'Create smart file gathering',
      'Set up automated briefing notes'
    ],
    estimated_implementation: '8-10 hours',
    confidence: 71
  }
];

const getTypeIcon = (type: EfficiencyOpportunity['type']) => {
  switch (type) {
    case 'automation':
      return <Zap className="w-5 h-5" />;
    case 'process_improvement':
      return <TrendingUp className="w-5 h-5" />;
    case 'time_saving':
      return <Clock className="w-5 h-5" />;
    case 'optimization':
      return <Target className="w-5 h-5" />;
    default:
      return <CheckCircle className="w-5 h-5" />;
  }
};

const getTypeColor = (type: EfficiencyOpportunity['type']) => {
  switch (type) {
    case 'automation':
      return 'text-purple-400 bg-purple-500/20';
    case 'process_improvement':
      return 'text-green-400 bg-green-500/20';
    case 'time_saving':
      return 'text-blue-400 bg-blue-500/20';
    case 'optimization':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-cyan-400 bg-cyan-500/20';
  }
};

const getPriorityColor = (priority: EfficiencyOpportunity['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getDifficultyColor = (difficulty: EfficiencyOpportunity['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

export default function TeslaEfficiencyAlerts({ 
  opportunities = mockOpportunities, 
  className = '' 
}: TeslaEfficiencyAlertsProps) {
  const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + opp.potential_savings.percentage, 0);
  const highPriorityCount = opportunities.filter(opp => opp.priority === 'high').length;

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Efficiency Opportunities</h3>
            <p className="text-sm text-gray-400">AI-identified optimization potential</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-orange-400">
            {totalPotentialSavings}%
          </div>
          <div className="text-xs text-gray-400">Total Efficiency Gain</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{opportunities.length}</div>
          <div className="text-xs text-gray-400">Opportunities</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-400">{highPriorityCount}</div>
          <div className="text-xs text-gray-400">High Priority</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-400">
            {opportunities.reduce((sum, opp) => {
              const hours = parseFloat(opp.potential_savings.time.split(' ')[0]);
              return sum + hours;
            }, 0).toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400">Weekly Savings</div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getTypeColor(opportunity.type)}`}>
                  {getTypeIcon(opportunity.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {opportunity.title}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {opportunity.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                  {opportunity.priority} priority
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-orange-400">
                    {opportunity.potential_savings.time}
                  </div>
                  <div className="text-xs text-gray-400">
                    {opportunity.potential_savings.percentage}% faster
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Details */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Difficulty</div>
                <div className={`text-sm font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Implementation Time</div>
                <div className="text-sm font-medium text-white">
                  {opportunity.estimated_implementation}
                </div>
              </div>
            </div>

            {/* Action Steps */}
            <div className="bg-gray-800/50 rounded p-3 mb-3">
              <div className="text-xs text-gray-400 mb-2">Action Steps:</div>
              <ul className="space-y-1">
                {opportunity.actionable_steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-200 flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Confidence:</span>
                <span className={`text-xs font-medium ${opportunity.confidence >= 85 ? 'text-green-400' : opportunity.confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'}`}>
                  {opportunity.confidence}%
                </span>
              </div>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Start Implementation →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
