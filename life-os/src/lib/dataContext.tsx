'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Shared interfaces
export interface Case {
  id: string;
  case_number?: string;
  title: string;
  client_name: string;
  description?: string;
  case_type: 'litigation' | 'transactional' | 'consultation' | 'research' | 'other';
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'high' | 'medium' | 'low';
  opened_date: string;
  due_date?: string;
  closed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  billing_rate?: number;
  contact_ids?: string[];
  task_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  goal_id?: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  start_date?: string;
  due_date?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'inbox' | 'next_action' | 'in_progress' | 'done';
  priority: 'P1' | 'P2' | 'P3' | 'deadline';
  do_date?: string;
  do_time?: string; // Time in HH:MM format
  due_date?: string;
  case_ids: string[];
  project_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'personal' | 'professional' | 'health' | 'financial' | 'learning' | 'other';
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority: 'high' | 'medium' | 'low';
  target_date?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  case_id?: string;
  task_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  type: 'client' | 'opposing_counsel' | 'judge' | 'expert' | 'referral' | 'co_counsel' | 'other';
  first_name: string;
  last_name: string;
  title?: string;
  firm_organization?: string;
  email?: string;
  phone?: string;
  address?: string;
  bar_number?: string;
  jurisdiction?: string;
  notes?: string;
  case_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactInteraction {
  id: string;
  contact_id: string;
  case_id?: string;
  interaction_type: 'meeting' | 'call' | 'email' | 'court' | 'other';
  date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Context interface
interface DataContextType {
  // Data
  cases: Case[];
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  sessions: WorkSession[];
  contacts: Contact[];
  contactInteractions: ContactInteraction[];
  
  // Cases
  addCase: (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => string;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  
  // Projects
  addProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Tasks
  addTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Goals
  addGoal: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Sessions
  addSession: (sessionData: Omit<WorkSession, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSession: (id: string, updates: Partial<WorkSession>) => void;
  deleteSession: (id: string) => void;
  
  // Contacts
  addContact: (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => string;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // Contact Interactions
  addContactInteraction: (interactionData: Omit<ContactInteraction, 'id' | 'created_at' | 'updated_at'>) => void;
  updateContactInteraction: (id: string, updates: Partial<ContactInteraction>) => void;
  deleteContactInteraction: (id: string) => void;
  
  // Helper functions
  getCaseById: (id: string) => Case | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTaskById: (id: string) => Task | undefined;
  getGoalById: (id: string) => Goal | undefined;
  getContactById: (id: string) => Contact | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize state with localStorage data
  const [cases, setCases] = useState<Case[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-cases');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing cases from localStorage:', error);
          localStorage.removeItem('lifeos-cases'); // Clear corrupted data
        }
      }
    }
    return [];
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-projects');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing projects from localStorage:', error);
          localStorage.removeItem('lifeos-projects');
        }
      }
    }
    return [];
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-tasks');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing tasks from localStorage:', error);
          localStorage.removeItem('lifeos-tasks');
        }
      }
    }
    return [];
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-goals');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing goals from localStorage:', error);
          localStorage.removeItem('lifeos-goals');
        }
      }
    }
    return [];
  });
  
  const [sessions, setSessions] = useState<WorkSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-sessions');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing sessions from localStorage:', error);
          localStorage.removeItem('lifeos-sessions');
        }
      }
    }
    return [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-contacts');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing contacts from localStorage:', error);
          localStorage.removeItem('lifeos-contacts');
        }
      }
    }
    return [];
  });

  const [contactInteractions, setContactInteractions] = useState<ContactInteraction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-contact-interactions');
      if (saved && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing contact interactions from localStorage:', error);
          localStorage.removeItem('lifeos-contact-interactions');
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-cases', JSON.stringify(cases));
    }
  }, [cases]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-projects', JSON.stringify(projects));
    }
  }, [projects]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-goals', JSON.stringify(goals));
    }
  }, [goals]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos-contact-interactions', JSON.stringify(contactInteractions));
    }
  }, [contactInteractions]);

  // Case functions
  const addCase = (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    const newCase: Case = {
      ...caseData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCases(prev => [newCase, ...prev]);
    
    // Update linked contacts to include this case
    if (newCase.contact_ids && newCase.contact_ids.length > 0) {
      setContacts(prev => prev.map(contact => 
        newCase.contact_ids!.includes(contact.id)
          ? { 
              ...contact, 
              case_ids: [...(contact.case_ids || []), newCase.id],
              updated_at: new Date().toISOString() 
            }
          : contact
      ));
    }
    
    return newCase.id; // Return the new case ID
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    const oldCase = cases.find(case_ => case_.id === id);
    if (!oldCase) return;
    
    setCases(prev => prev.map(case_ => 
      case_.id === id 
        ? { ...case_, ...updates, updated_at: new Date().toISOString() }
        : case_
    ));
    
    // Handle contact linking changes
    if (updates.contact_ids !== undefined) {
      const oldContactIds = oldCase.contact_ids || [];
      const newContactIds = updates.contact_ids || [];
      
      // Remove case from contacts that are no longer linked
      const removedContactIds = oldContactIds.filter(contactId => !newContactIds.includes(contactId));
      if (removedContactIds.length > 0) {
        setContacts(prev => prev.map(contact => 
          removedContactIds.includes(contact.id)
            ? { 
                ...contact, 
                case_ids: (contact.case_ids || []).filter(caseId => caseId !== id),
                updated_at: new Date().toISOString() 
              }
            : contact
        ));
      }
      
      // Add case to newly linked contacts
      const addedContactIds = newContactIds.filter(contactId => !oldContactIds.includes(contactId));
      if (addedContactIds.length > 0) {
        setContacts(prev => prev.map(contact => 
          addedContactIds.includes(contact.id)
            ? { 
                ...contact, 
                case_ids: [...(contact.case_ids || []), id],
                updated_at: new Date().toISOString() 
              }
            : contact
        ));
      }
    }
  };

  const deleteCase = (id: string) => {
    const caseToDelete = cases.find(case_ => case_.id === id);
    if (!caseToDelete) return;
    
    setCases(prev => prev.filter(case_ => case_.id !== id));
    
    // Remove case links from tasks
    setTasks(prev => prev.map(task => 
      task.case_ids.includes(id)
        ? { ...task, case_ids: task.case_ids.filter(caseId => caseId !== id), updated_at: new Date().toISOString() }
        : task
    ));
    
    // Remove case references from linked contacts
    if (caseToDelete.contact_ids && caseToDelete.contact_ids.length > 0) {
      setContacts(prev => prev.map(contact => 
        caseToDelete.contact_ids!.includes(contact.id)
          ? { 
              ...contact, 
              case_ids: (contact.case_ids || []).filter(caseId => caseId !== id),
              updated_at: new Date().toISOString() 
            }
          : contact
      ));
    }
  };

  // Project functions
  const addProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also remove project links from tasks
    setTasks(prev => prev.map(task => 
      task.project_ids.includes(id)
        ? { ...task, project_ids: task.project_ids.filter(projectId => projectId !== id), updated_at: new Date().toISOString() }
        : task
    ));
  };

  // Task functions
  const addTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    
    // Update linked cases to include this task
    if (newTask.case_ids.length > 0) {
      setCases(prev => prev.map(case_ => 
        newTask.case_ids.includes(case_.id)
          ? { 
              ...case_, 
              task_ids: [...(case_.task_ids || []), newTask.id],
              updated_at: new Date().toISOString() 
            }
          : case_
      ));
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const oldTask = tasks.find(task => task.id === id);
    if (!oldTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    ));
    
    // Handle case linking changes
    if (updates.case_ids !== undefined) {
      const oldCaseIds = oldTask.case_ids || [];
      const newCaseIds = updates.case_ids || [];
      
      // Remove task from cases that are no longer linked
      const removedCaseIds = oldCaseIds.filter(caseId => !newCaseIds.includes(caseId));
      if (removedCaseIds.length > 0) {
        setCases(prev => prev.map(case_ => 
          removedCaseIds.includes(case_.id)
            ? { 
                ...case_, 
                task_ids: (case_.task_ids || []).filter(taskId => taskId !== id),
                updated_at: new Date().toISOString() 
              }
            : case_
        ));
      }
      
      // Add task to newly linked cases
      const addedCaseIds = newCaseIds.filter(caseId => !oldCaseIds.includes(caseId));
      if (addedCaseIds.length > 0) {
        setCases(prev => prev.map(case_ => 
          addedCaseIds.includes(case_.id)
            ? { 
                ...case_, 
                task_ids: [...(case_.task_ids || []), id],
                updated_at: new Date().toISOString() 
              }
            : case_
        ));
      }
    }
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;
    
    setTasks(prev => prev.filter(task => task.id !== id));
    
    // Remove task references from linked cases
    if (taskToDelete.case_ids.length > 0) {
      setCases(prev => prev.map(case_ => 
        taskToDelete.case_ids.includes(case_.id)
          ? { 
              ...case_, 
              task_ids: (case_.task_ids || []).filter(taskId => taskId !== id),
              updated_at: new Date().toISOString() 
            }
          : case_
      ));
    }
  };

  // Goal functions
  const addGoal = (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { ...goal, ...updates, updated_at: new Date().toISOString() }
        : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    // Also remove goal links from projects
    setProjects(prev => prev.map(project => 
      project.goal_id === id 
        ? { ...project, goal_id: undefined, updated_at: new Date().toISOString() }
        : project
    ));
  };

  // Session functions
  const addSession = (sessionData: Omit<WorkSession, 'id' | 'created_at' | 'updated_at'>) => {
    const newSession: WorkSession = {
      ...sessionData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const updateSession = (id: string, updates: Partial<WorkSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === id 
        ? { ...session, ...updates, updated_at: new Date().toISOString() }
        : session
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  // Contact functions
  const addContact = (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setContacts(prev => [newContact, ...prev]);
    
    // Update linked cases to include this contact
    if (newContact.case_ids && newContact.case_ids.length > 0) {
      setCases(prev => prev.map(case_ => 
        newContact.case_ids!.includes(case_.id)
          ? { 
              ...case_, 
              contact_ids: [...(case_.contact_ids || []), newContact.id],
              updated_at: new Date().toISOString() 
            }
          : case_
      ));
    }
    
    return newContact.id; // Return the new contact ID
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    const oldContact = contacts.find(contact => contact.id === id);
    if (!oldContact) return;
    
    setContacts(prev => prev.map(contact => 
      contact.id === id 
        ? { ...contact, ...updates, updated_at: new Date().toISOString() }
        : contact
    ));
    
    // Handle case linking changes
    if (updates.case_ids !== undefined) {
      const oldCaseIds = oldContact.case_ids || [];
      const newCaseIds = updates.case_ids || [];
      
      // Remove contact from cases that are no longer linked
      const removedCaseIds = oldCaseIds.filter(caseId => !newCaseIds.includes(caseId));
      if (removedCaseIds.length > 0) {
        setCases(prev => prev.map(case_ => 
          removedCaseIds.includes(case_.id)
            ? { 
                ...case_, 
                contact_ids: (case_.contact_ids || []).filter(contactId => contactId !== id),
                updated_at: new Date().toISOString() 
              }
            : case_
        ));
      }
      
      // Add contact to newly linked cases
      const addedCaseIds = newCaseIds.filter(caseId => !oldCaseIds.includes(caseId));
      if (addedCaseIds.length > 0) {
        setCases(prev => prev.map(case_ => 
          addedCaseIds.includes(case_.id)
            ? { 
                ...case_, 
                contact_ids: [...(case_.contact_ids || []), id],
                updated_at: new Date().toISOString() 
              }
            : case_
        ));
      }
    }
  };

  const deleteContact = (id: string) => {
    const contactToDelete = contacts.find(contact => contact.id === id);
    if (!contactToDelete) return;
    
    setContacts(prev => prev.filter(contact => contact.id !== id));
    
    // Remove contact references from linked cases
    if (contactToDelete.case_ids && contactToDelete.case_ids.length > 0) {
      setCases(prev => prev.map(case_ => 
        contactToDelete.case_ids!.includes(case_.id)
          ? { 
              ...case_, 
              contact_ids: (case_.contact_ids || []).filter(contactId => contactId !== id),
              updated_at: new Date().toISOString() 
            }
          : case_
      ));
    }
    
    // Also remove related interactions
    setContactInteractions(prev => prev.filter(interaction => interaction.contact_id !== id));
  };

  // Contact Interaction functions
  const addContactInteraction = (interactionData: Omit<ContactInteraction, 'id' | 'created_at' | 'updated_at'>) => {
    const newInteraction: ContactInteraction = {
      ...interactionData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setContactInteractions(prev => [newInteraction, ...prev]);
  };

  const updateContactInteraction = (id: string, updates: Partial<ContactInteraction>) => {
    setContactInteractions(prev => prev.map(interaction => 
      interaction.id === id 
        ? { ...interaction, ...updates, updated_at: new Date().toISOString() }
        : interaction
    ));
  };

  const deleteContactInteraction = (id: string) => {
    setContactInteractions(prev => prev.filter(interaction => interaction.id !== id));
  };

  // Helper functions
  const getCaseById = (id: string) => cases.find(case_ => case_.id === id);
  const getProjectById = (id: string) => projects.find(project => project.id === id);
  const getTaskById = (id: string) => tasks.find(task => task.id === id);
  const getGoalById = (id: string) => goals.find(goal => goal.id === id);
  const getContactById = (id: string) => contacts.find(contact => contact.id === id);

  const value: DataContextType = {
    // Data
    cases,
    projects,
    tasks,
    goals,
    sessions,
    contacts,
    contactInteractions,
    
    // Cases
    addCase,
    updateCase,
    deleteCase,
    
    // Projects
    addProject,
    updateProject,
    deleteProject,
    
    // Tasks
    addTask,
    updateTask,
    deleteTask,
    
    // Goals
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Sessions
    addSession,
    updateSession,
    deleteSession,
    
    // Contacts
    addContact,
    updateContact,
    deleteContact,
    
    // Contact Interactions
    addContactInteraction,
    updateContactInteraction,
    deleteContactInteraction,
    
    // Helpers
    getCaseById,
    getProjectById,
    getTaskById,
    getGoalById,
    getContactById
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
