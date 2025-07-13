'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'discord' | 'zoom' | 'phone' | 'sms' | 'whatsapp' | 'telegram';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  isActive: boolean;
  lastSyncAt: Date;
  messagesCount: number;
  unreadCount: number;
  responseRate: number; // percentage
  avgResponseTime: number; // minutes
  integrationHealth: number; // 0-100
  notifications: boolean;
  autoSync: boolean;
  credentials: {
    isValid: boolean;
    expiresAt?: Date;
    scopes: string[];
  };
  settings: ChannelSettings;
  analytics: ChannelAnalytics;
}

interface ChannelSettings {
  autoCreateTasks: boolean;
  urgentKeywords: string[];
  clientNotifications: boolean;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  signature: string;
  templates: MessageTemplate[];
  rules: AutomationRule[];
}

interface MessageTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
  category: 'client_update' | 'deadline_reminder' | 'case_status' | 'meeting_request' | 'follow_up';
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'keyword_match' | 'sender_pattern' | 'time_based' | 'case_update' | 'deadline_approaching';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  priority: number;
}

interface RuleCondition {
  field: 'subject' | 'body' | 'sender' | 'recipient' | 'time' | 'case_id';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than';
  value: string | number;
}

interface RuleAction {
  type: 'create_task' | 'send_notification' | 'add_to_case' | 'schedule_reminder' | 'forward_message' | 'auto_reply' | 'escalate';
  parameters: {
    [key: string]: any;
  };
}

interface ChannelAnalytics {
  dailyMessages: { date: string; sent: number; received: number; }[];
  responseTimeHistory: { date: string; avgTime: number; }[];
  keywordMentions: { keyword: string; count: number; }[];
  clientInteractions: { clientId: string; clientName: string; messageCount: number; lastContact: Date; }[];
  urgentMessages: number;
  missedMessages: number;
}

