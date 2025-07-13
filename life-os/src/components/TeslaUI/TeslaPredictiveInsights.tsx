'use client';

import React from 'react';
import { TrendingUp, Clock, AlertTriangle, Target, Brain } from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface TeslaPredictiveInsightsProps {
  insights?: PredictiveInsight[];
  className?: string;
}

const mockInsights: PredictiveInsight[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Deadline Risk Alert',
    description: 'Based on current pace, you\'re likely to miss the Johnson case deadline by 2 days',
    confidence: 87,
    impact: 'high',
    actionable: true
  },
  {
    id: '2',
    type: 'pattern',
    title: 'Peak Productivity Window',
    description: 'You typically complete 40% more tasks between 9-11 AM on Tuesdays',
    confidence: 94,
    impact: 'medium',
    actionable: true
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Case Preparation Efficiency',
    description: 'Similar cases usually take 3.2 hours less when you prepare documents first',
    confidence: 78,
    impact: 'medium',
    actionable: true
  },
  {
    id: '4',
    type: 'risk',
    title: 'Workload Capacity Warning',
    description: 'Next week\'s schedule is 127% of your optimal capacity',
    confidence: 91,
    impact: 'high',
    actionable: true
  }
];

const getInsightIcon = (type: PredictiveInsight['type']) => {
  switch (type) {
    case 'prediction':
      return <TrendingUp className="w-5 h-5" />;
    case 'pattern':
      return <Brain className="w-5 h-5" />;
    case 'risk':
      return <AlertTriangle className="w-5 h-5" />;
    case 'opportunity':
      return <Target className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

const getInsightColor = (type: PredictiveInsight['type'], impact: PredictiveInsight['impact']) => {
  if (type === 'risk') {
    return impact === 'high' ? 'text-red-400' : 'text-orange-400';
  }
  if (type === 'opportunity') {
    return impact === 'high' ? 'text-green-400' : 'text-blue-400';
  }
  return 'text-cyan-400';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-400';
  if (confidence >= 75) return 'text-yellow-400';
  return 'text-orange-400';
};

export default function TeslaPredictiveInsights({ 
  insights = mockInsights, 
  className = '' 
}: TeslaPredictiveInsightsProps) {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Predictive Insights</h3>
            <p className="text-sm text-gray-400">AI-powered predictions and patterns</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live Analysis</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg bg-gray-800/50 ${getInsightColor(insight.type, insight.impact)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {insight.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full bg-gray-800 ${getInsightColor(insight.type, insight.impact)}`}>
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 ml-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}% confidence
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getConfidenceColor(insight.confidence).replace('text-', 'bg-')} transition-all duration-500`}
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            {insight.actionable && (
              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Take Action →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{insights.length}</div>
            <div className="text-xs text-gray-400">Active Insights</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-400">
              {insights.filter(i => i.confidence >= 85).length}
            </div>
            <div className="text-xs text-gray-400">High Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-400">
              {insights.filter(i => i.type === 'risk').length}
            </div>
            <div className="text-xs text-gray-400">Risk Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
