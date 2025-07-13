'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Star, 
  User, 
  FileText, 
  Briefcase, 
  Calendar, 
  Brain, 
  Link, 
  ArrowRight, 
  ChevronDown,
  X,
  Zap,
  Target,
  TrendingUp,
  Hash,
  Globe,
  MessageSquare,
  Archive,
  Bookmark,
  History,
  Settings,
  Command,
  Lightbulb,
  BookOpen,
  Eye
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import { AIInsightBadge } from './TeslaAIInsightsBadges';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'task' | 'case' | 'contact' | 'knowledge' | 'deadline' | 'note' | 'document';
  module: string;
  relevance_score: number;
  last_updated: Date;
  preview_text: string;
  tags: string[];
  metadata: {
    [key: string]: any;
  };
  
  // AI-enhanced properties
  ai_summary?: string;
  ai_keywords?: string[];
  ai_context?: string;
  ai_suggestions?: string[];
  
  // Cross-module connections
  related_items?: {
    id: string;
    type: string;
    title: string;
    relevance: number;
  }[];
  
  // Usage analytics
  access_count?: number;
  last_accessed?: Date;
  interaction_score?: number;
}

interface SearchFilter {
  id: string;
  label: string;
  type: 'module' | 'date' | 'priority' | 'status' | 'tag';
  options: string[];
  selected: string[];
}

interface SearchSuggestion {
  id: string;
  query: string;
  type: 'recent' | 'popular' | 'ai_suggested' | 'contextual';
  confidence: number;
  context?: string;
}

interface TeslaUnifiedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  onSearchPerformed?: (query: string, results: SearchResult[]) => void;
  currentContext?: {
    module?: string;
    entity_id?: string;
    entity_type?: string;
  };
  placeholder?: string;
  className?: string;
}

