'use client';

import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';

interface WorkloadMetric {
  period: string;
  scheduled_hours: number;
  optimal_hours: number;
  capacity_percentage: number;
  stress_level: 'low' | 'moderate' | 'high' | 'critical';
  task_count: number;
  meeting_count: number;
  deadline_count: number;
}

interface TeslaWorkloadCapacityProps {
  weeklyData?: WorkloadMetric[];
  currentCapacity?: number;
  optimalCapacity?: number;
  className?: string;
}

const mockWeeklyData: WorkloadMetric[] = [
  {
    period: 'This Week',
    scheduled_hours: 42,
    optimal_hours: 40,
    capacity_percentage: 105,
    stress_level: 'moderate',
    task_count: 28,
    meeting_count: 12,
    deadline_count: 3
  },
  {
    period: 'Next Week',
    scheduled_hours: 51,
    optimal_hours: 40,
    capacity_percentage: 127,
    stress_level: 'high',
    task_count: 35,
    meeting_count: 18,
    deadline_count: 5
  },
  {
    period: 'Week +2',
    scheduled_hours: 38,
    optimal_hours: 40,
    capacity_percentage: 95,
    stress_level: 'low',
    task_count: 22,
    meeting_count: 8,
    deadline_count: 2
  },
  {
    period: 'Week +3',
    scheduled_hours: 44,
    optimal_hours: 40,
    capacity_percentage: 110,
    stress_level: 'moderate',
    task_count: 31,
    meeting_count: 14,
    deadline_count: 4
  }
];

const getStressColor = (stressLevel: WorkloadMetric['stress_level']) => {
  switch (stressLevel) {
    case 'low':
      return 'text-green-400 bg-green-500/20';
    case 'moderate':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'high':
      return 'text-orange-400 bg-orange-500/20';
    case 'critical':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};

const getCapacityColor = (percentage: number) => {
  if (percentage <= 85) return 'bg-green-500';
  if (percentage <= 100) return 'bg-yellow-500';
  if (percentage <= 120) return 'bg-orange-500';
  return 'bg-red-500';
};

const getStressIcon = (stressLevel: WorkloadMetric['stress_level']) => {
  switch (stressLevel) {
    case 'low':
      return <CheckCircle className="w-4 h-4" />;
    case 'moderate':
      return <Clock className="w-4 h-4" />;
    case 'high':
      return <AlertTriangle className="w-4 h-4" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

export default function TeslaWorkloadCapacity({ 
  weeklyData = mockWeeklyData,
  currentCapacity = 105,
  optimalCapacity = 100,
  className = '' 
}: TeslaWorkloadCapacityProps) {
  const averageCapacity = weeklyData.reduce((sum, week) => sum + week.capacity_percentage, 0) / weeklyData.length;
  const criticalWeeks = weeklyData.filter(week => week.capacity_percentage > 120).length;
  const currentWeek = weeklyData[0];

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Workload Capacity</h3>
            <p className="text-sm text-gray-400">Real-time capacity monitoring and alerts</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${currentCapacity > 100 ? 'text-orange-400' : 'text-green-400'}`}>
            {currentCapacity}%
          </div>
          <div className="text-xs text-gray-400">Current Capacity</div>
        </div>
      </div>

      {/* Current Week Highlight */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${getStressColor(currentWeek.stress_level)}`}>
              {getStressIcon(currentWeek.stress_level)}
            </div>
            <div>
              <h4 className="text-white font-semibold">{currentWeek.period}</h4>
              <p className="text-sm text-gray-400">
                {currentWeek.scheduled_hours}h scheduled / {currentWeek.optimal_hours}h optimal
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${currentWeek.capacity_percentage > 100 ? 'text-orange-400' : 'text-green-400'}`}>
              {currentWeek.capacity_percentage}%
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {currentWeek.stress_level} stress
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capacity Usage</span>
            <span>{currentWeek.scheduled_hours} / {currentWeek.optimal_hours} hours</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getCapacityColor(currentWeek.capacity_percentage)}`}
              style={{ width: `${Math.min(currentWeek.capacity_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{currentWeek.task_count}</div>
            <div className="text-xs text-gray-400">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">{currentWeek.meeting_count}</div>
            <div className="text-xs text-gray-400">Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400">{currentWeek.deadline_count}</div>
            <div className="text-xs text-gray-400">Deadlines</div>
          </div>
        </div>
      </div>

      {/* Weekly Forecast */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">4-Week Capacity Forecast</h4>
        <div className="space-y-3">
          {weeklyData.map((week, index) => (
            <div key={week.period} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-gray-800/30'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getCapacityColor(week.capacity_percentage)}`} />
                <div>
                  <div className="text-sm font-medium text-white">{week.period}</div>
                  <div className="text-xs text-gray-400">{week.scheduled_hours}h scheduled</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-2 py-1 rounded text-xs ${getStressColor(week.stress_level)}`}>
                  {week.stress_level}
                </div>
                <div className="text-sm font-semibold text-white">
                  {week.capacity_percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {currentCapacity > 100 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Capacity Alert</span>
          </div>
          <p className="text-sm text-gray-200">
            You're operating above optimal capacity. Consider rescheduling non-urgent tasks or delegating work to maintain quality and prevent burnout.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="pt-4 border-t border-gray-700/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-lg font-semibold ${averageCapacity > 100 ? 'text-orange-400' : 'text-green-400'}`}>
              {Math.round(averageCapacity)}%
            </div>
            <div className="text-xs text-gray-400">Avg Capacity</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${criticalWeeks > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {criticalWeeks}
            </div>
            <div className="text-xs text-gray-400">Critical Weeks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">
              {weeklyData.reduce((sum, week) => sum + week.task_count, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
