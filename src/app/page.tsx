'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, Bell, AlertTriangle, CheckCircle, Brain, 
  TrendingUp, Users, Phone, Mail, MessageSquare, Zap,
  Eye, MoreHorizontal, ArrowRight, Target, FileText,
  Gavel, Scale, DollarSign, Timer, ChevronRight, Star
} from 'lucide-react';
import { useData } from '../lib/dataContext';

// Mock intelligent data for the Tesla-style dashboard
const mockIntelligentData = {
  aiInsights: {
    criticalPath: "Motion response due tomorrow - 6h work needed",
    prediction: "On track for all deadlines with current pace",
    recommendation: "Focus 9-11 AM (peak productivity) on legal research",
    efficiency: "+23% vs last week"
  },
  
  workloadAnalysis: {
    currentCapacity: 78,
    taskVelocity: 4.2,
    efficiencyTrend: "increasing",
    recommendedActions: ["Can accept 2 more cases", "Optimal focus: Tuesday AM"]
  }
};

export default function IntelligentDashboard() {
  const { tasks, cases } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeUntilDeadline = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffInMs = deadline.getTime() - now.getTime();
    const diffInHours = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60)));
    
    if (diffInHours < 24) return `${diffInHours}h`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d ${diffInHours % 24}h`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': case 'P1': case 'deadline': return 'bg-red-500';
      case 'high': case 'P2': return 'bg-orange-500';
      case 'medium': case 'P3': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ai_prioritized': case 'in_progress': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'waiting_followup': case 'inbox': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'background_ready': case 'next_action': return <Eye className="w-4 h-4 text-blue-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  // Get urgent tasks (due today or overdue)
  const urgentTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date <= today && task.status !== 'done';
  }).slice(0, 3);

  // Get high priority tasks
  const highPriorityTasks = tasks.filter(task => 
    (task.priority === 'P1' || task.priority === 'deadline') && task.status !== 'done'
  ).slice(0, 3);

  // Get recent cases
  const recentCases = cases.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* AI-Powered Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Good morning! 🌅</h1>
              <p className="text-blue-200 text-lg">AI analyzed your workflow - here's your intelligent priority guide</p>
            </div>
            <div className="text-right text-blue-200">
              <div className="text-sm">{currentTime.toLocaleDateString()}</div>
              <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
          
          {/* AI Intelligence Bar */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Brain className="w-6 h-6 text-purple-300" />
                <div>
                  <h3 className="font-bold text-white">🧠 AI Strategic Analysis</h3>
                  <p className="text-blue-200 text-sm">{mockIntelligentData.aiInsights.criticalPath}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-sm text-blue-300">Efficiency</div>
                  <div className="text-lg font-bold text-green-400">{mockIntelligentData.aiInsights.efficiency}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-300">Prediction</div>
                  <div className="text-lg font-bold text-blue-300">✅ On Track</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Intelligence Banner */}
      {urgentTasks.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-white">🚨 Critical Path Detected</h3>
                  <p className="text-red-100">{urgentTasks.length} urgent task{urgentTasks.length > 1 ? 's' : ''} need{urgentTasks.length === 1 ? 's' : ''} immediate attention</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/tasks?filter=today">
                  <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                    🎯 View Tasks
                  </button>
                </Link>
                <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                  📱 Mobile Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: AI-Prioritized Tasks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Intelligent Task Queue */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  🎯 AI-Prioritized Task Queue
                </h2>
                <Link href="/tasks">
                  <button className="bg-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
                    ✨ View All Tasks
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {highPriorityTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">🎉</div>
                    <p className="text-gray-400">No high priority tasks - you're caught up!</p>
                    <Link href="/tasks">
                      <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                        View all tasks →
                      </button>
                    </Link>
                  </div>
                ) : (
                  highPriorityTasks.map(task => (
                    <div key={task.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(task.status)}
                            <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></span>
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                              {task.priority}
                            </span>
                          </div>
                          <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {task.due_date && (
                            <div className="text-xs text-orange-400">
                              Due: {getTimeUntilDeadline(task.due_date)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Insights Panel */}
                      <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">🤖 AI Insights</h4>
                        <div className="text-xs text-gray-300">
                          <div className="mb-1">
                            <span className="text-purple-400">Status:</span> {task.status.replace('_', ' ')}
                          </div>
                          <div className="mb-1">
                            <span className="text-purple-400">Priority:</span> {task.priority} - High importance
                          </div>
                          {task.due_date && (
                            <div>
                              <span className="text-purple-400">Timing:</span> Due {task.due_date}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <Link href={`/tasks?edit=${task.id}`}>
                          <button className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                            🎯 Start Now
                          </button>
                        </Link>
                        <button className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-700 transition">
                          📅 Schedule
                        </button>
                        <button className="bg-purple-600 px-3 py-1 rounded text-xs hover:bg-purple-700 transition">
                          🤖 AI Assist
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Cases Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Gavel className="w-5 h-5 mr-2 text-gray-400" />
                  ⚖️ Recent Cases
                </h2>
                <Link href="/work">
                  <button className="bg-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">
                    View All Cases
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentCases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📁</div>
                    <p className="text-gray-400">No cases yet</p>
                    <Link href="/work">
                      <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                        Create first case →
                      </button>
                    </Link>
                  </div>
                ) : (
                  recentCases.map(case_ => (
                    <div key={case_.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{case_.title}</h3>
                          <p className="text-sm text-gray-300">{case_.status}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                          </span>
                        </div>
                      </div>

                      {case_.description && (
                        <p className="text-sm text-gray-400 mb-3">{case_.description}</p>
                      )}

                      <div className="flex space-x-2">
                        <Link href={`/work?edit=${case_.id}`}>
                          <button className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                            📄 View Details
                          </button>
                        </Link>
                        <button className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-700 transition">
                          📧 Contact Client
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Module Access Grid */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                🚀 Life OS Modules
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/tasks">
                  <div className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">📋</div>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Tasks</h3>
                    <p className="text-blue-100 text-sm">Task & Project Management</p>
                    <div className="mt-2 text-xs text-blue-200">
                      {tasks.filter(t => t.status !== 'done').length} active tasks
                    </div>
                  </div>
                </Link>

                <Link href="/work">
                  <div className="bg-gray-700 text-white rounded-lg p-4 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">⚖️</div>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Legal Cases</h3>
                    <p className="text-gray-300 text-sm">Case Management</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {cases.length} active cases
                    </div>
                  </div>
                </Link>

                <div className="bg-gray-700 text-gray-300 rounded-lg p-4 relative opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl opacity-50">🧠</div>
                    <div className="bg-yellow-500 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Knowledge</h3>
                  <p className="text-gray-400 text-sm">Second Brain & Notes</p>
                </div>

                <div className="bg-gray-700 text-gray-300 rounded-lg p-4 relative opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl opacity-50">💰</div>
                    <div className="bg-yellow-500 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-white">Finance</h3>
                  <p className="text-gray-400 text-sm">Net Worth & Budgets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Intelligence */}
          <div className="space-y-6">
            
            {/* Critical Deadlines */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                🚨 Critical Deadlines
              </h2>

              <div className="space-y-3">
                {urgentTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-green-400 mb-2">✅</div>
                    <p className="text-gray-400 text-sm">No urgent deadlines</p>
                  </div>
                ) : (
                  urgentTasks.map(task => (
                    <div key={task.id} className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{task.title}</h4>
                          {task.description && (
                            <p className="text-red-300 text-xs">{task.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-red-400 font-bold text-sm">
                            {task.due_date ? getTimeUntilDeadline(task.due_date) : 'No date'}
                          </div>
                          {task.due_date && (
                            <div className="text-red-300 text-xs">
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-red-200 mb-2">🤖 AI: High priority task needs attention</p>
                      
                      <div className="flex space-x-1">
                        <Link href={`/tasks?edit=${task.id}`}>
                          <button className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700 transition">
                            🎯 Work Now
                          </button>
                        </Link>
                        <button className="bg-orange-600 px-2 py-1 rounded text-xs hover:bg-orange-700 transition">
                          📅 Schedule
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Workload Analysis */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                📊 Live Workload Analysis
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 text-sm">Capacity</span>
                    <span className="text-blue-400 font-bold">{mockIntelligentData.workloadAnalysis.currentCapacity}%</span>
                  </div>
                  <div className="w-full bg-blue-900 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${mockIntelligentData.workloadAnalysis.currentCapacity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-900 bg-opacity-30 rounded-lg p-3">
                    <div className="text-green-400 text-xs">Task Velocity</div>
                    <div className="text-green-300 font-bold">{mockIntelligentData.workloadAnalysis.taskVelocity}/day</div>
                  </div>
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3">
                    <div className="text-purple-400 text-xs">Efficiency</div>
                    <div className="text-purple-300 font-bold">↗️ +23%</div>
                  </div>
                </div>

                <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-3">
                  <h4 className="text-yellow-400 text-sm font-semibold mb-2">🤖 AI Recommendations</h4>
                  <ul className="text-yellow-200 text-xs space-y-1">
                    {mockIntelligentData.workloadAnalysis.recommendedActions.map((action, index) => (
                      <li key={index}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                ⚡ Quick Actions
              </h2>

              <div className="space-y-2">
                <Link href="/tasks">
                  <button className="w-full bg-blue-600 p-3 rounded-lg text-left hover:bg-blue-700 transition">
                    🎯 View All Tasks
                  </button>
                </Link>
                <Link href="/work">
                  <button className="w-full bg-gray-600 p-3 rounded-lg text-left hover:bg-gray-700 transition">
                    ⚖️ Manage Legal Cases
                  </button>
                </Link>
                <button className="w-full bg-purple-600 p-3 rounded-lg text-left hover:bg-purple-700 transition">
                  🤖 Get AI Productivity Report
                </button>
                <button className="w-full bg-orange-600 p-3 rounded-lg text-left hover:bg-orange-700 transition">
                  📱 Switch to Mobile Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Development Progress */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">🚀 Life OS Evolution Progress</h3>
          <p className="text-blue-100 mb-4">Phase 1: Intelligence Foundation → Tesla-Style UI Implementation</p>
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div className="bg-white rounded-full h-2 w-4/5"></div>
          </div>
          <p className="text-sm text-blue-100">AI Integration ✅ • Tesla UI ✅ • Predictive Analytics in progress</p>
        </div>
      </div>
    </div>
  );
}
