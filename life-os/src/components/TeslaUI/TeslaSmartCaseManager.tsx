'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaProgressBar from './TeslaProgressBar';
import TeslaChart from './TeslaChart';
import { AIInsightBadge } from './TeslaAIInsightsBadges';
import TeslaSmartSuggestions from './TeslaSmartSuggestions';
import TeslaPredictiveInsights from './TeslaPredictiveInsights';

interface Case {
  id: string;
  case_name: string;
  case_summary: string;
  case_number: string;
  court: string;
  judge: string;
  status: 'Active' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  next_deadline?: Date;
  estimated_completion?: Date;
  completion_probability?: number;
  ai_risk_score?: number;
  ai_insights?: string[];
  created_at: Date;
  updated_at: Date;
  contact_ids?: string[];
  task_ids?: string[];
  total_tasks?: number;
  completed_tasks?: number;
  billable_hours?: number;
  estimated_hours?: number;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  contact_type: 'client' | 'judge' | 'mediator' | 'arbitrator' | 'opposing_counsel' | 'co_counsel' | 'vendor';
  case_ids: string[];
}

interface TeslaSmartCaseManagerProps {
  cases: Case[];
  contacts: Contact[];
  onCaseSelect?: (caseId: string) => void;
  onCaseUpdate?: (caseId: string, updates: Partial<Case>) => void;
  onCreateTask?: (caseId: string, taskTitle: string) => void;
}

