'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useData, Case as DataCase, Contact as DataContact } from '../../lib/dataContext';
import { LinkingAutocomplete } from '../../components/LinkingAutocomplete';

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
  contact_ids?: string[];
  task_ids?: string[];
}

interface Court {
  id: string;
  court_name: string;
}

interface Judge {
  id: string;
  judge_name: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  contact_type: 'client' | 'judge' | 'mediator' | 'arbitrator' | 'opposing_counsel' | 'co_counsel' | 'vendor';
  case_ids: string[];
  created_at: Date;
  updated_at: Date;
}

interface NewContactForm {
  first_name: string;
  last_name: string;
  contact_type: Contact['contact_type'];
  case_ids: string[];
}

interface NewCaseForm {
  case_name: string;
  case_summary: string;
  case_number: string;
  court: string;
  judge: string;
  status: 'Active' | 'Closed';
  closed_reason?: 'Settlement' | 'MTD' | 'MSJ' | 'Trial' | 'Dismissed';
  contact_ids: string[];
}

type ViewMode = 'active-cards' | 'active-list' | 'closed' | 'contacts-cards' | 'contacts-list' | 'contacts-grouped';

// Get contact type display name
const getContactTypeDisplay = (type: Contact['contact_type']) => {
  const typeMap = {
    client: 'Client',
    judge: 'Judge',
    mediator: 'Mediator',
    arbitrator: 'Arbitrator',
    opposing_counsel: 'Opposing Counsel',
    co_counsel: 'Co-Counsel',
    vendor: 'Vendor'
  };
  return typeMap[type];
};

interface PeopleAutocompleteProps {
  contacts: Contact[];
  selectedContactIds: string[];
  onContactsChange: (contactIds: string[]) => void;
  onCreateContact: (firstName: string, lastName: string) => void;
}

