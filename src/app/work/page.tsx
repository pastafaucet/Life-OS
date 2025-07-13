'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData, Case, WorkSession } from '../../lib/dataContext';

export default function WorkPage() {
  const { 
    cases, 
    sessions, 
    addCase, 
    deleteCase, 
    addSession, 
    updateSession, 
    deleteSession 
  } = useData();
  const [activeView, setActiveView] = useState<'cases' | 'sessions'>('cases');
  const [showAddCase, setShowAddCase] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  
  const [newCase, setNewCase] = useState({
    case_number: '',
    title: '',
    client_name: '',
    description: '',
    case_type: 'litigation' as Case['case_type'],
    status: 'active' as Case['status'],
    priority: 'medium' as Case['priority'],
    opened_date: new Date().toISOString().split('T')[0],
    due_date: '',
    estimated_hours: '',
    billing_rate: ''
  });

  const [newSession, setNewSession] = useState({
    case_id: '',
    title: '',
    description: '',
    start_time: new Date().toISOString().slice(0, 16)
  });

  // Add new case
  const handleAddCase = () => {
    if (!newCase.title.trim()) return;

    addCase({
      case_number: newCase.case_number,
      title: newCase.title,
      client_name: newCase.client_name,
      description: newCase.description,
      case_type: newCase.case_type,
      status: newCase.status,
      priority: newCase.priority,
      opened_date: newCase.opened_date,
      due_date: newCase.due_date || undefined,
      estimated_hours: newCase.estimated_hours ? parseInt(newCase.estimated_hours) : undefined,
      billing_rate: newCase.billing_rate ? parseFloat(newCase.billing_rate) : undefined
    });

    setNewCase({ 
      case_number: '', 
      title: '', 
      client_name: '', 
      description: '', 
      case_type: 'litigation', 
      status: 'active', 
      priority: 'medium', 
      opened_date: new Date().toISOString().split('T')[0], 
      due_date: '', 
      estimated_hours: '', 
      billing_rate: '' 
    });
    setShowAddCase(false);
  };

  // Add new session
  const handleAddSession = () => {
    if (!newSession.title.trim()) return;

    addSession({
      case_id: newSession.case_id || undefined,
      title: newSession.title,
      description: newSession.description,
      start_time: newSession.start_time,
      is_active: true
    });

    setNewSession({ case_id: '', title: '', description: '', start_time: new Date().toISOString().slice(0, 16) });
    setShowAddSession(false);
  };

  // Stop active session
  const stopSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.is_active) {
      const endTime = new Date().toISOString();
      const startTime = new Date(session.start_time);
      const endTimeDate = new Date(endTime);
      const durationMinutes = Math.round((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));
      
      updateSession(sessionId, {
        end_time: endTime,
        duration_minutes: durationMinutes,
        is_active: false
      });
    }
  };

  // Delete case
  const handleDeleteCase = (caseId: string) => {
    deleteCase(caseId);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  // Get case type color
  const getCaseTypeColor = (caseType: Case['case_type']) => {
    switch (caseType) {
      case 'litigation': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'transactional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'consultation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'research': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const activeCases = cases.filter(c => c.status === 'active');
  const activeSessions = sessions.filter(s => s.is_active);

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
                Case Management
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddCase(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + New Case
              </button>
              <button
                onClick={() => setShowAddSession(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + Start Session
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MCLE Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">MCLE Requirements Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nevada Requirements */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">Nevada</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Hours needed this period:</span>
                  <span className="font-medium text-slate-900 dark:text-white">10 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Days remaining in period:</span>
                  <span className="font-medium text-orange-600">245 days</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Period: July 1, 2024 - June 30, 2027
                </div>
              </div>
            </div>

            {/* California Requirements */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">California</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Hours needed this period:</span>
                  <span className="font-medium text-slate-900 dark:text-white">25 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Days remaining in period:</span>
                  <span className="font-medium text-red-600">245 days</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Period: February 1, 2025 - January 31, 2028
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Need Info Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Need Info</h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• No tasks</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Active Cases</p>
            <p className="text-2xl font-bold text-blue-600">{activeCases.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Cases</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{cases.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Active Sessions</p>
            <p className="text-2xl font-bold text-green-600">{activeSessions.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.length}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 mb-6 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('cases')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'cases'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cases
          </button>
          <button
            onClick={() => setActiveView('sessions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'sessions'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Work Sessions
          </button>
        </div>

        {/* Cases View */}
        {activeView === 'cases' && (
          <div className="space-y-4">
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No cases yet</p>
                <button
                  onClick={() => setShowAddCase(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Create Your First Case
                </button>
              </div>
            ) : (
              cases.map(caseItem => (
                <div key={caseItem.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{caseItem.title}</h3>
                        {caseItem.case_number && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">#{caseItem.case_number}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Client: {caseItem.client_name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCase(caseItem.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {caseItem.description && (
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{caseItem.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCaseTypeColor(caseItem.case_type)}`}>
                      {caseItem.case_type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Opened</p>
                      <p className="text-slate-900 dark:text-white">{new Date(caseItem.opened_date).toLocaleDateString()}</p>
                    </div>
                    {caseItem.due_date && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Due Date</p>
                        <p className="text-slate-900 dark:text-white">{new Date(caseItem.due_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {caseItem.estimated_hours && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Estimated Hours</p>
                        <p className="text-slate-900 dark:text-white">{caseItem.estimated_hours}h</p>
                      </div>
                    )}
                    {caseItem.billing_rate && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Billing Rate</p>
                        <p className="text-slate-900 dark:text-white">${caseItem.billing_rate}/hr</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sessions View */}
        {activeView === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No work sessions yet</p>
                <button
                  onClick={() => setShowAddSession(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Start Your First Session
                </button>
              </div>
            ) : (
              sessions.map(session => (
                <div key={session.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{session.title}</h3>
                      {session.case_id && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Case: {cases.find(c => c.id === session.case_id)?.title || 'Unknown'}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {session.is_active && (
                        <button
                          onClick={() => stopSession(session.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                        >
                          Stop
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {session.description && (
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{session.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Status</p>
                      <p className={`font-medium ${session.is_active ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                        {session.is_active ? 'Active' : 'Completed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Start Time</p>
                      <p className="text-slate-900 dark:text-white">{new Date(session.start_time).toLocaleString()}</p>
                    </div>
                    {session.end_time && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">End Time</p>
                        <p className="text-slate-900 dark:text-white">{new Date(session.end_time).toLocaleString()}</p>
                      </div>
                    )}
                    {session.duration_minutes && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Duration</p>
                        <p className="text-slate-900 dark:text-white">
                          {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Case Modal */}
        {showAddCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Case</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Case Number
                    </label>
                    <input
                      type="text"
                      value={newCase.case_number}
                      onChange={(e) => setNewCase({ ...newCase, case_number: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Case Type
                    </label>
                    <select
                      value={newCase.case_type}
                      onChange={(e) => setNewCase({ ...newCase, case_type: e.target.value as Case['case_type'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="litigation">Litigation</option>
                      <option value="transactional">Transactional</option>
                      <option value="consultation">Consultation</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Case Title *
                  </label>
                  <input
                    type="text"
                    value={newCase.title}
                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter case title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newCase.client_name}
                    onChange={(e) => setNewCase({ ...newCase, client_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter client name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCase.description}
                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="Case description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newCase.status}
                      onChange={(e) => setNewCase({ ...newCase, status: e.target.value as Case['status'] })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="on_hold">On Hold</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={newCase.priority}
                      onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as Case['priority'] })}
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
                      Opened Date
                    </label>
                    <input
                      type="date"
                      value={newCase.opened_date}
                      onChange={(e) => setNewCase({ ...newCase, opened_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newCase.due_date}
                      onChange={(e) => setNewCase({ ...newCase, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={newCase.estimated_hours}
                      onChange={(e) => setNewCase({ ...newCase, estimated_hours: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Billing Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCase.billing_rate}
                      onChange={(e) => setNewCase({ ...newCase, billing_rate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCase(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCase}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Case
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Session Modal */}
        {showAddSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Start Work Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter session title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Link to Case
                  </label>
                  <select
                    value={newSession.case_id}
                    onChange={(e) => setNewSession({ ...newSession, case_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">No case selected</option>
                    {cases.map(caseItem => (
                      <option key={caseItem.id} value={caseItem.id}>
                        {caseItem.title} - {caseItem.client_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    placeholder="What are you working on?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddSession(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSession}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
