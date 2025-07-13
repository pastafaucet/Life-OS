'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';

interface Meeting {
  id: string;
  title: string;
  type: 'client' | 'court' | 'deposition' | 'internal' | 'consultation' | 'mediation';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  attendees: Attendee[];
  location: {
    type: 'office' | 'courthouse' | 'client' | 'remote' | 'unknown';
    address?: string;
    travelTime?: number; // minutes
    coordinates?: { lat: number; lng: number };
  };
  case?: {
    id: string;
    title: string;
    status: string;
  };
  agenda: AgendaItem[];
  requiredDocuments: Document[];
  preparationTasks: PreparationTask[];
  automationStatus: {
    documentsGathered: boolean;
    agendaPrepared: boolean;
    travelArranged: boolean;
    remindersSent: boolean;
    materialsReviewed: boolean;
  };
  riskFactors: RiskFactor[];
  aiInsights: AIInsight[];
}

interface Attendee {
  id: string;
  name: string;
  role: 'client' | 'opposing_counsel' | 'judge' | 'witness' | 'colleague' | 'expert';
  email: string;
  phone?: string;
  organization?: string;
  confirmed: boolean;
  preparationNotes?: string;
}

interface AgendaItem {
  id: string;
  topic: string;
  description: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  presenter?: string;
  requiredDocuments: string[];
  notes?: string;
}

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'motion' | 'evidence' | 'correspondence' | 'research' | 'exhibits';
  status: 'available' | 'pending' | 'missing' | 'outdated';
  lastUpdated: Date;
  relevance: number; // 0-100
  source: string;
  pages?: number;
  confidentiality: 'public' | 'confidential' | 'privileged';
}

interface PreparationTask {
  id: string;
  title: string;
  description: string;
  type: 'research' | 'document_review' | 'strategy' | 'logistics' | 'communication';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dueTime: Date;
  dependencies: string[];
  assignedTo?: string;
  completedAt?: Date;
  aiGenerated: boolean;
}

interface RiskFactor {
  id: string;
  category: 'time' | 'preparation' | 'logistics' | 'communication' | 'legal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation: string;
  probability: number; // 0-100
  detectedAt: Date;
}

interface AIInsight {
  id: string;
  type: 'preparation_suggestion' | 'risk_warning' | 'optimization' | 'strategy_tip' | 'efficiency_improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number; // 0-100
  basedOn: string[];
  estimatedImpact: string;
}

