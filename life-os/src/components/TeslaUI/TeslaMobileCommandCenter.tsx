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
  Gauge,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import { mobileCommandCenter, useMobileCommandCenter } from '../../lib/api/mobile-command-center-api';

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

interface TeslaMobileCommandCenterProps {
  deadlines?: DeadlineCountdown[];
  metrics?: RealTimeMetrics;
  className?: string;
}

export const TeslaMobileCommandCenter: React.FC<TeslaMobileCommandCenterProps> = ({
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
  const [expandedSections, setExpandedSections] = useState({
    deadlines: true,
    metrics: false,
    insights: false,
    actions: false
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Use Mobile Command Center API
  const {
    isOnline,
    pendingActions,
    locationContext,
    triggerEmergency,
    processVoiceCommand,
    updateLocation,
    queueOfflineAction,
    getDashboardData
  } = useMobileCommandCenter();

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} ${className}`}>
      <div className={`${isFullscreen ? 'h-screen overflow-y-auto' : ''} bg-gray-900 text-white`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Activity className="w-5 h-5 text-purple-300 animate-pulse" />
              <h1 className="text-lg font-bold">Command Center</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <TeslaStatusIndicator status="online" size="sm" />
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-200">Tasks</div>
              <div className="text-sm font-bold text-white">{mockDeadlines.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-200">Capacity</div>
              <div className="text-sm font-bold text-white">{liveMetrics.workloadCapacity}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-purple-200">Focus</div>
              <div className="text-sm font-bold text-white">{liveMetrics.focusTimeToday.toFixed(1)}h</div>
            </div>
          </div>
          
          {/* Live Time */}
          <div className="mt-2 text-center">
            <div className="text-sm font-mono text-purple-200">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMenuOpen(false)}>
            <div className="bg-gray-800 w-64 h-full p-4 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="space-y-2">
                <button className="w-full p-3 text-left rounded-lg bg-blue-600 hover:bg-blue-700 transition">
                  📊 Dashboard
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  📋 Tasks
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  ⚖️ Legal Cases
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  🔔 Notifications
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Critical Deadlines Section */}
          <TeslaCard className="overflow-hidden">
            <button 
              onClick={() => toggleSection('deadlines')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-red-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">🚨 Critical Deadlines</h2>
                  <p className="text-sm text-gray-400">{mockDeadlines.length} active deadlines</p>
                </div>
              </div>
              {expandedSections.deadlines ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.deadlines && (
              <div className="px-4 pb-4 space-y-3">
                {mockDeadlines.map((deadline) => {
                  const timeRemaining = formatTimeRemaining(deadline.deadline);
                  return (
                    <div
                      key={deadline.id}
                      className={`border rounded-lg p-3 transition-all duration-300 ${
                        timeRemaining.isOverdue 
                          ? 'border-red-500 bg-red-900/20' 
                          : timeRemaining.urgency === 'critical'
                          ? 'border-red-400 bg-red-900/10'
                          : timeRemaining.urgency === 'warning'
                          ? 'border-orange-400 bg-orange-900/10'
                          : 'border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{deadline.title}</h3>
                          <p className="text-xs text-gray-400">{deadline.category}</p>
                        </div>
                        <div className="text-right ml-2">
                          <div className={`text-sm font-mono px-2 py-1 rounded-full ${getUrgencyStyle(timeRemaining.urgency, timeRemaining.isOverdue)}`}>
                            {timeRemaining.text}
                          </div>
                        </div>
                      </div>

                      {deadline.completionPercentage && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{deadline.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                deadline.completionPercentage >= 80 ? 'bg-green-400' :
                                deadline.completionPercentage >= 50 ? 'bg-orange-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${deadline.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition">
                          🎯 Start
                        </button>
                        <button className="flex-1 bg-green-600 px-3 py-1.5 rounded text-xs hover:bg-green-700 transition">
                          📅 Schedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TeslaCard>

          {/* Live Metrics Section */}
          <TeslaCard className="overflow-hidden">
            <button 
              onClick={() => toggleSection('metrics')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">📊 Live Metrics</h2>
                  <p className="text-sm text-gray-400">Real-time performance data</p>
                </div>
              </div>
              {expandedSections.metrics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.metrics && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-900/30 rounded-lg p-3">
                    <div className="text-blue-400 text-xs">Velocity</div>
                    <div className="text-blue-300 font-bold">{liveMetrics.caseVelocity.toFixed(1)}/day</div>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-3">
                    <div className="text-green-400 text-xs">Completion</div>
                    <div className="text-green-300 font-bold">{Math.round(liveMetrics.taskCompletionRate)}%</div>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-3">
                    <div className="text-purple-400 text-xs">Productivity</div>
                    <div className="text-purple-300 font-bold">{Math.round(liveMetrics.productivityScore)}</div>
                  </div>
                  <div className="bg-orange-900/30 rounded-lg p-3">
                    <div className="text-orange-400 text-xs">Focus Time</div>
                    <div className="text-orange-300 font-bold">{liveMetrics.focusTimeToday.toFixed(1)}h</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">Workload Capacity</span>
                      <span className="text-white font-bold">{liveMetrics.workloadCapacity}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          liveMetrics.workloadCapacity > 90 ? 'bg-red-400' :
                          liveMetrics.workloadCapacity > 75 ? 'bg-orange-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${liveMetrics.workloadCapacity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TeslaCard>

          {/* AI Insights Section */}
          <TeslaCard className="overflow-hidden">
            <button 
              onClick={() => toggleSection('insights')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">🔮 AI Insights</h2>
                  <p className="text-sm text-gray-400">Predictive analysis & alerts</p>
                </div>
              </div>
              {expandedSections.insights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.insights && (
              <div className="px-4 pb-4 space-y-3">
                <TeslaAlert type="warning" title="Deadline Risk">
                  Motion Response likely to miss deadline. Recommend 4h focus block tomorrow.
                </TeslaAlert>
                
                <TeslaAlert type="info" title="Peak Performance">
                  You complete 40% more tasks 9-11 AM. Schedule complex work then.
                </TeslaAlert>
                
                <TeslaAlert type="success" title="Ahead of Schedule">
                  Discovery Responses 25% ahead of timeline. Early completion likely.
                </TeslaAlert>
              </div>
            )}
          </TeslaCard>

          {/* Quick Actions Section */}
          <TeslaCard className="overflow-hidden">
            <button 
              onClick={() => toggleSection('actions')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">⚡ Quick Actions</h2>
                  <p className="text-sm text-gray-400">Instant access controls</p>
                </div>
              </div>
              {expandedSections.actions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.actions && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <TeslaButton variant="primary" size="sm" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Block Time
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm" className="w-full">
                    <Timer className="w-4 h-4 mr-2" />
                    Start Timer
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Alert
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </TeslaButton>
                </div>
              </div>
            )}
          </TeslaCard>

          {/* Bottom Padding for mobile scrolling */}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
};

export default TeslaMobileCommandCenter;
