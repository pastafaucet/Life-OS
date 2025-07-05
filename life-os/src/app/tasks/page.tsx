'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'inbox' | 'someday' | 'next_action' | 'in_progress' | 'done' | 'cancelled';
  priority: 'deadline' | 'urgent' | 'event' | 'quick' | 'p1' | 'p2' | 'p3' | 'personal';
  doDate?: string; // YYYY-MM-DD format - the operative date
  doTime?: string; // HH:MM format
  repeat?: string; // Recurrence pattern
  linkedCases?: string[]; // Array of case IDs
  linkedNotes?: string[]; // Array of note IDs
  createdAt: Date;
}

interface NewTaskForm {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  doDate: string;
  doTime: string;
  repeat: string;
  linkedCases: string[];
  linkedNotes: string[];
}

type FilterType = 'all' | 'today' | 'tomorrow' | 'no_date' | 'done' | 'inbox' | 'someday' | 'next_action' | 'in_progress' | 'cancelled';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tempDateForm, setTempDateForm] = useState({
    doDate: '',
    doTime: '',
    repeat: ''
  });
  const [newTaskForm, setNewTaskForm] = useState<NewTaskForm>({
    title: '',
    description: '',
    status: 'inbox',
    priority: 'p2',
    doDate: '',
    doTime: '',
    repeat: '',
    linkedCases: [],
    linkedNotes: []
  });

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Date calculation helpers
  const getRelativeDates = () => {
    const now = new Date();
    const todayDate = new Date(now);
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // This weekend (next Saturday)
    const thisWeekend = new Date(now);
    const daysUntilSaturday = (6 - now.getDay()) % 7;
    thisWeekend.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    
    // Next week (next Monday)
    const nextWeek = new Date(now);
    const daysUntilMonday = (8 - now.getDay()) % 7;
    nextWeek.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
    
    // Next weekend (Saturday after next week)
    const nextWeekend = new Date(thisWeekend);
    nextWeekend.setDate(thisWeekend.getDate() + 7);
    
    // 2 weeks from now
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);
    
    // 4 weeks from now
    const fourWeeks = new Date(now);
    fourWeeks.setDate(now.getDate() + 28);

    return {
      today: { date: todayDate, label: todayDate.toLocaleDateString('en-US', { weekday: 'short' }) },
      tomorrow: { date: tomorrowDate, label: tomorrowDate.toLocaleDateString('en-US', { weekday: 'short' }) },
      thisWeekend: { date: thisWeekend, label: thisWeekend.toLocaleDateString('en-US', { weekday: 'short' }) },
      nextWeek: { date: nextWeek, label: nextWeek.toLocaleDateString('en-US', { weekday: 'short' }) },
      nextWeekend: { date: nextWeekend, label: nextWeekend.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) },
      twoWeeks: { date: twoWeeks, label: twoWeeks.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) },
      fourWeeks: { date: fourWeeks, label: fourWeeks.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) }
    };
  };

  // Calendar generation
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);
      if (current.getMonth() > month && week >= 4) break;
    }
    
    return calendar;
  };

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Handle Escape key to close date picker
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDatePicker) {
          setShowDatePicker(false);
        }
        if (showPriorityDropdown) {
          setShowPriorityDropdown(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDatePicker, showPriorityDropdown]);

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'today':
        return tasks.filter(task => task.doDate === today);
      case 'tomorrow':
        return tasks.filter(task => task.doDate === tomorrow);
      case 'no_date':
        return tasks.filter(task => !task.doDate);
      case 'done':
        return tasks.filter(task => task.status === 'done');
      case 'cancelled':
        return tasks.filter(task => task.status === 'cancelled');
      case 'someday':
        return tasks.filter(task => task.status === 'someday');
      case 'inbox':
        return tasks.filter(task => task.status === 'inbox');
      case 'next_action':
        return tasks.filter(task => task.status === 'next_action');
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress');
      default:
        return tasks;
    }
  };

  const handleCreateTask = () => {
    if (!newTaskForm.title.trim()) return;

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? {
              ...task,
              title: newTaskForm.title,
              description: newTaskForm.description,
              priority: newTaskForm.priority,
              status: newTaskForm.status,
              doDate: newTaskForm.doDate || undefined,
              doTime: newTaskForm.doTime || undefined,
              repeat: newTaskForm.repeat || undefined,
              linkedCases: newTaskForm.linkedCases,
              linkedNotes: newTaskForm.linkedNotes,
            }
          : task
      ));
      setEditingTask(null);
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskForm.title,
        description: newTaskForm.description,
        priority: newTaskForm.priority,
        status: newTaskForm.status,
        doDate: newTaskForm.doDate || undefined,
        doTime: newTaskForm.doTime || undefined,
        repeat: newTaskForm.repeat || undefined,
        linkedCases: newTaskForm.linkedCases,
        linkedNotes: newTaskForm.linkedNotes,
        createdAt: new Date()
      };

      setTasks([newTask, ...tasks]);
    }

    setNewTaskForm({
      title: '',
      description: '',
      status: 'inbox',
      priority: 'p2',
      doDate: '',
      doTime: '',
      repeat: '',
      linkedCases: [],
      linkedNotes: []
    });
    setShowNewTaskModal(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      doDate: task.doDate || '',
      doTime: task.doTime || '',
      repeat: task.repeat || '',
      linkedCases: task.linkedCases || [],
      linkedNotes: task.linkedNotes || []
    });
    setShowNewTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowNewTaskModal(false);
    setEditingTask(null);
    setNewTaskForm({
      title: '',
      description: '',
      status: 'inbox',
      priority: 'p2',
      doDate: '',
      doTime: '',
      repeat: '',
      linkedCases: [],
      linkedNotes: []
    });
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quick': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'p1': return 'bg-red-100 text-red-800 border-red-200';
      case 'p2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'p3': return 'bg-green-100 text-green-800 border-green-200';
      case 'personal': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'deadline': return '‼️';
      case 'urgent': return '🔥';
      case 'p1': return '🔴';
      case 'p2': return '🟡';
      case 'p3': return '🟢';
      case 'event': return '📅';
      case 'quick': return '⚡';
      case 'personal': return '😊';
      default: return '🟡';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'inbox': return 'bg-gray-100 text-gray-800';
      case 'someday': return 'bg-purple-100 text-purple-800';
      case 'next_action': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const filteredTasks = getFilteredTasks();

  const filters = [
    { key: 'all', label: 'All Tasks', count: tasks.length },
    { key: 'today', label: 'Today', count: tasks.filter(t => t.doDate === today).length },
    { key: 'tomorrow', label: 'Tomorrow', count: tasks.filter(t => t.doDate === tomorrow).length },
    { key: 'no_date', label: 'No Date', count: tasks.filter(t => !t.doDate).length },
    { key: 'inbox', label: 'Inbox', count: tasks.filter(t => t.status === 'inbox').length },
    { key: 'someday', label: 'Someday', count: tasks.filter(t => t.status === 'someday').length },
    { key: 'next_action', label: 'Next Actions', count: tasks.filter(t => t.status === 'next_action').length },
    { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { key: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
    { key: 'cancelled', label: 'Cancelled', count: tasks.filter(t => t.status === 'cancelled').length },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Tasks</h1>
                <p className="text-gray-300">Task & Project Management</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Tasks Display (2/3) */}
          <div className="flex-1" style={{ flexBasis: '66.666667%' }}>
            {/* View Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as FilterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Events Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Events & Agendas</h2>
              <div className="space-y-4">
                {filteredTasks.filter(task => task.priority === 'event').length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No events scheduled</p>
                  </div>
                ) : (
                  filteredTasks.filter(task => task.priority === 'event').map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Icon on far left */}
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getPriorityIcon(task.priority)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-gray-300 mb-3">
                              {task.description}
                            </p>
                          )}
                          
                        </div>
                        
                        {/* Checkbox on far right */}
                        <div className="flex-shrink-0 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, task.status === 'done' ? 'inbox' : 'done');
                            }}
                            className="w-6 h-6 border-2 border-gray-400 rounded hover:border-green-400 transition-colors flex items-center justify-center"
                          >
                            {task.status === 'done' && (
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
              <div className="space-y-4">
                {filteredTasks.filter(task => task.priority !== 'event').length === 0 ? (
                  <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {activeFilter === 'all' ? 'No tasks yet' : `No ${activeFilter.replace('_', ' ')} tasks`}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {activeFilter === 'all' 
                        ? 'Create your first task to get started!' 
                        : `No tasks match the ${activeFilter.replace('_', ' ')} filter.`
                      }
                    </p>
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Task
                    </button>
                  </div>
                ) : (
                  filteredTasks.filter(task => task.priority !== 'event').map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Icon on far left */}
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getPriorityIcon(task.priority)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-gray-300 mb-3">
                              {task.description}
                            </p>
                          )}
                          
                        </div>
                        
                        {/* Checkbox on far right */}
                        <div className="flex-shrink-0 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, task.status === 'done' ? 'inbox' : 'done');
                            }}
                            className="w-6 h-6 border-2 border-gray-400 rounded hover:border-green-400 transition-colors flex items-center justify-center"
                          >
                            {task.status === 'done' && (
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Context Panel (1/3) */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Context & Overview</h3>
              
              {/* Task Statistics */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Task Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Tasks</span>
                    <span className="text-white font-medium">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">In Progress</span>
                    <span className="text-orange-400 font-medium">{tasks.filter(t => t.status === 'in_progress').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Next Actions</span>
                    <span className="text-blue-400 font-medium">{tasks.filter(t => t.status === 'next_action').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-green-400 font-medium">{tasks.filter(t => t.status === 'done').length}</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Upcoming This Week</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    📅 Project review meeting - Tomorrow
                  </div>
                  <div className="text-sm text-gray-400">
                    🎂 John's birthday - Friday
                  </div>
                  <div className="text-sm text-gray-400">
                    📋 Quarterly report due - Next Monday
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowNewTaskModal(true)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                  >
                    + Add Task
                  </button>
                  <button 
                    onClick={() => setActiveFilter('today')}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                  >
                    📅 View Today's Tasks
                  </button>
                  <button 
                    onClick={() => setActiveFilter('in_progress')}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                  >
                    🔄 View In Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* New Task Panel - Floating without overlay */}
      {showNewTaskModal && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-[600px] z-40">
            <div className="p-6">
              {/* Title Input */}
              <input
                type="text"
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTask();
                  }
                }}
                className="w-full text-xl font-medium text-white bg-transparent border-none outline-none placeholder-gray-400 mb-2"
                placeholder="Task name"
              />
              
              {/* Description Input */}
              <textarea
                value={newTaskForm.description}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                }}
                className="w-full text-gray-300 bg-transparent border-none outline-none placeholder-gray-500 resize-none mb-4"
                rows={2}
                placeholder="Description"
              />
              
              {/* Tag-style Buttons Row */}
              <div className="flex items-start gap-2 mb-6 relative">
                {/* Date/Time/Repeat Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      newTaskForm.doDate || newTaskForm.doTime || newTaskForm.repeat
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {newTaskForm.doDate ? new Date(newTaskForm.doDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                    {(newTaskForm.doDate || newTaskForm.doTime || newTaskForm.repeat) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewTaskForm({ ...newTaskForm, doDate: '', doTime: '', repeat: '' });
                        }}
                        className="ml-1 text-green-200 hover:text-white cursor-pointer"
                      >
                        ×
                      </span>
                    )}
                  </button>
                  
                  {/* Comprehensive Date Picker - positioned under the date button */}
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 w-[700px]">
                      {/* Main Content */}
                      <div className="flex">
                        {/* Left Panel - Quick Options */}
                        <div className="w-1/2 p-4 border-r border-gray-600">
                          <div className="space-y-1">
                            {(() => {
                              const dates = getRelativeDates();
                              return [
                                { key: 'today', label: 'Today', value: dates.today.date.toISOString().split('T')[0], display: dates.today.label },
                                { key: 'later', label: 'Later', value: dates.today.date.toISOString().split('T')[0], display: '5:05 pm', time: '17:05' },
                                { key: 'tomorrow', label: 'Tomorrow', value: dates.tomorrow.date.toISOString().split('T')[0], display: dates.tomorrow.label },
                                { key: 'thisWeekend', label: 'This weekend', value: dates.thisWeekend.date.toISOString().split('T')[0], display: dates.thisWeekend.label },
                                { key: 'nextWeek', label: 'Next week', value: dates.nextWeek.date.toISOString().split('T')[0], display: dates.nextWeek.label },
                                { key: 'nextWeekend', label: 'Next weekend', value: dates.nextWeekend.date.toISOString().split('T')[0], display: dates.nextWeekend.label },
                                { key: 'twoWeeks', label: '2 weeks', value: dates.twoWeeks.date.toISOString().split('T')[0], display: dates.twoWeeks.label },
                                { key: 'fourWeeks', label: '4 weeks', value: dates.fourWeeks.date.toISOString().split('T')[0], display: dates.fourWeeks.label }
                              ].map((option) => (
                                <button
                                  key={option.key}
                                  onClick={() => {
                                    if (option.key === 'later') {
                                      setNewTaskForm({ ...newTaskForm, doDate: option.value, doTime: option.time || '' });
                                    } else {
                                      setNewTaskForm({ ...newTaskForm, doDate: option.value });
                                    }
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-700 rounded text-white text-sm"
                                >
                                  <span>{option.label}</span>
                                  <span className="text-gray-400 text-xs">{option.display}</span>
                                </button>
                              ));
                            })()}
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-600">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-700 rounded text-white text-sm">
                              <span>Set Recurring</span>
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Right Panel - Full Calendar */}
                        <div className="w-1/2 p-4">
                          {/* Top Bar - positioned above calendar */}
                          <div className="bg-gray-700 rounded px-3 py-2 mb-4 flex items-center justify-between border border-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-400 text-sm">Start date</span>
                            </div>
                            
                            {newTaskForm.doDate && (
                              <div className="flex items-center gap-2 px-2 py-1 bg-gray-600 rounded text-sm text-white">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(newTaskForm.doDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                <button
                                  onClick={() => {
                                    setNewTaskForm({ ...newTaskForm, doDate: '', doTime: '' });
                                  }}
                                  className="ml-1 text-gray-300 hover:text-white"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            
                            <input
                              type="text"
                              value={newTaskForm.doTime}
                              onChange={(e) => setNewTaskForm({ ...newTaskForm, doTime: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setShowDatePicker(false);
                                }
                              }}
                              placeholder="Add time"
                              className="bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                            />
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">
                              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  const today = new Date();
                                  setCurrentMonth(today);
                                  setNewTaskForm({ ...newTaskForm, doDate: today.toISOString().split('T')[0] });
                                }}
                                className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-gray-600 rounded"
                              >
                                Today
                              </button>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                  className="p-1 hover:bg-gray-700 rounded"
                                >
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                  className="p-1 hover:bg-gray-700 rounded"
                                >
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <div key={day} className="text-center text-sm text-gray-400 py-2 font-medium">
                                {day}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {generateCalendar(currentMonth).flat().map((date, index) => {
                              const dateStr = date.toISOString().split('T')[0];
                              const isToday = dateStr === today;
                              const isSelected = dateStr === newTaskForm.doDate;
                              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setNewTaskForm({ ...newTaskForm, doDate: dateStr });
                                  }}
                                  className={`
                                    w-8 h-8 text-sm rounded flex items-center justify-center transition-colors font-medium
                                    ${isSelected ? 'bg-blue-600 text-white rounded-lg' : ''}
                                    ${isToday && !isSelected ? 'bg-red-600 text-white rounded-full' : ''}
                                    ${!isSelected && !isToday ? (isCurrentMonth ? 'text-white hover:bg-gray-700' : 'text-gray-600') : ''}
                                  `}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      newTaskForm.priority !== 'p2'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                    </svg>
                    {newTaskForm.priority.toUpperCase()}
                  </button>
                  
                  {/* Priority Dropdown */}
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
                      {[
                        { value: 'deadline', label: 'Deadline', color: 'text-red-400' },
                        { value: 'urgent', label: 'Urgent', color: 'text-orange-400' },
                        { value: 'event', label: 'Event', color: 'text-purple-400' },
                        { value: 'quick', label: 'Quick', color: 'text-blue-400' },
                        { value: 'p1', label: 'P1', color: 'text-red-400' },
                        { value: 'p2', label: 'P2', color: 'text-yellow-400' },
                        { value: 'p3', label: 'P3', color: 'text-green-400' },
                        { value: 'personal', label: 'Personal', color: 'text-pink-400' }
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => {
                            setNewTaskForm({ ...newTaskForm, priority: priority.value as Task['priority'] });
                            setShowPriorityDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${priority.color}`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown - moved to right of priority */}
                <div>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value as Task['status'] })}
                    className="px-3 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="inbox">📥 Inbox</option>
                    <option value="someday">📅 Someday</option>
                    <option value="next_action">⚡ Next Action</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="done">✅ Done</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Removed separate status dropdown section */}
              <div className="mb-6">
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
                >
                  {editingTask ? 'Update task' : 'Add task'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