function PeopleAutocomplete({ contacts, selectedContactIds, onContactsChange, onCreateContact }: PeopleAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = contacts.filter(contact => {
        const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
        return fullName.includes(inputValue.toLowerCase()) && !selectedContactIds.includes(contact.id);
      });
      setFilteredContacts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredContacts([]);
      setShowDropdown(false);
    }
  }, [inputValue, contacts, selectedContactIds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up to modal
      
      if (e.metaKey || e.ctrlKey) {
        // Cmd+Enter or Ctrl+Enter: Create new contact
        const nameParts = inputValue.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        if (firstName) {
          onCreateContact(firstName, lastName);
          setInputValue('');
          setShowDropdown(false);
        }
      } else {
        // Regular Enter: Select existing contact if exact match
        const exactMatch = contacts.find(contact => {
          const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
          return fullName === inputValue.toLowerCase().trim();
        });

        if (exactMatch && !selectedContactIds.includes(exactMatch.id)) {
          // Add existing contact
          onContactsChange([...selectedContactIds, exactMatch.id]);
          setInputValue('');
          setShowDropdown(false);
        }
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // Prevent event from bubbling up to modal
      setShowDropdown(false);
      setInputValue('');
    }
  };

  const handleSelectContact = (contact: Contact) => {
    if (!selectedContactIds.includes(contact.id)) {
      onContactsChange([...selectedContactIds, contact.id]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveContact = (contactId: string) => {
    onContactsChange(selectedContactIds.filter(id => id !== contactId));
  };

  const getSelectedContacts = () => {
    return contacts.filter(contact => selectedContactIds.includes(contact.id));
  };

  return (
    <div className="relative">
      {/* Selected contacts */}
      {selectedContactIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {getSelectedContacts().map((contact) => (
            <span
              key={contact.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {contact.first_name} {contact.last_name}
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.trim() && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type to search people or add new (e.g., 'John Smith')"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-gray-300 border-b border-gray-600 last:border-b-0"
              >
                <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                <div className="text-xs text-gray-400">{getContactTypeDisplay(contact.contact_type)}</div>
              </button>
            ))
          ) : inputValue.trim() ? (
            <div className="px-3 py-2 text-gray-400 text-sm">
              Press Cmd+Enter to create "{inputValue.trim()}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function LegalPage() {
  const { cases: dataCases, contacts: dataContacts, tasks: dataTasks, addCase, addContact, updateCase, updateContact, updateTask, deleteCase, deleteContact, getCaseById } = useData();
  
  // Convert DataContext cases to local Case interface
  const cases: Case[] = dataCases.map(c => ({
    id: c.id,
    case_name: c.title,
    case_summary: c.description || '',
    case_number: c.case_number || '',
    court: '', // TODO: Add court field to DataContext
    judge: '', // TODO: Add judge field to DataContext  
    status: c.status === 'active' ? 'Active' : 'Closed',
    created_at: new Date(c.created_at),
    updated_at: new Date(c.updated_at),
    contact_ids: c.contact_ids || [],
    task_ids: c.task_ids || []
  }));
  
  // Convert DataContext contacts to local Contact interface  
  const contacts: Contact[] = dataContacts.map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
    contact_type: c.type === 'client' ? 'client' : 'opposing_counsel', // Map from DataContext type
    case_ids: c.case_ids || [], // Use the case_ids from DataContext
    created_at: new Date(c.created_at),
    updated_at: new Date(c.updated_at)
  }));
  
  const [localCases, setLocalCases] = useState<Case[]>([]);
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>('active-cards');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewCourtModal, setShowNewCourtModal] = useState(false);
  const [showNewJudgeModal, setShowNewJudgeModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newCourtName, setNewCourtName] = useState('');
  const [newJudgeName, setNewJudgeName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['client', 'judge', 'opposing_counsel']));
  const [newCaseForm, setNewCaseForm] = useState<NewCaseForm>({
    case_name: '',
    case_summary: '',
    case_number: '',
    court: '',
    judge: '',
    status: 'Active',
    contact_ids: []
  });
  const [newContactForm, setNewContactForm] = useState<NewContactForm>({
    first_name: '',
    last_name: '',
    contact_type: 'client',
    case_ids: []
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

  // Get tasks linked to a case
  const getTasksForCase = (caseId: string) => {
    // Return tasks that have this case in their case_ids array
    return dataTasks.filter(task => task.case_ids && task.case_ids.includes(caseId));
  };

  // Check if case has no tasks
  const caseHasNoTasks = (caseItem: Case) => {
    return getTasksForCase(caseItem.id).length === 0;
  };

  // Handle creating/updating case
  const handleCreateCase = () => {
    if (!newCaseForm.case_name.trim()) return;

    if (editingCase) {
      // Update existing case
      const updates = {
        title: newCaseForm.case_name,
        client_name: newCaseForm.case_name.split(' vs. ')[0] || newCaseForm.case_name,
        description: newCaseForm.case_summary,
        status: newCaseForm.status === 'Active' ? 'active' as const : 'closed' as const,
        case_number: newCaseForm.case_number,
        contact_ids: newCaseForm.contact_ids
      };

      updateCase(editingCase.id, updates);
    } else {
      // Create new case using DataContext
      const newCaseData = {
        title: newCaseForm.case_name,
        client_name: newCaseForm.case_name.split(' vs. ')[0] || newCaseForm.case_name,
        description: newCaseForm.case_summary,
        case_type: 'litigation' as const,
        status: newCaseForm.status === 'Active' ? 'active' as const : 'closed' as const,
        priority: 'medium' as const,
        opened_date: new Date().toISOString().split('T')[0],
        case_number: newCaseForm.case_number,
        contact_ids: newCaseForm.contact_ids
      };

      addCase(newCaseData);
    }

    handleCloseModal();
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
      closed_reason: caseItem.closed_reason,
      contact_ids: caseItem.contact_ids || []
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

  // Contact management functions
  const handleCreateContact = () => {
    if (!newContactForm.first_name.trim() || !newContactForm.last_name.trim()) return;

    if (editingContact) {
      // Update existing contact
      const updates = {
        first_name: newContactForm.first_name,
        last_name: newContactForm.last_name,
        type: newContactForm.contact_type === 'client' ? 'client' as const : 'other' as const,
        case_ids: newContactForm.case_ids
      };

      updateContact(editingContact.id, updates);
    } else {
      // Create new contact using DataContext
      const newContactData = {
        type: newContactForm.contact_type === 'client' ? 'client' as const : 'other' as const,
        first_name: newContactForm.first_name,
        last_name: newContactForm.last_name,
        email: '', // Default empty
        phone: '', // Default empty
        firm_organization: '', // Default empty
        notes: '', // Default empty
        case_ids: newContactForm.case_ids // Include the case_ids from the form
      };

      addContact(newContactData);
    }

    handleCloseContactModal();
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContactForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      contact_type: contact.contact_type,
      case_ids: contact.case_ids
    });
    setShowNewContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowNewContactModal(false);
    setEditingContact(null);
    setNewContactForm({
      first_name: '',
      last_name: '',
      contact_type: 'client',
      case_ids: []
    });
  };

  // Get sorted contacts
  const getSortedContacts = () => {
    return [...contacts].sort((a, b) => {
      // First by case count (descending)
      const aCaseCount = a.case_ids.length;
      const bCaseCount = b.case_ids.length;
      if (aCaseCount !== bCaseCount) {
        return bCaseCount - aCaseCount;
      }
      // Then by last name (ascending)
      return a.last_name.localeCompare(b.last_name);
    });
  };

  // Get contacts grouped by type
  const getGroupedContacts = () => {
    const typeOrder = ['client', 'judge', 'mediator', 'arbitrator', 'opposing_counsel', 'co_counsel', 'vendor'];
    const grouped: { [key: string]: Contact[] } = {};
    
    typeOrder.forEach(type => {
      grouped[type] = contacts
        .filter(c => c.contact_type === type)
        .sort((a, b) => {
          const aCaseCount = a.case_ids.length;
          const bCaseCount = b.case_ids.length;
          if (aCaseCount !== bCaseCount) {
            return bCaseCount - aCaseCount;
          }
          return a.last_name.localeCompare(b.last_name);
        });
    });
    
    return grouped;
  };

  // Get contact type display name
  const getContactTypeDisplay = (type: Contact['contact_type']) => {
    const typeMap = {
      client: 'Client',
      judge: 'Judge',
      mediator: 'Mediator',
      arbitrator: 'Arbitrator',
      opposing_counsel: 'Opposing Counsel',
      co_counsel: 'Co-Counsel',
      vendor: 'Vendor'
    };
    return typeMap[type];
  };

  // Toggle group expansion
  const toggleGroup = (groupType: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupType)) {
      newExpanded.delete(groupType);
    } else {
      newExpanded.add(groupType);
    }
    setExpandedGroups(newExpanded);
  };

  // Get case name by ID
  const getCaseNameById = (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.case_name : 'Unknown Case';
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
      status: 'Active',
      contact_ids: []
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
      } else if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
        // Only handle Enter if it's NOT Cmd+Enter or Ctrl+Enter
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
            <div className="flex gap-2">
              {activeView.startsWith('contacts') ? (
                <button
                  onClick={() => setShowNewContactModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  + New Contact
                </button>
              ) : (
                <button
                  onClick={() => setShowNewCaseModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  + New Case
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Cases Display (75%) */}
          <div className="flex-1" style={{ flexBasis: '75%' }}>
            {/* View Mode Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {/* Case Views */}
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
                
                {/* Spacer */}
                <div className="w-4"></div>
                
                {/* Contact Views */}
                <button
                  onClick={() => setActiveView('contacts-cards')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'contacts-cards'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Contacts - Cards
                </button>
                <button
                  onClick={() => setActiveView('contacts-list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'contacts-list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Contacts - List
                </button>
                <button
                  onClick={() => setActiveView('contacts-grouped')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'contacts-grouped'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Contacts - Grouped
                </button>
              </div>
            </div>

            {/* Main Display Area */}
            <div>
              {activeView.startsWith('contacts') ? (
                /* Contacts Views */
                <>
                  {contacts.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
                      <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No contacts yet</h3>
                      <p className="text-gray-400 mb-4">Create your first contact to get started!</p>
                      <button
                        onClick={() => setShowNewContactModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Create First Contact
                      </button>
                    </div>
                  ) : activeView === 'contacts-cards' ? (
                    /* Contacts Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {getSortedContacts().map((contact) => (
                        <div 
                          key={contact.id}
                          className="bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-750 transition-colors h-fit relative group"
                          onClick={() => handleEditContact(contact)}
                        >
                          
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-white mb-1 pr-8">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            <p className="text-purple-400 text-sm font-medium mb-2">
                              {getContactTypeDisplay(contact.contact_type)}
                            </p>
                          </div>
                          
                          <div className="text-gray-300 text-sm">
                            <span className="font-medium">
                              {contact.case_ids.length} case{contact.case_ids.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeView === 'contacts-list' ? (
                    /* Contacts List View */
                    <div className="space-y-2">
                      {getSortedContacts().map((contact) => (
                        <div 
                          key={contact.id}
                          className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors group"
                          onClick={() => handleEditContact(contact)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {contact.first_name} {contact.last_name}
                                </h3>
                                <span className="text-purple-400 text-sm font-medium">
                                  {getContactTypeDisplay(contact.contact_type)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-gray-300 text-sm font-medium">
                                  {contact.case_ids.length} case{contact.case_ids.length !== 1 ? 's' : ''}
                                </div>
                                {contact.case_ids.map((caseId) => (
                                  <button
                                    key={caseId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Navigate to case - placeholder for now
                                      console.log('Navigate to case:', caseId);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                                  >
                                    {getCaseNameById(caseId)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Contacts Grouped View */
                    <div className="space-y-4">
                      {Object.entries(getGroupedContacts()).map(([type, typeContacts]) => (
                        typeContacts.length > 0 && (
                          <div key={type} className="bg-gray-800 rounded-lg shadow-md">
                            <button
                              onClick={() => toggleGroup(type)}
                              className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-750 transition-colors rounded-t-lg"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${
                                    expandedGroups.has(type) ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="text-lg font-semibold text-white">
                                  {getContactTypeDisplay(type as Contact['contact_type'])}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  ({typeContacts.length})
                                </span>
                              </div>
                            </button>
                            
                            {expandedGroups.has(type) && (
                              <div className="border-t border-gray-700">
                                {typeContacts.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="px-4 py-3 border-b border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-750 transition-colors"
                                    onClick={() => handleEditContact(contact)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-white font-medium mb-1">
                                          {contact.first_name} {contact.last_name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {contact.case_ids.map((caseId) => (
                                            <button
                                              key={caseId}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Navigate to case - placeholder for now
                                                console.log('Navigate to case:', caseId);
                                              }}
                                              className="text-blue-400 hover:text-blue-300 text-sm underline"
                                            >
                                              {getCaseNameById(caseId)}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="text-gray-300 text-sm font-medium">
                                        {contact.case_ids.length} case{contact.case_ids.length !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Cases Views */
                <>
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
                          className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors group"
                          onClick={() => handleEditCase(caseItem)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-white">{caseItem.case_name}</h3>
                                {caseItem.case_summary && (
                                  <span className="text-gray-400 text-sm">— {caseItem.case_summary}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {caseNeedsInfo(caseItem) && (
                                <span className="text-red-400 text-xs font-medium">Case Info Needed</span>
                              )}
                              {caseHasNoTasks(caseItem) && (
                                <span className="text-purple-400 text-xs font-medium">No Current Task</span>
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
                          className="bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-750 transition-colors h-fit relative group"
                          onClick={() => handleEditCase(caseItem)}
                        >
                          
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 pr-8">{caseItem.case_name}</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              {caseNeedsInfo(caseItem) && (
                                <span className="text-red-400 text-xs font-medium">Case Info Needed</span>
                              )}
                              {caseHasNoTasks(caseItem) && (
                                <span className="text-purple-400 text-xs font-medium">No Current Task</span>
                              )}
                              
                              {/* Contact count - only show if there are contacts */}
                              {caseItem.contact_ids && caseItem.contact_ids.length > 0 && (
                                <span className="text-blue-400 text-xs font-medium">
                                  {caseItem.contact_ids.length} contact{caseItem.contact_ids.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Context Panel (25%) */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Legal Overview</h3>
              
              {activeView.startsWith('contacts') ? (
                /* Contact Statistics */
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Contact Statistics</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-purple-400 font-medium">{contacts.length}</span>
                      <span className="text-gray-400"> - Total People</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-blue-400 font-medium">{contacts.filter(c => c.contact_type === 'client').length}</span>
                      <span className="text-gray-400"> - Clients</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-green-400 font-medium">{contacts.filter(c => c.contact_type === 'judge').length}</span>
                      <span className="text-gray-400"> - Judges</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-yellow-400 font-medium">{contacts.filter(c => c.contact_type === 'mediator').length}</span>
                      <span className="text-gray-400"> - Mediators</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-orange-400 font-medium">{contacts.filter(c => c.contact_type === 'arbitrator').length}</span>
                      <span className="text-gray-400"> - Arbitrators</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-red-400 font-medium">{contacts.filter(c => c.contact_type === 'opposing_counsel').length}</span>
                      <span className="text-gray-400"> - Opposing Counsel</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-cyan-400 font-medium">{contacts.filter(c => c.contact_type === 'co_counsel').length}</span>
                      <span className="text-gray-400"> - Co-Counsel</span>
                    </div>
                    <div className="text-sm ml-4">
                      <span className="text-pink-400 font-medium">{contacts.filter(c => c.contact_type === 'vendor').length}</span>
                      <span className="text-gray-400"> - Vendors</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Case Statistics */
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
              )}

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
                    <span className="text-xs text-gray-400">180 days left</span>
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
                  className="w-full text-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors font-medium"
                >
                  Cases
                </button>
                <Link 
                  href="/mcle"
                  className="block w-full text-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors font-medium"
                >
                  MCLE Tracking
                </Link>
                <button 
                  onClick={() => setActiveView('contacts-cards')}
                  className="w-full text-center px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors font-medium"
                >
                  Work Contacts
                </button>
                <Link 
                  href="/work-notes"
                  className="block w-full text-center px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 rounded-md text-white transition-colors font-medium"
                >
                  Work Notes
                </Link>
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
            
            {/* People Autocomplete */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">People</label>
              <PeopleAutocomplete
                contacts={contacts}
                selectedContactIds={newCaseForm.contact_ids}
                onContactsChange={(contactIds) => setNewCaseForm({ ...newCaseForm, contact_ids: contactIds })}
                onCreateContact={(firstName, lastName) => {
                  // Create new contact using DataContext
                  const newContactData = {
                    type: 'client' as const,
                    first_name: firstName,
                    last_name: lastName,
                    email: '',
                    phone: '',
                    firm_organization: '',
                    notes: ''
                  };
                  
                  const newContactId = addContact(newContactData);
                  // Automatically select the newly created contact
                  if (newContactId) {
                    setNewCaseForm({ ...newCaseForm, contact_ids: [...newCaseForm.contact_ids, newContactId] });
                  }
                }}
              />
            </div>

            {/* Linked Tasks - Interactive Display */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">Linked Tasks</label>
              <div className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 min-h-[42px]">
                {editingCase && getTasksForCase(editingCase.id).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getTasksForCase(editingCase.id).map((task) => (
                      <span
                        key={task.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        📋 {task.title}
                        <button
                          onClick={() => {
                            // Remove this case from the task's case_ids
                            const updatedCaseIds = (task.case_ids || []).filter(caseId => caseId !== editingCase.id);
                            updateTask(task.id, { case_ids: updatedCaseIds });
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No tasks linked to this case</span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Tasks can be linked from the Tasks page, or unlinked here by clicking the × button.
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-3">
              <div>
                {editingCase && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${editingCase.case_name}"?`)) {
                        deleteCase(editingCase.id);
                        handleCloseModal();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Case
                  </button>
                )}
              </div>
              <div className="flex gap-3">
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

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-[600px] z-40">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingContact ? 'Edit Contact' : 'New Contact'}
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* First Name */}
              <input
                type="text"
                value={newContactForm.first_name}
                onChange={(e) => setNewContactForm({ ...newContactForm, first_name: e.target.value })}
                className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="First name"
              />
              
              {/* Last Name */}
              <input
                type="text"
                value={newContactForm.last_name}
                onChange={(e) => setNewContactForm({ ...newContactForm, last_name: e.target.value })}
                className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Last name"
              />
            </div>
            
            {/* Contact Type */}
            <select
              value={newContactForm.contact_type}
              onChange={(e) => setNewContactForm({ ...newContactForm, contact_type: e.target.value as Contact['contact_type'] })}
              className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="client">Client</option>
              <option value="judge">Judge</option>
              <option value="mediator">Mediator</option>
              <option value="arbitrator">Arbitrator</option>
              <option value="opposing_counsel">Opposing Counsel</option>
              <option value="co_counsel">Co-Counsel</option>
              <option value="vendor">Vendor</option>
            </select>
            
            {/* Case Selection */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">Associated Cases</label>
              <div className="max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md p-2">
                {cases.length === 0 ? (
                  <p className="text-gray-400 text-sm">No cases available</p>
                ) : (
                  cases.map((caseItem) => (
                    <label key={caseItem.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={newContactForm.case_ids.includes(caseItem.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewContactForm({
                              ...newContactForm,
                              case_ids: [...newContactForm.case_ids, caseItem.id]
                            });
                          } else {
                            setNewContactForm({
                              ...newContactForm,
                              case_ids: newContactForm.case_ids.filter(id => id !== caseItem.id)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-gray-300 text-sm">{caseItem.case_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-3">
              <div>
                {editingContact && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${editingContact.first_name} ${editingContact.last_name}"?`)) {
                        deleteContact(editingContact.id);
                        handleCloseContactModal();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Contact
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseContactModal}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContact}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
