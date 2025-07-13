'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Target, TrendingDown, Users, Calendar, Brain, Zap, CheckCircle, XCircle } from 'lucide-react';
import { usePredictiveAnalytics } from '../../lib/api/predictive-analytics-api';

interface PredictiveAlert {
  id: string;
  type: 'deadline_risk' | 'case_pace' | 'priority_conflict' | 'resource_allocation' | 'risk_assessment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  confidence: number;
  entity_id?: string;
  entity_type?: 'task' | 'case' | 'deadline';
  suggested_actions: string[];
  created_at: string;
  dismissed?: boolean;
}

interface TeslaPredictiveInsightsEngineProps {
  tasks?: any[];
  cases?: any[];
  className?: string;
}

const mockAlerts: PredictiveAlert[] = [
  {
    id: 'alert_1',
    type: 'deadline_risk',
    severity: 'high',
    title: 'Deadline Risk Detected',
    message: "You're likely to miss the Johnson case deadline (Dec 15) based on current pace. You're 35% behind the typical preparation timeline.",
    confidence: 87,
    entity_id: 'case_johnson',
    entity_type: 'case',
    suggested_actions: [
      'Schedule additional 6 hours this week',
      'Delegate document review to paralegal',
      'Reschedule non-urgent meetings',
      'Consider requesting extension'
    ],
    created_at: '2025-07-12T18:00:00Z'
  },
  {
    id: 'alert_2',
    type: 'case_pace',
    severity: 'medium',
    title: 'Case Progress Alert',
    message: "Smith divorce case is taking 40% longer than similar cases. Average divorce cases complete in 4.2 months, you're at month 6.1.",
    confidence: 92,
    entity_id: 'case_smith',
    entity_type: 'case',
    suggested_actions: [
      'Review process bottlenecks',
      'Schedule client checkpoint meeting',
      'Analyze similar successful cases',
      'Consider streamlining document requests'
    ],
    created_at: '2025-07-12T17:30:00Z'
  },
  {
    id: 'alert_3',
    type: 'priority_conflict',
    severity: 'critical',
    title: 'Priority Conflict Warning',
    message: "You have 3 conflicting high-priority deadlines next week: Johnson brief (Mon), Davis deposition prep (Tue), and Wilson contract review (Wed).",
    confidence: 95,
    suggested_actions: [
      'Delegate Wilson contract to associate',
      'Reschedule Davis deposition to following week',
      'Block Friday for Johnson brief completion',
      'Alert clients of potential schedule adjustments'
    ],
    created_at: '2025-07-12T17:15:00Z'
  },
  {
    id: 'alert_4',
    type: 'resource_allocation',
    severity: 'medium',
    title: 'Resource Optimization',
    message: "Your utilization is at 127% capacity. Recommend reallocating 2 cases to associates and focusing on high-value client work.",
    confidence: 84,
    suggested_actions: [
      'Assign Miller case to junior associate',
      'Delegate Thompson discovery to paralegal',
      'Focus on Johnson and Davis high-value work',
      'Schedule team capacity planning meeting'
    ],
    created_at: '2025-07-12T16:45:00Z'
  },
  {
    id: 'alert_5',
    type: 'risk_assessment',
    severity: 'high',
    title: 'Client Risk Assessment',
    message: "Anderson case shows 73% probability of client dissatisfaction based on communication patterns and timeline delays.",
    confidence: 78,
    entity_id: 'case_anderson',
    entity_type: 'case',
    suggested_actions: [
      'Schedule immediate client check-in call',
      'Provide detailed progress update',
      'Address timeline concerns proactively',
      'Consider fee adjustment discussion'
    ],
    created_at: '2025-07-12T16:20:00Z'
  }
];

const getSeverityColor = (severity: PredictiveAlert['severity']) => {
  switch (severity) {
    case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getSeverityIcon = (severity: PredictiveAlert['severity']) => {
  switch (severity) {
    case 'low': return <CheckCircle className="w-4 h-4" />;
    case 'medium': return <Clock className="w-4 h-4" />;
    case 'high': return <AlertTriangle className="w-4 h-4" />;
    case 'critical': return <XCircle className="w-4 h-4" />;
    default: return <Brain className="w-4 h-4" />;
  }
};

const getTypeIcon = (type: PredictiveAlert['type']) => {
  switch (type) {
    case 'deadline_risk': return <Clock className="w-5 h-5" />;
    case 'case_pace': return <TrendingDown className="w-5 h-5" />;
    case 'priority_conflict': return <Target className="w-5 h-5" />;
    case 'resource_allocation': return <Users className="w-5 h-5" />;
    case 'risk_assessment': return <AlertTriangle className="w-5 h-5" />;
    default: return <Brain className="w-5 h-5" />;
  }
};

const getTypeLabel = (type: PredictiveAlert['type']) => {
  switch (type) {
    case 'deadline_risk': return 'Deadline Risk';
    case 'case_pace': return 'Case Pace';
    case 'priority_conflict': return 'Priority Conflict';
    case 'resource_allocation': return 'Resource Allocation';
    case 'risk_assessment': return 'Risk Assessment';
    default: return 'Insight';
  }
};

export default function TeslaPredictiveInsightsEngine({ 
  tasks = [], 
  cases = [], 
  className = '' 
}: TeslaPredictiveInsightsEngineProps) {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>(mockAlerts);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAlerts = alerts
    .filter(alert => !alert.dismissed)
    .filter(alert => selectedSeverity === 'all' || alert.severity === selectedSeverity)
    .filter(alert => selectedType === 'all' || alert.type === selectedType)
    .sort((a, b) => {
      // Sort by severity (critical > high > medium > low) then by time
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const severityCounts = alerts.reduce((acc, alert) => {
    if (!alert.dismissed) {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Predictive Insights Engine</h3>
            <p className="text-sm text-gray-400">AI-powered alerts and recommendations</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{filteredAlerts.length}</div>
            <div className="text-xs text-gray-400">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-400">{severityCounts.critical || 0}</div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-orange-400">{severityCounts.high || 0}</div>
          <div className="text-xs text-gray-400">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-yellow-400">{severityCounts.medium || 0}</div>
          <div className="text-xs text-gray-400">Medium</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-blue-400">{severityCounts.low || 0}</div>
          <div className="text-xs text-gray-400">Low</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Types</option>
          <option value="deadline_risk">Deadline Risk</option>
          <option value="case_pace">Case Pace</option>
          <option value="priority_conflict">Priority Conflict</option>
          <option value="resource_allocation">Resource Allocation</option>
          <option value="risk_assessment">Risk Assessment</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Alerts</h3>
            <p className="text-gray-500">All predictions look good! The AI is monitoring for potential issues.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getSeverityColor(alert.severity)}`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-600/30 text-gray-300">
                        {getTypeLabel(alert.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{formatTimeAgo(alert.created_at)}</span>
                      <span>Confidence: {alert.confidence}%</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-200 mb-4">{alert.message}</p>

              {/* Suggested Actions */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-gray-300 mb-2 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Recommended Actions
                </h5>
                <div className="space-y-1">
                  {alert.suggested_actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                      <div className="w-1 h-1 rounded-full bg-gray-500" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>AI Confidence</span>
                  <span>{alert.confidence}%</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      alert.confidence >= 90 ? 'bg-green-500' :
                      alert.confidence >= 75 ? 'bg-yellow-500' :
                      alert.confidence >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${alert.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Processing Status */}
      <div className="mt-6 pt-4 border-t border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-400">AI Engine Active</span>
          </div>
          <div className="text-sm text-gray-400">
            Last scan: {formatTimeAgo(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
}
