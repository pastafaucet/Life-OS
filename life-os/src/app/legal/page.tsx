'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Case {
  id: string;
  case_name: string;
  case_summary: string;
  case_number: string;
  court: string;
  judge: string;
  status: 'Active' | 'Closed';
  closed_reason?: 'Settlement' | 'MTD' | 'MSJ' | 'Trial' | 'Dismissed';
  created_at: Date;
  updated_at: Date;
}

interface Court {
  id: string;
  court_name: string;
}

interface Judge {
  id: string;
  judge_name: string;
}

interface NewCaseForm {
  case_name: string;
  case_summary: string;
  case_number: string;
  court: string;
  judge: string;
  status: 'Active' | 'Closed';
  closed_reason?: 'Settlement' | 'MTD' | 'MSJ' | 'Trial' | 'Dismissed';
}

type ViewMode = 'active-cards' | 'active-list' | 'closed';

export default function LegalPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>('active-cards');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewCourtModal, setShowNewCourtModal] = useState(false);
  const [showNewJudgeModal, setShowNewJudgeModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [newCourtName, setNewCourtName] = useState('');
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newCaseForm, setNewCaseForm] = useState<NewCaseForm>({
    case_name: '',
    case_summary: '',
    case_number: '',
    court: '',
    judge: '',
    status: 'Active'
  });

  // Get filtered cases based on active view
  const getFilteredCases = () => {
    const sortedCases = [...cases].sort((a, b) => a.case_name.localeCompare(b.case_name));
    
    switch (activeView) {
      case 'active-cards':
      case 'active-list':
        return sortedCases.filter(c => c.status === 'Active');
      case 'closed':
        return sortedCases.filter(c => c.status === 'Closed');
      default:
        return sortedCases;
    }
  };

  // Check if case needs info
  const caseNeedsInfo = (caseItem: Case) => {
    return !caseItem.case_number || !caseItem.court || !caseItem.judge;
  };

  // Check if case has no tasks (placeholder for now)
  const caseHasNoTasks = (caseItem: Case) => {
    // TODO: Integrate with tasks system
    return true; // Placeholder
  };

  // Handle creating new case
  const handleCreateCase = () => {
    if (!newCaseForm.case_name.trim()) return;

    const newCase: Case = {
      id: Date.now().toString(),
      case_name: newCaseForm.case_name,
      case_summary: newCaseForm.case_summary,
      case_number: newCaseForm.case_number,
      court: newCaseForm.court,
      judge: newCaseForm.judge,
      status: newCaseForm.status,
      closed_reason: newCaseForm.status === 'Closed' ? newCaseForm.closed_reason : undefined,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (editingCase) {
      setCases(cases.map(c => c.id === editingCase.id ? { ...newCase, id: editingCase.id } : c));
      setEditingCase(null);
    } else {
      setCases([newCase, ...cases]);
    }

    setNewCaseForm({
      case_name: '',
      case_summary: '',
      case_number: '',
      court: '',
      judge: '',
      status: 'Active'
    });
    setShowNewCaseModal(false);
  };

  // Handle editing case
  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setNewCaseForm({
      case_name: caseItem.case_name,
      case_summary: caseItem.case_summary,
      case_number: caseItem.case_number,
      court: caseItem.court,
      judge: caseItem.judge,
      status: caseItem.status,
      closed_reason: caseItem.closed_reason
    });
    setShowNewCaseModal(true);
  };

  // Handle adding new court
  const handleAddCourt = () => {
    if (!newCourtName.trim()) return;
    
    const newCourt: Court = {
      id: Date.now().toString(),
      court_name: newCourtName
    };
    
    setCourts([...courts, newCourt]);
    setNewCaseForm({ ...newCaseForm, court: newCourtName });
    setNewCourtName('');
    setShowNewCourtModal(false);
  };

  // Handle adding new judge
  const handleAddJudge = () => {
    if (!newJudgeName.trim()) return;
    
    const newJudge: Judge = {
      id: Date.now().toString(),
      judge_name: newJudgeName
    };
    
    setJudges([...judges, newJudge]);
    setNewCaseForm({ ...newCaseForm, judge: newJudgeName });
    setNewJudgeName('');
    setShowNewJudgeModal(false);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowNewCaseModal(false);
    setEditingCase(null);
    setNewCaseForm({
      case_name: '',
      case_summary: '',
      case_number: '',
      court: '',
      judge: '',
      status: 'Active'
    });
  };

  // Handle Escape and Enter keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showNewCaseModal) {
          handleCloseModal();
        } else if (showNewCourtModal) {
          setShowNewCourtModal(false);
          setNewCourtName('');
        } else if (showNewJudgeModal) {
          setShowNewJudgeModal(false);
          setNewJudgeName('');
        }
      } else if (event.key === 'Enter') {
        if (showNewCaseModal && newCaseForm.case_name.trim()) {
          handleCreateCase();
        } else if (showNewCourtModal && newCourtName.trim()) {
          handleAddCourt();
        } else if (showNewJudgeModal && newJudgeName.trim()) {
          handleAddJudge();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNewCaseModal, showNewCourtModal, showNewJudgeModal, newCaseForm.case_name, newCourtName, newJudgeName]);

  const filteredCases = getFilteredCases();

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
                <h1 className="text-2xl font-bold text-white">Legal Cases</h1>
                <p className="text-gray-300">Case Management</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Case
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Cases Display (75%) */}
          <div className="flex-1" style={{ flexBasis: '75%' }}>
            {/* View Mode Tabs */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView('active-cards')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'active-cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Active Cases - Cards
                </button>
                <button
                  onClick={() => setActiveView('active-list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'active-list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Active Cases - List
                </button>
                <button
                  onClick={() => setActiveView('closed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'closed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Closed Cases
                </button>
              </div>
            </div>

            {/* Cases Display */}
            <div>
              {filteredCases.length === 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {activeView === 'closed' ? 'No closed cases' : 'No active cases'}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {activeView === 'closed' 
                      ? 'Closed cases will appear here when you mark cases as completed.' 
                      : 'Create your first case to get started!'
                    }
                  </p>
                  {activeView !== 'closed' && (
                    <button
                      onClick={() => setShowNewCaseModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Case
                    </button>
                  )}
                </div>
              ) : activeView === 'active-list' ? (
                /* List View */
                <div className="space-y-2">
                  {filteredCases.map((caseItem) => (
                    <div 
                      key={caseItem.id}
                      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                      onClick={() => handleEditCase(caseItem)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{caseItem.case_name}</h3>
                          {caseItem.case_summary && (
                            <p className="text-gray-300 text-sm mt-1">{caseItem.case_summary}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {caseNeedsInfo(caseItem) && (
                            <span className="text-red-400 text-xs font-medium">Case Info Needed</span>
                          )}
                          {caseHasNoTasks(caseItem) && (
                            <span className="text-purple-400 text-xs font-medium">No Current Tasks</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Card View - Grid Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredCases.map((caseItem) => (
                    <div 
                      key={caseItem.id}
                      className="bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-750 transition-colors h-fit"
                      onClick={() => handleEditCase(caseItem)}
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{caseItem.case_name}</h3>
                        {caseItem.case_summary && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{caseItem.case_summary}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400">
                          {caseItem.case_number && <div>#{caseItem.case_number}</div>}
                          {caseItem.court && <div>{caseItem.court}</div>}
                          {caseItem.judge && <div>Judge {caseItem.judge}</div>}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          {caseNeedsInfo(caseItem) && (
                            <span className="text-red-400 text-xs font-medium">Case Info Needed</span>
                          )}
                          {caseHasNoTasks(caseItem) && (
                            <span className="text-purple-400 text-xs font-medium">No Current Tasks</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Context Panel (25%) */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Legal Overview</h3>
              
              {/* Case Statistics */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Case Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Cases</span>
                    <span className="text-blue-400 font-medium">{cases.filter(c => c.status === 'Active').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Closed Cases</span>
                    <span className="text-green-400 font-medium">{cases.filter(c => c.status === 'Closed').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Need Info</span>
                    <span className="text-red-400 font-medium">{cases.filter(c => c.status === 'Active' && caseNeedsInfo(c)).length}</span>
                  </div>
                </div>
              </div>

              {/* MCLE Summary */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">MCLE Status</h4>
                  <Link href="/mcle" className="text-blue-400 hover:text-blue-300 text-xs">
                    Details →
                  </Link>
                </div>
                
                {/* Nevada */}
                <div className="mb-3 p-2 bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-white">Nevada</span>
                    <span className="text-xs text-gray-400">245 days left</span>
                  </div>
                  <div className="text-sm font-bold text-orange-400">10 hours needed</div>
                </div>

                {/* California */}
                <div className="p-2 bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-white">California</span>
                    <span className="text-xs text-gray-400">245 days left</span>
                  </div>
                  <div className="text-sm font-bold text-red-400">25 hours needed</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveView('active-cards')}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors font-medium"
                >
                  Cases
                </button>
                <Link 
                  href="/mcle"
                  className="block w-full text-left px-3 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors font-medium"
                >
                  MCLE Tracking
                </Link>
                <button 
                  className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                  disabled
                >
                  Work Contacts (Coming Soon)
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                  disabled
                >
                  Work Notes (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-[600px] z-40">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingCase ? 'Edit Case' : 'New Case'}
            </h2>
            
            {/* Case Name */}
            <input
              type="text"
              value={newCaseForm.case_name}
              onChange={(e) => setNewCaseForm({ ...newCaseForm, case_name: e.target.value })}
              className="w-full text-lg font-medium text-white bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Case name (e.g., Smith vs. ABC Corp)"
            />
            
            {/* Case Summary */}
            <input
              type="text"
              value={newCaseForm.case_summary}
              onChange={(e) => setNewCaseForm({ ...newCaseForm, case_summary: e.target.value })}
              className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief case summary (1-2 sentences)"
            />
            
            {/* Case Number */}
            <input
              type="text"
              value={newCaseForm.case_number}
              onChange={(e) => setNewCaseForm({ ...newCaseForm, case_number: e.target.value })}
              className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Case number"
            />
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Court Dropdown */}
              <div className="relative">
                <select
                  value={newCaseForm.court}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowNewCourtModal(true);
                    } else {
                      setNewCaseForm({ ...newCaseForm, court: e.target.value });
                    }
                  }}
                  className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Court</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.court_name}>
                      {court.court_name}
                    </option>
                  ))}
                  <option value="ADD_NEW">+ Add New Court</option>
                </select>
              </div>
              
              {/* Judge Dropdown */}
              <div className="relative">
                <select
                  value={newCaseForm.judge}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowNewJudgeModal(true);
                    } else {
                      setNewCaseForm({ ...newCaseForm, judge: e.target.value });
                    }
                  }}
                  className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Judge</option>
                  {judges.map((judge) => (
                    <option key={judge.id} value={judge.judge_name}>
                      {judge.judge_name}
                    </option>
                  ))}
                  <option value="ADD_NEW">+ Add New Judge</option>
                </select>
              </div>
            </div>
            
            {/* Status */}
            <div className="mb-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Active"
                    checked={newCaseForm.status === 'Active'}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, status: e.target.value as 'Active' | 'Closed' })}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Closed"
                    checked={newCaseForm.status === 'Closed'}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, status: e.target.value as 'Active' | 'Closed' })}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Closed</span>
                </label>
              </div>
            </div>
            
            {/* Closed Reason (only if Closed) */}
            {newCaseForm.status === 'Closed' && (
              <select
                value={newCaseForm.closed_reason || ''}
                onChange={(e) => setNewCaseForm({ ...newCaseForm, closed_reason: e.target.value as any })}
                className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Closed Reason</option>
                <option value="Settlement">Settlement</option>
                <option value="MTD">MTD</option>
                <option value="MSJ">MSJ</option>
                <option value="Trial">Trial</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {editingCase ? 'Update Case' : 'Create Case'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Court Modal */}
      {showNewCourtModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-[400px] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Court</h3>
            <input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCourt();
                }
              }}
              className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Court name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewCourtModal(false);
                  setNewCourtName('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourt}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Judge Modal */}
      {showNewJudgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-[400px] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Judge</h3>
            <input
              type="text"
              value={newJudgeName}
              onChange={(e) => setNewJudgeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddJudge();
                }
              }}
              className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Judge full name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewJudgeModal(false);
                  setNewJudgeName('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJudge}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
