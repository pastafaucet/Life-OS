'use client';

import React from 'react';
import { Target, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SuccessMetric {
  id: string;
  category: 'deadline' | 'case_outcome' | 'task_completion' | 'goal_achievement';
  title: string;
  description: string;
  probability: number;
  confidence: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  deadline?: string;
  recommendation: string;
  historical_accuracy: number;
}

interface TeslaSuccessProbabilityProps {
  metrics?: SuccessMetric[];
  className?: string;
}

const mockMetrics: SuccessMetric[] = [
  {
    id: '1',
    category: 'deadline',
    title: 'Johnson Case Motion Filing',
    description: 'Probability of meeting the July 15th motion filing deadline',
    probability: 73,
    confidence: 91,
    factors: {
      positive: ['Research 80% complete', 'Template available', 'Client responsive'],
      negative: ['Complex legal issues', 'Heavy workload this week', 'Dependent on client docs']
    },
    deadline: 'July 15, 2025',
    recommendation: 'Allocate 6 additional hours Tuesday-Wednesday to ensure completion',
    historical_accuracy: 87
  },
  {
    id: '2',
    category: 'case_outcome',
    title: 'Smith vs. ABC Corp Settlement',
    description: 'Likelihood of achieving favorable settlement terms',
    probability: 84,
    confidence: 76,
    factors: {
      positive: ['Strong evidence', 'Precedent cases favor client', 'Opposing counsel cooperative'],
      negative: ['Corporation has deep pockets', 'Public relations concerns']
    },
    recommendation: 'Schedule mediation within 2 weeks while momentum is strong',
    historical_accuracy: 82
  },
  {
    id: '3',
    category: 'task_completion',
    title: 'Weekly Case Review Completion',
    description: 'Probability of completing all scheduled case reviews this week',
    probability: 92,
    confidence: 95,
    factors: {
      positive: ['Ahead of schedule', 'No urgent interruptions', 'Good energy levels'],
      negative: ['Friday court hearing may run long']
    },
    recommendation: 'Front-load reviews Tuesday-Thursday to create Friday buffer',
    historical_accuracy: 94
  },
  {
    id: '4',
    category: 'goal_achievement',
    title: 'Q3 MCLE Credits Goal',
    description: 'Likelihood of completing 25 MCLE credits by September 30th',
    probability: 67,
    confidence: 88,
    factors: {
      positive: ['14 credits already earned', '3 months remaining', 'Several courses identified'],
      negative: ['Busy case schedule', 'Limited evening availability']
    },
    deadline: 'September 30, 2025',
    recommendation: 'Register for weekend seminar series to accelerate progress',
    historical_accuracy: 91
  }
];

const getCategoryIcon = (category: SuccessMetric['category']) => {
  switch (category) {
    case 'deadline':
      return <Clock className="w-5 h-5" />;
    case 'case_outcome':
      return <Target className="w-5 h-5" />;
    case 'task_completion':
      return <CheckCircle className="w-5 h-5" />;
    case 'goal_achievement':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <Target className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: SuccessMetric['category']) => {
  switch (category) {
    case 'deadline':
      return 'text-red-400 bg-red-500/20';
    case 'case_outcome':
      return 'text-purple-400 bg-purple-500/20';
    case 'task_completion':
      return 'text-green-400 bg-green-500/20';
    case 'goal_achievement':
      return 'text-blue-400 bg-blue-500/20';
    default:
      return 'text-cyan-400 bg-cyan-500/20';
  }
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 80) return 'text-green-400 bg-green-400';
  if (probability >= 60) return 'text-yellow-400 bg-yellow-400';
  if (probability >= 40) return 'text-orange-400 bg-orange-400';
  return 'text-red-400 bg-red-400';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-400';
  if (confidence >= 75) return 'text-yellow-400';
  return 'text-orange-400';
};

export default function TeslaSuccessProbability({ 
  metrics = mockMetrics, 
  className = '' 
}: TeslaSuccessProbabilityProps) {
  const averageProbability = metrics.reduce((sum, m) => sum + m.probability, 0) / metrics.length;
  const highRiskCount = metrics.filter(m => m.probability < 60).length;
  const averageAccuracy = metrics.reduce((sum, m) => sum + m.historical_accuracy, 0) / metrics.length;

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Success Probability</h3>
            <p className="text-sm text-gray-400">AI-powered success forecasting</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${getProbabilityColor(averageProbability).split(' ')[0]}`}>
            {Math.round(averageProbability)}%
          </div>
          <div className="text-xs text-gray-400">Avg Success Rate</div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{metrics.length}</div>
          <div className="text-xs text-gray-400">Active Forecasts</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className={`text-lg font-semibold ${highRiskCount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            {highRiskCount}
          </div>
          <div className="text-xs text-gray-400">High Risk</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-cyan-400">{Math.round(averageAccuracy)}%</div>
          <div className="text-xs text-gray-400">AI Accuracy</div>
        </div>
      </div>

      {/* Success Metrics */}
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(metric.category)}`}>
                  {getCategoryIcon(metric.category)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {metric.title}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {metric.description}
                  </p>
                  {metric.deadline && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{metric.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-3 py-1 rounded text-xs font-medium ${getCategoryColor(metric.category)}`}>
                  {metric.category.replace('_', ' ')}
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${getProbabilityColor(metric.probability).split(' ')[0]}`}>
                    {metric.probability}%
                  </div>
                  <div className="text-xs text-gray-400">success rate</div>
                </div>
              </div>
            </div>

            {/* Probability Visualization */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Success Probability</span>
                <span className={`${getConfidenceColor(metric.confidence)}`}>
                  {metric.confidence}% confidence
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProbabilityColor(metric.probability).split(' ')[1]}`}
                  style={{ width: `${metric.probability}%` }}
                />
              </div>
            </div>

            {/* Factors Analysis */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Positive Factors</span>
                </div>
                <ul className="space-y-1">
                  {metric.factors.positive.map((factor, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-start space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">Risk Factors</span>
                </div>
                <ul className="space-y-1">
                  {metric.factors.negative.map((factor, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-start space-x-2">
                      <div className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">AI Recommendation</span>
              </div>
              <p className="text-sm text-gray-200">
                {metric.recommendation}
              </p>
            </div>

            {/* Historical Accuracy */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Historical AI Accuracy: {metric.historical_accuracy}%</span>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
