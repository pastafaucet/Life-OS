'use client';

import React from 'react';
import { 
  useAutomationMonitoring,
  initializeSampleMonitoringData,
  automationMonitoringFramework 
} from '../../lib/automation/automation-monitoring-framework';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaChart from './TeslaChart';
import TeslaStatusIndicator from './TeslaStatusIndicator';

function AutomationDetailView({ automationId }: { automationId: string }) {
  const metrics = automationMonitoringFramework.getMetrics(automationId)[0];
  const recentEvents = automationMonitoringFramework.getRecentEvents(automationId, 10);
  const performanceData = automationMonitoringFramework.getPerformanceData(automationId, 24);

  if (!metrics) {
    return <div className="text-gray-400">No metrics available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <TeslaMetric
          label="Total Executions"
          value={metrics.totalExecutions}
          color="blue"
          icon="🔄"
        />
        <TeslaMetric
          label="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          color={metrics.successRate >= 95 ? "green" : metrics.successRate >= 80 ? "orange" : "red"}
          icon="✅"
        />
        <TeslaMetric
          label="Avg Execution Time"
          value={`${Math.round(metrics.averageExecutionTime / 1000)}s`}
          color="purple"
          icon="⏱️"
        />
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-white">Recent Events</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {recentEvents.slice(-5).map((event) => (
            <div key={event.id} className="text-xs p-2 bg-gray-800/30 rounded">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                event.status === 'success' ? 'bg-green-500' :
                event.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              {event.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeslaAutomationMonitoringDashboard() {
  const { dashboardData, isLoading, refreshData } = useAutomationMonitoring();
  const [selectedAutomation, setSelectedAutomation] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      initializeSampleMonitoringData();
      setIsInitialized(true);
      refreshData();
    }
  }, [isInitialized, refreshData]);

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    if (action === 'acknowledge') {
      automationMonitoringFramework.acknowledgeAlert(alertId);
    } else {
      automationMonitoringFramework.resolveAlert(alertId);
    }
    refreshData();
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'green';
      case 'degraded': return 'orange';
      case 'critical': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🔧 Automation Monitoring</h1>
          <p className="text-gray-300 mt-1">Real-time automation health and performance monitoring</p>
        </div>
        <TeslaButton
          onClick={refreshData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh'}
        </TeslaButton>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TeslaCard>
          <TeslaMetric
            label="Total Automations"
            value={dashboardData.overview.totalAutomations}
            color="blue"
            icon="⚡"
          />
        </TeslaCard>

        <TeslaCard>
          <TeslaMetric
            label="Healthy Systems"
            value={`${dashboardData.overview.healthyAutomations} / ${dashboardData.overview.totalAutomations}`}
            color="green"
            icon="✅"
          />
        </TeslaCard>

        <TeslaCard>
          <TeslaMetric
            label="Active Alerts"
            value={dashboardData.overview.activeAlerts}
            color={dashboardData.overview.activeAlerts > 0 ? "red" : "green"}
            icon="🚨"
          />
        </TeslaCard>

        <TeslaCard>
          <TeslaMetric
            label="Success Rate"
            value={`${dashboardData.overview.averageSuccessRate.toFixed(1)}%`}
            color={dashboardData.overview.averageSuccessRate >= 95 ? "green" : 
                   dashboardData.overview.averageSuccessRate >= 80 ? "orange" : "red"}
            icon="📊"
          />
        </TeslaCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status Panel */}
        <TeslaCard className="h-full">
          <h3 className="text-xl font-bold text-white mb-4">🏥 System Health Status</h3>
          <div className="space-y-4">
            {dashboardData.healthStatus.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🔧</div>
                <p>Initializing health monitoring...</p>
              </div>
            ) : (
              dashboardData.healthStatus.map((status) => (
                <div
                  key={status.automationId}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAutomation(status.automationId)}
                >
                  <div className="flex items-center space-x-3">
                    <TeslaStatusIndicator
                      status={status.health === 'healthy' ? 'online' : 
                             status.health === 'degraded' ? 'warning' : 'offline'}
                    />
                    <div>
                      <h4 className="font-semibold text-white capitalize">
                        {status.automationId.replace(/-/g, ' ')}
                      </h4>
                      <p className="text-sm text-gray-400">Health Score: {status.score}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TeslaGauge
                      value={status.score}
                      max={100}
                      color={getHealthColor(status.health)}
                      size="sm"
                    />
                    <span className={`text-sm font-semibold ${
                      status.health === 'healthy' ? 'text-green-400' :
                      status.health === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {status.health.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TeslaCard>

        {/* Critical Alerts Panel */}
        <TeslaCard className="h-full">
          <h3 className="text-xl font-bold text-white mb-4">🚨 Critical Alerts</h3>
          <div className="space-y-3">
            {dashboardData.topIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p>No critical alerts</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              dashboardData.topIssues.map((alert) => (
                <TeslaAlert
                  key={alert.id}
                  type={alert.severity === 'critical' ? 'error' : 'warning'}
                  title={alert.title}
                >
                  {alert.description}
                </TeslaAlert>
              ))
            )}
          </div>
        </TeslaCard>
      </div>

      {/* Detailed Metrics for Selected Automation */}
      {selectedAutomation && (
        <TeslaCard>
          <h3 className="text-xl font-bold text-white mb-4">📈 Detailed Metrics: {selectedAutomation.replace(/-/g, ' ').toUpperCase()}</h3>
          <AutomationDetailView automationId={selectedAutomation} />
        </TeslaCard>
      )}

      {/* Real-time Activity Log */}
      <TeslaCard>
        <h3 className="text-xl font-bold text-white mb-4">📋 Recent Activity</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {automationMonitoringFramework.getMetrics().slice(0, 10).map((metrics) => {
            const recentEvents = automationMonitoringFramework.getRecentEvents(metrics.automationId, 10);
            return recentEvents.slice(-3).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'success' ? 'bg-green-500' :
                    event.status === 'failure' ? 'bg-red-500' :
                    event.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {metrics.automationName}: {event.message}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.eventType === 'completed' ? 'bg-green-500/20 text-green-400' :
                  event.eventType === 'failed' ? 'bg-red-500/20 text-red-400' :
                  event.eventType === 'started' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {event.eventType}
                </span>
              </div>
            ));
          })}
        </div>
      </TeslaCard>
    </div>
  );
}

export default TeslaAutomationMonitoringDashboard;
