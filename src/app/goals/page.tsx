'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData, Goal, Project } from '../../lib/dataContext';

export default function GoalsPage() {
  const { 
    goals, 
    projects, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useData();
  const [activeView, setActiveView] = useState<'goals' | 'projects'>('goals');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    status: 'active' as Goal['status'],
    priority: 'medium' as Goal['priority'],
    target_date: '',
    progress_percentage: 0
  });

  const [newProject, setNewProject] = useState({
    goal_id: '',
    title: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    due_date: '',
    progress_percentage: 0
  });

  // Add new goal
  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    addGoal({
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      status: newGoal.status,
      priority: newGoal.priority,
      target_date: newGoal.target_date || undefined,
      progress_percentage: newGoal.progress_percentage
    });

    setNewGoal({ title: '', description: '', category: 'personal', status: 'active', priority: 'medium', target_date: '', progress_percentage: 0 });
    setShowAddGoal(false);
  };

  // Add new project
  const handleAddProject = () => {
    if (!newProject.title.trim()) return;

    addProject({
      goal_id: newProject.goal_id || undefined,
      title: newProject.title,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      start_date: newProject.start_date || undefined,
      due_date: newProject.due_date || undefined,
      progress_percentage: newProject.progress_percentage
    });

    setNewProject({ goal_id: '', title: '', description: '', status: 'planning', priority: 'medium', start_date: '', due_date: '', progress_percentage: 0 });
    setShowAddProject(false);
  };

  // Delete goal
  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  // Update progress
  const updateGoalProgress = (goalId: string, progress: number) => {
    updateGoal(goalId, { progress_percentage: progress });
  };

  const updateProjectProgress = (projectId: string, progress: number) => {
    updateProject(projectId, { progress_percentage: progress });
  };

  // Get category color
  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'professional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'health': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'financial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'learning': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: Goal['status'] | Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'paused': case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Goal['priority'] | Project['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const activeProjects = projects.filter(p => p.status === 'active');

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
                Goals & Projects
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + New Goal
              </button>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Active Goals</p>
            <p className="text-2xl font-bold text-purple-600">{activeGoals.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Goals</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{goals.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Active Projects</p>
            <p className="text-2xl font-bold text-blue-600">{activeProjects.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Projects</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 mb-6 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('goals')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'goals'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveView('projects')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'projects'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Projects
          </button>
        </div>

        {/* Goals View */}
        {activeView === 'goals' && (
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No goals yet</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              goals.map(goal => (
                <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(goal.priority)}`}>
                      {goal.priority} priority
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Progress</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {[0, 25, 50, 75, 100].map(value => (
                        <button
                          key={value}
                          onClick={() => updateGoalProgress(goal.id, value)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded"
                        >
                          {value}%
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {goal.target_date && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Target Date</p>
                        <p className="text-slate-900 dark:text-white">{new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Created</p>
                      <p className="text-slate-900 dark:text-white">{new Date(goal.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Related Projects</p>
                      <p className="text-slate-900 dark:text-white">{projects.filter(p => p.goal_id === goal.id).length}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Projects View */}
        {activeView === 'projects' && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No projects yet</p>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                      {project.goal_id && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Goal: {goals.find(g => g.id === project.goal_id)?.title || 'Unknown'}
                        </p>
                      )}
                      {project.description && (
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{project.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(project.priority)}`}>
                      {project.priority} priority
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Progress</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{project.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {[0, 25, 50, 75, 100].map(value => (
                        <button
                          key={value}
                          onClick={() => updateProjectProgress(project.id, value)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded"
                        >
                          {value}%
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {project.start_date && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Start Date</p>
                        <p className="text-slate-900 dark:text-white">{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {project.due_date && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Due Date</p>
                        <p className="text-slate-900 dark:text-white">{new Date(project.due_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Created</p>
                      <p className="text-slate-900 dark:text-white">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Goal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter goal title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Goal description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="personal">Personal</option>
                      <option value="professional">Professional</option>
                      <option value="health">Health</option>
                      <option value="financial">Financial</option>
                      <option value="learning">Learning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Goal['priority'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter project title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Goal (Optional)
                  </label>
                  <select
                    value={newProject.goal_id}
                    onChange={(e) => setNewProject({ ...newProject, goal_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">No goal</option>
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Project description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project['status'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project['priority'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newProject.due_date}
                      onChange={(e) => setNewProject({ ...newProject, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