interface UnifiedMessage {
  id: string;
  channelId: string;
  channelType: string;
  subject?: string;
  body: string;
  sender: {
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  recipients: {
    name: string;
    email?: string;
    phone?: string;
  }[];
  timestamp: Date;
  isRead: boolean;
  isUrgent: boolean;
  priority: 'high' | 'medium' | 'low';
  caseId?: string;
  taskId?: string;
  attachments: MessageAttachment[];
  aiInsights: MessageAIInsight[];
  responseStatus: 'pending' | 'replied' | 'forwarded' | 'archived';
  tags: string[];
}

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface MessageAIInsight {
  id: string;
  type: 'urgency_detection' | 'deadline_mentioned' | 'action_required' | 'client_sentiment' | 'case_relevance';
  title: string;
  description: string;
  confidence: number;
  suggestedActions: string[];
  extractedData: any;
}

export function TeslaCommunicationPlatforms() {
  const [viewMode, setViewMode] = useState<'channels' | 'messages' | 'analytics' | 'automation'>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'urgent' | 'pending'>('all');

  const [communicationChannels] = useState<CommunicationChannel[]>([
    {
      id: 'email-main',
      name: 'Primary Email',
      type: 'email',
      status: 'connected',
      isActive: true,
      lastSyncAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      messagesCount: 1247,
      unreadCount: 23,
      responseRate: 92,
      avgResponseTime: 18, // minutes
      integrationHealth: 98,
      notifications: true,
      autoSync: true,
      credentials: {
        isValid: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        scopes: ['read', 'write', 'send']
      },
      settings: {
        autoCreateTasks: true,
        urgentKeywords: ['urgent', 'asap', 'emergency', 'deadline', 'court'],
        clientNotifications: true,
        workingHours: {
          enabled: true,
          start: '09:00',
          end: '17:00',
          timezone: 'America/Los_Angeles'
        },
        signature: 'Best regards,\nAttorney Smith\nSmith & Associates',
        templates: [
          {
            id: 'template-001',
            name: 'Client Status Update',
            subject: 'Case Update: {{case_name}}',
            body: 'Dear {{client_name}},\n\nI wanted to provide you with an update on your case...',
            variables: ['client_name', 'case_name', 'update_details'],
            category: 'client_update'
          }
        ],
        rules: [
          {
            id: 'rule-001',
            name: 'Create urgent tasks from client emails',
            trigger: 'keyword_match',
            conditions: [
              { field: 'body', operator: 'contains', value: 'urgent' },
              { field: 'sender', operator: 'contains', value: '@client-domain.com' }
            ],
            actions: [
              {
                type: 'create_task',
                parameters: {
                  title: 'Urgent client request',
                  priority: 'high',
                  dueDate: '24h'
                }
              }
            ],
            enabled: true,
            priority: 1
          }
        ]
      },
      analytics: {
        dailyMessages: [
          { date: '2024-07-05', sent: 12, received: 18 },
          { date: '2024-07-06', sent: 15, received: 22 },
          { date: '2024-07-07', sent: 8, received: 14 },
          { date: '2024-07-08', sent: 20, received: 25 },
          { date: '2024-07-09', sent: 16, received: 19 },
          { date: '2024-07-10', sent: 11, received: 16 },
          { date: '2024-07-11', sent: 9, received: 13 }
        ],
        responseTimeHistory: [
          { date: '2024-07-05', avgTime: 22 },
          { date: '2024-07-06', avgTime: 18 },
          { date: '2024-07-07', avgTime: 15 },
          { date: '2024-07-08', avgTime: 24 },
          { date: '2024-07-09', avgTime: 16 },
          { date: '2024-07-10', avgTime: 19 },
          { date: '2024-07-11', avgTime: 18 }
        ],
        keywordMentions: [
          { keyword: 'deadline', count: 15 },
          { keyword: 'court', count: 8 },
          { keyword: 'urgent', count: 12 },
          { keyword: 'settlement', count: 6 }
        ],
        clientInteractions: [
          { clientId: 'client-001', clientName: 'Johnson Inc.', messageCount: 45, lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { clientId: 'client-002', clientName: 'Smith Corp.', messageCount: 32, lastContact: new Date(Date.now() - 4 * 60 * 60 * 1000) }
        ],
        urgentMessages: 5,
        missedMessages: 2
      }
    },
    {
      id: 'slack-main',
      name: 'Law Firm Slack',
      type: 'slack',
      status: 'connected',
      isActive: true,
      lastSyncAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      messagesCount: 856,
      unreadCount: 12,
      responseRate: 88,
      avgResponseTime: 8, // minutes
      integrationHealth: 95,
      notifications: true,
      autoSync: true,
      credentials: {
        isValid: true,
        scopes: ['channels:read', 'chat:write', 'users:read']
      },
      settings: {
        autoCreateTasks: false,
        urgentKeywords: ['@channel', 'urgent', 'asap'],
        clientNotifications: false,
        workingHours: {
          enabled: true,
          start: '08:00',
          end: '18:00',
          timezone: 'America/Los_Angeles'
        },
        signature: '',
        templates: [],
        rules: []
      },
      analytics: {
        dailyMessages: [
          { date: '2024-07-05', sent: 25, received: 32 },
          { date: '2024-07-06', sent: 28, received: 35 },
          { date: '2024-07-07', sent: 18, received: 22 },
          { date: '2024-07-08', sent: 30, received: 38 },
          { date: '2024-07-09', sent: 26, received: 31 },
          { date: '2024-07-10', sent: 22, received: 28 },
          { date: '2024-07-11', sent: 15, received: 20 }
        ],
        responseTimeHistory: [
          { date: '2024-07-05', avgTime: 12 },
          { date: '2024-07-06', avgTime: 8 },
          { date: '2024-07-07', avgTime: 6 },
          { date: '2024-07-08', avgTime: 10 },
          { date: '2024-07-09', avgTime: 7 },
          { date: '2024-07-10', avgTime: 9 },
          { date: '2024-07-11', avgTime: 8 }
        ],
        keywordMentions: [
          { keyword: '@channel', count: 8 },
          { keyword: 'meeting', count: 15 },
          { keyword: 'review', count: 12 },
          { keyword: 'urgent', count: 5 }
        ],
        clientInteractions: [],
        urgentMessages: 3,
        missedMessages: 1
      }
    },
    {
      id: 'teams-main',
      name: 'Microsoft Teams',
      type: 'teams',
      status: 'connected',
      isActive: false,
      lastSyncAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      messagesCount: 423,
      unreadCount: 7,
      responseRate: 85,
      avgResponseTime: 25, // minutes
      integrationHealth: 78,
      notifications: false,
      autoSync: false,
      credentials: {
        isValid: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        scopes: ['Chat.Read', 'Chat.ReadWrite']
      },
      settings: {
        autoCreateTasks: false,
        urgentKeywords: ['urgent', 'asap'],
        clientNotifications: false,
        workingHours: {
          enabled: false,
          start: '09:00',
          end: '17:00',
          timezone: 'America/Los_Angeles'
        },
        signature: '',
        templates: [],
        rules: []
      },
      analytics: {
        dailyMessages: [
          { date: '2024-07-05', sent: 8, received: 12 },
          { date: '2024-07-06', sent: 6, received: 9 },
          { date: '2024-07-07', sent: 4, received: 7 },
          { date: '2024-07-08', sent: 10, received: 15 },
          { date: '2024-07-09', sent: 7, received: 11 },
          { date: '2024-07-10', sent: 5, received: 8 },
          { date: '2024-07-11', sent: 3, received: 5 }
        ],
        responseTimeHistory: [
          { date: '2024-07-05', avgTime: 30 },
          { date: '2024-07-06', avgTime: 25 },
          { date: '2024-07-07', avgTime: 20 },
          { date: '2024-07-08', avgTime: 28 },
          { date: '2024-07-09', avgTime: 22 },
          { date: '2024-07-10', avgTime: 26 },
          { date: '2024-07-11', avgTime: 25 }
        ],
        keywordMentions: [
          { keyword: 'meeting', count: 18 },
          { keyword: 'project', count: 12 },
          { keyword: 'deadline', count: 6 },
          { keyword: 'review', count: 9 }
        ],
        clientInteractions: [],
        urgentMessages: 2,
        missedMessages: 3
      }
    },
    {
      id: 'phone-main',
      name: 'Business Phone',
      type: 'phone',
      status: 'connected',
      isActive: true,
      lastSyncAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      messagesCount: 234, // call logs
      unreadCount: 3, // missed calls
      responseRate: 82,
      avgResponseTime: 5, // ring time before answer
      integrationHealth: 88,
      notifications: true,
      autoSync: true,
      credentials: {
        isValid: true,
        scopes: ['call_logs', 'voicemail']
      },
      settings: {
        autoCreateTasks: true,
        urgentKeywords: [],
        clientNotifications: false,
        workingHours: {
          enabled: true,
          start: '09:00',
          end: '17:00',
          timezone: 'America/Los_Angeles'
        },
        signature: '',
        templates: [],
        rules: [
          {
            id: 'rule-phone-001',
            name: 'Create task for missed client calls',
            trigger: 'case_update',
            conditions: [
              { field: 'sender', operator: 'contains', value: 'client' }
            ],
            actions: [
              {
                type: 'create_task',
                parameters: {
                  title: 'Return missed client call',
                  priority: 'high'
                }
              }
            ],
            enabled: true,
            priority: 1
          }
        ]
      },
      analytics: {
        dailyMessages: [
          { date: '2024-07-05', sent: 15, received: 18 },
          { date: '2024-07-06', sent: 12, received: 16 },
          { date: '2024-07-07', sent: 8, received: 10 },
          { date: '2024-07-08', sent: 20, received: 22 },
          { date: '2024-07-09', sent: 16, received: 19 },
          { date: '2024-07-10', sent: 11, received: 14 },
          { date: '2024-07-11', sent: 7, received: 9 }
        ],
        responseTimeHistory: [],
        keywordMentions: [],
        clientInteractions: [
          { clientId: 'client-001', clientName: 'Johnson Inc.', messageCount: 12, lastContact: new Date(Date.now() - 3 * 60 * 60 * 1000) }
        ],
        urgentMessages: 3,
        missedMessages: 3
      }
    }
  ]);

  const [unifiedMessages] = useState<UnifiedMessage[]>([
    {
      id: 'msg-001',
      channelId: 'email-main',
      channelType: 'email',
      subject: 'Urgent: Johnson Settlement Deadline Approaching',
      body: 'Hi Attorney Smith, I wanted to follow up on the Johnson settlement. The deadline is approaching next week and we need to finalize the terms...',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah@johnson-corp.com',
        avatar: '👩‍💼'
      },
      recipients: [
        { name: 'Attorney Smith', email: 'smith@lawfirm.com' }
      ],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      isUrgent: true,
      priority: 'high',
      caseId: 'case-001',
      attachments: [
        {
          id: 'att-001',
          name: 'settlement-draft-v3.pdf',
          type: 'application/pdf',
          size: 2457600,
          url: '/attachments/settlement-draft-v3.pdf'
        }
      ],
      aiInsights: [
        {
          id: 'insight-001',
          type: 'deadline_mentioned',
          title: 'Deadline Alert',
          description: 'Settlement deadline mentioned for next week',
          confidence: 95,
          suggestedActions: [
            'Review settlement terms',
            'Schedule client meeting',
            'Prepare final documentation'
          ],
          extractedData: {
            deadline: 'next week',
            case: 'Johnson Settlement',
            action: 'finalize terms'
          }
        },
        {
          id: 'insight-002',
          type: 'urgency_detection',
          title: 'High Urgency Detected',
          description: 'Message contains urgent language and deadline pressure',
          confidence: 92,
          suggestedActions: [
            'Prioritize response',
            'Set reminder for follow-up'
          ],
          extractedData: {
            urgencyWords: ['urgent', 'deadline approaching'],
            timeframe: 'next week'
          }
        }
      ],
      responseStatus: 'pending',
      tags: ['settlement', 'deadline', 'johnson']
    },
    {
      id: 'msg-002',
      channelId: 'slack-main',
      channelType: 'slack',
      body: '@channel - Quick update on the Williams case depositions scheduled for tomorrow. Conference room B is booked.',
      sender: {
        name: 'Paralegal Mike',
        avatar: '👨‍💼'
      },
      recipients: [
        { name: 'Team Channel' }
      ],
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      isRead: true,
      isUrgent: false,
      priority: 'medium',
      caseId: 'case-002',
      attachments: [],
      aiInsights: [
        {
          id: 'insight-003',
          type: 'action_required',
          title: 'Team Notification',
          description: 'Information about upcoming depositions and room booking',
          confidence: 88,
          suggestedActions: [
            'Confirm attendance',
            'Prepare deposition materials'
          ],
          extractedData: {
            event: 'depositions',
            date: 'tomorrow',
            location: 'Conference room B',
            case: 'Williams'
          }
        }
      ],
      responseStatus: 'replied',
      tags: ['williams', 'depositions', 'team']
    },
    {
      id: 'msg-003',
      channelId: 'phone-main',
      channelType: 'phone',
      body: 'Missed call from client regarding urgent matter',
      sender: {
        name: 'Robert Chen',
        phone: '+1-555-0123',
        avatar: '📞'
      },
      recipients: [
        { name: 'Attorney Smith', phone: '+1-555-0456' }
      ],
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      isUrgent: true,
      priority: 'high',
      caseId: 'case-003',
      attachments: [],
      aiInsights: [
        {
          id: 'insight-004',
          type: 'client_sentiment',
          title: 'Client Urgency',
          description: 'Client attempted contact regarding urgent matter',
          confidence: 85,
          suggestedActions: [
            'Return call immediately',
            'Check case status for updates'
          ],
          extractedData: {
            callType: 'missed',
            urgency: 'urgent matter',
            clientName: 'Robert Chen'
          }
        }
      ],
      responseStatus: 'pending',
      tags: ['missed_call', 'urgent', 'client']
    }
  ]);

  const [platformMetrics] = useState({
    totalChannels: 4,
    connectedChannels: 4,
    totalMessages: 2760,
    unreadMessages: 45,
    avgResponseTime: 16, // minutes
    responseRate: 89, // percentage
    urgentMessages: 13,
    automationRate: 67 // percentage
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'slack': return '💬';
      case 'teams': return '👥';
      case 'discord': return '🎮';
      case 'zoom': return '📹';
      case 'phone': return '📞';
      case 'sms': return '💬';
      case 'whatsapp': return '💚';
      case 'telegram': return '✈️';
      default: return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20';
      case 'disconnected': return 'text-gray-400 bg-gray-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      case 'syncing': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  };

  const getFilteredMessages = () => {
    switch (messageFilter) {
      case 'unread': return unifiedMessages.filter(m => !m.isRead);
      case 'urgent': return unifiedMessages.filter(m => m.isUrgent);
      case 'pending': return unifiedMessages.filter(m => m.responseStatus === 'pending');
      default: return unifiedMessages;
    }
  };

  const weeklyMessageData = [
    { day: 'Mon', email: 45, slack: 67, teams: 23, phone: 12 },
    { day: 'Tue', email: 52, slack: 71, teams: 19, phone: 15 },
    { day: 'Wed', email: 38, slack: 54, teams: 16, phone: 8 },
    { day: 'Thu', email: 61, slack: 78, teams: 28, phone: 18 },
    { day: 'Fri', email: 48, slack: 65, teams: 22, phone: 14 },
    { day: 'Sat', email: 15, slack: 23, teams: 5, phone: 3 },
    { day: 'Sun', email: 8, slack: 12, teams: 2, phone: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Communication Platform Integration</h2>
        <div className="flex space-x-2">
          {(['channels', 'messages', 'analytics', 'automation'] as const).map((mode) => (
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <TeslaMetric
          label="Total Channels"
          value={platformMetrics.totalChannels.toString()}
          icon="🔗"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="Connected"
          value={platformMetrics.connectedChannels.toString()}
          icon="✅"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Total Messages"
          value={platformMetrics.totalMessages.toLocaleString()}
          icon="💬"
          color="purple"
          trend="up"
        />
        <TeslaMetric
          label="Unread"
          value={platformMetrics.unreadMessages.toString()}
          icon="🔔"
          color="orange"
          trend="down"
        />
        <TeslaMetric
          label="Avg Response"
          value={formatResponseTime(platformMetrics.avgResponseTime)}
          icon="⚡"
          color="red"
          trend="down"
        />
        <TeslaMetric
          label="Automation Rate"
          value={`${platformMetrics.automationRate}%`}
          icon="🤖"
          color="green"
          trend="up"
        />
      </div>

      {viewMode === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel List */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Communication Channels</h3>
            <div className="space-y-4">
              {communicationChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedChannel === channel.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700/50 hover:border-blue-500/50 bg-gray-800/30'
                  }`}
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getChannelIcon(channel.type)}</div>
                      <div>
                        <h4 className="text-white font-medium">{channel.name}</h4>
                        <div className="text-sm text-gray-400">{channel.type.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(channel.status)}`}>
                        {channel.status.toUpperCase()}
                      </span>
                      {channel.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Messages:</span>
                      <span className="text-white ml-2">{channel.messagesCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Unread:</span>
                      <span className="text-white ml-2">{channel.unreadCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Response Rate:</span>
                      <span className="text-white ml-2">{channel.responseRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Response:</span>
                      <span className="text-white ml-2">{formatResponseTime(channel.avgResponseTime)}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Health</span>
                      <span className="text-xs text-gray-300">{channel.integrationHealth}%</span>
                    </div>
                    <TeslaProgressBar value={channel.integrationHealth} size="sm" />
                  </div>

                  {channel.unreadCount > 0 && (
                    <div className="mt-2 text-xs text-blue-400">
                      📬 {channel.unreadCount} new messages
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex space-x-2">
              <TeslaButton variant="primary" size="sm">
                ➕ Add Channel
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm">
                🔄 Sync All
              </TeslaButton>
            </div>
          </TeslaCard>

          {/* Channel Details */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Channel Configuration</h3>
            {(() => {
              const channel = communicationChannels.find(c => c.id === selectedChannel);
              if (!channel) {
                return (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔗</div>
                    <div className="text-gray-400">Select a channel to view configuration</div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getChannelIcon(channel.type)}</div>
                    <h4 className="text-white font-medium">{channel.name}</h4>
                    <div className="text-sm text-gray-400">{channel.type.toUpperCase()}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(channel.status)}`}>
                        {channel.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Sync:</span>
                      <span className="text-white">{channel.lastSyncAt.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto Sync:</span>
                      <div className={`w-8 h-4 rounded-full ${channel.autoSync ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${channel.autoSync ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Notifications:</span>
                      <div className={`w-8 h-4 rounded-full ${channel.notifications ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${channel.notifications ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto Create Tasks:</span>
                      <div className={`w-8 h-4 rounded-full ${channel.settings.autoCreateTasks ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${channel.settings.autoCreateTasks ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                      </div>
                    </div>
                  </div>

                  {channel.credentials.expiresAt && (
                    <TeslaAlert
                      type="warning"
                      title="Credentials Expiring"
                      children={
                        <div className="text-sm">
                          Expires: {channel.credentials.expiresAt.toLocaleDateString()}
                        </div>
                      }
                    />
                  )}

                  {channel.settings.urgentKeywords.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Urgent Keywords</h5>
                      <div className="flex flex-wrap gap-1">
                        {channel.settings.urgentKeywords.map(keyword => (
                          <span key={keyword} className="px-2 py-1 bg-red-500/20 text-xs text-red-400 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {channel.settings.rules.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Automation Rules</h5>
                      <div className="text-sm text-blue-400">
                        🤖 {channel.settings.rules.filter(r => r.enabled).length} active rules
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <TeslaButton variant="primary" size="sm">
                      ⚙️ Configure
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      📊 Analytics
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      🔄 Sync
                    </TeslaButton>
                  </div>
                </div>
              );
            })()}
          </TeslaCard>
        </div>
      )}

      {viewMode === 'messages' && (
        <div className="space-y-6">
          {/* Message Filters */}
          <TeslaCard>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Unified Message Center</h3>
              <div className="flex space-x-2">
                {(['all', 'unread', 'urgent', 'pending'] as const).map((filter) => (
                  <TeslaButton
                    key={filter}
                    variant={messageFilter === filter ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setMessageFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </TeslaButton>
                ))}
              </div>
            </div>
          </TeslaCard>

          {/* Message List */}
          <TeslaCard>
            <div className="space-y-4">
              {getFilteredMessages().map((message) => (
                <div key={message.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{getChannelIcon(message.channelType)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium">
                            {message.subject || `${message.channelType.toUpperCase()} Message`}
                          </h4>
                          <div className="text-sm text-gray-400">
                            From: {message.sender.name}
                            {message.sender.email && ` (${message.sender.email})`}
                            {message.sender.phone && ` (${message.sender.phone})`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(message.priority)}`}>
                            {message.priority.toUpperCase()}
                          </span>
                          {message.isUrgent && (
                            <span className="px-2 py-1 bg-red-500/20 text-xs text-red-400 rounded">
                              URGENT
                            </span>
                          )}
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-300 mb-3">
                        {message.body.length > 150 ? `${message.body.substring(0, 150)}...` : message.body}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                        <span>📅 {message.timestamp.toLocaleString()}</span>
                        {message.caseId && <span>📁 Case: {message.caseId}</span>}
                        {message.attachments.length > 0 && (
                          <span>📎 {message.attachments.length} attachments</span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          message.responseStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          message.responseStatus === 'replied' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {message.responseStatus.toUpperCase()}
                        </span>
                      </div>

                      {message.aiInsights.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs text-blue-400 mb-1">🤖 AI Insights</h5>
                          <div className="space-y-1">
                            {message.aiInsights.slice(0, 2).map(insight => (
                              <div key={insight.id} className="text-xs bg-blue-500/10 p-2 rounded border border-blue-500/30">
                                <div className="text-blue-400 font-medium">{insight.title}</div>
                                <div className="text-gray-300">{insight.description}</div>
                                {insight.suggestedActions.length > 0 && (
                                  <div className="text-blue-400 mt-1">
                                    💡 {insight.suggestedActions[0]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {message.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <TeslaButton variant="primary" size="sm">
                          💬 Reply
                        </TeslaButton>
                        <TeslaButton variant="secondary" size="sm">
                          📋 Create Task
                        </TeslaButton>
                        <TeslaButton variant="secondary" size="sm">
                          📁 Link to Case
                        </TeslaButton>
                        {!message.isRead && (
                          <TeslaButton variant="secondary" size="sm">
                            ✅ Mark Read
                          </TeslaButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Weekly Communication Activity */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Communication Activity</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyMessageData}
                dataKeys={['email', 'slack', 'teams', 'phone']}
                colors={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Email</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Slack</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Teams</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Phone</span>
              </div>
            </div>
          </TeslaCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Analytics */}
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Response Time by Channel</h3>
              <div className="space-y-3">
                {communicationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getChannelIcon(channel.type)}</span>
                      <span className="text-white">{channel.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TeslaProgressBar value={Math.max(0, 100 - channel.avgResponseTime)} size="sm" />
                      <span className="text-blue-400 text-sm w-16">{formatResponseTime(channel.avgResponseTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TeslaCard>

            {/* Communication Efficiency */}
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <TeslaGauge value={platformMetrics.responseRate} />
                  <div className="text-sm text-gray-400 mt-2">Overall Response Rate</div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { metric: 'Message Processing', score: 94 },
                    { metric: 'Auto-categorization', score: 88 },
                    { metric: 'Urgent Detection', score: 92 },
                    { metric: 'Integration Health', score: 87 }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between">
                      <span className="text-gray-300">{item.metric}</span>
                      <div className="flex items-center space-x-2">
                        <TeslaProgressBar value={item.score} size="sm" />
                        <span className="text-white text-sm w-8">{item.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>
          </div>
        </div>
      )}

      {viewMode === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Automation Rules */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Communication Automation</h3>
            <div className="space-y-4">
              {communicationChannels.flatMap(c => c.settings.rules).map((rule) => (
                <div key={rule.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{rule.name}</h4>
                      <div className="text-sm text-gray-400">
                        Trigger: {rule.trigger.replace('_', ' ')}
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <span className="text-white ml-2">{rule.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Actions:</span>
                      <div className="ml-2">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="text-gray-300">
                            • {action.type.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <TeslaButton variant="primary" size="md">
                ➕ Create New Rule
              </TeslaButton>
            </div>
          </TeslaCard>

          {/* Automation Performance */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Automation Impact</h3>
            <div className="space-y-4">
              <TeslaAlert
                type="success"
                title="High Automation Efficiency"
                children={
                  <p className="text-sm text-gray-300">
                    67% of communication tasks are now automated, saving an average of 3.2 hours per day.
                  </p>
                }
              />
              
              <div className="space-y-3">
                {[
                  { process: 'Auto-task creation', rate: 78, saved: '68min/day' },
                  { process: 'Message categorization', rate: 85, saved: '42min/day' },
                  { process: 'Urgent detection', rate: 92, saved: '23min/day' },
                  { process: 'Response routing', rate: 71, saved: '35min/day' }
                ].map((item) => (
                  <div key={item.process} className="p-3 bg-gray-800/30 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{item.process}</span>
                      <span className="text-green-400 text-sm">{item.saved}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TeslaProgressBar value={item.rate} size="sm" />
                      <span className="text-blue-400 text-sm">{item.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-400 mb-2">🎯 This Month's Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Messages processed</span>
                    <span className="text-blue-400">2,760</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tasks auto-created</span>
                    <span className="text-blue-400">84</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Time saved</span>
                    <span className="text-blue-400">96.4 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Urgent alerts</span>
                    <span className="text-blue-400">13</span>
                  </div>
                </div>
              </div>
            </div>
          </TeslaCard>
        </div>
      )}
    </div>
  );
}
