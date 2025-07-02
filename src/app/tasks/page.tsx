'use client';

import { useState } from 'react';
import Link from 'next/link';

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'inbox' | 'next_action' | 'in_progress' | 'done';
  priority: 'P1' | 'P2' | 'P3' | 'deadline';
  do_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'P2' as Task['priority'],
    due_date: ''
  });
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'P2' as Task['priority'],
    due_date: ''
  });

  // Add new task
  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'inbox',
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', priority: 'P2', due_date: '' });
    setShowAddForm(false);
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status, updated_at: new Date().toISOString() }
        : task
    ));
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Start editing task
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || ''
    });
    setShowEditForm(true);
  };

  // Save edited task
  const saveEditTask = () => {
    if (!editTask.title.trim() || !editingTask) return;

    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { 
            ...task, 
            title: editTask.title,
            description: editTask.description,
            priority: editTask.priority,
            due_date: editTask.due_date || undefined,
            updated_at: new Date().toISOString()
          }
        : task
    ));
    
    setShowEditForm(false);
    setEditingTask(null);
    setEditTask({ title: '', description: '', priority: 'P2', due_date: '' });
  };

  // Cancel edit
  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingTask(null);
    setEditTask({ title: '', description: '', priority: 'P2', due_date: '' });
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'P3': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'deadline': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'inbox': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'next_action': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  // Filter tasks by status
  const tasksByStatus = {
    inbox: tasks.filter(t => t.status === 'inbox'),
    next_action: tasks.filter(t => t.status === 'next_action'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                ← Back to Dashboard
              </Link>
              <div className="ml-4 h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <h1 className="ml-4 text-2xl font-bold text-slate-900 dark:text-white">
                Task Management
              </h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              + Add Task
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Inbox</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tasksByStatus.inbox.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Next Actions</p>
            <p className="text-2xl font-bold text-blue-600">{tasksByStatus.next_action.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">{tasksByStatus.in_progress.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Completed</p>
            <p className="text-2xl font-bold text-green-600">{tasksByStatus.done.length}</p>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="P1">P1 (High)</option>
                      <option value="P2">P2 (Medium)</option>
                      <option value="P3">P3 (Low)</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Form */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={editTask.priority}
                      onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as Task['priority'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="P1">P1 (High)</option>
                      <option value="P2">P2 (Medium)</option>
                      <option value="P3">P3 (Low)</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editTask.due_date}
                      onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditTask}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Inbox */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Inbox</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">New tasks to process</p>
            </div>
            <div className="p-4 space-y-3">
              {tasksByStatus.inbox.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
              {tasksByStatus.inbox.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                  No tasks in inbox
                </p>
              )}
            </div>
          </div>

          {/* Next Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Next Actions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Ready to work on</p>
            </div>
            <div className="p-4 space-y-3">
              {tasksByStatus.next_action.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
              {tasksByStatus.next_action.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                  No next actions
                </p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">In Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Currently working on</p>
            </div>
            <div className="p-4 space-y-3">
              {tasksByStatus.in_progress.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                  Nothing in progress
                </p>
              )}
            </div>
          </div>

          {/* Done */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Done</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Completed tasks</p>
            </div>
            <div className="p-4 space-y-3">
              {tasksByStatus.done.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
              {tasksByStatus.done.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                  No completed tasks
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusColor: (status: Task['status']) => string;
}

function TaskCard({ task, onStatusChange, onDelete, onEdit, getPriorityColor, getStatusColor }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm">{task.title}</h4>
        <button
          onClick={() => setShowActions(!showActions)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        {task.due_date && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
          <div className="flex flex-wrap gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
              >
                Edit
              </button>
            )}
            {task.status !== 'next_action' && (
              <button
                onClick={() => onStatusChange(task.id, 'next_action')}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
              >
                → Next Action
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={() => onStatusChange(task.id, 'in_progress')}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded"
              >
                → In Progress
              </button>
            )}
            {task.status !== 'done' && (
              <button
                onClick={() => onStatusChange(task.id, 'done')}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
              >
                → Done
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
