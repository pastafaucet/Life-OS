'use client';

import React from 'react';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Star,
  Activity,
  Lightbulb
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'prediction' | 'pattern' | 'optimization' | 'risk' | 'opportunity' | 'efficiency' | 'trend';
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  value: string | number;
  confidence: number;
  description?: string;
  actionable?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

interface TeslaAIInsightsBadgesProps {
  insights?: AIInsight[];
  layout?: 'grid' | 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  className?: string;
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'prediction',
    level: 'critical',
    title: 'Deadline Risk',
    value: '73%',
    confidence: 87,
    description: 'Johnson case motion likely to miss deadline without action',
    actionable: true,
    trend: 'down'
  },
  {
    id: '2',
    type: 'pattern',
    level: 'high',
    title: 'Peak Performance',
    value: 'Tue 9-11AM',
    confidence: 94,
    description: 'Your highest productivity window identified',
    actionable: true,
    trend: 'stable'
  },
  {
    id: '3',
    type: 'efficiency',
    level: 'medium',
    title: 'Time Savings',
    value: '2.5h/week',
    confidence: 91,
    description: 'Automation potential for case status updates',
    actionable: true,
    trend: 'up'
  },
  {
    id: '4',
    type: 'opportunity',
    level: 'medium',
    title: 'MCLE Credits',
    value: '67%',
    confidence: 88,
    description: 'Q3 goal completion probability',
    actionable: true,
    trend: 'up'
  },
  {
    id: '5',
    type: 'risk',
    level: 'high',
    title: 'Capacity Alert',
    value: '127%',
    confidence: 95,
    description: 'Next week workload exceeds optimal capacity',
    actionable: true,
    trend: 'up'
  },
  {
    id: '6',
    type: 'trend',
    level: 'info',
    title: 'Case Velocity',
    value: '+15%',
    confidence: 82,
    description: 'Case resolution speed improving',
    actionable: false,
    trend: 'up'
  }
];

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'prediction':
      return <Brain className="w-4 h-4" />;
    case 'pattern':
      return <Activity className="w-4 h-4" />;
    case 'optimization':
      return <Target className="w-4 h-4" />;
    case 'risk':
      return <AlertTriangle className="w-4 h-4" />;
    case 'opportunity':
      return <Star className="w-4 h-4" />;
    case 'efficiency':
      return <Zap className="w-4 h-4" />;
    case 'trend':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <Lightbulb className="w-4 h-4" />;
  }
};

const getLevelColors = (level: AIInsight['level']) => {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-red-500/20'
      };
    case 'high':
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20'
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20'
      };
    case 'low':
      return {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20'
      };
    case 'info':
      return {
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        glow: 'shadow-gray-500/20'
      };
    default:
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/20'
      };
  }
};

const getTrendIcon = (trend?: AIInsight['trend']) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-green-400" />;
    case 'down':
      return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
    case 'stable':
      return <div className="w-3 h-0.5 bg-gray-400 rounded" />;
    default:
      return null;
  }
};

const getSizeClasses = (size: TeslaAIInsightsBadgesProps['size']) => {
  switch (size) {
    case 'small':
      return {
        container: 'p-2',
        text: 'text-xs',
        value: 'text-sm',
        icon: 'w-3 h-3'
      };
    case 'large':
      return {
        container: 'p-4',
        text: 'text-sm',
        value: 'text-lg',
        icon: 'w-5 h-5'
      };
    default: // medium
      return {
        container: 'p-3',
        text: 'text-xs',
        value: 'text-base',
        icon: 'w-4 h-4'
      };
  }
};

const getLayoutClasses = (layout: TeslaAIInsightsBadgesProps['layout']) => {
  switch (layout) {
    case 'horizontal':
      return 'flex flex-wrap gap-2';
    case 'vertical':
      return 'flex flex-col space-y-2';
    default: // grid
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';
  }
};

interface BadgeProps {
  insight: AIInsight;
  size: TeslaAIInsightsBadgesProps['size'];
  interactive: boolean;
  onClick?: () => void;
}

function AIInsightBadge({ insight, size = 'medium', interactive, onClick }: BadgeProps) {
  const colors = getLevelColors(insight.level);
  const sizeClasses = getSizeClasses(size);
  
  return (
    <div
      className={`
        ${colors.bg} ${colors.border} border rounded-lg backdrop-blur-sm 
        ${sizeClasses.container}
        ${interactive ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''}
        ${colors.glow}
        group relative
      `}
      onClick={onClick}
    >
      {/* Animated Pulse for Critical Items */}
      {insight.level === 'critical' && (
        <div className="absolute inset-0 rounded-lg bg-red-500/10 animate-pulse" />
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className={colors.text}>
              {getInsightIcon(insight.type)}
            </div>
            <span className={`${sizeClasses.text} font-medium text-white truncate`}>
              {insight.title}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon(insight.trend)}
            {insight.actionable && (
              <CheckCircle className="w-3 h-3 text-green-400" />
            )}
          </div>
        </div>

        {/* Value */}
        <div className={`${sizeClasses.value} font-bold ${colors.text} mb-1`}>
          {insight.value}
        </div>

        {/* Confidence Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${colors.text.replace('text-', 'bg-')}`}
              style={{ width: `${insight.confidence}%` }}
            />
          </div>
          <span className={`${sizeClasses.text} text-gray-400`}>
            {insight.confidence}%
          </span>
        </div>

        {/* Description (for larger sizes) */}
        {size === 'large' && insight.description && (
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            {insight.description}
          </p>
        )}

        {/* Interactive Overlay */}
        {interactive && (
          <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>
    </div>
  );
}

export default function TeslaAIInsightsBadges({
  insights = mockInsights,
  layout = 'grid',
  size = 'medium',
  interactive = true,
  className = ''
}: TeslaAIInsightsBadgesProps) {
  const [selectedInsight, setSelectedInsight] = React.useState<string | null>(null);

  const handleInsightClick = (insightId: string) => {
    if (interactive) {
      setSelectedInsight(selectedInsight === insightId ? null : insightId);
    }
  };

  const criticalInsights = insights.filter(i => i.level === 'critical');
  const actionableInsights = insights.filter(i => i.actionable);

  return (
    <div className={`${className}`}>
      {/* Header Info */}
      {size !== 'small' && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Insights</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {criticalInsights.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>{criticalInsights.length} critical</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>{actionableInsights.length} actionable</span>
            </div>
          </div>
        </div>
      )}

      {/* Insights Grid/List */}
      <div className={getLayoutClasses(layout)}>
        {insights.map((insight) => (
          <AIInsightBadge
            key={insight.id}
            insight={insight}
            size={size}
            interactive={interactive}
            onClick={() => handleInsightClick(insight.id)}
          />
        ))}
      </div>

      {/* Detailed View for Selected Insight */}
      {selectedInsight && interactive && (
        <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
          {(() => {
            const insight = insights.find(i => i.id === selectedInsight);
            if (!insight) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{insight.title}</h4>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {insight.description && (
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{insight.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white">{insight.confidence}%</span>
                  </div>
                  {insight.actionable && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Actionable</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 mb-2">No insights available</div>
          <div className="text-sm text-gray-500">
            AI is analyzing your data to generate insights
          </div>
        </div>
      )}
    </div>
  );
}

// Export individual badge component for use in other components
export { AIInsightBadge };
