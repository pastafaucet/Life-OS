'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Calendar, CheckCircle, Timer, Zap } from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaProgressBar from './TeslaProgressBar';
import { realTimeMetricsAPI, LiveDeadline } from '../../lib/realtime/metrics-api';

interface TeslaLiveDeadlineCountdownProps {
  maxDisplay?: number;
  showProgress?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const TeslaLiveDeadlineCountdown: React.FC<TeslaLiveDeadlineCountdownProps> = ({
  maxDisplay = 5,
  showProgress = true,
  autoRefresh = true,
  refreshInterval = 1000
}) => {
  const [deadlines, setDeadlines] = useState<LiveDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Initial load
    loadDeadlines();

    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
        if (Date.now() % (refreshInterval * 10) === 0) {
          // Reload data every 10 seconds
          loadDeadlines();
        }
      }, refreshInterval);
    }

    // Subscribe to real-time updates
    const unsubscribe = realTimeMetricsAPI.subscribe((data) => {
      if (data.deadlines) {
        setDeadlines(data.deadlines.slice(0, maxDisplay));
      }
    });

    return () => {
      if (interval) clearInterval(interval);
      unsubscribe();
    };
  }, [maxDisplay, autoRefresh, refreshInterval]);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const liveDeadlines = await realTimeMetricsAPI.getLiveDeadlines();
      setDeadlines(liveDeadlines.slice(0, maxDisplay));
    } catch (error) {
      console.error('Failed to load deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (timeRemaining: LiveDeadline['timeRemaining']) => {
    const { days, hours, minutes, seconds, totalMs } = timeRemaining;
    
    if (totalMs < 0) {
      return {
        display: 'OVERDUE',
        color: 'text-red-400',
        urgent: true
      };
    }
    
    if (days > 0) {
      return {
        display: `${days}d ${hours}h ${minutes}m`,
        color: days <= 1 ? 'text-red-400' : days <= 7 ? 'text-yellow-400' : 'text-green-400',
        urgent: days <= 1
      };
    }
    
    if (hours > 0) {
      return {
        display: `${hours}h ${minutes}m ${seconds}s`,
        color: hours <= 2 ? 'text-red-400' : 'text-yellow-400',
        urgent: hours <= 2
      };
    }
    
    return {
      display: `${minutes}m ${seconds}s`,
      color: 'text-red-400',
      urgent: true
    };
  };

  const getStatusColor = (status: LiveDeadline['status']) => {
    switch (status) {
      case 'overdue': return 'error';
      case 'urgent': return 'error';
      case 'warning': return 'warning';
      case 'normal': return 'online';
      default: return 'online';
    }
  };

  const getPriorityIcon = (priority: LiveDeadline['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'medium': return <Timer className="w-4 h-4 text-blue-400" />;
      case 'low': return <Calendar className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <TeslaCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Timer className="w-4 h-4 text-blue-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Deadline Monitor</h3>
            <p className="text-sm text-gray-400">Loading real-time deadlines...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-700/50 rounded-lg"></div>
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
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Deadline Monitor</h3>
            <p className="text-sm text-gray-400">
              Real-time countdown • Updated {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <TeslaButton
          variant="secondary"
          size="sm"
          onClick={loadDeadlines}
          className="flex items-center space-x-1"
        >
          <Timer className="w-3 h-3" />
          <span>Refresh</span>
        </TeslaButton>
      </div>

      {deadlines.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium">No urgent deadlines!</p>
          <p className="text-gray-400 text-sm">All deadlines are under control</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deadlines.map((deadline) => {
            const timeDisplay = formatTimeRemaining(deadline.timeRemaining);
            
            return (
              <div
                key={deadline.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  timeDisplay.urgent
                    ? 'border-red-500/50 bg-red-900/10 shadow-lg shadow-red-500/20'
                    : deadline.status === 'warning'
                    ? 'border-yellow-500/50 bg-yellow-900/10'
                    : 'border-gray-600/50 bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(deadline.priority)}
                      <span className="text-white font-medium truncate">
                        {deadline.title}
                      </span>
                      <TeslaStatusIndicator
                        status={getStatusColor(deadline.status) as any}
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        Due: {deadline.dueDate.toLocaleDateString()}
                      </span>
                      <span className="text-gray-400">
                        {deadline.category}
                      </span>
                      {showProgress && (
                        <span className="text-gray-400">
                          {deadline.progressPercentage}% complete
                        </span>
                      )}
                    </div>
                    
                    {showProgress && (
                      <div className="mt-2">
                        <TeslaProgressBar
                          value={deadline.progressPercentage}
                          color={
                            deadline.progressPercentage >= 80 ? 'green' :
                            deadline.progressPercentage >= 50 ? 'blue' :
                            deadline.progressPercentage >= 25 ? 'orange' : 'red'
                          }
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold font-mono ${timeDisplay.color}`}>
                      {timeDisplay.display}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      {deadline.status === 'overdue' ? 'OVERDUE' : 'REMAINING'}
                    </div>
                  </div>
                </div>

                {timeDisplay.urgent && (
                  <div className="mt-3 pt-3 border-t border-red-500/30">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">
                        URGENT ACTION REQUIRED
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Showing {deadlines.length} most urgent deadlines
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs">LIVE</span>
          </div>
        </div>
      </div>
    </TeslaCard>
  );
};

export default TeslaLiveDeadlineCountdown;
