'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Users, 
  FileText, 
  Calendar, 
  Target, 
  Link, 
  Zap, 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  BookOpen,
  Eye,
  ChevronRight,
  Filter,
  Search,
  Settings
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';

interface EntityConnection {
  id: string;
  source_entity: string;
  source_id: string;
  target_entity: string;
  target_id: string;
  connection_type: 'related' | 'dependent' | 'blocking' | 'triggers' | 'suggests';
  strength: number; // 0-100
  confidence: number; // 0-100
  auto_detected: boolean;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface EntityNode {
  id: string;
  type: 'task' | 'case' | 'contact' | 'deadline' | 'note' | 'document';
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'pending' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  module: 'tasks' | 'legal' | 'contacts' | 'calendar' | 'notes';
  metadata?: Record<string, any>;
  connections: EntityConnection[];
  ai_insights?: string[];
  last_accessed?: Date;
}

interface IntelligenceInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'pattern' | 'recommendation' | 'anomaly';
  title: string;
  description: string;
  affected_entities: string[];
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions?: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface TeslaCrossModuleIntelligenceProps {
  entities: EntityNode[];
  connections: EntityConnection[];
  insights: IntelligenceInsight[];
  onEntitySelect?: (entityId: string) => void;
  onConnectionCreate?: (sourceId: string, targetId: string, type: string) => void;
  onInsightAction?: (insightId: string, action: string) => void;
  className?: string;
}

const TeslaCrossModuleIntelligence: React.FC<TeslaCrossModuleIntelligenceProps> = ({
  entities = [],
  connections = [],
  insights = [],
  onEntitySelect,
  onConnectionCreate,
  onInsightAction,
  className = ''
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'timeline' | 'matrix' | 'insights'>('network');
  const [filterType, setFilterType] = useState<'all' | 'high-impact' | 'recent' | 'actionable'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get entity icon based on type
  const getEntityIcon = (type: EntityNode['type']) => {
    switch (type) {
      case 'task': return <Target className="w-4 h-4" />;
      case 'case': return <Briefcase className="w-4 h-4" />;
      case 'contact': return <User className="w-4 h-4" />;
      case 'deadline': return <Calendar className="w-4 h-4" />;
      case 'note': return <BookOpen className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  // Get entity color based on type
  const getEntityColor = (type: EntityNode['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
      case 'case': return 'bg-purple-500/20 border-purple-500/40 text-purple-300';
      case 'contact': return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'deadline': return 'bg-red-500/20 border-red-500/40 text-red-300';
      case 'note': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      case 'document': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
      default: return 'bg-gray-500/20 border-gray-500/40 text-gray-300';
    }
  };

  // Get connection type color
  const getConnectionColor = (type: EntityConnection['connection_type']) => {
    switch (type) {
      case 'related': return 'text-blue-400';
      case 'dependent': return 'text-orange-400';
      case 'blocking': return 'text-red-400';
      case 'triggers': return 'text-purple-400';
      case 'suggests': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Get insight priority color
  const getInsightPriorityColor = (priority: IntelligenceInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/40';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  // Get entity connections
  const getEntityConnections = (entityId: string) => {
    return connections.filter(conn => 
      conn.source_id === entityId || conn.target_id === entityId
    );
  };

  // Get connected entities
  const getConnectedEntities = (entityId: string) => {
    const entityConnections = getEntityConnections(entityId);
    return entityConnections.map(conn => {
      const connectedId = conn.source_id === entityId ? conn.target_id : conn.source_id;
      return entities.find(e => e.id === connectedId);
    }).filter(Boolean);
  };

  // Filter entities based on search and filter
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = !searchTerm || 
      entity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'high-impact' && entity.priority === 'high') ||
      (filterType === 'recent' && entity.last_accessed && 
       new Date(entity.last_accessed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) ||
      (filterType === 'actionable' && entity.status === 'pending');
    
    return matchesSearch && matchesFilter;
  });

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = !searchTerm || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'high-impact' && insight.impact === 'high') ||
      (filterType === 'actionable' && insight.actionable);
    
    return matchesSearch && matchesFilter;
  });

  // Mock data for demonstration
  const mockEntities: EntityNode[] = [
    {
      id: '1',
      type: 'case',
      title: 'Johnson vs Smith Contract Dispute',
      description: 'Commercial contract dispute case',
      status: 'active',
      priority: 'high',
      module: 'legal',
      connections: [],
      ai_insights: ['High settlement probability', 'Similar case patterns detected'],
      last_accessed: new Date()
    },
    {
      id: '2',
      type: 'task',
      title: 'Review Contract Terms',
      description: 'Analyze contract clauses for Johnson case',
      status: 'pending',
      priority: 'high',
      module: 'tasks',
      connections: [],
      ai_insights: ['Dependency on case resolution']
    },
    {
      id: '3',
      type: 'contact',
      title: 'John Johnson - Client',
      description: 'Primary client contact',
      status: 'active',
      priority: 'medium',
      module: 'contacts',
      connections: []
    },
    {
      id: '4',
      type: 'deadline',
      title: 'Discovery Deadline',
      description: 'Submit discovery materials',
      status: 'pending',
      priority: 'critical',
      module: 'calendar',
      connections: []
    }
  ];

  const mockInsights: IntelligenceInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Early Settlement Opportunity',
      description: 'Based on case patterns, settling now could save 40% in costs and 3 months of time',
      affected_entities: ['1', '2'],
      confidence: 87,
      impact: 'high',
      actionable: true,
      actions: ['Schedule settlement meeting', 'Prepare settlement analysis', 'Contact opposing counsel'],
      priority: 'high'
    },
    {
      id: '2',
      type: 'risk',
      title: 'Discovery Timeline Risk',
      description: 'Current pace suggests 25% chance of missing discovery deadline',
      affected_entities: ['4', '2'],
      confidence: 78,
      impact: 'high',
      actionable: true,
      actions: ['Accelerate document review', 'Assign additional resources', 'Request extension'],
      priority: 'critical'
    }
  ];

