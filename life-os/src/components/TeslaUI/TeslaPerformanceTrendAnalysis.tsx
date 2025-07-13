'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Clock, Target, Zap, Calendar, Brain, AlertCircle } from 'lucide-react';

interface PerformanceMetric {
  metric: string;
  current_value: number;
  previous_value: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  unit: string;
  category: 'productivity' | 'quality' | 'efficiency' | 'wellbeing';
}

interface TrendDataPoint {
  period: string;
  tasks_completed: number;
  hours_worked: number;
  efficiency_score: number;
  stress_level: number;
  quality_score: number;
  focus_time: number;
}

interface TeslaPerformanceTrendAnalysisProps {
  metrics?: PerformanceMetric[];
  trendData?: TrendDataPoint[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

const mockMetrics: PerformanceMetric[] = [
  {
    metric: 'Task Completion Rate',
    current_value: 87,
    previous_value: 82,
    trend: 'up',
    change_percentage: 6.1,
    unit: '%',
    category: 'productivity'
  },
  {
    metric: 'Average Hours/Day',
    current_value: 8.4,
    previous_value: 9.2,
    trend: 'down',
    change_percentage: -8.7,
    unit: 'hrs',
    category: 'wellbeing'
  },
  {
    metric: 'Focus Time Ratio',
    current_value: 73,
    previous_value: 68,
    trend: 'up',
    change_percentage: 7.4,
    unit: '%',
    category: 'efficiency'
  },
  {
    metric: 'Quality Score',
    current_value: 4.7,
    previous_value: 4.5,
    trend: 'up',
    change_percentage: 4.4,
    unit: '/5',
    category: 'quality'
  },
  {
    metric: 'Stress Level',
    current_value: 3.2,
    previous_value: 3.8,
    trend: 'down',
    change_percentage: -15.8,
    unit: '/10',
    category: 'wellbeing'
  },
  {
    metric: 'Deadline Success',
    current_value: 94,
    previous_value: 89,
    trend: 'up',
    change_percentage: 5.6,
    unit: '%',
    category: 'quality'
  }
];

const mockTrendData: TrendDataPoint[] = [
  { period: 'Week 1', tasks_completed: 28, hours_worked: 42, efficiency_score: 85, stress_level: 3.5, quality_score: 4.2, focus_time: 65 },
  { period: 'Week 2', tasks_completed: 31, hours_worked: 45, efficiency_score: 82, stress_level: 4.1, quality_score: 4.3, focus_time: 68 },
  { period: 'Week 3', tasks_completed: 29, hours_worked: 38, efficiency_score: 88, stress_level: 3.2, quality_score: 4.6, focus_time: 72 },
  { period: 'Week 4', tasks_completed: 33, hours_worked: 41, efficiency_score: 91, stress_level: 2.8, quality_score: 4.8, focus_time: 76 },
  { period: 'This Week', tasks_completed: 35, hours_worked: 39, efficiency_score: 94, stress_level: 2.5, quality_score: 4.9, focus_time: 78 }
];

const getCategoryIcon = (category: PerformanceMetric['category']) => {
  switch (category) {
    case 'productivity': return <Target className="w-4 h-4" />;
    case 'quality': return <BarChart3 className="w-4 h-4" />;
    case 'efficiency': return <Zap className="w-4 h-4" />;
    case 'wellbeing': return <Brain className="w-4 h-4" />;
    default: return <BarChart3 className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: PerformanceMetric['category']) => {
  switch (category) {
    case 'productivity': return 'text-blue-400 bg-blue-500/20';
    case 'quality': return 'text-green-400 bg-green-500/20';
    case 'efficiency': return 'text-yellow-400 bg-yellow-500/20';
    case 'wellbeing': return 'text-purple-400 bg-purple-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

const getTrendIcon = (trend: PerformanceMetric['trend']) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
    default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
  }
};

const getTrendColor = (trend: PerformanceMetric['trend'], metric: string) => {
  // For stress level, down is good, up is bad
  if (metric.toLowerCase().includes('stress')) {
    return trend === 'down' ? 'text-green-400' : trend === 'up' ? 'text-red-400' : 'text-gray-400';
  }
  // For most other metrics, up is good, down is bad
  return trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
};

export default function TeslaPerformanceTrendAnalysis({
  metrics = mockMetrics,
  trendData = mockTrendData,
  timeRange = '30d',
  className = ''
}: TeslaPerformanceTrendAnalysisProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

  const categories = Array.from(new Set(metrics.map(m => m.category)));
  const overallTrend = metrics.filter(m => m.trend === 'up').length > metrics.filter(m => m.trend === 'down').length ? 'positive' : 'negative';

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Performance Trend Analysis</h3>
            <p className="text-sm text-gray-400">Real-time performance insights and trend analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${overallTrend === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {overallTrend === 'positive' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-white font-semibold">Overall Performance Trend</h4>
              <p className="text-sm text-gray-400">
                {overallTrend === 'positive' ? 'Performance is improving across most metrics' : 'Some metrics need attention'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${overallTrend === 'positive' ? 'text-green-400' : 'text-orange-400'}`}>
              {overallTrend === 'positive' ? '↗️' : '⚠️'}
            </div>
            <div className="text-xs text-gray-400">Trend Direction</div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700/30">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-400">
              {metrics.filter(m => m.trend === 'up').length}
            </div>
            <div className="text-xs text-gray-400">Improving</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400">
              {metrics.filter(m => m.trend === 'down').length}
            </div>
            <div className="text-xs text-gray-400">Declining</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-400">
              {metrics.filter(m => m.trend === 'stable').length}
            </div>
            <div className="text-xs text-gray-400">Stable</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
              selectedCategory === category 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {filteredMetrics.map((metric) => (
          <div key={metric.metric} className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${getCategoryColor(metric.category)}`}>
                  {getCategoryIcon(metric.category)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{metric.metric}</h4>
                  <p className="text-xs text-gray-400 capitalize">{metric.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-semibold ${getTrendColor(metric.trend, metric.metric)}`}>
                  {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {metric.current_value.toFixed(metric.unit === '/5' || metric.unit === '/10' ? 1 : 0)}{metric.unit}
                </div>
                <div className="text-xs text-gray-400">
                  vs {metric.previous_value.toFixed(metric.unit === '/5' || metric.unit === '/10' ? 1 : 0)}{metric.unit} last period
                </div>
              </div>
              <div className="w-12 h-8 bg-gray-700/50 rounded relative overflow-hidden">
                <div 
                  className={`absolute bottom-0 left-0 w-full transition-all duration-500 ${
                    metric.trend === 'up' ? 'bg-green-500/40' : 
                    metric.trend === 'down' ? 'bg-red-500/40' : 'bg-gray-500/40'
                  }`}
                  style={{ height: `${Math.min(Math.abs(metric.change_percentage) * 2, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Visualization */}
      <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-white mb-4">5-Week Performance Trend</h4>
        <div className="space-y-3">
          {trendData.map((week, index) => (
            <div key={week.period} className={`flex items-center justify-between p-3 rounded-lg ${
              index === trendData.length - 1 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-gray-700/20'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <div className="text-sm font-medium text-white">{week.period}</div>
                  <div className="text-xs text-gray-400">{week.tasks_completed} tasks • {week.hours_worked}h</div>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-xs">
                <div className="text-center">
                  <div className="text-white font-semibold">{week.efficiency_score}%</div>
                  <div className="text-gray-400">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{week.quality_score}</div>
                  <div className="text-gray-400">Quality</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${week.stress_level <= 3 ? 'text-green-400' : week.stress_level <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {week.stress_level}
                  </div>
                  <div className="text-gray-400">Stress</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-semibold text-white">AI Performance Insights</h4>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-200">
            📈 <strong>Positive Trend:</strong> Your task completion rate has improved by 6.1% while working 8.7% fewer hours, indicating significant efficiency gains.
          </p>
          <p className="text-sm text-gray-200">
            🎯 <strong>Focus Improvement:</strong> Focus time ratio increased to 73%, correlating with higher quality scores and lower stress levels.
          </p>
          <p className="text-sm text-gray-200">
            ⚡ <strong>Recommendation:</strong> Continue current work patterns. Consider scheduling more focused work blocks during your most productive hours (9-11 AM).
          </p>
        </div>
      </div>
    </div>
  );
}
