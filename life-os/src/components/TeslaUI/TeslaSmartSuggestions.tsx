'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  Clock, 
  Users, 
  FileText, 
  Calendar, 
  Brain, 
  TrendingUp, 
  Target,
  Zap,
  ChevronRight,
  X,
  Star
} from 'lucide-react';

interface SmartSuggestion {
  id: string;
  type: 'productivity' | 'scheduling' | 'automation' | 'relationship' | 'learning' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  context: string;
  confidence: number;
  potential_impact: 'high' | 'medium' | 'low';
  time_to_implement: string;
  action_items: string[];
  related_items?: string[];
  dismissible: boolean;
}

interface TeslaSmartSuggestionsProps {
  suggestions?: SmartSuggestion[];
  contextualMode?: boolean;
  className?: string;
}

const mockSuggestions: SmartSuggestion[] = [
  {
    id: '1',
    type: 'productivity',
    priority: 'high',
    title: 'Optimize Your Tuesday Morning Peak',
    description: 'You complete 40% more complex tasks on Tuesday mornings. Consider scheduling the Johnson case motion during this high-productivity window.',
    context: 'Based on 8 weeks of productivity analysis',
    confidence: 94,
    potential_impact: 'high',
    time_to_implement: '5 minutes',
    action_items: [
      'Block Tuesday 9:00-11:30 AM for complex legal writing',
      'Move routine tasks to lower-energy periods',
      'Set calendar reminder for next Tuesday'
    ],
    related_items: ['Johnson Case Motion', 'Calendar Management'],
    dismissible: true
  },
  {
    id: '2',
    type: 'scheduling',
    priority: 'high',
    title: 'Avoid Friday Afternoon Meetings',
    description: 'Your attention drops 23% on Friday afternoons. Consider rescheduling the Wilson consultation to Tuesday or Wednesday.',
    context: 'Pattern detected over 12 weeks',
    confidence: 87,
    potential_impact: 'medium',
    time_to_implement: '2 minutes',
    action_items: [
      'Reschedule Wilson consultation to Tuesday 2:00 PM',
      'Block Friday afternoons for administrative tasks',
      'Update client communication templates'
    ],
    related_items: ['Wilson Consultation', 'Meeting Optimization'],
    dismissible: true
  },
  {
    id: '3',
    type: 'automation',
    priority: 'medium',
    title: 'Automate Case Status Updates',
    description: 'You spend 2.5 hours/week manually updating case statuses. Set up automatic triggers based on document uploads and calendar events.',
    context: 'Time tracking analysis',
    confidence: 91,
    potential_impact: 'high',
    time_to_implement: '30 minutes setup',
    action_items: [
      'Configure document upload triggers',
      'Set up calendar-based status rules',
      'Create client notification templates'
    ],
    related_items: ['Workflow Automation', 'Time Management'],
    dismissible: true
  },
  {
    id: '4',
    type: 'relationship',
    priority: 'medium',
    title: 'Follow Up with Martinez Client',
    description: 'It\'s been 5 days since your last contact with Martinez. Based on case urgency and client communication patterns, now is optimal timing for an update.',
    context: 'Client relationship analysis',
    confidence: 78,
    potential_impact: 'medium',
    time_to_implement: '10 minutes',
    action_items: [
      'Send progress update email',
      'Schedule next check-in call',
      'Prepare case status summary'
    ],
    related_items: ['Martinez Case', 'Client Relations'],
    dismissible: true
  },
  {
    id: '5',
    type: 'learning',
    priority: 'low',
    title: 'MCLE Credit Opportunity',
    description: 'There\'s a relevant Ethics in AI webinar next week that would count toward your MCLE requirements and align with your current caseload.',
    context: 'Professional development tracking',
    confidence: 82,
    potential_impact: 'medium',
    time_to_implement: '3 minutes',
    action_items: [
      'Register for "Ethics in AI" webinar',
      'Block calendar time for attendance',
      'Add to MCLE credit tracking'
    ],
    related_items: ['MCLE Credits', 'Professional Development'],
    dismissible: true
  },
  {
    id: '6',
    type: 'optimization',
    priority: 'medium',
    title: 'Batch Similar Tasks',
    description: 'You have 4 research tasks this week. Batching similar work types can improve focus and reduce context switching by 35%.',
    context: 'Task efficiency analysis',
    confidence: 89,
    potential_impact: 'medium',
    time_to_implement: '15 minutes',
    action_items: [
      'Group research tasks into 2-hour blocks',
      'Schedule for optimal focus times',
      'Prepare research materials in advance'
    ],
    related_items: ['Task Management', 'Research Efficiency'],
    dismissible: true
  }
];

