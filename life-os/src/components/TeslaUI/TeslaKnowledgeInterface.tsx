'use client';

import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  Plus, 
  Link, 
  Tag, 
  FileText, 
  Lightbulb,
  Star,
  Clock,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  BookOpen,
  ArrowRight,
  Hash
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaSmartSuggestions from './TeslaSmartSuggestions';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'insight' | 'reference' | 'template' | 'research' | 'idea';
  tags: string[];
  created_at: Date;
  updated_at: Date;
  access_count: number;
  last_accessed?: Date;
  importance: 'low' | 'medium' | 'high' | 'critical';
  
  // AI-enhanced properties
  ai_summary?: string;
  ai_keywords?: string[];
  ai_relevance_score?: number;
  
  // Cross-module connections
  linked_tasks?: string[];
  linked_cases?: string[];
  linked_contacts?: string[];
  
  // Knowledge graph properties
  knowledge_cluster?: string;
  expertise_domain?: string;
}

interface KnowledgeCluster {
  id: string;
  name: string;
  description: string;
  item_count: number;
  last_updated: Date;
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  color_theme: string;
}

interface TeslaKnowledgeInterfaceProps {
  knowledgeItems?: KnowledgeItem[];
  knowledgeClusters?: KnowledgeCluster[];
  onCreateItem?: (item: Partial<KnowledgeItem>) => void;
  onUpdateItem?: (id: string, updates: Partial<KnowledgeItem>) => void;
  onDeleteItem?: (id: string) => void;
  className?: string;
}

