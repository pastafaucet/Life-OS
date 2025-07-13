'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target, BarChart3, Zap } from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaProgressBar from './TeslaProgressBar';
import TeslaMetric from './TeslaMetric';
import { realTimeMetricsAPI, CaseVelocity } from '../../lib/realtime/metrics-api';

interface TeslaCaseVelocityTrackerProps {
  refreshInterval?: number;
  showMilestones?: boolean;
  sortBy?: 'velocity' | 'duration' | 'status' | 'title';
}

export const TeslaCaseVelocityTracker: React.FC<TeslaCaseVelocityTrackerProps> = ({
  refreshInterval = 30000,
  showMilestones = true,
  sortBy = 'velocity'
}) => {
  const [velocityData, setVelocityData] = useState<CaseVelocity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Initial load
    loadVelocityData();

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadVelocityData();
    }, refreshInterval);

    // Subscribe to real-time updates
    const unsubscribe = realTimeMetricsAPI.subscribe((data) => {
      // Velocity data would be included in real-time updates
      loadVelocityData();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshInterval]);

  const loadVelocityData = async () => {
    try {
      const data = await realTimeMetricsAPI.getCaseVelocity();
      const sortedData = sortVelocityData(data);
      setVelocityData(sortedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load velocity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortVelocityData = (data: CaseVelocity[]) => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'velocity':
          return b.velocityRatio - a.velocityRatio; // Higher ratio first (slower cases)
        case 'duration':
          return b.actualDuration - a.actualDuration;
        case 'status':
          const statusOrder = { 'critical': 4, 'behind': 3, 'on-track': 2, 'ahead': 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const getStatusColor = (status: CaseVelocity['status']) => {
    switch (status) {
      case 'ahead': return 'online';
      case 'on-track': return 'processing';
      case 'behind': return 'warning';
      case 'critical': return 'error';
      default: return 'offline';
    }
  };

  const getStatusIcon = (status: CaseVelocity['status']) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'on-track': return <Target className="w-4 h-4 text-blue-400" />;
      case 'behind': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <TrendingDown className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVelocityDescription = (velocity: CaseVelocity) => {
    const ratio = velocity.velocityRatio;
    const percentage = Math.round((ratio - 1) * 100);
    
    if (ratio <= 0.8) {
      return `${Math.abs(percentage)}% faster than expected`;
    } else if (ratio <= 1.2) {
      return `On schedule`;
    } else {
      return `${percentage}% slower than expected`;
    }
  };

  const getOverallStats = () => {
    if (velocityData.length === 0) return null;

    const ahead = velocityData.filter(v => v.status === 'ahead').length;
    const onTrack = velocityData.filter(v => v.status === 'on-track').length;
    const behind = velocityData.filter(v => v.status === 'behind').length;
    const critical = velocityData.filter(v => v.status === 'critical').length;

    const avgVelocity = velocityData.reduce((sum, v) => sum + v.velocityRatio, 0) / velocityData.length;
    const avgMilestones = velocityData.reduce((sum, v) => sum + v.milestones.percentage, 0) / velocityData.length;

    return {
      ahead,
      onTrack,
      behind,
      critical,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      avgMilestones: Math.round(avgMilestones)
    };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <TeslaCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Case Velocity Tracker</h3>
            <p className="text-sm text-gray-400">Loading velocity analysis...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </TeslaCard>
    );
  }

  return (
    <TeslaCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Case Velocity Tracker</h3>
            <p className="text-sm text-gray-400">
              Real-time progress analysis • Updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <TeslaButton
          variant="secondary"
          size="sm"
          onClick={loadVelocityData}
          className="flex items-center space-x-1"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Refresh</span>
        </TeslaButton>
      </div>

      {/* Overall Statistics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <TeslaMetric
            label="Ahead"
            value={stats.ahead}
            trend="up"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <TeslaMetric
            label="On Track"
            value={stats.onTrack}
            trend="neutral"
            icon={<Target className="w-4 h-4" />}
          />
          <TeslaMetric
            label="Behind"
            value={stats.behind}
            trend="down"
            icon={<Clock className="w-4 h-4" />}
          />
          <TeslaMetric
            label="Critical"
            value={stats.critical}
            trend="down"
            icon={<AlertCircle className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Average Performance */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Average Velocity</span>
              <span className={`text-lg font-bold ${
                stats.avgVelocity <= 1.0 ? 'text-green-400' :
                stats.avgVelocity <= 1.2 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.avgVelocity}x
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {stats.avgVelocity <= 1.0 ? 'Cases moving faster than expected' :
               stats.avgVelocity <= 1.2 ? 'Cases on average schedule' : 'Cases taking longer than expected'}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Average Progress</span>
              <span className="text-lg font-bold text-blue-400">{stats.avgMilestones}%</span>
            </div>
            <TeslaProgressBar
              value={stats.avgMilestones}
              color={stats.avgMilestones >= 60 ? 'green' : stats.avgMilestones >= 30 ? 'blue' : 'red'}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Individual Cases */}
      {velocityData.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium">No active cases to track</p>
          <p className="text-gray-400 text-sm">All cases are completed or not yet started</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white mb-3">Case Performance</h4>
          {velocityData.map((velocity) => (
            <div
              key={velocity.caseId}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                velocity.status === 'critical'
                  ? 'border-red-500/50 bg-red-900/10 shadow-lg shadow-red-500/20'
                  : velocity.status === 'behind'
                  ? 'border-yellow-500/50 bg-yellow-900/10'
                  : velocity.status === 'ahead'
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-gray-600/50 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(velocity.status)}
                    <span className="text-white font-medium truncate">
                      {velocity.title}
                    </span>
                    <TeslaStatusIndicator
                      status={getStatusColor(velocity.status)}
                      size="sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Expected Duration</span>
                      <p className="text-white font-medium">{velocity.expectedDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Actual Duration</span>
                      <p className="text-white font-medium">{velocity.actualDuration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Velocity Ratio</span>
                      <p className={`font-bold ${
                        velocity.velocityRatio <= 1.0 ? 'text-green-400' :
                        velocity.velocityRatio <= 1.2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {velocity.velocityRatio.toFixed(2)}x
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status</span>
                      <p className="text-white font-medium capitalize">{velocity.status}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mt-2">
                    {getVelocityDescription(velocity)}
                  </p>
                </div>
              </div>

              {showMilestones && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Milestones Progress ({velocity.milestones.completed}/{velocity.milestones.total})
                    </span>
                    <span className="text-sm font-medium text-white">
                      {velocity.milestones.percentage}%
                    </span>
                  </div>
                  <TeslaProgressBar
                    value={velocity.milestones.percentage}
                    color={
                      velocity.milestones.percentage >= 80 ? 'green' :
                      velocity.milestones.percentage >= 50 ? 'blue' :
                      velocity.milestones.percentage >= 25 ? 'orange' : 'red'
                    }
                    size="sm"
                  />
                </div>
              )}

              {velocity.status === 'critical' && (
                <div className="mt-3 pt-3 border-t border-red-500/30">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">
                      REQUIRES IMMEDIATE ATTENTION - Case significantly behind schedule
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Tracking {velocityData.length} active cases
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-xs">ANALYZING</span>
          </div>
        </div>
      </div>
    </TeslaCard>
  );
};

export default TeslaCaseVelocityTracker;
