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
  addCase: (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => void;
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
  addContact: (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
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
      if (saved) {
        return JSON.parse(saved);
      } else {
        // Add sample cases if none exist
        const sampleCases: Case[] = [
          {
            id: '1',
            case_number: '2024-001',
            title: 'Smith vs. Johnson Contract Dispute',
            client_name: 'John Smith',
            description: 'Contract dispute regarding software development agreement',
            case_type: 'litigation',
            status: 'active',
            priority: 'high',
            opened_date: '2024-01-15',
            due_date: '2024-03-15',
            estimated_hours: 40,
            billing_rate: 350,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            case_number: '2024-002',
            title: 'ABC Corp Merger Review',
            client_name: 'ABC Corporation',
            description: 'Due diligence and legal review for corporate merger',
            case_type: 'transactional',
            status: 'active',
            priority: 'medium',
            opened_date: '2024-02-01',
            estimated_hours: 60,
            billing_rate: 400,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            case_number: '2024-003',
            title: 'Employment Law Consultation',
            client_name: 'Tech Startup Inc',
            description: 'Employment contract and policy consultation',
            case_type: 'consultation',
            status: 'pending',
            priority: 'low',
            opened_date: '2024-02-10',
            estimated_hours: 15,
            billing_rate: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return sampleCases;
      }
    }
    return [];
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-projects');
      if (saved) {
        return JSON.parse(saved);
      } else {
        // Add sample projects if none exist
        const sampleProjects: Project[] = [
          {
            id: '1',
            title: 'Mobile App Development',
            description: 'Develop a cross-platform mobile application for task management',
            status: 'active',
            priority: 'high',
            start_date: '2024-01-01',
            due_date: '2024-06-01',
            progress_percentage: 25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Website Redesign',
            description: 'Complete redesign of company website with modern UI/UX',
            status: 'planning',
            priority: 'medium',
            start_date: '2024-03-01',
            due_date: '2024-05-01',
            progress_percentage: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'API Integration Project',
            description: 'Integrate third-party APIs for enhanced functionality',
            status: 'active',
            priority: 'medium',
            start_date: '2024-02-15',
            due_date: '2024-04-15',
            progress_percentage: 60,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            title: 'Database Migration',
            description: 'Migrate legacy database to modern cloud infrastructure',
            status: 'on_hold',
            priority: 'low',
            start_date: '2024-04-01',
            due_date: '2024-07-01',
            progress_percentage: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return sampleProjects;
      }
    }
    return [];
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-goals');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [sessions, setSessions] = useState<WorkSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-sessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-contacts');
      if (saved) {
        return JSON.parse(saved);
      } else {
        // Add sample contacts if none exist
        const sampleContacts: Contact[] = [
          {
            id: '1',
            type: 'client',
            first_name: 'John',
            last_name: 'Smith',
            title: 'CEO',
            firm_organization: 'Smith Enterprises',
            email: 'john.smith@smithenterprises.com',
            phone: '(555) 123-4567',
            address: '123 Business Ave, Suite 100, Las Vegas, NV 89101',
            notes: 'Primary contact for contract dispute case',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'opposing_counsel',
            first_name: 'Sarah',
            last_name: 'Johnson',
            title: 'Partner',
            firm_organization: 'Johnson & Associates',
            email: 'sarah.johnson@johnsonlaw.com',
            phone: '(555) 987-6543',
            bar_number: 'NV12345',
            jurisdiction: 'Nevada',
            notes: 'Opposing counsel in Smith vs. Johnson case',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            type: 'judge',
            first_name: 'Robert',
            last_name: 'Williams',
            title: 'Judge',
            firm_organization: 'Clark County District Court',
            email: 'chambers@clarkcounty.gov',
            phone: '(702) 671-4000',
            jurisdiction: 'Nevada',
            notes: 'Assigned judge for civil litigation matters',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return sampleContacts;
      }
    }
    return [];
  });

  const [contactInteractions, setContactInteractions] = useState<ContactInteraction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos-contact-interactions');
      return saved ? JSON.parse(saved) : [];
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
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(case_ => 
      case_.id === id 
        ? { ...case_, ...updates, updated_at: new Date().toISOString() }
        : case_
    ));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(case_ => case_.id !== id));
    // Also remove case links from tasks
    setTasks(prev => prev.map(task => 
      task.case_ids.includes(id)
        ? { ...task, case_ids: task.case_ids.filter(caseId => caseId !== id), updated_at: new Date().toISOString() }
        : task
    ));
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
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
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
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id 
        ? { ...contact, ...updates, updated_at: new Date().toISOString() }
        : contact
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
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
