'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  Brain, 
  Zap, 
  Target,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  estimated_time: number;
  actual_time?: number;
  due_date: string;
  category: string;
  ai_insights: {
    complexity_score: number;
    optimal_time: string;
    similar_tasks_avg: number;
    completion_probability: number;
    suggested_actions: string[];
  };
  dependencies?: string[];
  linked_cases?: string[];
}

interface TeslaTaskDashboardProps {
  tasks?: Task[];
  className?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Draft Motion for Summary Judgment - Johnson Case',
    description: 'Prepare comprehensive motion with supporting legal arguments and case citations',
    priority: 'urgent',
    status: 'in_progress',
    estimated_time: 480, // minutes
    actual_time: 180,
    due_date: '2025-07-15',
    category: 'Legal Writing',
    ai_insights: {
      complexity_score: 8.2,
      optimal_time: 'Tuesday 9:00-11:30 AM',
      similar_tasks_avg: 420,
      completion_probability: 73,
      suggested_actions: [
        'Review Smith v. Johnson precedent',
        'Gather supporting exhibits',
        'Schedule review with senior partner'
      ]
    },
    dependencies: ['Case research completion'],
    linked_cases: ['Johnson v. ABC Corp']
  },
  {
    id: '2',
    title: 'Client Meeting Preparation - Wilson Consultation',
    description: 'Review case materials and prepare consultation agenda',
    priority: 'high',
    status: 'todo',
    estimated_time: 90,
    due_date: '2025-07-12',
    category: 'Client Relations',
    ai_insights: {
      complexity_score: 4.1,
      optimal_time: 'Monday 2:00-3:30 PM',
      similar_tasks_avg: 75,
      completion_probability: 92,
      suggested_actions: [
        'Review previous consultation notes',
        'Prepare fee agreement',
        'Gather relevant documents'
      ]
    },
    linked_cases: ['Wilson Estate Planning']
  },
  {
    id: '3',
    title: 'MCLE Course Completion',
    description: 'Complete "Ethics in Digital Age" online course',
    priority: 'medium',
    status: 'todo',
    estimated_time: 180,
    due_date: '2025-07-20',
    category: 'Professional Development',
    ai_insights: {
      complexity_score: 2.5,
      optimal_time: 'Weekend morning',
      similar_tasks_avg: 165,
      completion_probability: 87,
      suggested_actions: [
        'Block weekend time',
        'Download course materials',
        'Prepare note-taking setup'
      ]
    }
  },
  {
    id: '4',
    title: 'Discovery Document Review',
    description: 'Review and categorize discovery documents for Martinez case',
    priority: 'high',
    status: 'blocked',
    estimated_time: 360,
    due_date: '2025-07-18',
    category: 'Case Work',
    ai_insights: {
      complexity_score: 6.8,
      optimal_time: 'Thursday afternoon block',
      similar_tasks_avg: 340,
      completion_probability: 68,
      suggested_actions: [
        'Wait for client document delivery',
        'Set up document review system',
        'Prepare categorization framework'
      ]
    },
    dependencies: ['Client document delivery'],
    linked_cases: ['Martinez Personal Injury']
  }
];

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'high':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'low':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'todo':
      return <Clock className="w-4 h-4" />;
    case 'in_progress':
      return <PlayCircle className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'blocked':
      return <PauseCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'todo':
      return 'text-gray-400';
    case 'in_progress':
      return 'text-blue-400';
    case 'completed':
      return 'text-green-400';
    case 'blocked':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const getComplexityColor = (score: number) => {
  if (score >= 8) return 'text-red-400';
  if (score >= 6) return 'text-orange-400';
  if (score >= 4) return 'text-yellow-400';
  return 'text-green-400';
};

export default function TeslaTaskDashboard({ 
  tasks = mockTasks, 
  className = '' 
}: TeslaTaskDashboardProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'complexity':
          return b.ai_insights.complexity_score - a.ai_insights.complexity_score;
        default:
          return 0;
      }
    });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI-Enhanced Task Dashboard</h3>
            <p className="text-sm text-gray-400">Intelligent task management with AI insights</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/tasks?action=new'}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Task</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-gray-400">{stats.todo}</div>
          <div className="text-xs text-gray-400">To Do</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-blue-400">{stats.in_progress}</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-red-400">{stats.blocked}</div>
          <div className="text-xs text-gray-400">Blocked</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="priority">Sort by Priority</option>
            <option value="due_date">Sort by Due Date</option>
            <option value="complexity">Sort by Complexity</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="group p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {task.title}
                    </h4>
                    <div className={`px-2 py-0.5 rounded border text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    {task.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(task.estimated_time)}</span>
                    </div>
                    <div className="px-2 py-0.5 bg-gray-700/50 rounded text-xs">
                      {task.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">AI Insights</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Complexity</div>
                  <div className={`text-sm font-semibold ${getComplexityColor(task.ai_insights.complexity_score)}`}>
                    {task.ai_insights.complexity_score}/10
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Success Rate</div>
                  <div className="text-sm font-semibold text-green-400">
                    {task.ai_insights.completion_probability}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Optimal Time</div>
                  <div className="text-sm font-semibold text-cyan-400">
                    {task.ai_insights.optimal_time}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Avg Time</div>
                  <div className="text-sm font-semibold text-yellow-400">
                    {formatDuration(task.ai_insights.similar_tasks_avg)}
                  </div>
                </div>
              </div>

              {/* Suggested Actions */}
              <div>
                <div className="text-xs text-gray-400 mb-2">AI Suggestions:</div>
                <ul className="space-y-1">
                  {task.ai_insights.suggested_actions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-200 flex items-start space-x-2">
                      <Zap className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dependencies & Links */}
            {(task.dependencies || task.linked_cases) && (
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  {task.dependencies && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Depends on: {task.dependencies.join(', ')}</span>
                    </div>
                  )}
                  {task.linked_cases && (
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Cases: {task.linked_cases.join(', ')}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => window.location.href = `/tasks?edit=${task.id}`}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  Open Task →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No tasks found</div>
          <div className="text-sm text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
          </div>
        </div>
      )}
    </div>
  );
}