const TeslaUnifiedSearch: React.FC<TeslaUnifiedSearchProps> = ({
  onResultSelect,
  onSearchPerformed,
  currentContext,
  placeholder = "Search across all modules...",
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced' | 'ai'>('simple');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Johnson v. Smith Settlement Discussion',
      content: 'Settlement negotiations scheduled for next week. Client prefers mediation over trial.',
      type: 'case',
      module: 'Legal Cases',
      relevance_score: 95,
      last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      preview_text: 'Settlement negotiations scheduled for next week. Client prefers mediation over trial.',
      tags: ['settlement', 'mediation', 'high-priority'],
      metadata: {
        case_status: 'active',
        client: 'Johnson',
        opposing_party: 'Smith',
        case_value: 150000
      },
      ai_summary: 'Active settlement case with upcoming mediation',
      ai_keywords: ['settlement', 'mediation', 'johnson', 'smith'],
      ai_context: 'High-value case requiring immediate attention',
      related_items: [
        { id: 'task-1', type: 'task', title: 'Prepare settlement documents', relevance: 85 },
        { id: 'contact-1', type: 'contact', title: 'Sarah Johnson', relevance: 90 }
      ],
      access_count: 15,
      last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interaction_score: 92
    },
    {
      id: '2',
      title: 'Client Communication Best Practices',
      content: 'Comprehensive guide for effective client communication in legal matters...',
      type: 'knowledge',
      module: 'Knowledge Base',
      relevance_score: 88,
      last_updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      preview_text: 'Key strategies for maintaining clear communication with clients throughout case lifecycle.',
      tags: ['communication', 'best-practices', 'clients'],
      metadata: {
        knowledge_type: 'reference',
        expertise_level: 'advanced',
        usage_count: 25
      },
      ai_summary: 'Essential reference for client communication strategies',
      ai_keywords: ['communication', 'client management', 'best practices'],
      ai_context: 'Highly accessed resource for professional development',
      related_items: [
        { id: 'case-1', type: 'case', title: 'Johnson v. Smith', relevance: 70 },
        { id: 'task-2', type: 'task', title: 'Client update call', relevance: 65 }
      ],
      access_count: 25,
      last_accessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      interaction_score: 88
    },
    {
      id: '3',
      title: 'Prepare discovery documents',
      content: 'Review and compile discovery materials for Johnson case',
      type: 'task',
      module: 'Tasks',
      relevance_score: 82,
      last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      preview_text: 'High priority task for Johnson case - discovery deadline approaching',
      tags: ['discovery', 'johnson', 'urgent'],
      metadata: {
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimated_hours: 4
      },
      ai_summary: 'Critical task with approaching deadline',
      ai_keywords: ['discovery', 'johnson', 'documents', 'deadline'],
      ai_context: 'Urgent task requiring immediate attention',
      related_items: [
        { id: 'case-1', type: 'case', title: 'Johnson v. Smith', relevance: 95 },
        { id: 'contact-1', type: 'contact', title: 'Sarah Johnson', relevance: 75 }
      ],
      access_count: 8,
      last_accessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      interaction_score: 82
    },
    {
      id: '4',
      title: 'Sarah Johnson',
      content: 'Primary contact for Johnson v. Smith case',
      type: 'contact',
      module: 'Contacts',
      relevance_score: 79,
      last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      preview_text: 'Client contact information and communication history',
      tags: ['client', 'johnson-case', 'primary-contact'],
      metadata: {
        phone: '555-0123',
        email: 'sarah.johnson@email.com',
        relationship: 'client',
        last_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      ai_summary: 'Primary client contact for active case',
      ai_keywords: ['sarah', 'johnson', 'client', 'contact'],
      ai_context: 'Active client with recent communication',
      related_items: [
        { id: 'case-1', type: 'case', title: 'Johnson v. Smith', relevance: 95 },
        { id: 'task-3', type: 'task', title: 'Client update call', relevance: 80 }
      ],
      access_count: 12,
      last_accessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interaction_score: 79
    }
  ];

  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      query: 'johnson case',
      type: 'recent',
      confidence: 95,
      context: 'Recently searched'
    },
    {
      id: '2',
      query: 'settlement strategies',
      type: 'ai_suggested',
      confidence: 88,
      context: 'Based on current case activity'
    },
    {
      id: '3',
      query: 'client communication',
      type: 'popular',
      confidence: 82,
      context: 'Frequently accessed'
    },
    {
      id: '4',
      query: 'discovery deadlines',
      type: 'contextual',
      confidence: 90,
      context: 'Related to current work'
    }
  ];

  const mockFilters: SearchFilter[] = [
    {
      id: 'module',
      label: 'Module',
      type: 'module',
      options: ['Legal Cases', 'Tasks', 'Contacts', 'Knowledge Base', 'Deadlines'],
      selected: []
    },
    {
      id: 'date',
      label: 'Date',
      type: 'date',
      options: ['Today', 'This Week', 'This Month', 'This Year'],
      selected: []
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'priority',
      options: ['Critical', 'High', 'Medium', 'Low'],
      selected: []
    },
    {
      id: 'status',
      label: 'Status',
      type: 'status',
      options: ['Active', 'Pending', 'Complete', 'Archived'],
      selected: []
    }
  ];

  // Simulate search with delay
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock results based on query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      result.ai_keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort by relevance score
    filteredResults.sort((a, b) => b.relevance_score - a.relevance_score);

    setResults(filteredResults);
    setIsSearching(false);

    // Update recent searches
    const updatedRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updatedRecentSearches);

    // Call callback if provided
    if (onSearchPerformed) {
      onSearchPerformed(searchQuery, filteredResults);
    }
  };

  // Handle input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Initialize with suggestions
  useEffect(() => {
    setSuggestions(mockSuggestions);
    setFilters(mockFilters);
  }, []);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Target className="w-4 h-4" />;
      case 'case': return <Briefcase className="w-4 h-4" />;
      case 'contact': return <User className="w-4 h-4" />;
      case 'knowledge': return <Brain className="w-4 h-4" />;
      case 'deadline': return <Calendar className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'document': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-400';
      case 'case': return 'text-purple-400';
      case 'contact': return 'text-green-400';
      case 'knowledge': return 'text-yellow-400';
      case 'deadline': return 'text-red-400';
      case 'note': return 'text-cyan-400';
      case 'document': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.query);
    performSearch(suggestion.query);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    searchInputRef.current?.focus();
  };

  // Toggle filter
  const toggleFilter = (filterId: string, option: string) => {
    setSelectedFilters(prev => {
      const currentSelected = prev[filterId] || [];
      const newSelected = currentSelected.includes(option)
        ? currentSelected.filter(item => item !== option)
        : [...currentSelected, option];
      
      return {
        ...prev,
        [filterId]: newSelected
      };
    });
  };

  return (
    <div className={`tesla-unified-search ${className}`}>
      {/* Search Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Unified Search
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <TeslaButton
            variant={searchMode === 'simple' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSearchMode('simple')}
          >
            Simple
          </TeslaButton>
          <TeslaButton
            variant={searchMode === 'advanced' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSearchMode('advanced')}
          >
            Advanced
          </TeslaButton>
          <TeslaButton
            variant={searchMode === 'ai' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSearchMode('ai')}
          >
            <Brain className="w-4 h-4 mr-1" />
            AI
          </TeslaButton>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {searchMode === 'advanced' && (
        <div className="mb-6">
          <TeslaCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showAdvanced && (
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id}>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">{filter.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {filter.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => toggleFilter(filter.id, option)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedFilters[filter.id]?.includes(option)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TeslaCard>
        </div>
      )}

      {/* Search Results or Suggestions */}
      {query ? (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Search Results ({results.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Search took {Math.random() * 0.5 + 0.1}s</span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((result) => (
              <TeslaCard 
                key={result.id} 
                className="cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => handleResultSelect(result)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)} bg-current/20`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{result.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{result.module}</span>
                          <span>•</span>
                          <span className="capitalize">{result.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TeslaStatusIndicator 
                        status={result.relevance_score > 90 ? 'online' : result.relevance_score > 70 ? 'processing' : 'warning'}
                        label={`${result.relevance_score}%`}
                      />
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {result.preview_text}
                  </p>
                  
                  {result.ai_summary && (
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-300">{result.ai_summary}</span>
                        <span className="text-xs text-purple-400">{result.relevance_score}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {result.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-700/50 rounded-full text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{result.access_count}</span>
                      </div>
                      <span>{new Date(result.last_updated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {result.related_items && result.related_items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">Related Items</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.related_items.slice(0, 3).map((item, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TeslaCard>
            ))}
          </div>

          {results.length === 0 && !isSearching && (
            <TeslaCard>
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            </TeslaCard>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Suggestions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Search Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => (
                <TeslaCard 
                  key={suggestion.id} 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          suggestion.type === 'recent' ? 'text-blue-400 bg-blue-400/20' :
                          suggestion.type === 'popular' ? 'text-green-400 bg-green-400/20' :
                          suggestion.type === 'ai_suggested' ? 'text-purple-400 bg-purple-400/20' :
                          'text-yellow-400 bg-yellow-400/20'
                        }`}>
                          {suggestion.type === 'recent' ? <Clock className="w-4 h-4" /> :
                           suggestion.type === 'popular' ? <TrendingUp className="w-4 h-4" /> :
                           suggestion.type === 'ai_suggested' ? <Brain className="w-4 h-4" /> :
                           <Target className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{suggestion.query}</h4>
                          <p className="text-sm text-gray-400">{suggestion.context}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </TeslaCard>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300 hover:bg-gray-600/50 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TeslaButton variant="secondary" size="sm" className="justify-center">
                <Briefcase className="w-4 h-4 mr-2" />
                All Cases
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm" className="justify-center">
                <Target className="w-4 h-4 mr-2" />
                My Tasks
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm" className="justify-center">
                <User className="w-4 h-4 mr-2" />
                Contacts
              </TeslaButton>
              <TeslaButton variant="secondary" size="sm" className="justify-center">
                <Brain className="w-4 h-4 mr-2" />
                Knowledge
              </TeslaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeslaUnifiedSearch;
