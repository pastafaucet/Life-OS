'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAIEnhancedData } from '../../lib/ai/enhanced-data-context';
import { EnhancedTask as DataTask } from '../../lib/ai/enhanced-storage';
import { 
  TeslaCard, 
  TeslaButton, 
  TeslaMetric, 
  TeslaStatusIndicator,
  TeslaTaskDashboard,
  TeslaPredictiveInsights,
  TeslaAIInsightsBadges
} from '../../components/TeslaUI';
import { 
  Brain, 
  Clock, 
  Target, 
  Plus,
  ArrowLeft,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function TasksPage() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    enhanceTask,
    isAIEnabled,
    isProcessing
  } = useAIEnhancedData();
  
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DataTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<DataTask['priority']>('P2');
  const [editTaskStatus, setEditTaskStatus] = useState<DataTask['status']>('inbox');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');

  // Check URL parameters to auto-open new task modal or edit task
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
      setShowNewTaskModal(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/tasks');
    } else if (urlParams.get('edit')) {
      const taskId = urlParams.get('edit');
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setEditingTask(task);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description || '');
        setEditTaskPriority(task.priority);
        setEditTaskStatus(task.status);
        setEditTaskDueDate(task.due_date || '');
        setShowEditTaskModal(true);
      }
      // Clean up the URL
      window.history.replaceState({}, '', '/tasks');
    }
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      console.log('Creating task:', { title: newTaskTitle, description: newTaskDescription });
      
      const taskId = await addTask({
        title: newTaskTitle,
        description: newTaskDescription || '',
        status: 'inbox',
        priority: 'P2',
        tags: [],
        case_ids: []
      });

      console.log('Task created with ID:', taskId);

      // Auto-enhance the task if AI is enabled
      if (isAIEnabled && taskId) {
        try {
          console.log('Enhancing task...');
          await enhanceTask(taskId);
        } catch (error) {
          console.error('Error enhancing task:', error);
        }
      }

      // Reset form and close modal
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowNewTaskModal(false);
      
      console.log('Task creation completed successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTask = () => {
    if (!editingTask || !editTaskTitle.trim()) return;

    try {
      console.log('Updating task:', editingTask.id);
      
      updateTask(editingTask.id, {
        title: editTaskTitle,
        description: editTaskDescription,
        priority: editTaskPriority,
        status: editTaskStatus,
        due_date: editTaskDueDate || undefined,
        updated_at: new Date().toISOString()
      });

      // Reset form and close modal
      setShowEditTaskModal(false);
      setEditingTask(null);
      setEditTaskTitle('');
      setEditTaskDescription('');
      setEditTaskPriority('P2');
      setEditTaskStatus('inbox');
      setEditTaskDueDate('');
      
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const updateTaskStatus = (id: string, status: DataTask['status']) => {
    updateTask(id, { status });
  };

  const getStatusIcon = (status: DataTask['status']) => {
    switch (status) {
      case 'inbox': return <FileText className="w-4 h-4" />;
      case 'next_action': return <Target className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'done': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: DataTask['priority']) => {
    switch (priority) {
      case 'deadline': return 'text-red-400';
      case 'P1': return 'text-red-400';
      case 'P2': return 'text-orange-400';
      case 'P3': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile-First Header Layout */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Link href="/" className="text-blue-400 hover:text-blue-300 flex-shrink-0">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-purple-300 flex-shrink-0" />
                  <span className="truncate">AI Task Intelligence</span>
                </h1>
                <p className="text-blue-200 text-sm sm:text-base lg:text-lg">Smart task management with AI-powered insights</p>
              </div>
            </div>
            
            {/* Action Button - Responsive */}
            <div className="flex justify-end sm:justify-start">
              <TeslaButton 
                variant="primary" 
                size="md"
                onClick={() => setShowNewTaskModal(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:inline">New Task</span>
              </TeslaButton>
            </div>
          </div>
          
          {/* AI Intelligence Bar */}
          <TeslaCard gradient="purple" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <TeslaStatusIndicator status="online" size="md" />
                <div>
                  <h3 className="font-bold text-white">AI Analysis Active</h3>
                  <p className="text-purple-200 text-sm">
                    {tasks.filter(t => t.ai_enhanced).length} tasks enhanced • Processing: {isProcessing ? 'Active' : 'Idle'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <TeslaMetric
                  label="Active Tasks"
                  value={activeTasks.length.toString()}
                  color="blue"
                  size="sm"
                />
                <TeslaMetric
                  label="Completed"
                  value={completedTasks.length.toString()}
                  color="green"
                  size="sm"
                />
              </div>
            </div>
          </TeslaCard>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Tesla AI Insights Panel - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="lg:col-span-2">
            <TeslaAIInsightsBadges />
          </div>
          <div>
            <TeslaPredictiveInsights />
          </div>
        </div>

        {/* Tesla Task Dashboard */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Create your first task to get started with AI-powered task management</p>
            <TeslaButton 
              variant="primary" 
              size="md"
              onClick={() => setShowNewTaskModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Task
            </TeslaButton>
          </div>
        ) : (
          <TeslaTaskDashboard 
            tasks={tasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              priority: task.priority === 'deadline' ? 'urgent' : 
                        task.priority === 'P1' ? 'urgent' :
                        task.priority === 'P2' ? 'high' :
                        task.priority === 'P3' ? 'medium' : 'low',
              status: task.status === 'inbox' ? 'todo' :
                      task.status === 'next_action' ? 'todo' :
                      task.status === 'in_progress' ? 'in_progress' :
                      task.status === 'done' ? 'completed' : 'todo',
              estimated_time: 120, // Default 2 hours
              due_date: task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              category: task.tags?.[0] || 'General',
              ai_insights: {
                complexity_score: Math.random() * 10,
                optimal_time: 'Morning 9:00-11:00 AM',
                similar_tasks_avg: 90 + Math.random() * 120,
                completion_probability: 70 + Math.random() * 25,
                suggested_actions: [
                  'Review related documents',
                  'Schedule focused work time',
                  'Gather necessary resources'
                ]
              },
              dependencies: task.case_ids?.length ? [`Related to case ${task.case_ids[0]}`] : undefined,
              linked_cases: task.case_ids?.map(id => `Case ${id}`)
            }))}
          />
        )}
      </div>

      {/* Tesla-Style New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create AI-Enhanced Task</h3>
                <p className="text-sm text-gray-400">AI will analyze and optimize your task automatically</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-800/70 transition-all"
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-800/70 transition-all resize-none"
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>

              {/* AI Enhancement Notice */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">AI Enhancement</span>
                </div>
                <p className="text-xs text-purple-300">
                  Task will be automatically analyzed for complexity, priority, and optimal scheduling suggestions.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <TeslaButton
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowNewTaskModal(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                }}
              >
                Cancel
              </TeslaButton>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-4 h-4" />
                <span>Create & Enhance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tesla-Style Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Edit Task</h3>
                <p className="text-sm text-gray-400">Override AI suggestions and customize task details</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all"
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all resize-none"
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value as DataTask['priority'])}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="deadline">🔴 Deadline</option>
                    <option value="P1">🟠 P1 - High</option>
                    <option value="P2">🟡 P2 - Medium</option>
                    <option value="P3">🟢 P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value as DataTask['status'])}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="inbox">📥 Inbox</option>
                    <option value="next_action">🎯 Next Action</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={editTaskDueDate}
                  onChange={(e) => setEditTaskDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-gray-800/70 transition-all"
                />
              </div>

              {/* AI Override Notice */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">Human Override</span>
                </div>
                <p className="text-xs text-orange-300">
                  Your manual edits will override AI suggestions and be preserved in future analyses.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                  setEditTaskTitle('');
                  setEditTaskDescription('');
                  setEditTaskPriority('P2');
                  setEditTaskStatus('inbox');
                  setEditTaskDueDate('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTask}
                disabled={!editTaskTitle.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
