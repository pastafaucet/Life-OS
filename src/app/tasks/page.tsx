'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData, Task, Case, Project } from '../../lib/dataContext';

export default function TasksPage() {
  const { 
    tasks, 
    cases, 
    projects, 
    addTask, 
    updateTask, 
    deleteTask, 
    getCaseById, 
    getProjectById 
  } = useData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'P2' as Task['priority'],
    do_date: '',
    do_time: '',
    due_date: '',
    case_ids: [] as string[],
    project_ids: [] as string[]
  });

  const [showParseHint, setShowParseHint] = useState(false);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'P2' as Task['priority'],
    do_date: '',
    do_time: '',
    due_date: '',
    case_ids: [] as string[],
    project_ids: [] as string[]
  });

  // Handle title input - simple text input
  const handleTitleChange = (value: string) => {
    setNewTask(prev => ({
      ...prev,
      title: value
    }));
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    addTask({
      title: newTask.title,
      description: newTask.description,
      status: 'inbox',
      priority: newTask.priority,
      do_date: newTask.do_date || undefined,
      do_time: newTask.do_time || undefined,
      due_date: newTask.due_date || undefined,
      case_ids: newTask.case_ids,
      project_ids: newTask.project_ids
    });

    setNewTask({ 
      title: '', 
      description: '', 
      priority: 'P2', 
      do_date: '',
      do_time: '',
      due_date: '', 
      case_ids: [], 
      project_ids: [] 
    });
    setShowAddForm(false);
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  // Start editing task
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      do_date: task.do_date || '',
      do_time: task.do_time || '',
      due_date: task.due_date || '',
      case_ids: task.case_ids || [],
      project_ids: task.project_ids || []
    });
    setShowEditForm(true);
  };

  // Save edited task
  const saveEditTask = () => {
    if (!editTask.title.trim() || !editingTask) return;

    updateTask(editingTask.id, {
      title: editTask.title,
      description: editTask.description,
      priority: editTask.priority,
      do_date: editTask.do_date || undefined,
      do_time: editTask.do_time || undefined,
      due_date: editTask.due_date || undefined,
      case_ids: editTask.case_ids,
      project_ids: editTask.project_ids
    });
    
    setShowEditForm(false);
    setEditingTask(null);
    setEditTask({ 
      title: '', 
      description: '', 
      priority: 'P2', 
      do_date: '',
      do_time: '',
      due_date: '', 
      case_ids: [], 
      project_ids: [] 
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingTask(null);
    setEditTask({ 
      title: '', 
      description: '', 
      priority: 'P2', 
      do_date: '',
      do_time: '',
      due_date: '', 
      case_ids: [], 
      project_ids: [] 
    });
  };

  // Handle case selection (multi-select)
  const handleCaseSelection = (caseId: string, isNewTask: boolean = true) => {
    const currentTask = isNewTask ? newTask : editTask;
    const setCurrentTask = isNewTask ? setNewTask : setEditTask;
    
    const updatedCaseIds = currentTask.case_ids.includes(caseId)
      ? currentTask.case_ids.filter(id => id !== caseId)
      : [...currentTask.case_ids, caseId];
    
    setCurrentTask({ ...currentTask, case_ids: updatedCaseIds });
  };

  // Handle project selection (multi-select)
  const handleProjectSelection = (projectId: string, isNewTask: boolean = true) => {
    const currentTask = isNewTask ? newTask : editTask;
    const setCurrentTask = isNewTask ? setNewTask : setEditTask;
    
    const updatedProjectIds = currentTask.project_ids.includes(projectId)
      ? currentTask.project_ids.filter(id => id !== projectId)
      : [...currentTask.project_ids, projectId];
    
    setCurrentTask({ ...currentTask, project_ids: updatedProjectIds });
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

  // Helper functions to get linked data
  const getLinkedCases = (caseIds: string[]): Case[] => {
    return caseIds.map(id => getCaseById(id)).filter(Boolean) as Case[];
  };

  const getLinkedProjects = (projectIds: string[]): Project[] => {
    return projectIds.map(id => getProjectById(id)).filter(Boolean) as Project[];
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
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
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

                <div className="grid grid-cols-1 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Do Date
                    </label>
                    <input
                      type="date"
                      value={newTask.do_date}
                      onChange={(e) => setNewTask({ ...newTask, do_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Do Time
                    </label>
                    <input
                      type="time"
                      value={newTask.do_time}
                      onChange={(e) => setNewTask({ ...newTask, do_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>


                {/* Cases Multi-Select Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Link to Cases
                  </label>
                  <MultiSelectPicker
                    options={cases.map(case_ => ({
                      id: case_.id,
                      label: case_.case_number ? `${case_.case_number}: ${case_.title}` : case_.title,
                      sublabel: case_.client_name
                    }))}
                    selectedIds={newTask.case_ids}
                    onChange={(selectedIds) => setNewTask({ ...newTask, case_ids: selectedIds })}
                    placeholder="Select cases..."
                    emptyMessage="No cases available"
                  />
                </div>

                {/* Projects Multi-Select Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Link to Projects
                  </label>
                  <MultiSelectPicker
                    options={projects.map(project => ({
                      id: project.id,
                      label: project.title,
                      sublabel: `${project.status} • ${project.priority} priority`
                    }))}
                    selectedIds={newTask.project_ids}
                    onChange={(selectedIds) => setNewTask({ ...newTask, project_ids: selectedIds })}
                    placeholder="Select projects..."
                    emptyMessage="No projects available"
                  />
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
                  onClick={handleAddTask}
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
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Do Date
                    </label>
                    <input
                      type="date"
                      value={editTask.do_date}
                      onChange={(e) => setEditTask({ ...editTask, do_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Do Time
                    </label>
                    <input
                      type="time"
                      value={editTask.do_time}
                      onChange={(e) => setEditTask({ ...editTask, do_time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>


                {/* Cases Multi-Select Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Link to Cases
                  </label>
                  <MultiSelectPicker
                    options={cases.map(case_ => ({
                      id: case_.id,
                      label: case_.case_number ? `${case_.case_number}: ${case_.title}` : case_.title,
                      sublabel: case_.client_name
                    }))}
                    selectedIds={editTask.case_ids}
                    onChange={(selectedIds) => setEditTask({ ...editTask, case_ids: selectedIds })}
                    placeholder="Select cases..."
                    emptyMessage="No cases available"
                  />
                </div>

                {/* Projects Multi-Select Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Link to Projects
                  </label>
                  <MultiSelectPicker
                    options={projects.map(project => ({
                      id: project.id,
                      label: project.title,
                      sublabel: `${project.status} • ${project.priority} priority`
                    }))}
                    selectedIds={editTask.project_ids}
                    onChange={(selectedIds) => setEditTask({ ...editTask, project_ids: selectedIds })}
                    placeholder="Select projects..."
                    emptyMessage="No projects available"
                  />
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
                  onDelete={handleDeleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getLinkedCases={getLinkedCases}
                  getLinkedProjects={getLinkedProjects}
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
                  onDelete={handleDeleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getLinkedCases={getLinkedCases}
                  getLinkedProjects={getLinkedProjects}
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
                  onDelete={handleDeleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getLinkedCases={getLinkedCases}
                  getLinkedProjects={getLinkedProjects}
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
                  onDelete={handleDeleteTask}
                  onEdit={startEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getLinkedCases={getLinkedCases}
                  getLinkedProjects={getLinkedProjects}
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

// Multi-Select Picker Component with Search
interface MultiSelectPickerProps {
  options: Array<{
    id: string;
    label: string;
    sublabel?: string;
  }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder: string;
  emptyMessage: string;
}

function MultiSelectPicker({ options, selectedIds, onChange, placeholder, emptyMessage }: MultiSelectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (optionId: string) => {
    const newSelectedIds = selectedIds.includes(optionId)
      ? selectedIds.filter(id => id !== optionId)
      : [...selectedIds, optionId];
    onChange(newSelectedIds);
  };

  const selectedOptions = options.filter(option => selectedIds.includes(option.id));

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.sublabel && option.sublabel.toLowerCase().includes(searchLower))
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Main Input Area */}
      <div 
        className="w-full min-h-[42px] px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white cursor-text"
        onClick={handleInputClick}
      >
        {/* Selected Items */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedOptions.map(option => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.id);
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          placeholder={selectedOptions.length === 0 ? placeholder : "Type to search..."}
          className="w-full bg-transparent border-none outline-none text-sm placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search Results Info */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
              {filteredOptions.length === 0 
                ? `No results for "${searchTerm}"`
                : `${filteredOptions.length} result${filteredOptions.length === 1 ? '' : 's'} for "${searchTerm}"`
              }
            </div>
          )}
          
          {/* Options List */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              {searchTerm ? `No matches found for "${searchTerm}"` : emptyMessage}
            </div>
          ) : (
            filteredOptions.map(option => (
              <label
                key={option.id}
                className="flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                  className="mr-2 rounded border-slate-300 dark:border-slate-600"
                />
                <div className="flex-1">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {searchTerm ? (
                      <HighlightText text={option.label} highlight={searchTerm} />
                    ) : (
                      option.label
                    )}
                  </div>
                  {option.sublabel && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {searchTerm ? (
                        <HighlightText text={option.sublabel} highlight={searchTerm} />
                      ) : (
                        option.sublabel
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))
          )}
          
          {/* Clear Search Button */}
          {searchTerm && (
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleClose}
        />
      )}
    </div>
  );
}

// Helper component to highlight search terms
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-slate-900 dark:text-white">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
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
  getLinkedCases?: (caseIds: string[]) => Case[];
  getLinkedProjects?: (projectIds: string[]) => Project[];
}

function TaskCard({ task, onStatusChange, onDelete, onEdit, getPriorityColor, getStatusColor, getLinkedCases, getLinkedProjects }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Get linked data
  const linkedCases = getLinkedCases?.(task.case_ids) || [];
  const linkedProjects = getLinkedProjects?.(task.project_ids) || [];

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

      {/* Linked Cases/Projects Display */}
      {(linkedCases.length > 0 || linkedProjects.length > 0) && (
        <div className="mb-2 space-y-1">
          {linkedCases.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-wrap gap-1">
                {linkedCases.map((case_, index) => (
                  <span key={case_.id} className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    {case_.case_number ? `${case_.case_number}` : case_.title}
                    {index < linkedCases.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}
          {linkedProjects.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-wrap gap-1">
                {linkedProjects.map((project, index) => (
                  <span key={project.id} className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {project.title}
                    {index < linkedProjects.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
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