const getSuggestionIcon = (type: SmartSuggestion['type']) => {
  switch (type) {
    case 'productivity':
      return <TrendingUp className="w-5 h-5" />;
    case 'scheduling':
      return <Calendar className="w-5 h-5" />;
    case 'automation':
      return <Zap className="w-5 h-5" />;
    case 'relationship':
      return <Users className="w-5 h-5" />;
    case 'learning':
      return <Brain className="w-5 h-5" />;
    case 'optimization':
      return <Target className="w-5 h-5" />;
    default:
      return <Lightbulb className="w-5 h-5" />;
  }
};

const getSuggestionColor = (type: SmartSuggestion['type']) => {
  switch (type) {
    case 'productivity':
      return 'text-green-400 bg-green-500/20';
    case 'scheduling':
      return 'text-blue-400 bg-blue-500/20';
    case 'automation':
      return 'text-purple-400 bg-purple-500/20';
    case 'relationship':
      return 'text-pink-400 bg-pink-500/20';
    case 'learning':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'optimization':
      return 'text-cyan-400 bg-cyan-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};

const getPriorityColor = (priority: SmartSuggestion['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getImpactColor = (impact: SmartSuggestion['potential_impact']) => {
  switch (impact) {
    case 'high':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
};

export default function TeslaSmartSuggestions({ 
  suggestions = mockSuggestions,
  contextualMode = false,
  className = '' 
}: TeslaSmartSuggestionsProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => new Set([...prev, id]));
  };

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));
  const highPrioritySuggestions = activeSuggestions.filter(s => s.priority === 'high');

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Suggestions</h3>
            <p className="text-sm text-gray-400">
              {contextualMode ? 'Context-aware recommendations' : 'AI-powered optimization tips'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {highPrioritySuggestions.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs text-red-400 font-medium">
                {highPrioritySuggestions.length} urgent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{activeSuggestions.length}</div>
          <div className="text-xs text-gray-400">Active Suggestions</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-400">{highPrioritySuggestions.length}</div>
          <div className="text-xs text-gray-400">High Priority</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-400">
            {Math.round(activeSuggestions.reduce((sum, s) => sum + s.confidence, 0) / activeSuggestions.length)}%
          </div>
          <div className="text-xs text-gray-400">Avg Confidence</div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {activeSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">
                      {suggestion.title}
                    </h4>
                    <div className={`px-2 py-0.5 rounded border text-xs ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>{suggestion.context}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{suggestion.time_to_implement}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {suggestion.dismissible && (
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    title="Dismiss suggestion"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setExpandedSuggestion(expandedSuggestion === suggestion.id ? null : suggestion.id)}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedSuggestion === suggestion.id ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-medium ${suggestion.confidence >= 85 ? 'text-green-400' : suggestion.confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {suggestion.confidence}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">Impact:</span>
                  <span className={`font-medium ${getImpactColor(suggestion.potential_impact)}`}>
                    {suggestion.potential_impact}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getSuggestionColor(suggestion.type)}`}>
                  {suggestion.type}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedSuggestion === suggestion.id && (
              <div className="border-t border-gray-700/30 pt-3 mt-3">
                {/* Action Items */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Recommended Actions</span>
                  </div>
                  <ul className="space-y-2">
                    {suggestion.action_items.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-200">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related Items */}
                {suggestion.related_items && suggestion.related_items.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Related Items:</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.related_items.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm font-medium">
                    Implement Now
                  </button>
                  <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded-lg transition-colors text-sm">
                    Remind Later
                  </button>
                  <button className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
                    More Details →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activeSuggestions.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 mb-2">No active suggestions</div>
          <div className="text-sm text-gray-500">
            AI is analyzing your patterns to generate personalized recommendations
          </div>
        </div>
      )}
    </div>
  );
}
