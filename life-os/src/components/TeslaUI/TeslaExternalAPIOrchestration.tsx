'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import { useExternalIntegrations } from '../../lib/api/external-integrations-api';

export function TeslaExternalAPIOrchestration() {
  const [viewMode, setViewMode] = useState<'overview' | 'integrations' | 'endpoints' | 'monitoring'>('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    calendarIntegrations,
    emailIntegrations,
    documentIntegrations,
    communicationIntegrations,
    allConnections,
    stats,
    syncOperations,
    loading,
    error,
    refreshData,
    connectCalendar,
    connectEmail,
    connectDocument,
    connectCommunication,
    testConnection,
    triggerFullSync
  } = useExternalIntegrations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20';
      case 'syncing': return 'text-blue-400 bg-blue-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      case 'disconnected': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calendar': return '📅';
      case 'email': return '📧';
      case 'document': return '📄';
      case 'communication': return '💬';
      case 'other': return '🔗';
      default: return '🔗';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [integrationId]: { status: 'testing', message: 'Testing connection...' }
      }));

      const result = await testConnection(integrationId);
      
      setTestResults(prev => ({
        ...prev,
        [integrationId]: {
          status: result.success ? 'success' : 'error',
          message: result.success 
            ? `Connection successful! Response time: ${result.responseTime}ms` 
            : result.error || 'Connection failed. Please check your credentials.',
          responseTime: result.responseTime,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [integrationId]: {
          status: 'error',
          message: 'Test failed due to network error.',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  const handleConnectAPI = async (apiType: string) => {
    setIsConnecting(true);
    try {
      switch (apiType) {
        case 'google-calendar':
          await connectCalendar('google', 'user@gmail.com');
          break;
        case 'outlook-calendar':
          await connectCalendar('outlook', 'user@company.com');
          break;
        case 'gmail':
          await connectEmail('gmail', 'user@gmail.com');
          break;
        case 'google-drive':
          await connectDocument('google_drive');
          break;
        case 'slack':
          await connectCommunication('slack');
          break;
        case 'teams':
          await connectCommunication('teams');
          break;
        default:
          console.log(`Connected to ${apiType}`);
      }
      
      await refreshData();
    } catch (error) {
      console.error(`Failed to connect to ${apiType}:`, error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading && allConnections.length === 0) {
    return (
      <div className="space-y-6">
        <TeslaCard className="p-8 text-center">
          <div className="text-blue-400 mb-2 text-2xl">🔄</div>
          <div className="text-white">Loading integration data...</div>
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
          <h2 className="text-2xl font-bold text-white mb-2">External API Orchestration</h2>
          <p className="text-gray-400">Manage integrations with external services and APIs</p>
        </div>
        <div className="flex space-x-4">
          <TeslaButton
            onClick={triggerFullSync}
            variant="secondary"
            disabled={loading}
          >
            {loading ? 'Syncing...' : 'Sync All'}
          </TeslaButton>
          <TeslaButton
            onClick={() => setSelectedIntegration('new')}
            variant="primary"
          >
            Add Integration
          </TeslaButton>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-2">
        {(['overview', 'integrations', 'endpoints', 'monitoring'] as const).map((mode) => (
          <TeslaButton
            key={mode}
            variant={viewMode === mode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </TeslaButton>
        ))}
      </div>

      {/* Integration Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeslaMetric
          label="Active Connections"
          value={stats?.activeConnections.toString() || '--'}
          trend="up"
          icon="🔗"
          color="green"
        />
        <TeslaMetric
          label="Sync Operations"
          value={stats?.syncOperations24h.toString() || '--'}
          trend="up"
          icon="⚡"
          color="blue"
        />
        <TeslaMetric
          label="Success Rate"
          value={stats ? `${(100 - stats.errorRate).toFixed(1)}%` : '--'}
          trend="up"
          icon="✅"
          color="green"
        />
        <TeslaMetric
          label="Avg Response"
          value={stats ? `${stats.averageResponseTime}ms` : '--'}
          trend="down"
          icon="⏱️"
          color="orange"
        />
      </div>

      {/* Real-Time Integration Status */}
      {allConnections.length > 0 && (
        <div className="mb-8">
          <TeslaCard>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Connected Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allConnections.map((connection) => (
                  <div key={connection.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getCategoryIcon(connection.category)}</span>
                        <h4 className="font-semibold text-white">{connection.name}</h4>
                      </div>
                      <TeslaStatusIndicator 
                        status={connection.status === 'connected' ? 'online' : connection.status === 'error' ? 'error' : 'warning'} 
                        size="sm"
                      />
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {connection.category} • {connection.dataCount.toLocaleString()} items
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        connection.health === 'excellent' ? 'bg-green-600 text-green-100' :
                        connection.health === 'good' ? 'bg-blue-600 text-blue-100' :
                        connection.health === 'fair' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-red-600 text-red-100'
                      }`}>
                        {connection.health}
                      </span>
                      <span className="text-xs text-gray-400">{connection.uptime}% uptime</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Last activity: {formatTimeAgo(connection.lastActivity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Sync Operations Status */}
          <TeslaCard>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Sync Operations</h3>
              <div className="space-y-3">
                {syncOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {operation.status === 'completed' ? '✅' : 
                         operation.status === 'failed' ? '❌' : 
                         operation.status === 'running' ? '⚡' : '⏳'}
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          operation.status === 'completed' ? 'text-green-400' :
                          operation.status === 'failed' ? 'text-red-400' :
                          operation.status === 'running' ? 'text-blue-400' : 'text-yellow-400'
                        }`}>
                          {operation.integrationName}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {operation.operation} • {operation.itemsProcessed}/{operation.totalItems} items
                        </p>
                        {operation.error && (
                          <p className="text-sm text-red-400">{operation.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{formatTimeAgo(operation.startedAt)}</div>
                      {operation.status === 'running' && (
                        <div className="w-24 mt-1">
                          <TeslaProgressBar value={operation.progress} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TeslaCard>

          {/* Integration Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Integrations */}
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  📅 Calendar Integrations
                </h3>
                <div className="space-y-3">
                  {calendarIntegrations.map((calendar) => (
                    <div key={calendar.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{calendar.name}</h4>
                        <p className="text-sm text-gray-400">{calendar.email}</p>
                        <p className="text-xs text-gray-500">
                          {calendar.syncedEvents} events • Last sync: {formatTimeAgo(calendar.lastSync)}
                        </p>
                      </div>
                      <div className="text-right">
                        <TeslaStatusIndicator 
                          status={calendar.status === 'connected' ? 'online' : calendar.status === 'error' ? 'error' : 'warning'} 
                          size="sm"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          {calendar.autoTaskCreation ? 'Auto-tasks: ON' : 'Auto-tasks: OFF'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>

            {/* Email Integrations */}
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  � Email Integrations
                </h3>
                <div className="space-y-3">
                  {emailIntegrations.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{email.name}</h4>
                        <p className="text-sm text-gray-400">{email.email}</p>
                        <p className="text-xs text-gray-500">
                          {email.totalEmails.toLocaleString()} total • {email.unreadEmails} unread
                        </p>
                      </div>
                      <div className="text-right">
                        <TeslaStatusIndicator 
                          status={email.status === 'connected' ? 'online' : email.status === 'error' ? 'error' : 'warning'} 
                          size="sm"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          {email.autoTaskCreation ? 'Auto-parse: ON' : 'Auto-parse: OFF'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>

            {/* Document Integrations */}
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  📄 Document Storage
                </h3>
                <div className="space-y-3">
                  {documentIntegrations.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-400">{doc.storageUsed} used</p>
                        <p className="text-xs text-gray-500">
                          {doc.totalDocuments.toLocaleString()} documents • {doc.recentDocuments} recent
                        </p>
                      </div>
                      <div className="text-right">
                        <TeslaStatusIndicator 
                          status={doc.status === 'connected' ? 'online' : doc.status === 'error' ? 'error' : 'warning'} 
                          size="sm"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          Sync: {doc.settings.syncInterval}min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>

            {/* Communication Integrations */}
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  💬 Communication Platforms
                </h3>
                <div className="space-y-3">
                  {communicationIntegrations.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{comm.name}</h4>
                        <p className="text-sm text-gray-400">{comm.type.toUpperCase()}</p>
                        <p className="text-xs text-gray-500">
                          {comm.messageCount} messages • {comm.meetingCount} meetings
                        </p>
                      </div>
                      <div className="text-right">
                        <TeslaStatusIndicator 
                          status={comm.status === 'connected' ? 'online' : comm.status === 'error' ? 'error' : 'warning'} 
                          size="sm"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          {comm.settings.notifications ? 'Notifications: ON' : 'Notifications: OFF'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>
          </div>

          {/* System Health */}
          <TeslaCard>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Integration Health Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TeslaGauge value={stats?.uptime || 0} />
                  <div className="text-sm text-gray-400 mt-2">System Uptime</div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Data Transfer</span>
                      <span className="text-blue-400">{stats?.dataTransferred24h || '0 MB'}</span>
                    </div>
                    <TeslaProgressBar value={75} size="sm" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Error Rate</span>
                      <span className="text-orange-400">{stats?.errorRate.toFixed(1) || '0'}%</span>
                    </div>
                    <TeslaProgressBar value={stats?.errorRate || 0} size="sm" color="orange" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Response Time</span>
                      <span className="text-green-400">{stats?.averageResponseTime || 0}ms</span>
                    </div>
                    <TeslaProgressBar value={85} size="sm" color="green" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-green-500/10 rounded border border-green-500/30">
                    <h4 className="text-green-400 font-medium text-sm">📊 Today's Stats</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total connections</span>
                        <span className="text-green-400">{stats?.totalConnections || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Active now</span>
                        <span className="text-green-400">{stats?.activeConnections || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sync operations</span>
                        <span className="text-green-400">{stats?.syncOperations24h || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TeslaCard>
        </div>
      )}

      {/* Quick Connect Actions */}
      <TeslaCard>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Connect</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TeslaButton 
              variant="secondary" 
              onClick={() => handleConnectAPI('google-calendar')}
              disabled={isConnecting}
            >
              � Google Calendar
            </TeslaButton>
            <TeslaButton 
              variant="secondary" 
              onClick={() => handleConnectAPI('gmail')}
              disabled={isConnecting}
            >
              📧 Gmail
            </TeslaButton>
            <TeslaButton 
              variant="secondary" 
              onClick={() => handleConnectAPI('google-drive')}
              disabled={isConnecting}
            >
              📄 Google Drive
            </TeslaButton>
            <TeslaButton 
              variant="secondary" 
              onClick={() => handleConnectAPI('slack')}
              disabled={isConnecting}
            >
              💬 Slack
            </TeslaButton>
          </div>
        </div>
      </TeslaCard>
    </div>
  );
}
