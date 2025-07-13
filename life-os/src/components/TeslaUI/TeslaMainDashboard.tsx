'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOnboarding } from '../../lib/hooks/useOnboarding';
import { 
  Brain, 
  Zap, 
  Target, 
  AlertTriangle, 
  Briefcase, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp,
  Shield,
  Smartphone,
  Settings,
  ChevronRight,
  Activity,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { TeslaCard, TeslaButton, TeslaMetric, TeslaProgressBar, TeslaAlert, TeslaGauge, TeslaStatusIndicator } from './index';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface AIInsight {
  id: string;
  type: 'efficiency' | 'deadline' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export function TeslaMainDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workloadCapacity, setWorkloadCapacity] = useState(73);
  const [systemHealth, setSystemHealth] = useState(98);
  const [showSettings, setShowSettings] = useState(false);
  const { resetOnboarding } = useOnboarding();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && !(event.target as Element).closest('.relative')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const keyMetrics: DashboardMetric[] = [
    {
      id: 'active-cases',
      title: 'Active Cases',
      value: 0,
      change: 'No data',
      changeType: 'neutral',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      value: 0,
      change: 'No data',
      changeType: 'neutral',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green'
    },
    {
      id: 'deadlines-approaching',
      title: 'Deadlines (7 days)',
      value: 0,
      change: 'No data',
      changeType: 'neutral',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'red'
    },
    {
      id: 'mcle-hours',
      title: 'MCLE Progress',
      value: '0/0',
      change: 'No data',
      changeType: 'neutral',
      icon: <Star className="w-5 h-5" />,
      color: 'yellow'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'legal-cases',
      title: 'Legal Cases',
      description: 'View and manage active legal cases',
      icon: <Briefcase className="w-6 h-6" />,
      href: '/legal',
      color: 'blue',
      urgency: 'medium'
    },
    {
      id: 'tasks',
      title: 'Task Management',
      description: 'Organize and track your tasks',
      icon: <CheckCircle className="w-6 h-6" />,
      href: '/tasks',
      color: 'green',
      urgency: 'high'
    },
    {
      id: 'mcle',
      title: 'MCLE Tracking',
      description: 'Monitor continuing education requirements',
      icon: <Star className="w-6 h-6" />,
      href: '/mcle',
      color: 'yellow',
      urgency: 'medium'
    },
    {
      id: 'intelligence',
      title: 'AI Intelligence',
      description: 'Access AI-powered insights and analytics',
      icon: <Brain className="w-6 h-6" />,
      href: '/intelligence',
      color: 'purple',
      urgency: 'low'
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Manage automated processes and workflows',
      icon: <Zap className="w-6 h-6" />,
      href: '/automation',
      color: 'cyan',
      urgency: 'low'
    },
    {
      id: 'mobile',
      title: 'Mobile Command',
      description: 'Mobile-optimized command center',
      icon: <Smartphone className="w-6 h-6" />,
      href: '/mobile',
      color: 'indigo',
      urgency: 'low'
    },
    {
      id: 'emergency',
      title: 'Emergency Center',
      description: 'Crisis management and escalation protocols',
      icon: <Shield className="w-6 h-6" />,
      href: '/emergency',
      color: 'red',
      urgency: 'critical'
    }
  ];

  const aiInsights: AIInsight[] = [];

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'green': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'red': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'cyan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'indigo': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyIndicator = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse';
      case 'high': return 'absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full';
      case 'medium': return 'absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full';
      default: return '';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'deadline': return <Clock className="w-5 h-5 text-red-400" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Life OS Command Center
          </h1>
          <p className="text-gray-400 mb-4 lg:mb-0">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TeslaStatusIndicator status="online" size="sm" />
            <span className="text-sm text-gray-300">System Health: {systemHealth}%</span>
          </div>
          <div className="relative">
            <TeslaButton 
              variant="secondary" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TeslaButton>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-4">Quick Settings</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        resetOnboarding();
                        setShowSettings(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <Brain className="w-4 h-4 mr-3 text-blue-400" />
                      Restart Tour
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <Activity className="w-4 h-4 mr-3 text-green-400" />
                      View System Status
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = '/intelligence';
                        setShowSettings(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-3 text-yellow-400" />
                      AI Configuration
                    </button>
                    <hr className="border-gray-600 my-2" />
                    <div className="text-xs text-gray-500 p-2">
                      Life OS v1.0 - Tesla Edition
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeslaCard className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
            System Overview
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {keyMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-4 rounded-lg border ${getMetricColor(metric.color)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-800">
                    {metric.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400 mb-1">
                  {metric.title}
                </div>
                <div className={`text-xs ${getChangeColor(metric.changeType)}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Workload Capacity</span>
                <span className="text-sm text-white">{workloadCapacity}%</span>
              </div>
              <TeslaProgressBar
                value={workloadCapacity}
                max={100}
                color={workloadCapacity > 80 ? 'red' : workloadCapacity > 60 ? 'orange' : 'green'}
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">AI Intelligence Active</span>
                <span className="text-sm text-green-400">Operational</span>
              </div>
              <TeslaProgressBar
                value={100}
                max={100}
                color="green"
                className="h-2"
              />
            </div>
          </div>
        </TeslaCard>

        <TeslaCard>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3 text-green-400" />
            Today's Focus
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
              <div className="text-gray-400 text-sm">No active priority tasks</div>
              <div className="text-xs text-gray-500 mt-1">Tasks will appear here when created</div>
            </div>
          </div>
        </TeslaCard>
      </div>

      {/* Quick Actions Grid */}
      <TeslaCard>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-yellow-400" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.id} href={action.href}>
              <div className={`relative p-6 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${getMetricColor(action.color)} hover:border-opacity-50`}>
                {action.urgency && <div className={getUrgencyIndicator(action.urgency)}></div>}
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 rounded-lg bg-gray-800">
                    {action.icon}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
                
                <div className="text-white font-semibold mb-2">
                  {action.title}
                </div>
                <div className="text-sm text-gray-400">
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </TeslaCard>

      {/* AI Insights */}
      <TeslaCard>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-3 text-purple-400" />
          AI Intelligence Insights
        </h2>
        
        <div className="space-y-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-gray-700">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                      {insight.actionable && (
                        <TeslaButton size="sm" variant="primary">
                          Act
                        </TeslaButton>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TeslaCard>

      {/* Evolution Progress */}
      <TeslaCard>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-cyan-400" />
          Life OS Evolution Progress
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">From Bicycle to Tesla</h3>
                <p className="text-gray-400 text-sm">AI-powered transformation in progress</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">95%</div>
                <div className="text-sm text-gray-400">Complete</div>
              </div>
            </div>
            
            <TeslaProgressBar
              value={95}
              max={100}
              color="blue"
              className="h-3 mb-4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Phase 1: Intelligence</span>
                </div>
                <div className="text-sm text-gray-300">AI brain integration complete</div>
              </div>
              
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">Phase 2: Automation</span>
                </div>
                <div className="text-sm text-gray-300">Workflow orchestration active</div>
              </div>
              
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="font-semibold text-cyan-400">Phase 3: Real-Time</span>
                </div>
                <div className="text-sm text-gray-300">Final polish in progress</div>
              </div>
            </div>
          </div>
        </div>
      </TeslaCard>
    </div>
  );
}
