'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Zap,
  Activity,
  Timer,
  Calendar,
  Gauge
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaStatusIndicator from './TeslaStatusIndicator';

interface DeadlineCountdown {
  id: string;
  title: string;
  deadline: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  estimatedHours?: number;
  completionPercentage?: number;
}

interface RealTimeMetrics {
  caseVelocity: number;
  taskCompletionRate: number;
  productivityScore: number;
  workloadCapacity: number;
  focusTimeToday: number;
  deadlineCompliance: number;
}

interface TeslaRealTimeIntelligenceProps {
  deadlines?: DeadlineCountdown[];
  metrics?: RealTimeMetrics;
  className?: string;
}

export const TeslaRealTimeIntelligence: React.FC<TeslaRealTimeIntelligenceProps> = ({
  deadlines = [],
  metrics = {
    caseVelocity: 4.2,
    taskCompletionRate: 87,
    productivityScore: 92,
    workloadCapacity: 78,
    focusTimeToday: 6.5,
    deadlineCompliance: 100
  },
  className = ""
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveMetrics, setLiveMetrics] = useState(metrics);

  // Update time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate live metrics updates every 30 seconds
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        caseVelocity: prev.caseVelocity + (Math.random() - 0.5) * 0.2,
        taskCompletionRate: Math.max(0, Math.min(100, prev.taskCompletionRate + (Math.random() - 0.5) * 2)),
        productivityScore: Math.max(0, Math.min(100, prev.productivityScore + (Math.random() - 0.5) * 2)),
        workloadCapacity: Math.max(0, Math.min(100, prev.workloadCapacity + (Math.random() - 0.5) * 5)),
        focusTimeToday: Math.max(0, prev.focusTimeToday + (Math.random() - 0.5) * 0.1)
      }));
    }, 30000);

    return () => clearInterval(metricsTimer);
  }, []);

  const formatTimeRemaining = (deadline: Date): { 
    text: string; 
    urgency: 'critical' | 'warning' | 'normal'; 
    isOverdue: boolean 
  } => {
    const now = currentTime.getTime();
    const deadlineTime = deadline.getTime();
    const diff = deadlineTime - now;
    
    if (diff < 0) {
      const overdue = Math.abs(diff);
      const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
      const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return {
        text: `${days}d ${hours}h overdue`,
        urgency: 'critical',
        isOverdue: true
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days === 0 && hours < 24) {
      if (hours < 2) {
        return {
          text: `${hours}h ${minutes}m`,
          urgency: 'critical',
          isOverdue: false
        };
      }
      return {
        text: `${hours}h ${minutes}m`,
        urgency: 'warning',
        isOverdue: false
      };
    }

    if (days < 7) {
      return {
        text: `${days}d ${hours}h`,
        urgency: days < 2 ? 'warning' : 'normal',
        isOverdue: false
      };
    }

    return {
      text: `${days} days`,
      urgency: 'normal',
      isOverdue: false
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getUrgencyStyle = (urgency: 'critical' | 'warning' | 'normal', isOverdue: boolean) => {
    if (isOverdue) {
      return 'text-red-400 bg-red-900/30 animate-pulse';
    }
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-900/30 animate-pulse';
      case 'warning': return 'text-orange-400 bg-orange-900/30';
      case 'normal': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  // Mock deadlines for demonstration
  const mockDeadlines: DeadlineCountdown[] = deadlines.length > 0 ? deadlines : [
    {
      id: '1',
      title: 'Motion Response - Johnson v. State',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      priority: 'critical',
      category: 'Court Filing',
      estimatedHours: 6,
      completionPercentage: 40
    },
    {
      id: '2',
      title: 'Discovery Responses - ABC Corp',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      priority: 'high',
      category: 'Discovery',
      estimatedHours: 4,
      completionPercentage: 75
    },
    {
      id: '3',
      title: 'Client Meeting Prep - Smith Case',
      deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      priority: 'medium',
      category: 'Client Work',
      estimatedHours: 2,
      completionPercentage: 90
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real-Time Intelligence Header */}
      <TeslaCard gradient="purple" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-purple-300 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Real-Time Intelligence</h2>
            </div>
            <TeslaStatusIndicator status="online" size="sm" />
          </div>
          <div className="text-right">
            <div className="text-lg font-mono text-purple-200">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-purple-300">
              Live Updates Active
            </div>
          </div>
        </div>
        
        <div className="text-purple-200 text-sm">
          Command center with live deadline tracking, case velocity monitoring, and predictive analytics
        </div>
      </TeslaCard>

      {/* Live Deadline Countdown Timers */}
      <TeslaCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Timer className="w-5 h-5 mr-2 text-red-400" />
            🚨 Live Deadline Countdown
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Real-time tracking</span>
          </div>
        </div>

        <div className="space-y-4">
          {mockDeadlines.map((deadline) => {
            const timeRemaining = formatTimeRemaining(deadline.deadline);
            return (
              <div
                key={deadline.id}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  timeRemaining.isOverdue 
                    ? 'border-red-500 bg-red-900/20' 
                    : timeRemaining.urgency === 'critical'
                    ? 'border-red-400 bg-red-900/10'
                    : timeRemaining.urgency === 'warning'
                    ? 'border-orange-400 bg-orange-900/10'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{deadline.title}</h4>
                    <p className="text-sm text-gray-400">{deadline.category}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-mono px-3 py-1 rounded-full ${getUrgencyStyle(timeRemaining.urgency, timeRemaining.isOverdue)}`}>
                      {timeRemaining.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {deadline.deadline.toLocaleDateString()} {deadline.deadline.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{deadline.estimatedHours}h estimated</span>
                    </div>
                    {deadline.completionPercentage && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{deadline.completionPercentage}% complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(deadline.priority) === 'red' ? 'bg-red-400' : getPriorityColor(deadline.priority) === 'orange' ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                    <span className="text-sm text-gray-400 capitalize">{deadline.priority} Priority</span>
                  </div>
                </div>

                {deadline.completionPercentage && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{deadline.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          deadline.completionPercentage >= 80 ? 'bg-green-400' :
                          deadline.completionPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${deadline.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </TeslaCard>

      {/* Live Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TeslaCard className="p-4">
          <TeslaMetric
            label="Case Velocity"
            value={`${liveMetrics.caseVelocity.toFixed(1)}/day`}
            color="blue"
            size="md"
            trend="up"
            trendValue="+12%"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <div className="mt-2 text-xs text-gray-400">
            Live tracking • Updates every 30s
          </div>
        </TeslaCard>

        <TeslaCard className="p-4">
          <TeslaGauge
            value={liveMetrics.taskCompletionRate}
            max={100}
            label="Task Completion Rate"
            color="green"
            size="md"
            showValue={true}
            unit="%"
          />
          <div className="mt-2 text-xs text-gray-400">
            Real-time completion tracking
          </div>
        </TeslaCard>

        <TeslaCard className="p-4">
          <TeslaMetric
            label="Productivity Score"
            value={`${Math.round(liveMetrics.productivityScore)}`}
            color="purple"
            size="md"
            trend={liveMetrics.productivityScore > 90 ? 'up' : 'down'}
            trendValue={liveMetrics.productivityScore > 90 ? '+5%' : '-2%'}
            icon={<Brain className="w-5 h-5" />}
          />
          <div className="mt-2 text-xs text-gray-400">
            AI-calculated efficiency score
          </div>
        </TeslaCard>

        <TeslaCard className="p-4">
          <TeslaGauge
            value={liveMetrics.workloadCapacity}
            max={100}
            label="Workload Capacity"
            color={liveMetrics.workloadCapacity > 90 ? "red" : liveMetrics.workloadCapacity > 75 ? "orange" : "blue"}
            size="md"
            showValue={true}
            unit="%"
          />
          <div className="mt-2 text-xs text-gray-400">
            Current capacity utilization
          </div>
        </TeslaCard>

        <TeslaCard className="p-4">
          <TeslaMetric
            label="Focus Time Today"
            value={`${liveMetrics.focusTimeToday.toFixed(1)}h`}
            color="orange"
            size="md"
            trend="up"
            trendValue="+0.5h"
            icon={<Zap className="w-5 h-5" />}
          />
          <div className="mt-2 text-xs text-gray-400">
            Deep work time tracking
          </div>
        </TeslaCard>

        <TeslaCard className="p-4">
          <TeslaMetric
            label="Deadline Compliance"
            value={`${liveMetrics.deadlineCompliance}%`}
            color={liveMetrics.deadlineCompliance === 100 ? "green" : "red"}
            size="md"
            trend={liveMetrics.deadlineCompliance === 100 ? "up" : "down"}
            trendValue={liveMetrics.deadlineCompliance === 100 ? "Perfect" : "-5%"}
            icon={<Target className="w-5 h-5" />}
          />
          <div className="mt-2 text-xs text-gray-400">
            On-time delivery rate
          </div>
        </TeslaCard>
      </div>

      {/* Predictive Insights & Alerts */}
      <TeslaCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          🔮 Predictive Insights & Risk Assessment
        </h3>
        
        <div className="space-y-3">
          <TeslaAlert
            type="warning"
            title="Deadline Risk Detected"
          >
            Motion Response - Johnson v. State is likely to miss deadline based on current pace. Recommend blocking 4h tomorrow morning.
          </TeslaAlert>
          
          <TeslaAlert
            type="info"
            title="Productivity Optimization"
          >
            You typically complete 40% more tasks between 9-11 AM. Consider scheduling complex work during this window.
          </TeslaAlert>
          
          <TeslaAlert
            type="success"
            title="Workflow Efficiency"
          >
            Discovery Responses - ABC Corp is 25% ahead of similar case timelines. You're on track for early completion.
          </TeslaAlert>
        </div>
      </TeslaCard>

      {/* Quick Actions */}
      <TeslaCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">⚡ Real-Time Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TeslaButton variant="primary" size="sm" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Block Focus Time
          </TeslaButton>
          <TeslaButton variant="secondary" size="sm" className="w-full">
            <Timer className="w-4 h-4 mr-2" />
            Start Timer
          </TeslaButton>
          <TeslaButton variant="secondary" size="sm" className="w-full">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Create Alert
          </TeslaButton>
          <TeslaButton variant="secondary" size="sm" className="w-full">
            <Gauge className="w-4 h-4 mr-2" />
            View Analytics
          </TeslaButton>
        </div>
      </TeslaCard>
    </div>
  );
};

export default TeslaRealTimeIntelligence;
