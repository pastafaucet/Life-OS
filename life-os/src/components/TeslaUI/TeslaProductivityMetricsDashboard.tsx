'use client';

import { useState, useEffect } from 'react';
import { realTimeMetricsAPI, ProductivityMetrics, WorkloadCapacity, PerformanceTrend } from '../../lib/realtime/metrics-api';
import TeslaCard from './TeslaCard';
import TeslaMetric from './TeslaMetric';
import TeslaChart from './TeslaChart';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';

interface TeslaProductivityMetricsDashboardProps {
  className?: string;
}

export function TeslaProductivityMetricsDashboard({ className = '' }: TeslaProductivityMetricsDashboardProps) {
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [workload, setWorkload] = useState<WorkloadCapacity | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [productivityData, workloadData, trendsData] = await Promise.all([
          realTimeMetricsAPI.getProductivityMetrics(),
          realTimeMetricsAPI.getWorkloadCapacity(),
          realTimeMetricsAPI.getPerformanceTrends()
        ]);
        
        setMetrics(productivityData);
        setWorkload(workloadData);
        setTrends(trendsData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to load productivity metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Subscribe to real-time updates
    const unsubscribe = realTimeMetricsAPI.subscribe((data) => {
      if (data.productivity) setMetrics(data.productivity);
      if (data.workload) setWorkload(data.workload);
      setLastUpdate(new Date());
    });

    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <TeslaCard className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </TeslaCard>
    );
  }

  if (!metrics || !workload) {
    return (
      <TeslaCard className={`p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <p>Unable to load productivity metrics</p>
        </div>
      </TeslaCard>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-400';
    if (efficiency >= 70) return 'text-blue-400';
    if (efficiency >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'underutilized': return 'text-blue-400';
      case 'optimal': return 'text-green-400';
      case 'near-capacity': return 'text-yellow-400';
      case 'overloaded': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-400">↗</span>;
      case 'declining':
        return <span className="text-red-400">↘</span>;
      case 'stable':
        return <span className="text-blue-400">→</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with last update */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Productivity Intelligence</h2>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Today's Performance */}
      <TeslaCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TeslaMetric
            label="Tasks Completed"
            value={metrics.today.tasksCompleted.toString()}
            trend={metrics.today.tasksCompleted > metrics.thisWeek.averageDailyTasks ? 'up' : 'down'}
            className="bg-gray-800"
          />
          <TeslaMetric
            label="Hours Worked"
            value={`${metrics.today.hoursWorked.toFixed(1)}h`}
            className="bg-gray-800"
          />
          <TeslaMetric
            label="Efficiency Score"
            value={`${metrics.today.efficiency}%`}
            className={`bg-gray-800 ${getEfficiencyColor(metrics.today.efficiency)}`}
          />
          <TeslaMetric
            label="Focus Time"
            value={`${Math.floor(metrics.today.focusTime / 60)}h ${metrics.today.focusTime % 60}m`}
            className="bg-gray-800"
          />
        </div>
      </TeslaCard>

      {/* Workload Capacity */}
      <TeslaCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Workload Capacity</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capacity Gauge */}
          <div>
            <TeslaGauge
              value={workload.current}
              max={100}
              label="Current Capacity"
              color={workload.status === 'optimal' ? 'green' : workload.status === 'overloaded' ? 'red' : 'blue'}
            />
            <div className="mt-4 text-center">
              <span className={`text-sm font-medium ${getWorkloadColor(workload.status)}`}>
                {workload.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Workload Breakdown */}
          <div>
            <h4 className="text-md font-medium text-white mb-3">Workload Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Legal Cases</span>
                  <span className="text-blue-400">{workload.breakdown.legal.toFixed(0)}%</span>
                </div>
                <TeslaProgressBar value={workload.breakdown.legal} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Tasks</span>
                  <span className="text-green-400">{workload.breakdown.tasks.toFixed(0)}%</span>
                </div>
                <TeslaProgressBar value={workload.breakdown.tasks} className="h-2" color="green" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">MCLE</span>
                  <span className="text-yellow-400">{workload.breakdown.mcle}%</span>
                </div>
                <TeslaProgressBar value={workload.breakdown.mcle} className="h-2" color="orange" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Administrative</span>
                  <span className="text-purple-400">{workload.breakdown.administrative}%</span>
                </div>
                <TeslaProgressBar value={workload.breakdown.administrative} className="h-2" color="purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {workload.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-2">🎯 Recommendations</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              {workload.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </TeslaCard>

      {/* Performance Trends */}
      <TeslaCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {trends.map((trend, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">{trend.metric}</h4>
                {getTrendIcon(trend.trend)}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {typeof trend.current === 'number' ? trend.current.toFixed(0) : trend.current}
              </div>
              <div className="text-xs text-gray-400 mb-2">{trend.period}</div>
              <div className="flex items-center text-sm">
                <span className={trend.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-2">vs previous</span>
              </div>
            </div>
          ))}
        </div>
      </TeslaCard>

      {/* Weekly Overview Chart */}
      <TeslaCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Efficiency Trend */}
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">Efficiency Trend</h4>
            <TeslaChart
              data={metrics.trends.efficiency.map(item => ({ label: item.date.split('T')[0].slice(-5), value: item.value }))}
              height={120}
            />
          </div>

          {/* Tasks Per Day */}
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">Daily Task Completion</h4>
            <TeslaChart
              data={metrics.trends.tasksPerDay.map(item => ({ label: item.date.split('T')[0].slice(-5), value: item.value }))}
              height={120}
              type="bar"
            />
          </div>

          {/* Focus Time Trend */}
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">Focus Time (minutes)</h4>
            <TeslaChart
              data={metrics.trends.focusTime.map(item => ({ label: item.date.split('T')[0].slice(-5), value: item.value }))}
              height={120}
            />
          </div>
        </div>
      </TeslaCard>

      {/* Weekly Summary */}
      <TeslaCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">This Week's Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TeslaMetric
            label="Total Tasks"
            value={metrics.thisWeek.tasksCompleted.toString()}
            className="bg-gray-800"
          />
          <TeslaMetric
            label="Total Hours"
            value={`${metrics.thisWeek.hoursWorked.toFixed(1)}h`}
            className="bg-gray-800"
          />
          <TeslaMetric
            label="Avg. Efficiency"
            value={`${metrics.thisWeek.efficiency}%`}
            className={`bg-gray-800 ${getEfficiencyColor(metrics.thisWeek.efficiency)}`}
          />
          <TeslaMetric
            label="Daily Average"
            value={`${metrics.thisWeek.averageDailyTasks.toFixed(1)} tasks`}
            className="bg-gray-800"
          />
        </div>
      </TeslaCard>
    </div>
  );
}
