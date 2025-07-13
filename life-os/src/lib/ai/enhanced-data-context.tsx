'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lifeOSAI, TaskEnhancement, CaseAnalysis, CrossModuleConnection } from './openai-client';
import { 
  EnhancedStorageManager, 
  LifeOSData, 
  EnhancedTask, 
  EnhancedCase, 
  EnhancedContact, 
  AIInsight 
} from './enhanced-storage';

// Enhanced context interface that extends the original
interface EnhancedDataContextType {
  // Enhanced Data
  data: LifeOSData;
  
  // AI Status
  isAIEnabled: boolean;
  isProcessing: boolean;
  
  // Enhanced Tasks
  addEnhancedTask: (taskData: Omit<EnhancedTask, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateEnhancedTask: (id: string, updates: Partial<EnhancedTask>) => void;
  deleteEnhancedTask: (id: string) => void;
  enhanceExistingTask: (taskId: string) => Promise<void>;
  
  // Enhanced Cases
  addEnhancedCase: (caseData: Omit<EnhancedCase, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateEnhancedCase: (id: string, updates: Partial<EnhancedCase>) => void;
  deleteEnhancedCase: (id: string) => void;
  analyzeCaseComplexity: (caseId: string) => Promise<void>;
  
  // Enhanced Contacts
  addEnhancedContact: (contactData: Omit<EnhancedContact, 'id' | 'created_at' | 'updated_at'>) => string;
  updateEnhancedContact: (id: string, updates: Partial<EnhancedContact>) => void;
  deleteEnhancedContact: (id: string) => void;
  
  // AI Insights
  getInsightsForEntity: (entityId: string, entityType: string) => AIInsight[];
  dismissInsight: (insightId: string) => void;
  applyInsight: (insightId: string) => void;
  
  // AI Analysis
  findCrossModuleConnections: () => Promise<void>;
  generateWorkflowSuggestions: () => Promise<string[]>;
  
  // AI Settings
  updateAISettings: (settings: Partial<LifeOSData['ai_settings']>) => void;
  
  // Helper functions
  getEnhancedTaskById: (id: string) => EnhancedTask | undefined;
  getEnhancedCaseById: (id: string) => EnhancedCase | undefined;
  getEnhancedContactById: (id: string) => EnhancedContact | undefined;
  
  // Backward compatibility - expose original interfaces
  tasks: EnhancedTask[];
  cases: EnhancedCase[];
  contacts: EnhancedContact[];
}

const EnhancedDataContext = createContext<EnhancedDataContextType | undefined>(undefined);

export function EnhancedDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LifeOSData>(() => EnhancedStorageManager.loadData());
  const [isProcessing, setIsProcessing] = useState(false);
  const isAIEnabled = lifeOSAI.isAIEnabled();

  // Save data whenever it changes
  useEffect(() => {
    EnhancedStorageManager.saveData(data);
  }, [data]);

  // Cleanup old insights periodically
  useEffect(() => {
    const cleanup = () => {
      setData(prevData => {
        const newData = { ...prevData };
        EnhancedStorageManager.cleanupOldInsights(newData);
        return newData;
      });
    };

    // Cleanup on mount and then every 24 hours
    cleanup();
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Task Functions
  const addEnhancedTask = async (taskData: Omit<EnhancedTask, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const newTask: EnhancedTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_insights: [],
    };

    setData(prevData => ({
      ...prevData,
      tasks: [newTask, ...prevData.tasks],
    }));

    // Auto-enhance if enabled
    if (isAIEnabled && data.ai_settings.autoEnhance) {
      await enhanceTaskWithAI(newTask.id, taskData);
    }

    return newTask.id;
  };

  const updateEnhancedTask = (id: string, updates: Partial<EnhancedTask>) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ),
    }));
  };

  const deleteEnhancedTask = (id: string) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.filter(task => task.id !== id),
      ai_insights: prevData.ai_insights.filter(insight => 
        !(insight.entityType === 'task' && insight.entityId === id)
      ),
    }));
  };

  const enhanceExistingTask = async (taskId: string) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    await enhanceTaskWithAI(taskId, task);
  };

  const enhanceTaskWithAI = async (taskId: string, taskData: Partial<EnhancedTask>) => {
    if (!isAIEnabled) return;

    setIsProcessing(true);
    try {
      const enhancement = await lifeOSAI.enhanceTask({
        title: taskData.title || '',
        description: taskData.description,
        existingCases: data.cases.map(c => ({
          id: c.id,
          title: c.title,
          case_type: c.case_type,
        })),
        existingContacts: data.contacts.map(c => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          type: c.type,
        })),
      });

      if (enhancement && enhancement.confidence >= data.ai_settings.confidenceThreshold) {
        // Update task with AI suggestions
        updateEnhancedTask(taskId, {
          ai_enhanced: true,
          ai_confidence: enhancement.confidence,
          ai_suggestions: {
            estimatedHours: enhancement.estimatedHours,
            relatedCaseTypes: enhancement.relatedCaseTypes,
            requiredDocuments: enhancement.requiredDocuments,
            keyContacts: enhancement.keyContacts,
            reasoning: enhancement.reasoning,
          },
        });

        // Add insight
        const insight = EnhancedStorageManager.addInsight(data, {
          type: 'task_enhancement',
          entityId: taskId,
          entityType: 'task',
          data: enhancement,
          confidence: enhancement.confidence,
        });

        setData(prevData => ({
          ...prevData,
          ai_insights: [...prevData.ai_insights, insight],
        }));
      }
    } catch (error) {
      console.error('Error enhancing task:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced Case Functions
  const addEnhancedCase = async (caseData: Omit<EnhancedCase, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const newCase: EnhancedCase = {
      ...caseData,
      id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_insights: [],
    };

    setData(prevData => ({
      ...prevData,
      cases: [newCase, ...prevData.cases],
    }));

    // Auto-analyze if enabled
    if (isAIEnabled && data.ai_settings.autoEnhance) {
      await analyzeCaseWithAI(newCase.id);
    }

    return newCase.id;
  };

  const updateEnhancedCase = (id: string, updates: Partial<EnhancedCase>) => {
    setData(prevData => ({
      ...prevData,
      cases: prevData.cases.map(case_ =>
        case_.id === id
          ? { ...case_, ...updates, updated_at: new Date().toISOString() }
          : case_
      ),
    }));
  };

  const deleteEnhancedCase = (id: string) => {
    setData(prevData => ({
      ...prevData,
      cases: prevData.cases.filter(case_ => case_.id !== id),
      tasks: prevData.tasks.map(task => ({
        ...task,
        case_ids: task.case_ids.filter(caseId => caseId !== id),
        updated_at: task.case_ids.includes(id) ? new Date().toISOString() : task.updated_at,
      })),
      ai_insights: prevData.ai_insights.filter(insight => 
        !(insight.entityType === 'case' && insight.entityId === id)
      ),
    }));
  };

  const analyzeCaseComplexity = async (caseId: string) => {
    await analyzeCaseWithAI(caseId);
  };

  const analyzeCaseWithAI = async (caseId: string) => {
    if (!isAIEnabled) return;

    const case_ = data.cases.find(c => c.id === caseId);
    if (!case_) return;

    setIsProcessing(true);
    try {
      const analysis = await lifeOSAI.analyzeCaseComplexity({
        title: case_.title,
        description: case_.description,
        case_type: case_.case_type,
        client_name: case_.client_name,
      });

      if (analysis && analysis.confidence >= data.ai_settings.confidenceThreshold) {
        // Update case with AI analysis
        updateEnhancedCase(caseId, {
          ai_analysis: {
            complexity: analysis.caseComplexity,
            estimatedDuration: analysis.estimatedDuration,
            successProbability: analysis.successProbability,
            riskFactors: analysis.riskFactors,
            recommendedActions: analysis.recommendedActions,
            requiredResources: analysis.requiredResources,
            confidence: analysis.confidence,
          },
        });

        // Add insight
        const insight = EnhancedStorageManager.addInsight(data, {
          type: 'case_analysis',
          entityId: caseId,
          entityType: 'case',
          data: analysis,
          confidence: analysis.confidence,
        });

        setData(prevData => ({
          ...prevData,
          ai_insights: [...prevData.ai_insights, insight],
        }));
      }
    } catch (error) {
      console.error('Error analyzing case:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced Contact Functions
  const addEnhancedContact = (contactData: Omit<EnhancedContact, 'id' | 'created_at' | 'updated_at'>): string => {
    const newContact: EnhancedContact = {
      ...contactData,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_insights: [],
    };

    setData(prevData => ({
      ...prevData,
      contacts: [newContact, ...prevData.contacts],
    }));

    return newContact.id;
  };

  const updateEnhancedContact = (id: string, updates: Partial<EnhancedContact>) => {
    setData(prevData => ({
      ...prevData,
      contacts: prevData.contacts.map(contact =>
        contact.id === id
          ? { ...contact, ...updates, updated_at: new Date().toISOString() }
          : contact
      ),
    }));
  };

  const deleteEnhancedContact = (id: string) => {
    setData(prevData => ({
      ...prevData,
      contacts: prevData.contacts.filter(contact => contact.id !== id),
      ai_insights: prevData.ai_insights.filter(insight => 
        !(insight.entityType === 'contact' && insight.entityId === id)
      ),
    }));
  };

  // AI Insight Functions
  const getInsightsForEntity = (entityId: string, entityType: string): AIInsight[] => {
    return EnhancedStorageManager.getInsightsForEntity(data, entityId, entityType);
  };

  const dismissInsight = (insightId: string) => {
    EnhancedStorageManager.dismissInsight(data, insightId);
    setData(prevData => ({ ...prevData })); // Trigger re-render
  };

  const applyInsight = (insightId: string) => {
    EnhancedStorageManager.applyInsight(data, insightId);
    setData(prevData => ({ ...prevData })); // Trigger re-render
  };

  // AI Analysis Functions
  const findCrossModuleConnections = async () => {
    if (!isAIEnabled) return;

    setIsProcessing(true);
    try {
      const connections = await lifeOSAI.findCrossModuleConnections({
        tasks: data.tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          case_ids: t.case_ids,
        })),
        cases: data.cases.map(c => ({
          id: c.id,
          title: c.title,
          case_type: c.case_type,
          description: c.description,
        })),
        contacts: data.contacts.map(c => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          type: c.type,
        })),
      });

      // Add connection insights
      connections.forEach(connection => {
        if (connection.strength >= data.ai_settings.confidenceThreshold) {
          const insight = EnhancedStorageManager.addInsight(data, {
            type: 'cross_connection',
            entityId: connection.sourceId,
            entityType: connection.sourceType as 'task' | 'case' | 'contact',
            data: connection,
            confidence: connection.strength,
          });

          setData(prevData => ({
            ...prevData,
            ai_insights: [...prevData.ai_insights, insight],
          }));
        }
      });
    } catch (error) {
      console.error('Error finding connections:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWorkflowSuggestions = async (): Promise<string[]> => {
    if (!isAIEnabled) return [];

    setIsProcessing(true);
    try {
      const currentTask = data.tasks.find(t => t.status === 'in_progress');
      const upcomingDeadlines = data.tasks
        .filter(t => t.due_date && new Date(t.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5)
        .map(t => ({ title: t.title, due_date: t.due_date! }));

      const suggestions = await lifeOSAI.generateWorkflowSuggestions({
        currentTask: currentTask ? {
          title: currentTask.title,
          description: currentTask.description,
          priority: currentTask.priority,
        } : undefined,
        upcomingDeadlines,
        workloadCapacity: data.tasks.filter(t => t.status === 'in_progress').length,
      });

      return suggestions;
    } catch (error) {
      console.error('Error generating workflow suggestions:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Settings
  const updateAISettings = (settings: Partial<LifeOSData['ai_settings']>) => {
    setData(prevData => ({
      ...prevData,
      ai_settings: { ...prevData.ai_settings, ...settings },
    }));
  };

  // Helper functions
  const getEnhancedTaskById = (id: string) => data.tasks.find(task => task.id === id);
  const getEnhancedCaseById = (id: string) => data.cases.find(case_ => case_.id === id);
  const getEnhancedContactById = (id: string) => data.contacts.find(contact => contact.id === id);

  const value: EnhancedDataContextType = {
    // Enhanced Data
    data,
    
    // AI Status
    isAIEnabled,
    isProcessing,
    
    // Enhanced Tasks
    addEnhancedTask,
    updateEnhancedTask,
    deleteEnhancedTask,
    enhanceExistingTask,
    
    // Enhanced Cases
    addEnhancedCase,
    updateEnhancedCase,
    deleteEnhancedCase,
    analyzeCaseComplexity,
    
    // Enhanced Contacts
    addEnhancedContact,
    updateEnhancedContact,
    deleteEnhancedContact,
    
    // AI Insights
    getInsightsForEntity,
    dismissInsight,
    applyInsight,
    
    // AI Analysis
    findCrossModuleConnections,
    generateWorkflowSuggestions,
    
    // AI Settings
    updateAISettings,
    
    // Helper functions
    getEnhancedTaskById,
    getEnhancedCaseById,
    getEnhancedContactById,
    
    // Backward compatibility
    tasks: data.tasks,
    cases: data.cases,
    contacts: data.contacts,
  };

  return (
    <EnhancedDataContext.Provider value={value}>
      {children}
    </EnhancedDataContext.Provider>
  );
}

export function useEnhancedData() {
  const context = useContext(EnhancedDataContext);
  if (context === undefined) {
    throw new Error('useEnhancedData must be used within an EnhancedDataProvider');
  }
  return context;
}

// Backward compatibility hook that provides the original interface
export function useAIEnhancedData() {
  const enhanced = useEnhancedData();
  
  // Return original-style interface with AI enhancements
  return {
    // Original data with AI enhancements
    tasks: enhanced.tasks,
    cases: enhanced.cases,
    contacts: enhanced.contacts,
    
    // Enhanced functions that work like originals but with AI
    addTask: async (taskData: Omit<EnhancedTask, 'id' | 'created_at' | 'updated_at' | 'ai_enhanced' | 'ai_confidence' | 'ai_suggestions' | 'ai_insights'>) => {
      return await enhanced.addEnhancedTask({
        ...taskData,
        tags: taskData.tags || [],
      });
    },
    updateTask: enhanced.updateEnhancedTask,
    deleteTask: enhanced.deleteEnhancedTask,
    
    addCase: enhanced.addEnhancedCase,
    updateCase: enhanced.updateEnhancedCase,
    deleteCase: enhanced.deleteEnhancedCase,
    
    addContact: enhanced.addEnhancedContact,
    updateContact: enhanced.updateEnhancedContact,
    deleteContact: enhanced.deleteEnhancedContact,
    
    // Helper functions
    getTaskById: enhanced.getEnhancedTaskById,
    getCaseById: enhanced.getEnhancedCaseById,
    getContactById: enhanced.getEnhancedContactById,
    
    // AI-specific functions
    isAIEnabled: enhanced.isAIEnabled,
    isProcessing: enhanced.isProcessing,
    enhanceTask: enhanced.enhanceExistingTask,
    analyzeCase: enhanced.analyzeCaseComplexity,
    getInsights: enhanced.getInsightsForEntity,
    dismissInsight: enhanced.dismissInsight,
    applyInsight: enhanced.applyInsight,
    findConnections: enhanced.findCrossModuleConnections,
    getWorkflowSuggestions: enhanced.generateWorkflowSuggestions,
  };
}