  const displayEntities = entities.length > 0 ? filteredEntities : mockEntities;
  const displayInsights = insights.length > 0 ? filteredInsights : mockInsights;

  return (
    <div className={`tesla-cross-module-intelligence ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
            <Network className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cross-Module Intelligence
            </h2>
            <p className="text-gray-400">Relationship visualization and intelligent connections</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TeslaButton
            variant={viewMode === 'network' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('network')}
          >
            Network
          </TeslaButton>
          <TeslaButton
            variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </TeslaButton>
          <TeslaButton
            variant={viewMode === 'matrix' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('matrix')}
          >
            Matrix
          </TeslaButton>
          <TeslaButton
            variant={viewMode === 'insights' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('insights')}
          >
            Insights
          </TeslaButton>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search entities, connections, or insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Items</option>
            <option value="high-impact">High Impact</option>
            <option value="recent">Recent</option>
            <option value="actionable">Actionable</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <TeslaMetric
          label="Total Entities"
          value={displayEntities.length}
          icon="🔗"
          trend="up"
          trendValue="+3"
        />
        <TeslaMetric
          label="Active Connections"
          value={connections.length}
          icon="🔄"
          trend="up"
          trendValue="+5"
        />
        <TeslaMetric
          label="Intelligence Insights"
          value={displayInsights.length}
          icon="🧠"
          trend="up"
          trendValue="+2"
        />
        <TeslaMetric
          label="Actionable Items"
          value={displayInsights.filter(i => i.actionable).length}
          icon="⚡"
          trend="up"
          trendValue="+1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'network' && (
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Entity Network</h3>
                
                {/* Network Visualization */}
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayEntities.map((entity) => (
                      <div
                        key={entity.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedEntity === entity.id ? 'ring-2 ring-blue-500' : ''
                        } ${getEntityColor(entity.type)}`}
                        onClick={() => {
                          setSelectedEntity(entity.id);
                          onEntitySelect?.(entity.id);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getEntityIcon(entity.type)}
                          <span className="text-sm font-medium">{entity.module}</span>
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-1">{entity.title}</h4>
                        <p className="text-xs text-gray-300 line-clamp-2">{entity.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            entity.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            entity.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            entity.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {entity.priority}
                          </span>
                          <TeslaStatusIndicator 
                            status={entity.status === 'active' ? 'online' : 'offline'}
                            size="sm"
                          />
                        </div>
                        {entity.ai_insights && entity.ai_insights.length > 0 && (
                          <div className="mt-2 text-xs text-cyan-300">
                            <Brain className="w-3 h-3 inline mr-1" />
                            {entity.ai_insights.length} AI insight{entity.ai_insights.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection Details */}
                {selectedEntity && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">
                      Connections for {displayEntities.find(e => e.id === selectedEntity)?.title}
                    </h4>
                    <div className="space-y-2">
                      {getEntityConnections(selectedEntity).map((conn) => (
                        <div key={conn.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white">{conn.connection_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {conn.confidence}% confidence
                            </span>
                            <span className={`text-xs ${getConnectionColor(conn.connection_type)}`}>
                              {conn.strength}% strength
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TeslaCard>
          )}

          {viewMode === 'insights' && (
            <TeslaCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Intelligence Insights</h3>
                
                <div className="space-y-4">
                  {displayInsights.map((insight) => (
                    <div key={insight.id} className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                            insight.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                            insight.type === 'pattern' ? 'bg-blue-500/20 text-blue-400' :
                            insight.type === 'recommendation' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4" />}
                            {insight.type === 'risk' && <AlertTriangle className="w-4 h-4" />}
                            {insight.type === 'pattern' && <Brain className="w-4 h-4" />}
                            {insight.type === 'recommendation' && <Zap className="w-4 h-4" />}
                            {insight.type === 'anomaly' && <Eye className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${getInsightPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span>Confidence: {insight.confidence}%</span>
                        <span>Impact: {insight.impact}</span>
                        <span>Entities: {insight.affected_entities.length}</span>
                      </div>

                      {insight.actionable && insight.actions && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-yellow-400 mb-2">Recommended Actions:</h5>
                          <div className="space-y-1">
                            {insight.actions.map((action, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                <span className="text-sm text-gray-200">{action}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <TeslaButton
                              variant="primary"
                              size="sm"
                              onClick={() => onInsightAction?.(insight.id, 'implement')}
                            >
                              Implement
                            </TeslaButton>
                            <TeslaButton
                              variant="secondary"
                              size="sm"
                              onClick={() => onInsightAction?.(insight.id, 'dismiss')}
                            >
                              Dismiss
                            </TeslaButton>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TeslaCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connection Strength */}
          <TeslaCard>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Connection Strength</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Task-Case Links</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">87%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Contact-Case Links</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">78%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Deadline-Task Links</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div className="w-10 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </TeslaCard>

          {/* AI Recommendations */}
          <TeslaCard>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                <TeslaAlert type="warning">
                  Review potential connections between Johnson case and related tasks
                </TeslaAlert>
                <TeslaAlert type="info">
                  Consider linking upcoming deadlines to preparation tasks
                </TeslaAlert>
                <TeslaAlert type="success">
                  Strong connection patterns detected in legal module
                </TeslaAlert>
              </div>
            </div>
          </TeslaCard>
        </div>
      </div>
    </div>
  );
};

export default TeslaCrossModuleIntelligence;
