'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaChart from './TeslaChart';
import TeslaMetric from './TeslaMetric';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaGauge from './TeslaGauge';
import TeslaProgressBar from './TeslaProgressBar';

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'motion' | 'correspondence' | 'research' | 'evidence' | 'pleading' | 'discovery' | 'exhibit' | 'template' | 'memo';
  status: 'draft' | 'review' | 'approved' | 'filed' | 'archived' | 'outdated';
  size: number; // bytes
  format: 'pdf' | 'docx' | 'txt' | 'xlsx' | 'pptx' | 'jpg' | 'png';
  createdAt: Date;
  modifiedAt: Date;
  version: string;
  author: string;
  tags: string[];
  caseId?: string;
  folderId: string;
  path: string;
  confidentiality: 'public' | 'confidential' | 'privileged' | 'work_product';
  checksum: string;
  ocrText?: string;
  aiInsights: AIDocumentInsight[];
  collaborators: Collaborator[];
  reviewHistory: ReviewAction[];
  linkedDocuments: string[];
  metadata: DocumentMetadata;
}

interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  type: 'case' | 'client' | 'practice_area' | 'templates' | 'archive' | 'inbox';
  documents: Document[];
  subfolders: DocumentFolder[];
  permissions: FolderPermissions;
  autoRules: AutomationRule[];
  createdAt: Date;
  color: string;
  icon: string;
}

interface AIDocumentInsight {
  id: string;
  type: 'content_summary' | 'key_dates' | 'action_items' | 'risk_analysis' | 'precedent_match' | 'compliance_check';
  title: string;
  description: string;
  confidence: number; // 0-100
  extractedData: any;
  suggestions: string[];
  createdAt: Date;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'reviewer' | 'approver' | 'owner';
  lastAccessed?: Date;
  comments: Comment[];
}

interface ReviewAction {
  id: string;
  action: 'created' | 'edited' | 'reviewed' | 'approved' | 'rejected' | 'shared' | 'archived';
  userId: string;
  userName: string;
  timestamp: Date;
  comment?: string;
  changes?: string[];
}

interface DocumentMetadata {
  jurisdiction?: string;
  court?: string;
  filingDeadline?: Date;
  caseNumber?: string;
  clientMatter?: string;
  billableHours?: number;
  costCenter?: string;
  retentionDate?: Date;
  customFields: { [key: string]: any };
}

interface FolderPermissions {
  read: string[];
  write: string[];
  admin: string[];
  autoAccess: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'document_added' | 'document_modified' | 'deadline_approaching' | 'review_requested';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
}

interface RuleAction {
  type: 'move_to_folder' | 'add_tag' | 'assign_reviewer' | 'send_notification' | 'extract_data' | 'generate_summary';
  parameters: any;
}

interface DocumentSearch {
  query: string;
  filters: {
    type?: string[];
    status?: string[];
    author?: string[];
    dateRange?: { start: Date; end: Date };
    tags?: string[];
    confidentiality?: string[];
    format?: string[];
  };
  sortBy: 'relevance' | 'date_modified' | 'date_created' | 'title' | 'size';
  sortOrder: 'asc' | 'desc';
}