export const TeslaSmartCaseManager: React.FC<TeslaSmartCaseManagerProps> = ({
  cases,
  contacts,
  onCaseSelect,
  onCaseUpdate,
  onCreateTask
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'active' | 'priority' | 'insights'>('overview');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(true);

  // AI-powered case analysis
  const getCaseRiskLevel = (caseItem: Case): 'online' | 'offline' | 'warning' | 'error' | 'processing' => {
    const riskScore = caseItem.ai_risk_score || 0;
    if (riskScore >= 8) return 'error';
    if (riskScore >= 6) return 'warning';
    if (riskScore >= 4) return 'processing';
    return 'online';
  };

  const getCaseProgress = (caseItem: Case): number => {
    if (!caseItem.total_tasks || caseItem.total_tasks === 0) return 0;
    return (caseItem.completed_tasks || 0) / caseItem.total_tasks;
  };

  const getTimeUtilization = (caseItem: Case): number => {
    if (!caseItem.estimated_hours || caseItem.estimated_hours === 0) return 0;
    return (caseItem.billable_hours || 0) / caseItem.estimated_hours;
  };

  const getDaysToDeadline = (caseItem: Case): number | null => {
    if (!caseItem.next_deadline) return null;
    const now = new Date();
    const deadline = new Date(caseItem.next_deadline);
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (caseItem: Case): 'low' | 'medium' | 'high' | 'critical' => {
    const daysToDeadline = getDaysToDeadline(caseItem);
    if (daysToDeadline === null) return 'low';
    if (daysToDeadline <= 7) return 'critical';
    if (daysToDeadline <= 14) return 'high';
    if (daysToDeadline <= 30) return 'medium';
    return 'low';
  };

  // Filter cases based on selected view
  const getFilteredCases = (): Case[] => {
    let filtered = cases.filter(c => c.status === 'Active');
    
    switch (selectedView) {
      case 'priority':
        return filtered.sort((a, b) => {
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      case 'insights':
        return filtered.filter(c => c.ai_insights && c.ai_insights.length > 0);
      case 'active':
        return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      default:
        return filtered;
    }
  };

  const filteredCases = getFilteredCases();

  // AI insights and suggestions
  const getAIInsights = () => {
    const insights = [
      'Case velocity is 15% below average this week',
      'Deadline clustering detected for next month',
      'Client response time has improved 40%',
      'Recommended: Schedule case status meetings',
      'Pattern: Discovery phase taking longer than usual'
    ];
    return insights;
  };

  const getSmartSuggestions = () => {
    const suggestions = [
      {
        id: '1',
        type: 'scheduling' as const,
        priority: 'high' as const,
        title: 'Schedule depositions',
        description: 'Based on case timeline analysis, optimal timing window for depositions is approaching',
        context: 'Case timeline analysis',
        confidence: 87,
        potential_impact: 'high' as const,
        time_to_implement: '15 minutes',
        action_items: ['Schedule deposition dates', 'Notify opposing counsel', 'Book court reporter'],
        dismissible: true
      },
      {
        id: '2',
        type: 'productivity' as const,
        priority: 'medium' as const,
        title: 'Request document production',
        description: 'Similar cases needed this by now - don\'t fall behind discovery schedule',
        context: 'Similar case analysis',
        confidence: 78,
        potential_impact: 'medium' as const,
        time_to_implement: '10 minutes',
        action_items: ['Draft document request', 'Send to opposing counsel', 'Set follow-up reminder'],
        dismissible: true
      },
      {
        id: '3',
        type: 'optimization' as const,
        priority: 'high' as const,
        title: 'Prepare settlement analysis',
        description: 'Optimal timing window opening - settlement discussions most productive now',
        context: 'Settlement pattern analysis',
        confidence: 92,
        potential_impact: 'high' as const,
        time_to_implement: '30 minutes',
        action_items: ['Gather settlement data', 'Prepare analysis report', 'Schedule client meeting'],
        dismissible: true
      }
    ];
    return suggestions;
  };

  const getPredictiveInsights = () => {
    return [
      {
        id: '1',
        type: 'prediction' as const,
        title: 'Case Resolution Probability',
        description: 'Based on current pace, 78% chance of resolution within 6 months',
        confidence: 87,
        impact: 'high' as const,
        actionable: true
      },
      {
        id: '2',
        type: 'opportunity' as const,
        title: 'Settlement Likelihood',
        description: '65% probability of favorable settlement within 3 months',
        confidence: 75,
        impact: 'medium' as const,
        actionable: true
      },
      {
        id: '3',
        type: 'pattern' as const,
        title: 'Resource Utilization',
        description: 'Current month utilization at 89% - optimal efficiency range',
        confidence: 94,
        impact: 'medium' as const,
        actionable: false
      }
    ];
  };

  return (
    <div className="tesla-smart-case-manager">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Smart Case Management
          </h2>
          <TeslaStatusIndicator 
            status="online" 
            label={`${filteredCases.length} Active Cases`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <TeslaButton
            variant={selectedView === 'overview' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </TeslaButton>
          <TeslaButton
            variant={selectedView === 'active' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedView('active')}
          >
            Active
          </TeslaButton>
          <TeslaButton
            variant={selectedView === 'priority' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedView('priority')}
          >
            Priority
          </TeslaButton>
          <TeslaButton
            variant={selectedView === 'insights' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedView('insights')}
          >
            AI Insights
          </TeslaButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Case Display */}
        <div className="lg:col-span-3 space-y-6">
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              <TeslaMetric
                label="Active Cases"
                value={cases.filter(c => c.status === 'Active').length}
                trendValue="+2"
                trend="up"
                icon="📋"
              />
              <TeslaMetric
                label="Critical Deadlines"
                value={cases.filter(c => getUrgencyLevel(c) === 'critical').length}
                trendValue="-1"
                trend="down"
                icon="⚠️"
              />
              <TeslaMetric
                label="Avg Case Progress"
                value={`${cases.length > 0 ? Math.round(cases.reduce((acc, c) => acc + getCaseProgress(c), 0) / cases.length * 100) : 0}%`}
                trendValue="+8%"
                trend="up"
                icon="📈"
              />
            </div>
          )}

          {/* Case Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((caseItem) => (
              <TeslaCard
                key={caseItem.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedCase === caseItem.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedCase(caseItem.id);
                  onCaseSelect?.(caseItem.id);
                }}
              >
                <div className="p-4">
                  {/* Case Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {caseItem.case_name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {caseItem.case_number || 'No case number'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TeslaStatusIndicator 
                        status={getCaseRiskLevel(caseItem)} 
                        size="sm"
                      />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        caseItem.priority === 'Critical' ? 'bg-red-900 text-red-200' :
                        caseItem.priority === 'High' ? 'bg-orange-900 text-orange-200' :
                        caseItem.priority === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-green-900 text-green-200'
                      }`}>
                        {caseItem.priority}
                      </span>
                    </div>
                  </div>

                  {/* Case Summary */}
                  {caseItem.case_summary && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {caseItem.case_summary}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(getCaseProgress(caseItem) * 100)}%</span>
                    </div>
                    <TeslaProgressBar 
                      value={getCaseProgress(caseItem) * 100} 
                      size="sm"
                    />
                  </div>

                  {/* Case Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Court:</span>
                      <div className="text-white font-medium truncate">
                        {caseItem.court || 'Not assigned'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Judge:</span>
                      <div className="text-white font-medium truncate">
                        {caseItem.judge || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Deadline Info */}
                  {caseItem.next_deadline && (
                    <div className="mt-3 p-2 bg-gray-800 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Next Deadline</span>
                        <span className={`text-xs font-medium ${
                          getUrgencyLevel(caseItem) === 'critical' ? 'text-red-400' :
                          getUrgencyLevel(caseItem) === 'high' ? 'text-orange-400' :
                          getUrgencyLevel(caseItem) === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {getDaysToDeadline(caseItem)} days
                        </span>
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {caseItem.ai_insights && caseItem.ai_insights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {caseItem.ai_insights.map((insightText, index) => (
                        <AIInsightBadge 
                          key={index} 
                          insight={{
                            id: `${caseItem.id}-${index}`,
                            type: 'pattern',
                            level: 'medium',
                            title: 'AI Insight',
                            value: insightText,
                            confidence: 85
                          }}
                          size="small"
                          interactive={false}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <TeslaButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onCreateTask?.(caseItem.id, '');
                      }}
                    >
                      + Task
                    </TeslaButton>
                    <TeslaButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Handle case update
                      }}
                    >
                      Edit
                    </TeslaButton>
                  </div>
                </div>
              </TeslaCard>
            ))}
          </div>
        </div>

        {/* AI Intelligence Panel */}
        {showAIPanel && (
          <div className="lg:col-span-1 space-y-6">
            <TeslaCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">AI Intelligence</h3>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                {/* Predictive Insights */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Predictive Insights</h4>
                  <TeslaPredictiveInsights insights={getPredictiveInsights()} />
                </div>

                {/* Smart Suggestions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Smart Suggestions</h4>
                  <TeslaSmartSuggestions suggestions={getSmartSuggestions()} />
                </div>

                {/* AI Alerts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">AI Alerts</h4>
                  {getAIInsights().map((insight, index) => (
                    <TeslaAlert
                      key={index}
                      type={index < 2 ? 'warning' : 'info'}
                    >
                      {insight}
                    </TeslaAlert>
                  ))}
                </div>
              </div>
            </TeslaCard>
          </div>
        )}
      </div>
    </div>
  );
};