export function TeslaMeetingPreparationAutomation() {
  const [viewMode, setViewMode] = useState<'upcoming' | 'preparation' | 'automation' | 'insights'>('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  
  const [upcomingMeetings] = useState<Meeting[]>([
    {
      id: 'meeting-001',
      title: 'Johnson v. Smith Case Strategy Review',
      type: 'client',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      duration: 60,
      attendees: [
        {
          id: 'att-001',
          name: 'John Johnson',
          role: 'client',
          email: 'john.johnson@email.com',
          phone: '+1-555-0123',
          confirmed: true,
          preparationNotes: 'Review settlement options'
        },
        {
          id: 'att-002',
          name: 'Sarah Wilson',
          role: 'colleague',
          email: 'sarah.wilson@firm.com',
          confirmed: true,
          preparationNotes: 'Financial analysis expert'
        }
      ],
      location: {
        type: 'office',
        address: '123 Law Building, Suite 500',
        travelTime: 0
      },
      case: {
        id: 'case-001',
        title: 'Johnson v. Smith Contract Dispute',
        status: 'discovery'
      },
      agenda: [
        {
          id: 'agenda-001',
          topic: 'Case Status Update',
          description: 'Review current discovery progress and timeline',
          estimatedMinutes: 15,
          priority: 'high',
          presenter: 'Attorney',
          requiredDocuments: ['discovery_log', 'timeline']
        },
        {
          id: 'agenda-002',
          topic: 'Settlement Discussion',
          description: 'Explore potential settlement scenarios',
          estimatedMinutes: 30,
          priority: 'high',
          presenter: 'Attorney',
          requiredDocuments: ['financial_analysis', 'comparable_cases']
        },
        {
          id: 'agenda-003',
          topic: 'Next Steps Planning',
          description: 'Plan upcoming depositions and motions',
          estimatedMinutes: 15,
          priority: 'medium',
          presenter: 'Sarah Wilson',
          requiredDocuments: ['deposition_schedule', 'motion_calendar']
        }
      ],
      requiredDocuments: [
        {
          id: 'doc-001',
          title: 'Discovery Log & Timeline',
          type: 'research',
          status: 'available',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
          relevance: 95,
          source: 'Case Management System',
          pages: 8,
          confidentiality: 'confidential'
        },
        {
          id: 'doc-002',
          title: 'Financial Analysis Report',
          type: 'research',
          status: 'available',
          lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
          relevance: 90,
          source: 'Sarah Wilson',
          pages: 15,
          confidentiality: 'confidential'
        },
        {
          id: 'doc-003',
          title: 'Comparable Settlement Cases',
          type: 'research',
          status: 'pending',
          lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000),
          relevance: 85,
          source: 'Legal Research Database',
          pages: 25,
          confidentiality: 'public'
        }
      ],
      preparationTasks: [
        {
          id: 'task-001',
          title: 'Review client file and recent correspondence',
          description: 'Thoroughly review all recent communications and case developments',
          type: 'document_review',
          priority: 'critical',
          estimatedMinutes: 30,
          status: 'completed',
          dueTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
          dependencies: [],
          completedAt: new Date(Date.now() - 30 * 60 * 1000),
          aiGenerated: true
        },
        {
          id: 'task-002',
          title: 'Prepare settlement range analysis',
          description: 'Calculate potential settlement ranges based on comparable cases',
          type: 'research',
          priority: 'high',
          estimatedMinutes: 45,
          status: 'in_progress',
          dueTime: new Date(Date.now() + 90 * 60 * 1000),
          dependencies: ['task-001'],
          aiGenerated: true
        },
        {
          id: 'task-003',
          title: 'Confirm attendee availability and send agenda',
          description: 'Final confirmation with all attendees and distribute meeting materials',
          type: 'communication',
          priority: 'medium',
          estimatedMinutes: 15,
          status: 'not_started',
          dueTime: new Date(Date.now() + 60 * 60 * 1000),
          dependencies: [],
          aiGenerated: false
        }
      ],
      automationStatus: {
        documentsGathered: true,
        agendaPrepared: true,
        travelArranged: true,
        remindersSent: false,
        materialsReviewed: true
      },
      riskFactors: [
        {
          id: 'risk-001',
          category: 'preparation',
          severity: 'medium',
          description: 'Comparable cases research still pending',
          impact: 'May affect settlement negotiation strategy',
          mitigation: 'Use preliminary data and confirm post-meeting',
          probability: 70,
          detectedAt: new Date(Date.now() - 60 * 60 * 1000)
        }
      ],
      aiInsights: [
        {
          id: 'insight-001',
          type: 'strategy_tip',
          priority: 'high',
          title: 'Client Likely Open to Settlement',
          description: 'Based on recent communications patterns, client shows 85% probability of settlement acceptance',
          actionable: true,
          confidence: 85,
          basedOn: ['communication_analysis', 'sentiment_analysis', 'historical_patterns'],
          estimatedImpact: 'Could reduce case timeline by 6-8 months'
        },
        {
          id: 'insight-002',
          type: 'efficiency_improvement',
          priority: 'medium',
          title: 'Optimize Meeting Duration',
          description: 'Similar meetings historically run 23% over time. Consider 75-minute booking.',
          actionable: true,
          confidence: 78,
          basedOn: ['historical_meeting_data', 'agenda_complexity_analysis'],
          estimatedImpact: 'Prevent schedule conflicts and improve efficiency'
        }
      ]
    },
    {
      id: 'meeting-002',
      title: 'Williams Case Deposition Prep',
      type: 'deposition',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      duration: 60,
      attendees: [
        {
          id: 'att-003',
          name: 'Dr. Michael Williams',
          role: 'witness',
          email: 'mwilliams@hospital.com',
          confirmed: false,
          preparationNotes: 'Medical expert witness - needs technical briefing'
        }
      ],
      location: {
        type: 'office',
        address: '123 Law Building, Conference Room A'
      },
      agenda: [
        {
          id: 'agenda-004',
          topic: 'Deposition Question Review',
          description: 'Go through planned questions and potential follow-ups',
          estimatedMinutes: 45,
          priority: 'high',
          requiredDocuments: ['question_outline', 'medical_records']
        }
      ],
      requiredDocuments: [
        {
          id: 'doc-004',
          title: 'Medical Records Summary',
          type: 'evidence',
          status: 'available',
          lastUpdated: new Date(),
          relevance: 100,
          source: 'Hospital Records',
          confidentiality: 'privileged'
        }
      ],
      preparationTasks: [
        {
          id: 'task-004',
          title: 'Review medical terminology and procedures',
          description: 'Ensure familiarity with medical concepts that will be discussed',
          type: 'research',
          priority: 'high',
          estimatedMinutes: 60,
          status: 'not_started',
          dueTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
          dependencies: [],
          aiGenerated: true
        }
      ],
      automationStatus: {
        documentsGathered: true,
        agendaPrepared: false,
        travelArranged: true,
        remindersSent: false,
        materialsReviewed: false
      },
      riskFactors: [
        {
          id: 'risk-002',
          category: 'communication',
          severity: 'medium',
          description: 'Witness confirmation pending',
          impact: 'May need to reschedule if witness unavailable',
          mitigation: 'Follow up with direct phone call',
          probability: 40,
          detectedAt: new Date()
        }
      ],
      aiInsights: [
        {
          id: 'insight-003',
          type: 'preparation_suggestion',
          priority: 'high',
          title: 'Focus on Technical Accuracy',
          description: 'Medical expert witnesses require precise technical questions. Review medical literature.',
          actionable: true,
          confidence: 92,
          basedOn: ['expert_witness_best_practices', 'case_type_analysis'],
          estimatedImpact: 'Improved deposition quality and case strength'
        }
      ]
    }
  ]);

  const [automationMetrics] = useState({
    tasksAutomated: 85,
    preparationEfficiency: 73,
    riskReduction: 92,
    timesSaved: 156 // minutes per week
  });

  const getCurrentMeeting = () => {
    return upcomingMeetings.find(m => m.id === selectedMeeting) || upcomingMeetings[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'not_started': return 'text-gray-400 bg-gray-500/20';
      case 'blocked': return 'text-red-400 bg-red-500/20';
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'missing': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'client': return '👤';
      case 'court': return '⚖️';
      case 'deposition': return '📝';
      case 'internal': return '🏢';
      case 'consultation': return '💬';
      case 'mediation': return '🤝';
      default: return '📅';
    }
  };

  const formatTimeUntil = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const weeklyPreparationData = [
    { day: 'Mon', automated: 85, manual: 45, efficiency: 88 },
    { day: 'Tue', automated: 92, manual: 38, efficiency: 90 },
    { day: 'Wed', automated: 78, manual: 52, efficiency: 82 },
    { day: 'Thu', automated: 88, manual: 42, efficiency: 89 },
    { day: 'Fri', automated: 95, manual: 35, efficiency: 93 },
    { day: 'Sat', automated: 60, manual: 20, efficiency: 85 },
    { day: 'Sun', automated: 40, manual: 15, efficiency: 80 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Meeting Preparation Automation</h2>
        <div className="flex space-x-2">
          {(['upcoming', 'preparation', 'automation', 'insights'] as const).map((mode) => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TeslaMetric
          label="Tasks Automated"
          value="85%"
          icon="🤖"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="Prep Efficiency"
          value="73%"
          icon="⚡"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Risk Reduction"
          value="92%"
          icon="🛡️"
          color="purple"
          trend="up"
        />
        <TeslaMetric
          label="Time Saved"
          value="156min/wk"
          icon="⏰"
          color="orange"
          trend="up"
        />
      </div>

      {viewMode === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Meetings</h3>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  className={`p-4 bg-gray-800/30 rounded-lg border cursor-pointer transition-colors ${
                    selectedMeeting === meeting.id ? 'border-blue-500' : 'border-gray-700/50 hover:border-blue-500/50'
                  }`}
                  onClick={() => setSelectedMeeting(meeting.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getMeetingTypeIcon(meeting.type)}</span>
                      <div>
                        <h4 className="text-white font-medium">{meeting.title}</h4>
                        <div className="text-sm text-gray-400">
                          {meeting.startTime.toLocaleDateString()} • {meeting.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-400">
                        in {formatTimeUntil(meeting.startTime)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {meeting.duration}min • {meeting.attendees.length} attendees
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {Object.entries(meeting.automationStatus).map(([key, completed]) => (
                        <div 
                          key={key}
                          className={`w-2 h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-600'}`}
                          title={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        ></div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      {meeting.riskFactors.length > 0 && (
                        <span className="text-xs text-orange-400">
                          ⚠️ {meeting.riskFactors.length} risks
                        </span>
                      )}
                      <span className="text-xs text-blue-400">
                        💡 {meeting.aiInsights.length} insights
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TeslaCard>

          {/* Meeting Quick Overview */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Meeting Overview</h3>
            {(() => {
              const meeting = getCurrentMeeting();
              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getMeetingTypeIcon(meeting.type)}</div>
                    <h4 className="text-white font-medium">{meeting.title}</h4>
                    <div className="text-sm text-gray-400">
                      {meeting.startTime.toLocaleDateString()} • {meeting.duration} minutes
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Preparation Status</div>
                      <div className="space-y-1">
                        {Object.entries(meeting.automationStatus).map(([key, status]) => (
                          <div key={key} className="flex items-center space-x-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                            <span className={status ? 'text-green-400' : 'text-gray-400'}>
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Key Stats</div>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-300">📋 {meeting.agenda.length} agenda items</div>
                        <div className="text-gray-300">📄 {meeting.requiredDocuments.length} documents</div>
                        <div className="text-gray-300">✅ {meeting.preparationTasks.filter(t => t.status === 'completed').length}/{meeting.preparationTasks.length} tasks done</div>
                        <div className="text-gray-300">👥 {meeting.attendees.length} attendees</div>
                      </div>
                    </div>
                  </div>

                  {meeting.riskFactors.length > 0 && (
                    <TeslaAlert
                      type="warning"
                      title={`${meeting.riskFactors.length} Risk Factor${meeting.riskFactors.length > 1 ? 's' : ''} Detected`}
                      children={
                        <div className="text-sm">
                          {meeting.riskFactors[0].description}
                          {meeting.riskFactors.length > 1 && ` and ${meeting.riskFactors.length - 1} more`}
                        </div>
                      }
                    />
                  )}

                  {meeting.aiInsights.length > 0 && (
                    <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                      <h5 className="text-blue-400 font-medium text-sm mb-1">💡 AI Insight</h5>
                      <p className="text-xs text-gray-300">
                        {meeting.aiInsights[0].description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </TeslaCard>
        </div>
      )}

      {viewMode === 'preparation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preparation Tasks */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Preparation Tasks</h3>
            {(() => {
              const meeting = getCurrentMeeting();
              const tasksByPriority = meeting.preparationTasks.sort((a, b) => {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                       (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
              });

              return (
                <div className="space-y-3">
                  {tasksByPriority.map((task) => (
                    <div 
                      key={task.id}
                      className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-white font-medium text-sm">{task.title}</h5>
                            {task.aiGenerated && (
                              <span className="text-xs text-blue-400 bg-blue-500/20 px-1 rounded">AI</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300">{task.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>⏱️ {task.estimatedMinutes}min</span>
                        <span>📅 Due: {task.dueTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {task.dependencies.length > 0 && (
                          <span>🔗 {task.dependencies.length} dependencies</span>
                        )}
                      </div>

                      {task.status === 'completed' && task.completedAt && (
                        <div className="mt-2 text-xs text-green-400">
                          ✅ Completed {task.completedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-4 flex space-x-2">
                    <TeslaButton variant="primary" size="sm">
                      🤖 Generate More Tasks
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      ✅ Mark Complete
                    </TeslaButton>
                  </div>
                </div>
              );
            })()}
          </TeslaCard>

          {/* Documents & Agenda */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Documents & Agenda</h3>
            {(() => {
              const meeting = getCurrentMeeting();
              return (
                <div className="space-y-4">
                  {/* Required Documents */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Required Documents</h4>
                    <div className="space-y-2">
                      {meeting.requiredDocuments.map((doc) => (
                        <div 
                          key={doc.id}
                          className="p-2 bg-gray-800/30 rounded border border-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white font-medium">{doc.title}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {doc.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>📁 {doc.type} • Relevance: {doc.relevance}%</span>
                            {doc.pages && <span>📄 {doc.pages} pages</span>}
                            <span className={`px-1 rounded ${
                              doc.confidentiality === 'privileged' ? 'text-red-400 bg-red-500/20' :
                              doc.confidentiality === 'confidential' ? 'text-yellow-400 bg-yellow-500/20' :
                              'text-green-400 bg-green-500/20'
                            }`}>
                              {doc.confidentiality}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meeting Agenda */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Meeting Agenda</h4>
                    <div className="space-y-2">
                      {meeting.agenda.map((item, index) => (
                        <div 
                          key={item.id}
                          className="p-2 bg-gray-800/30 rounded border border-gray-700/50"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">#{index + 1}</span>
                                <span className="text-sm text-white font-medium">{item.topic}</span>
                                <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                                  {item.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300 mt-1">{item.description}</p>
                            </div>
                            <span className="text-xs text-blue-400">{item.estimatedMinutes}min</span>
                          </div>
                          {item.presenter && (
                            <div className="text-xs text-gray-400">👤 Presenter: {item.presenter}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <TeslaButton variant="primary" size="sm">
                      📋 Auto-Generate Agenda
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      📤 Send to Attendees
                    </TeslaButton>
                  </div>
                </div>
              );
            })()}
          </TeslaCard>
        </div>
      )}

      {viewMode === 'automation' && (
        <div className="space-y-6">
          {/* Automation Performance */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Automation Performance</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyPreparationData}
                dataKeys={['automated', 'manual', 'efficiency']}
                colors={['#10B981', '#6B7280', '#3B82F6']}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Automated Tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Manual Tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Efficiency %</span>
              </div>
            </div>
          </TeslaCard>

          {/* Automation Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Automation Settings</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Task Generation</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Auto-generate prep tasks', enabled: true },
                      { name: 'Smart document gathering', enabled: true },
                      { name: 'Agenda optimization', enabled: true },
                      { name: 'Risk factor detection', enabled: true },
                      { name: 'Travel time calculation', enabled: false }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                        <span className="text-sm text-gray-300">{setting.name}</span>
                        <div className={`w-8 h-4 rounded-full ${setting.enabled ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${setting.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Notification Timing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                      <span className="text-gray-300">Final reminder</span>
                      <span className="text-blue-400">30 minutes before</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                      <span className="text-gray-300">Preparation deadline</span>
                      <span className="text-blue-400">2 hours before</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                      <span className="text-gray-300">Initial setup</span>
                      <span className="text-blue-400">24 hours before</span>
                    </div>
                  </div>
                </div>
              </div>
            </TeslaCard>

            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Automation Insights</h3>
              <div className="space-y-4">
                <TeslaAlert
                  type="success"
                  title="High Automation Success Rate"
                  children={
                    <p className="text-sm text-gray-300">
                      85% of preparation tasks are now automated, saving an average of 156 minutes per week.
                    </p>
                  }
                />
                
                <TeslaAlert
                  type="info"
                  title="Optimization Opportunity"
                  children={
                    <p className="text-sm text-gray-300">
                      Enable travel time calculation to automatically adjust meeting schedules based on location.
                    </p>
                  }
                />
                
                <TeslaAlert
                  type="warning"
                  title="Manual Override Recommended"
                  children={
                    <p className="text-sm text-gray-300">
                      Complex depositions require manual agenda review. Consider hybrid automation for these cases.
                    </p>
                  }
                />
                
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h4 className="font-medium text-purple-400 mb-2">🎯 This Week's Impact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tasks automated</span>
                      <span className="text-purple-400">47 tasks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Time saved</span>
                      <span className="text-purple-400">3.2 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risks prevented</span>
                      <span className="text-purple-400">5 issues</span>
                    </div>
                  </div>
                </div>
              </div>
            </TeslaCard>
          </div>
        </div>
      )}

      {viewMode === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Insights</h3>
            {(() => {
              const meeting = getCurrentMeeting();
              return (
                <div className="space-y-4">
                  {meeting.aiInsights.map((insight) => (
                    <div 
                      key={insight.id}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium">{insight.title}</h4>
                          <span className={`text-xs ${getPriorityColor(insight.priority)}`}>
                            {insight.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-400">{insight.confidence}% confident</span>
                          {insight.actionable && (
                            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                              Actionable
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="text-gray-400">
                          <span className="font-medium">Based on:</span> {insight.basedOn.join(', ')}
                        </div>
                        <div className="text-blue-300">
                          <span className="font-medium">Expected impact:</span> {insight.estimatedImpact}
                        </div>
                      </div>
                      
                      {insight.actionable && (
                        <div className="mt-3">
                          <TeslaButton variant="primary" size="sm">
                            ✨ Apply Suggestion
                          </TeslaButton>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </TeslaCard>

          {/* Risk Factors */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            {(() => {
              const meeting = getCurrentMeeting();
              return (
                <div className="space-y-4">
                  {meeting.riskFactors.map((risk) => (
                    <div 
                      key={risk.id}
                      className={`p-4 rounded-lg border ${getRiskSeverityColor(risk.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium">{risk.category.replace('_', ' ').toUpperCase()}</h4>
                          <span className={`text-xs font-medium ${
                            risk.severity === 'critical' ? 'text-red-400' :
                            risk.severity === 'high' ? 'text-orange-400' :
                            risk.severity === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {risk.severity.toUpperCase()} SEVERITY
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">{risk.probability}%</div>
                          <div className="text-xs text-gray-400">probability</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-300">Issue:</span>
                          <span className="text-gray-300 ml-2">{risk.description}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Impact:</span>
                          <span className="text-gray-300 ml-2">{risk.impact}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-300">Mitigation:</span>
                          <span className="text-gray-300 ml-2">{risk.mitigation}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <TeslaButton variant="warning" size="sm">
                          🛠️ Implement Fix
                        </TeslaButton>
                        <TeslaButton variant="secondary" size="sm">
                          👁️ Monitor
                        </TeslaButton>
                      </div>
                    </div>
                  ))}
                  
                  {meeting.riskFactors.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="text-green-400 font-medium">No Risk Factors Detected</div>
                      <div className="text-sm text-gray-400">This meeting is well-prepared and low-risk</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </TeslaCard>
        </div>
      )}
    </div>
  );
}