export function TeslaDocumentManagement() {
  const [viewMode, setViewMode] = useState<'folders' | 'search' | 'analytics' | 'automation'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<DocumentSearch>({
    query: '',
    filters: {},
    sortBy: 'date_modified',
    sortOrder: 'desc'
  });

  const [documentFolders] = useState<DocumentFolder[]>([
    {
      id: 'inbox',
      name: 'Document Inbox',
      type: 'inbox',
      documents: [
        {
          id: 'doc-001',
          title: 'Johnson v. Smith - Settlement Agreement Draft',
          type: 'contract',
          status: 'draft',
          size: 2457600, // 2.4MB
          format: 'docx',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          modifiedAt: new Date(Date.now() - 30 * 60 * 1000),
          version: '2.1',
          author: 'Attorney Smith',
          tags: ['settlement', 'contract', 'urgent'],
          caseId: 'case-001',
          folderId: 'inbox',
          path: '/inbox/johnson-v-smith-settlement-v2.1.docx',
          confidentiality: 'confidential',
          checksum: 'abc123def456',
          ocrText: 'Settlement agreement between Johnson and Smith...',
          aiInsights: [
            {
              id: 'insight-001',
              type: 'content_summary',
              title: 'Key Settlement Terms Identified',
              description: 'Agreement includes $150K settlement with 30-day payment terms',
              confidence: 92,
              extractedData: {
                settlementAmount: '$150,000',
                paymentTerms: '30 days',
                releaseScope: 'Full and final release'
              },
              suggestions: [
                'Consider adding interest clause for late payment',
                'Verify tax implications with client',
                'Add confidentiality provisions'
              ],
              createdAt: new Date(Date.now() - 25 * 60 * 1000)
            },
            {
              id: 'insight-002',
              type: 'compliance_check',
              title: 'Document Compliance Review',
              description: 'All required settlement agreement elements present',
              confidence: 88,
              extractedData: {
                requiredElements: ['parties', 'consideration', 'release', 'signatures'],
                missingElements: [],
                complianceScore: 95
              },
              suggestions: [
                'Document meets standard settlement requirements',
                'Consider witness signature for added protection'
              ],
              createdAt: new Date(Date.now() - 20 * 60 * 1000)
            }
          ],
          collaborators: [
            {
              id: 'collab-001',
              name: 'Attorney Smith',
              email: 'smith@firm.com',
              role: 'owner',
              lastAccessed: new Date(Date.now() - 30 * 60 * 1000),
              comments: []
            },
            {
              id: 'collab-002',
              name: 'Paralegal Johnson',
              email: 'johnson@firm.com',
              role: 'editor',
              lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
              comments: []
            }
          ],
          reviewHistory: [
            {
              id: 'review-001',
              action: 'created',
              userId: 'user-001',
              userName: 'Attorney Smith',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              comment: 'Initial settlement draft based on client instructions'
            },
            {
              id: 'review-002',
              action: 'edited',
              userId: 'user-002',
              userName: 'Paralegal Johnson',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              comment: 'Updated payment terms and added compliance clauses',
              changes: ['Payment terms modified', 'Compliance section added']
            }
          ],
          linkedDocuments: ['doc-003', 'doc-004'],
          metadata: {
            jurisdiction: 'California',
            caseNumber: 'CV-2024-001',
            clientMatter: 'Johnson Contract Dispute',
            billableHours: 4.5,
            costCenter: 'Litigation',
            filingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            customFields: {
              dealValue: '$150,000',
              priority: 'High'
            }
          }
        },
        {
          id: 'doc-002',
          title: 'Williams Case - Motion to Dismiss',
          type: 'motion',
          status: 'review',
          size: 1834752, // 1.8MB
          format: 'pdf',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          version: '1.0',
          author: 'Attorney Brown',
          tags: ['motion', 'dismissal', 'williams'],
          caseId: 'case-002',
          folderId: 'inbox',
          path: '/inbox/williams-motion-to-dismiss-v1.0.pdf',
          confidentiality: 'work_product',
          checksum: 'def456ghi789',
          aiInsights: [
            {
              id: 'insight-003',
              type: 'risk_analysis',
              title: 'Motion Success Probability',
              description: 'Based on similar cases, 73% probability of success',
              confidence: 85,
              extractedData: {
                successProbability: 73,
                keyArguments: ['Lack of jurisdiction', 'Statute of limitations', 'Failure to state claim'],
                precedentCases: ['Smith v. Jones (2022)', 'Brown v. Davis (2021)']
              },
              suggestions: [
                'Strengthen jurisdiction argument with recent precedent',
                'Consider alternative venue argument',
                'Prepare response to likely counterarguments'
              ],
              createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
            }
          ],
          collaborators: [
            {
              id: 'collab-003',
              name: 'Attorney Brown',
              email: 'brown@firm.com',
              role: 'owner',
              comments: []
            }
          ],
          reviewHistory: [
            {
              id: 'review-003',
              action: 'created',
              userId: 'user-003',
              userName: 'Attorney Brown',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              comment: 'Initial motion draft completed'
            }
          ],
          linkedDocuments: [],
          metadata: {
            jurisdiction: 'Nevada',
            court: 'Clark County District Court',
            caseNumber: 'A-24-123456-C',
            filingDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            customFields: {}
          }
        }
      ],
      subfolders: [],
      permissions: {
        read: ['all'],
        write: ['attorneys', 'paralegals'],
        admin: ['partners'],
        autoAccess: true
      },
      autoRules: [
        {
          id: 'rule-001',
          name: 'Auto-categorize contracts',
          trigger: 'document_added',
          conditions: [
            { field: 'title', operator: 'contains', value: 'contract' },
            { field: 'type', operator: 'equals', value: 'contract' }
          ],
          actions: [
            { type: 'add_tag', parameters: { tag: 'contract' } },
            { type: 'move_to_folder', parameters: { folderId: 'contracts' } }
          ],
          enabled: true
        }
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      color: '#3B82F6',
      icon: '📥'
    },
    {
      id: 'contracts',
      name: 'Contracts & Agreements',
      type: 'practice_area',
      documents: [],
      subfolders: [],
      permissions: {
        read: ['all'],
        write: ['attorneys'],
        admin: ['partners'],
        autoAccess: true
      },
      autoRules: [],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      color: '#10B981',
      icon: '📋'
    },
    {
      id: 'templates',
      name: 'Document Templates',
      type: 'templates',
      documents: [],
      subfolders: [],
      permissions: {
        read: ['all'],
        write: ['attorneys', 'paralegals'],
        admin: ['partners'],
        autoAccess: true
      },
      autoRules: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      color: '#8B5CF6',
      icon: '📄'
    }
  ]);

  const [documentMetrics] = useState({
    totalDocuments: 1247,
    documentsThisWeek: 23,
    avgProcessingTime: 18, // minutes
    complianceScore: 94,
    storageUsed: 15.6, // GB
    automationRate: 78
  });

  const getCurrentFolder = () => {
    return documentFolders.find(f => f.id === selectedFolder) || documentFolders[0];
  };

  const getCurrentDocument = () => {
    const folder = getCurrentFolder();
    return folder.documents.find(d => d.id === selectedDocument);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-400 bg-yellow-500/20';
      case 'review': return 'text-blue-400 bg-blue-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'filed': return 'text-purple-400 bg-purple-500/20';
      case 'archived': return 'text-gray-400 bg-gray-500/20';
      case 'outdated': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'public': return 'text-green-400 bg-green-500/20';
      case 'confidential': return 'text-yellow-400 bg-yellow-500/20';
      case 'privileged': return 'text-red-400 bg-red-500/20';
      case 'work_product': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return '📋';
      case 'motion': return '⚖️';
      case 'correspondence': return '✉️';
      case 'research': return '🔍';
      case 'evidence': return '📊';
      case 'pleading': return '📝';
      case 'discovery': return '🔎';
      case 'exhibit': return '📑';
      case 'template': return '📄';
      case 'memo': return '📋';
      default: return '📄';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📕';
      case 'docx': return '📘';
      case 'txt': return '📄';
      case 'xlsx': return '📊';
      case 'pptx': return '📊';
      case 'jpg': case 'png': return '🖼️';
      default: return '📄';
    }
  };

  const weeklyDocumentData = [
    { day: 'Mon', created: 8, processed: 12, reviewed: 6 },
    { day: 'Tue', created: 12, processed: 15, reviewed: 9 },
    { day: 'Wed', created: 6, processed: 8, reviewed: 7 },
    { day: 'Thu', created: 15, processed: 18, reviewed: 11 },
    { day: 'Fri', created: 10, processed: 14, reviewed: 8 },
    { day: 'Sat', created: 3, processed: 5, reviewed: 2 },
    { day: 'Sun', created: 2, processed: 3, reviewed: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Document Management Integration</h2>
        <div className="flex space-x-2">
          {(['folders', 'search', 'analytics', 'automation'] as const).map((mode) => (
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
          label="Total Documents"
          value={documentMetrics.totalDocuments.toLocaleString()}
          icon="📄"
          color="blue"
          trend="up"
        />
        <TeslaMetric
          label="This Week"
          value={documentMetrics.documentsThisWeek.toString()}
          icon="📈"
          color="green"
          trend="up"
        />
        <TeslaMetric
          label="Avg Process Time"
          value={`${documentMetrics.avgProcessingTime}min`}
          icon="⚡"
          color="orange"
          trend="down"
        />
        <TeslaMetric
          label="Compliance Score"
          value={`${documentMetrics.complianceScore}%`}
          icon="🛡️"
          color="purple"
          trend="up"
        />
        <TeslaMetric
          label="Storage Used"
          value={`${documentMetrics.storageUsed}GB`}
          icon="💾"
          color="red"
          trend="up"
        />
        <TeslaMetric
          label="Automation Rate"
          value={`${documentMetrics.automationRate}%`}
          icon="🤖"
          color="green"
          trend="up"
        />
      </div>

      {viewMode === 'folders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Folder Navigation */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Folders</h3>
            <div className="space-y-2">
              {documentFolders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFolder === folder.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700/50 hover:border-blue-500/50 bg-gray-800/30'
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{folder.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{folder.name}</h4>
                      <div className="text-sm text-gray-400">
                        {folder.documents.length} documents
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: folder.color }}></div>
                  </div>
                  
                  {folder.autoRules.length > 0 && (
                    <div className="mt-2 text-xs text-blue-400">
                      🤖 {folder.autoRules.filter(r => r.enabled).length} automation rules active
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <TeslaButton variant="primary" size="sm">
                📁 New Folder
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm">
                📤 Upload
              </TeslaButton>
            </div>
          </TeslaCard>

          {/* Document List */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">
              Documents in {getCurrentFolder().name}
            </h3>
            <div className="space-y-3">
              {getCurrentFolder().documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocument === doc.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700/50 hover:border-blue-500/50 bg-gray-800/30'
                  }`}
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{getDocumentTypeIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{doc.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidentialityColor(doc.confidentiality)}`}>
                          {doc.confidentiality.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>{getFormatIcon(doc.format)} {doc.format.toUpperCase()}</span>
                        <span>📏 {formatFileSize(doc.size)}</span>
                        <span>👤 {doc.author}</span>
                        <span>📅 {doc.modifiedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {doc.aiInsights.length > 0 && (
                    <div className="mt-2 text-xs text-blue-400">
                      💡 {doc.aiInsights.length} AI insights available
                    </div>
                  )}
                  
                  {doc.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {getCurrentFolder().documents.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-gray-400">No documents in this folder</div>
                </div>
              )}
            </div>
          </TeslaCard>

          {/* Document Details */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Document Details</h3>
            {(() => {
              const doc = getCurrentDocument();
              if (!doc) {
                return (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-gray-400">Select a document to view details</div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getDocumentTypeIcon(doc.type)}</div>
                    <h4 className="text-white font-medium">{doc.title}</h4>
                    <div className="text-sm text-gray-400">v{doc.version}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white">{doc.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{formatFileSize(doc.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Author:</span>
                      <span className="text-white">{doc.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modified:</span>
                      <span className="text-white">{doc.modifiedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidentiality:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidentialityColor(doc.confidentiality)}`}>
                        {doc.confidentiality.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {doc.metadata.filingDeadline && (
                    <TeslaAlert
                      type="warning"
                      title="Filing Deadline"
                      children={
                        <div className="text-sm">
                          Due: {doc.metadata.filingDeadline.toLocaleDateString()}
                        </div>
                      }
                    />
                  )}

                  {doc.aiInsights.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">AI Insights</h5>
                      <div className="space-y-2">
                        {doc.aiInsights.map(insight => (
                          <div key={insight.id} className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                            <h6 className="text-blue-400 font-medium text-sm">{insight.title}</h6>
                            <p className="text-xs text-gray-300 mt-1">{insight.description}</p>
                            <div className="text-xs text-blue-400 mt-1">
                              {insight.confidence}% confidence
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <TeslaButton variant="primary" size="sm">
                      👁️ View
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      ✏️ Edit
                    </TeslaButton>
                    <TeslaButton variant="secondary" size="sm">
                      📤 Share
                    </TeslaButton>
                  </div>
                </div>
              );
            })()}
          </TeslaCard>
        </div>
      )}

      {viewMode === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Interface */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Search Query</label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Search documents..."
                  value={searchQuery.query}
                  onChange={(e) => setSearchQuery({...searchQuery, query: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Document Type</label>
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  <option value="">All Types</option>
                  <option value="contract">Contracts</option>
                  <option value="motion">Motions</option>
                  <option value="correspondence">Correspondence</option>
                  <option value="research">Research</option>
                  <option value="evidence">Evidence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="filed">Filed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="date"
                    className="p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                <select 
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  value={searchQuery.sortBy}
                  onChange={(e) => setSearchQuery({...searchQuery, sortBy: e.target.value as any})}
                >
                  <option value="relevance">Relevance</option>
                  <option value="date_modified">Date Modified</option>
                  <option value="date_created">Date Created</option>
                  <option value="title">Title</option>
                  <option value="size">File Size</option>
                </select>
              </div>

              <TeslaButton variant="primary" size="md">
                🔍 Search Documents
              </TeslaButton>
            </div>
          </TeslaCard>

          {/* Search Results */}
          <div className="lg:col-span-2">
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
              <div className="space-y-3">
                {documentFolders.flatMap(f => f.documents).map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{getDocumentTypeIcon(doc.type)}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{doc.title}</h4>
                        <div className="text-sm text-gray-400 mt-1">
                          {doc.ocrText && doc.ocrText.substring(0, 150)}...
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>{doc.type}</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.modifiedAt.toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-500/20 text-xs text-blue-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">95% match</div>
                        <div className="text-xs text-gray-400">Relevance score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TeslaCard>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Document Analytics */}
          <TeslaCard>
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Document Activity</h3>
            <div className="h-64">
              <TeslaChart
                data={weeklyDocumentData}
                dataKeys={['created', 'processed', 'reviewed']}
                colors={['#10B981', '#3B82F6', '#8B5CF6']}
                type="bar"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Processed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Reviewed</span>
              </div>
            </div>
          </TeslaCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Type Distribution */}
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Document Type Distribution</h3>
              <div className="space-y-3">
                {[
                  { type: 'Contracts', count: 324, percentage: 26 },
                  { type: 'Motions', count: 198, percentage: 16 },
                  { type: 'Correspondence', count: 287, percentage: 23 },
                  { type: 'Research', count: 156, percentage: 12 },
                  { type: 'Evidence', count: 143, percentage: 11 },
                  { type: 'Other', count: 139, percentage: 12 }
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white">{item.type}</span>
                      <span className="text-gray-400 text-sm">{item.count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TeslaProgressBar value={item.percentage} size="sm" />
                      <span className="text-blue-400 text-sm w-8">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </TeslaCard>

            {/* Compliance Metrics */}
            <TeslaCard>
              <h3 className="text-lg font-semibold text-white mb-4">Compliance Metrics</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <TeslaGauge value={documentMetrics.complianceScore} />
                  <div className="text-sm text-gray-400 mt-2">Overall Compliance Score</div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { metric: 'Document Retention', score: 98 },
                    { metric: 'Security Compliance', score: 95 },
                    { metric: 'Review Timeliness', score: 89 },
                    { metric: 'Version Control', score: 92 }
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
            <h3 className="text-lg font-semibold text-white mb-4">Automation Rules</h3>
            <div className="space-y-4">
              {documentFolders.flatMap(f => f.autoRules).map((rule) => (
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
                      <span className="text-gray-400">Conditions:</span>
                      <div className="ml-2">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-gray-300">
                            • {condition.field} {condition.operator} "{condition.value}"
                          </div>
                        ))}
                      </div>
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
            <h3 className="text-lg font-semibold text-white mb-4">Automation Performance</h3>
            <div className="space-y-4">
              <TeslaAlert
                type="success"
                title="High Automation Efficiency"
                children={
                  <p className="text-sm text-gray-300">
                    78% of document processing is now automated, saving an average of 2.3 hours per day.
                  </p>
                }
              />
              
              <div className="space-y-3">
                {[
                  { process: 'Auto-categorization', rate: 89, saved: '45min/day' },
                  { process: 'Compliance checking', rate: 76, saved: '32min/day' },
                  { process: 'Review routing', rate: 92, saved: '28min/day' },
                  { process: 'Metadata extraction', rate: 84, saved: '51min/day' }
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
                    <span className="text-gray-300">Documents processed</span>
                    <span className="text-blue-400">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Time saved</span>
                    <span className="text-blue-400">47.2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Errors prevented</span>
                    <span className="text-blue-400">23 issues</span>
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