const TeslaKnowledgeInterface: React.FC<TeslaKnowledgeInterfaceProps> = ({
  knowledgeItems = [],
  knowledgeClusters = [],
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'browse' | 'search' | 'clusters'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data for demonstration
  const mockKnowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'Client Communication Best Practices',
      content: 'Key strategies for effective client communication in legal matters...',
      type: 'reference',
      tags: ['communication', 'clients', 'best-practices'],
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      access_count: 15,
      last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      importance: 'high',
      ai_summary: 'Comprehensive guide for client communication strategies',
      ai_keywords: ['communication', 'client management', 'legal practice'],
      ai_relevance_score: 92,
      linked_cases: ['case-123', 'case-456'],
      linked_tasks: ['task-789'],
      knowledge_cluster: 'client-management',
      expertise_domain: 'legal-practice'
    },
    {
      id: '2',
      title: 'Discovery Process Checklist',
      content: 'Step-by-step checklist for managing discovery in litigation...',
      type: 'template',
      tags: ['discovery', 'litigation', 'checklist'],
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      access_count: 8,
      last_accessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      importance: 'critical',
      ai_summary: 'Essential checklist for discovery phase management',
      ai_keywords: ['discovery', 'litigation', 'process management'],
      ai_relevance_score: 88,
      linked_cases: ['case-123'],
      knowledge_cluster: 'litigation-process',
      expertise_domain: 'litigation'
    },
    {
      id: '3',
      title: 'Settlement Negotiation Insights',
      content: 'Key insights from recent settlement negotiations...',
      type: 'insight',
      tags: ['settlement', 'negotiation', 'strategy'],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      access_count: 12,
      last_accessed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      importance: 'medium',
      ai_summary: 'Strategic insights for effective settlement negotiations',
      ai_keywords: ['settlement', 'negotiation', 'strategy'],
      ai_relevance_score: 85,
      linked_cases: ['case-789'],
      knowledge_cluster: 'negotiation-strategy',
      expertise_domain: 'negotiation'
    }
  ];

  const mockClusters: KnowledgeCluster[] = [
    {
      id: '1',
      name: 'Client Management',
      description: 'Best practices for managing client relationships',
      item_count: 8,
      last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expertise_level: 'advanced',
      color_theme: 'blue'
    },
    {
      id: '2',
      name: 'Litigation Process',
      description: 'Procedures and strategies for litigation',
      item_count: 12,
      last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expertise_level: 'expert',
      color_theme: 'purple'
    },
    {
      id: '3',
      name: 'Negotiation Strategy',
      description: 'Techniques for effective negotiation',
      item_count: 6,
      last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expertise_level: 'intermediate',
      color_theme: 'green'
    }
  ];

  const currentItems = knowledgeItems.length > 0 ? knowledgeItems : mockKnowledgeItems;
  const currentClusters = knowledgeClusters.length > 0 ? knowledgeClusters : mockClusters;

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4" />;
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'reference': return <BookOpen className="w-4 h-4" />;
      case 'template': return <Archive className="w-4 h-4" />;
      case 'research': return <Search className="w-4 h-4" />;
      case 'idea': return <Brain className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'text-blue-400';
      case 'insight': return 'text-yellow-400';
      case 'reference': return 'text-green-400';
      case 'template': return 'text-purple-400';
      case 'research': return 'text-cyan-400';
      case 'idea': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  // Get importance color
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`tesla-knowledge-interface ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Knowledge Management
          </h2>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-400">Second Brain</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TeslaButton
            variant="primary"
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Knowledge
          </TeslaButton>
        </div>
      </div>

      {/* View Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <TeslaButton
          variant={selectedView === 'overview' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </TeslaButton>
        <TeslaButton
          variant={selectedView === 'browse' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedView('browse')}
        >
          Browse
        </TeslaButton>
        <TeslaButton
          variant={selectedView === 'search' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedView('search')}
        >
          Search
        </TeslaButton>
        <TeslaButton
          variant={selectedView === 'clusters' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedView('clusters')}
        >
          Clusters
        </TeslaButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview */}
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TeslaCard>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {currentItems.length}
                    </div>
                    <div className="text-sm text-gray-400">Knowledge Items</div>
                  </div>
                </TeslaCard>
                <TeslaCard>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {currentClusters.length}
                    </div>
                    <div className="text-sm text-gray-400">Knowledge Clusters</div>
                  </div>
                </TeslaCard>
                <TeslaCard>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {Math.round(currentItems.reduce((sum, item) => sum + item.access_count, 0) / currentItems.length)}
                    </div>
                    <div className="text-sm text-gray-400">Avg. Access Count</div>
                  </div>
                </TeslaCard>
              </div>

              {/* Recent Knowledge Items */}
              <TeslaCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Knowledge Items</h3>
                  <div className="space-y-3">
                    {currentItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(item.type)} bg-current/20`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.ai_summary}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{item.type}</span>
                              <div className={`w-2 h-2 rounded-full ${getImportanceColor(item.importance)}`} />
                              <span className="text-xs text-gray-500">{item.importance}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{item.access_count} views</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TeslaCard>
            </div>
          )}

          {/* Browse View */}
          {selectedView === 'browse' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentItems.map((item) => (
                  <TeslaCard key={item.id} className="cursor-pointer hover:scale-105 transition-transform">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(item.type)} bg-current/20`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{item.title}</h3>
                            <span className="text-xs text-gray-400 capitalize">{item.type}</span>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getImportanceColor(item.importance)}`} />
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                        {item.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-700/50 rounded-full text-gray-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{item.access_count} views</span>
                        <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TeslaCard>
                ))}
              </div>
            </div>
          )}

          {/* Search View */}
          {selectedView === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-sm text-gray-400">
                {searchQuery ? `Results for "${searchQuery}"` : 'Enter a search term to find knowledge items'}
              </div>
            </div>
          )}

          {/* Clusters View */}
          {selectedView === 'clusters' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentClusters.map((cluster) => (
                  <TeslaCard key={cluster.id} className="cursor-pointer hover:scale-105 transition-transform">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{cluster.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cluster.expertise_level === 'expert' ? 'bg-red-500/20 text-red-300' :
                          cluster.expertise_level === 'advanced' ? 'bg-orange-500/20 text-orange-300' :
                          cluster.expertise_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {cluster.expertise_level}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">
                        {cluster.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{cluster.item_count} items</span>
                        <span>Updated {new Date(cluster.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TeslaCard>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <TeslaCard>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">AI Suggestions</h3>
              <TeslaSmartSuggestions
                suggestions={[
                  {
                    id: '1',
                    type: 'productivity',
                    priority: 'medium',
                    title: 'Organize knowledge',
                    description: 'Consider creating clusters for better organization',
                    context: 'Knowledge management',
                    confidence: 85,
                    potential_impact: 'medium',
                    time_to_implement: '15 minutes',
                    action_items: ['Review items', 'Create clusters', 'Link items'],
                    dismissible: true
                  }
                ]}
              />
            </div>
          </TeslaCard>

          {/* Quick Stats */}
          <TeslaCard>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Notes</span>
                  <span className="text-white">{currentItems.filter(i => i.type === 'note').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Insights</span>
                  <span className="text-white">{currentItems.filter(i => i.type === 'insight').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">References</span>
                  <span className="text-white">{currentItems.filter(i => i.type === 'reference').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Templates</span>
                  <span className="text-white">{currentItems.filter(i => i.type === 'template').length}</span>
                </div>
              </div>
            </div>
          </TeslaCard>
        </div>
      </div>
    </div>
  );
};

export default TeslaKnowledgeInterface;
