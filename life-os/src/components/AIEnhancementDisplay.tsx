'use client';

import { useState, useEffect } from 'react';
import { useAIEnhancedData } from '../lib/ai/enhanced-data-context';
import { EnhancedTask } from '../lib/ai/enhanced-storage';

interface AIEnhancementDisplayProps {
  taskId?: string;
  onApplySuggestion?: (field: string, value: any) => void;
}

export function AIEnhancementDisplay({ taskId, onApplySuggestion }: AIEnhancementDisplayProps) {
  const { getTaskById, isAIEnabled, isProcessing, getInsights } = useAIEnhancedData();
  const [task, setTask] = useState<EnhancedTask | undefined>();
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    if (taskId) {
      const foundTask = getTaskById(taskId);
      setTask(foundTask);
      
      if (foundTask) {
        const taskInsights = getInsights(taskId, 'task');
        setInsights(taskInsights);
      }
    }
  }, [taskId, getTaskById, getInsights]);

  if (!isAIEnabled) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">AI Enhancement Disabled</span>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <span className="text-sm">AI is analyzing your task...</span>
        </div>
      </div>
    );
  }

  if (!task?.ai_enhanced && insights.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm">AI enhancement will appear here after task creation</span>
        </div>
      </div>
    );
  }

  // Show AI insights from the insights array, but avoid duplication with task.ai_suggestions
  const hasAISuggestions = task?.ai_enhanced && task?.ai_suggestions;
  const uniqueInsights = insights.filter(insight => 
    // Only show insights that aren't already covered by ai_suggestions
    !(hasAISuggestions && insight.type === 'task_enhancement')
  );

  return (
    <div className="space-y-4">
      {/* AI Enhancement Status - show structured suggestions */}
      {task?.ai_enhanced && task?.ai_suggestions && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">AI Enhanced</span>
            </div>
            <span className="text-xs text-green-300">
              Confidence: {Math.round((task.ai_confidence || 0) * 100)}%
            </span>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            {task.ai_suggestions.estimatedHours && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Estimated Time:</span>
                <span className="text-white font-medium">{task.ai_suggestions.estimatedHours} hours</span>
              </div>
            )}

            {task.ai_suggestions.relatedCaseTypes && task.ai_suggestions.relatedCaseTypes.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm">Related Case Types:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.ai_suggestions.relatedCaseTypes.map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.ai_suggestions.requiredDocuments && task.ai_suggestions.requiredDocuments.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm">Required Documents:</span>
                <ul className="mt-1 space-y-1">
                  {task.ai_suggestions.requiredDocuments.map((doc, index) => (
                    <li key={index} className="text-xs text-gray-400 flex items-center gap-1">
                      <span>•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task.ai_suggestions.keyContacts && task.ai_suggestions.keyContacts.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm">Key Contacts:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.ai_suggestions.keyContacts.map((contact, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                      {contact}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.ai_suggestions.reasoning && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <span className="text-gray-300 text-sm">AI Analysis:</span>
                <p className="text-xs text-gray-400 mt-1 italic">
                  {task.ai_suggestions.reasoning}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional AI Insights - only show unique insights not covered by suggestions */}
      {uniqueInsights.length > 0 && (
        <div className="space-y-2">
          {uniqueInsights.map((insight) => (
            <div key={insight.id} className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-300">Additional AI Insight</span>
                    <span className="text-xs text-blue-400">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  {insight.type === 'task_enhancement' && insight.data && (
                    <div className="text-sm text-gray-300">
                      <p>{insight.data.reasoning}</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {/* Handle dismiss */}}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
