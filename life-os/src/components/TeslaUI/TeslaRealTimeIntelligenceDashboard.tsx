'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, Database, Globe, HardDrive, Network, RefreshCw, Server, Wifi, Zap, XCircle, TrendingUp, TrendingDown, Minus, Eye, EyeOff, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { useRealTimeMetric } from '../../lib/realtime/real-time-metrics-api';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'alerts' | 'status' | 'gauge';
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  position: { x: number; y: number };
}

interface TeslaRealTimeIntelligenceDashboardProps {
  className?: string;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'system-health', title: 'System Health', type: 'status', size: 'medium', visible: true, position: { x: 0, y: 0 } },
  { id: 'workload-metrics', title: 'Workload Analysis', type: 'gauge', size: 'medium', visible: true, position: { x: 1, y: 0 } },
  { id: 'deadline-overview', title: 'Deadline Overview', type: 'metric', size: 'small', visible: true, position: { x: 2, y: 0 } },
  { id: 'productivity-trend', title: 'Productivity Trend', type: 'chart', size: 'large', visible: true, position: { x: 0, y: 1 } },
  { id: 'case-metrics', title: 'Case Metrics', type: 'metric', size: 'medium', visible: true, position: { x: 2, y: 1 } },
  { id: 'active-alerts', title: 'Active Alerts', type: 'alerts', size: 'large', visible: true, position: { x: 0, y: 2 } }
];

export default function TeslaRealTimeIntelligenceDashboard({ className = '' }: TeslaRealTimeIntelligenceDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real-time data hooks
  const { data: systemHealth, loading: systemLoading } = useRealTimeMetric('system_health');
  const { data: workloadData, loading: workloadLoading } = useRealTimeMetric('workload');
  const { data: deadlineData, loading: deadlineLoading } = useRealTimeMetric('deadlines');
  const { data: productivityData, loading: productivityLoading } = useRealTimeMetric('productivity');
  const { data: caseData, loading: caseLoading } = useRealTimeMetric('cases');
  const { data: alertData, loading: alertLoading } = useRealTimeMetric('alerts');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold * 1.1) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (value < threshold * 0.9) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    ));
  };

  // System Health Widget
  const SystemHealthWidget = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Server className="w-5 h-5 mr-2 text-blue-400" />
          System Health
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(systemHealth?.status || 'unknown')}`}>
          {getStatusIcon(systemHealth?.status || 'unknown')}
          <span className="ml-1">{systemHealth?.status?.toUpperCase() || 'UNKNOWN'}</span>
        </div>
      </div>
      
      {systemLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Cpu className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-gray-300">CPU: {systemHealth?.cpu_usage}%</span>
            </div>
            <div className="flex items-center text-sm">
              <HardDrive className="w-4 h-4 mr-2 text-orange-400" />
              <span className="text-gray-300">Memory: {systemHealth?.memory_usage}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-gray-300">Uptime: {formatUptime(systemHealth?.uptime || 0)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Activity className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-gray-300">Processes: {systemHealth?.active_processes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Workload Gauge Widget
  const WorkloadGaugeWidget = () => {
    const utilization = workloadData?.utilization_percent || 0;
    const getUtilizationColor = (percent: number) => {
      if (percent > 120) return 'text-red-400';
      if (percent > 90) return 'text-orange-400';
      if (percent > 70) return 'text-yellow-400';
      return 'text-green-400';
    };

    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-400" />
            Workload Analysis
          </h3>
          <div className={`text-2xl font-bold ${getUtilizationColor(utilization)}`}>
            {utilization}%
          </div>
        </div>
        
        {workloadLoading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Circular progress */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgb(55, 65, 81)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(utilization * 3.14, 314)} 314`}
                  className={getUtilizationColor(utilization)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getUtilizationColor(utilization)}`}>
                  {utilization}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="text-gray-400">Active Tasks</div>
                <div className="text-white font-semibold">{workloadData?.active_tasks}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Completed Today</div>
                <div className="text-white font-semibold">{workloadData?.today_completed}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Deadline Overview Widget
  const DeadlineOverviewWidget = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-red-400" />
          Deadlines
        </h3>
      </div>
      
      {deadlineLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Next 24h</span>
            <span className="text-lg font-bold text-red-400">{deadlineData?.upcoming_24h}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Next 7d</span>
            <span className="text-lg font-bold text-orange-400">{deadlineData?.upcoming_7d}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Overdue</span>
            <span className="text-lg font-bold text-red-400">{deadlineData?.overdue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Completion Rate</span>
            <span className="text-lg font-bold text-green-400">{deadlineData?.completion_rate}%</span>
          </div>
        </div>
      )}
    </div>
  );

  // Case Metrics Widget
  const CaseMetricsWidget = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Database className="w-5 h-5 mr-2 text-indigo-400" />
          Case Metrics
        </h3>
      </div>
      
      {caseLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Active Cases</span>
            <span className="text-lg font-bold text-blue-400">{caseData?.active_cases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">New This Week</span>
            <span className="text-lg font-bold text-green-400">{caseData?.new_this_week}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Client Satisfaction</span>
            <span className="text-lg font-bold text-purple-400">{caseData?.client_satisfaction}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Billable Hours Today</span>
            <span className="text-lg font-bold text-yellow-400">{caseData?.billable_hours_today}h</span>
          </div>
        </div>
      )}
    </div>
  );

  // Active Alerts Widget
  const ActiveAlertsWidget = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
          Active Alerts
        </h3>
        <div className="text-sm text-gray-400">
          {alertData?.length || 0} alerts
        </div>
      </div>
      
      {alertLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alertData && alertData.length > 0 ? (
            alertData.slice(0, 5).map((alert: any, index: number) => (
              <div key={index} className={`p-3 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{alert.message}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>All systems operational</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''} ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 p-6 mb-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Real-Time Intelligence Command Center</h1>
              <p className="text-blue-200">Live system monitoring and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-300">Live</span>
            </div>
            
            {/* Last Update */}
            <div className="text-sm text-gray-400">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Customize Dashboard"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dashboard Customization</h3>
          <div className="grid grid-cols-3 gap-4">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-white">{widget.title}</span>
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`p-1 rounded ${widget.visible ? 'text-green-400' : 'text-gray-500'}`}
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* System Health */}
        {widgets.find(w => w.id === 'system-health')?.visible && <SystemHealthWidget />}
        
        {/* Workload Gauge */}
        {widgets.find(w => w.id === 'workload-metrics')?.visible && <WorkloadGaugeWidget />}
        
        {/* Deadline Overview */}
        {widgets.find(w => w.id === 'deadline-overview')?.visible && <DeadlineOverviewWidget />}
        
        {/* Case Metrics */}
        {widgets.find(w => w.id === 'case-metrics')?.visible && <CaseMetricsWidget />}
        
        {/* Active Alerts - Full Width */}
        {widgets.find(w => w.id === 'active-alerts')?.visible && <ActiveAlertsWidget />}
      </div>

      {/* Productivity Trend Chart */}
      {widgets.find(w => w.id === 'productivity-trend')?.visible && (
        <div className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Productivity Trend Analysis
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                Focus Time: {productivityData?.focus_time_today}h
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                Tasks Completed: {productivityData?.tasks_completed}
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
                Quality Score: {productivityData?.quality_score}%
              </div>
            </div>
          </div>
          
          {productivityLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between space-x-2">
              {/* Simple bar chart simulation */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {i}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Auto-refresh: {refreshInterval}s</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Real-time monitoring active</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            Life OS Intelligence v2.0 | Last sync: {lastUpdate.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
