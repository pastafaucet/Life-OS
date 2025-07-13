'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaMetric from './TeslaMetric';
import TeslaProgressBar from './TeslaProgressBar';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaChart from './TeslaChart';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import { useAutomationEngine } from '../../lib/api/automation-engine-api';

export function TeslaAutomationMonitoring() {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  
  const {
    rules,
    executions,
    stats,
    templates,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    pauseRule,
    resumeRule,
    executeRule,
    refreshData
  } = useAutomationEngine();

  // Mock performance data for chart - can be replaced with real analytics later
  const [performanceData] = useState([
    { label: 'Mon', value: stats?.successful_executions_today || 45 },
    { label: 'Tue', value: 52 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 41 },
    { label: 'Fri', value: 56 },
    { label: 'Sat', value: 23 },
    { label: 'Sun', value: 18 }
  ]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const getTriggerTypeIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'email_received': return '📧';
      case 'calendar_event': return '📅';
      case 'deadline_approaching': return '⏰';
      case 'task_created': return '📝';
      case 'case_status_change': return '⚖️';
      case 'time_based': return '🕐';
      default: return '⚙️';
    }
  };

  const handleRuleAction = async (ruleId: string, action: 'pause' | 'resume' | 'delete' | 'execute') => {
    try {
      switch (action) {
        case 'pause':
          await pauseRule(ruleId);
          break;
        case 'resume':
          await resumeRule(ruleId);
          break;
        case 'delete':
          await deleteRule(ruleId);
          break;
        case 'execute':
          await executeRule(ruleId);
          break;
      }
      await refreshData();
    } catch (error) {
      console.error(`Failed to ${action} rule:`, error);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading && !rules.length) {
    return (
      <div className="space-y-6">
        <TeslaCard className="p-8 text-center">
          <div className="text-blue-400 mb-2 text-2xl">⚡</div>
          <div className="text-white">Loading automation data...</div>
        </TeslaCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TeslaAlert type="error">
          <div className="text-white font-semibold">Connection Error</div>
          <div className="text-gray-300">{error}</div>
        </TeslaAlert>
        <div className="text-center">
          <TeslaButton onClick={refreshData} variant="primary">
            Retry
          </TeslaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Automation Monitoring</h2>
          <p className="text-gray-400">Manage and monitor automated workflows</p>
        </div>
        <div className="flex items-center space-x-4">
          <TeslaStatusIndicator 
            status={stats && stats.active_rules > 0 ? 'online' : 'warning'} 
            label={stats ? `${stats.active_rules} Active Rules` : 'Loading'}
          />
          <TeslaButton
            onClick={() => setShowCreateRule(true)}
            variant="primary"
          >
            Create Rule
          </TeslaButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeslaMetric
          label="Success Rate"
          value={stats ? `${Math.round((stats.successful_executions_today / Math.max(stats.total_executions_today, 1)) * 100)}%` : '--'}
          trend="up"
          icon="✅"
          color="green"
        />
        <TeslaMetric
          label="Avg Processing"
          value={stats ? `${Math.round(stats.average_execution_time_ms / 1000)}s` : '--'}
          trend="down"
          icon="⚡"
          color="blue"
        />
        <TeslaMetric
          label="Active Rules"
          value={stats?.active_rules.toString() || '--'}
          icon="🔄"
          color="orange"
        />
        <TeslaMetric
          label="Daily Executions"
          value={stats?.total_executions_today.toString() || '--'}
          trend="up"
          icon="📊"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <TeslaCard className="col-span-1">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Performance</h3>
            <div className="h-64">
              <TeslaChart
                data={performanceData}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Successful</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">Failed</span>
              </div>
            </div>
          </div>
        </TeslaCard>

        {/* Active Rules Overview */}
        <TeslaCard className="col-span-1">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Automation Rules</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Rules Success Rate</span>
                  <span className="text-green-400 font-semibold">
                    {stats ? Math.round((stats.successful_executions_today / Math.max(stats.total_executions_today, 1)) * 100) : 0}%
                  </span>
                </div>
                <TeslaProgressBar 
                  value={stats ? (stats.successful_executions_today / Math.max(stats.total_executions_today, 1)) * 100 : 0} 
                  color="green"
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Active vs Total</span>
                  <span className="text-blue-400 font-semibold">
                    {stats ? Math.round((stats.active_rules / stats.total_rules) * 100) : 0}%
                  </span>
                </div>
                <TeslaProgressBar 
                  value={stats ? (stats.active_rules / stats.total_rules) * 100 : 0} 
                  color="blue"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Today's Failure Rate</span>
                  <span className="text-red-400 font-semibold">
                    {stats ? Math.round((stats.failed_executions_today / Math.max(stats.total_executions_today, 1)) * 100) : 0}%
                  </span>
                </div>
                <TeslaProgressBar 
                  value={stats ? (stats.failed_executions_today / Math.max(stats.total_executions_today, 1)) * 100 : 0} 
                  color="red"
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{stats?.active_rules || 0}</div>
                    <div className="text-xs text-gray-400">Active Rules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-400">{stats?.total_rules || 0}</div>
                    <div className="text-xs text-gray-400">Total Rules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TeslaCard>
      </div>

      {/* Automation Rules */}
      <TeslaCard>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Automation Rules</h3>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getTriggerTypeIcon(rule.trigger.type)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{rule.name}</h4>
                      <p className="text-sm text-gray-400">{rule.description}</p>
                    </div>
                  </div>
                  <TeslaStatusIndicator 
                    status={rule.enabled ? 'online' : 'warning'}
                    label={rule.enabled ? 'Active' : 'Paused'}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Last Executed</div>
                    <div className="text-white">
                      {rule.last_executed ? formatTimeAgo(rule.last_executed) : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                    <div className="text-white">{rule.success_rate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Executions</div>
                    <div className="text-white">{rule.execution_count}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Success Rate</div>
                  <TeslaProgressBar 
                    value={rule.success_rate} 
                    className="h-2"
                    color={rule.success_rate > 95 ? 'green' : rule.success_rate > 90 ? 'orange' : 'red'}
                  />
                </div>

                <div className="flex space-x-2">
                  {rule.enabled ? (
                    <TeslaButton
                      onClick={() => handleRuleAction(rule.id, 'pause')}
                      variant="secondary"
                      size="sm"
                    >
                      Pause
                    </TeslaButton>
                  ) : (
                    <TeslaButton
                      onClick={() => handleRuleAction(rule.id, 'resume')}
                      variant="primary"
                      size="sm"
                    >
                      Resume
                    </TeslaButton>
                  )}
                  <TeslaButton
                    onClick={() => handleRuleAction(rule.id, 'execute')}
                    variant="secondary"
                    size="sm"
                  >
                    Execute Now
                  </TeslaButton>
                  <TeslaButton
                    onClick={() => setSelectedRule(rule.id)}
                    variant="secondary"
                    size="sm"
                  >
                    View Details
                  </TeslaButton>
                  <TeslaButton
                    onClick={() => handleRuleAction(rule.id, 'delete')}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </TeslaButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>

      {/* Recent Executions */}
      <TeslaCard className="col-span-full">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Executions</h3>
          <div className="space-y-3">
            {executions.map((execution) => (
              <div 
                key={execution.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {execution.status === 'completed' ? '✅' : 
                     execution.status === 'failed' ? '❌' : 
                     execution.status === 'running' ? '⚡' : '⏳'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${
                        execution.status === 'completed' ? 'text-green-400' :
                        execution.status === 'failed' ? 'text-red-400' :
                        execution.status === 'running' ? 'text-blue-400' : 'text-yellow-400'
                      }`}>
                        {execution.rule_name}
                      </h4>
                      <TeslaStatusIndicator 
                        status={execution.status === 'completed' ? 'online' : execution.status === 'failed' ? 'error' : 'processing'} 
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {execution.actions_executed.length} actions executed
                    </p>
                    {execution.status === 'failed' && execution.actions_executed.some(action => action.error) && (
                      <p className="text-sm text-red-400 mt-1">
                        Error: {execution.actions_executed.find(action => action.error)?.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div className="text-sm">
                    <div className="text-gray-300">{formatTimeAgo(execution.started_at)}</div>
                    {execution.total_duration_ms && (
                      <div className="text-gray-500">{formatDuration(execution.total_duration_ms)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>

      {/* Trigger Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { type: 'email_received', label: 'Email Triggers', count: rules.filter(r => r.trigger.type === 'email_received').length, icon: '📧' },
          { type: 'calendar_event', label: 'Calendar Events', count: rules.filter(r => r.trigger.type === 'calendar_event').length, icon: '📅' },
          { type: 'deadline_approaching', label: 'Deadline Alerts', count: rules.filter(r => r.trigger.type === 'deadline_approaching').length, icon: '⏰' },
          { type: 'task_created', label: 'Task Triggers', count: rules.filter(r => r.trigger.type === 'task_created').length, icon: '📝' },
          { type: 'time_based', label: 'Scheduled', count: rules.filter(r => r.trigger.type === 'time_based').length, icon: '🕐' }
        ].map((triggerType) => (
          <TeslaCard key={triggerType.type} className="text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">{triggerType.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{triggerType.count}</div>
              <div className="text-sm text-gray-400">{triggerType.label}</div>
              <div className="text-xs text-green-400 mt-2">
                {triggerType.count > 0 ? 'Active' : 'None'}
              </div>
            </div>
          </TeslaCard>
        ))}
      </div>

      {/* Recent Failures (if any) */}
      {stats && stats.recent_failures.length > 0 && (
        <TeslaCard className="col-span-full">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Failures</h3>
            <div className="space-y-3">
              {stats.recent_failures.map((failure, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-xl">❌</div>
                    <div>
                      <h4 className="font-medium text-red-400">{failure.rule_name}</h4>
                      <p className="text-sm text-gray-400">{failure.error}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatTimeAgo(failure.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TeslaCard>
      )}
    </div>
  );
}
