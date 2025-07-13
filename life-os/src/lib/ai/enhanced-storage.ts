import { TaskEnhancement, CaseAnalysis, CrossModuleConnection } from './openai-client';

// Enhanced data structures with AI intelligence
export interface AIInsight {
  id: string;
  type: 'task_enhancement' | 'case_analysis' | 'cross_connection' | 'workflow_suggestion';
  entityId: string;
  entityType: 'task' | 'case' | 'contact';
  data: TaskEnhancement | CaseAnalysis | CrossModuleConnection | string[];
  confidence: number;
  createdAt: string;
  appliedAt?: string;
  dismissed?: boolean;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  priority: 'P1' | 'P2' | 'P3' | 'deadline';
  status: 'inbox' | 'next_action' | 'in_progress' | 'done';
  case_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  due_date?: string;
  
  // AI Enhancements
  ai_enhanced?: boolean;
  ai_confidence?: number;
  ai_suggestions?: {
    estimatedHours?: number;
    relatedCaseTypes?: string[];
    requiredDocuments?: string[];
    keyContacts?: string[];
    reasoning?: string;
  };
  ai_insights?: string[]; // Array of insight IDs
}

export interface EnhancedCase {
  id: string;
  title: string;
  description?: string;
  case_type: string;
  client_name: string;
  status: 'active' | 'closed' | 'on_hold';
  created_at: string;
  updated_at: string;
  
  // AI Enhancements
  ai_analysis?: {
    complexity?: 'low' | 'medium' | 'high';
    estimatedDuration?: number;
    successProbability?: number;
    riskFactors?: string[];
    recommendedActions?: string[];
    requiredResources?: string[];
    confidence?: number;
  };
  ai_insights?: string[]; // Array of insight IDs
}

export interface EnhancedContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  type: 'client' | 'opposing_counsel' | 'expert_witness' | 'court_personnel' | 'other';
  created_at: string;
  updated_at: string;
  
  // AI Enhancements
  ai_insights?: string[]; // Array of insight IDs
  ai_connections?: {
    relatedCases?: string[];
    relatedTasks?: string[];
    connectionStrength?: number;
  };
}

export interface LifeOSData {
  tasks: EnhancedTask[];
  cases: EnhancedCase[];
  contacts: EnhancedContact[];
  ai_insights: AIInsight[];
  ai_settings: {
    enabled: boolean;
    autoEnhance: boolean;
    confidenceThreshold: number;
    lastAnalysis?: string;
  };
  version: string;
  lastUpdated: string;
}

export class EnhancedStorageManager {
  private static readonly STORAGE_KEY = 'lifeos_enhanced_data';
  private static readonly VERSION = '2.0.0';

  static getDefaultData(): LifeOSData {
    return {
      tasks: [],
      cases: [],
      contacts: [],
      ai_insights: [],
      ai_settings: {
        enabled: true,
        autoEnhance: true,
        confidenceThreshold: 0.7,
      },
      version: this.VERSION,
      lastUpdated: new Date().toISOString(),
    };
  }

  static loadData(): LifeOSData {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // Check for legacy data and migrate
        return this.migrateLegacyData();
      }

      const data = JSON.parse(stored) as LifeOSData;
      
      // Version check and migration
      if (data.version !== this.VERSION) {
        return this.migrateData(data);
      }

      return data;
    } catch (error) {
      console.error('Error loading enhanced data:', error);
      return this.getDefaultData();
    }
  }

  static saveData(data: LifeOSData): void {
    if (typeof window === 'undefined') return;

    try {
      data.lastUpdated = new Date().toISOString();
      data.version = this.VERSION;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving enhanced data:', error);
    }
  }

  private static migrateLegacyData(): LifeOSData {
    const defaultData = this.getDefaultData();

    try {
      // Try to load legacy data from the original storage key
      const legacyTasks = localStorage.getItem('lifeos_tasks');
      const legacyCases = localStorage.getItem('lifeos_cases');
      const legacyContacts = localStorage.getItem('lifeos_contacts');

      if (legacyTasks) {
        const tasks = JSON.parse(legacyTasks);
        defaultData.tasks = tasks.map((task: any) => this.enhanceTaskStructure(task));
      }

      if (legacyCases) {
        const cases = JSON.parse(legacyCases);
        defaultData.cases = cases.map((case_: any) => this.enhanceCaseStructure(case_));
      }

      if (legacyContacts) {
        const contacts = JSON.parse(legacyContacts);
        defaultData.contacts = contacts.map((contact: any) => this.enhanceContactStructure(contact));
      }

      // Save migrated data
      this.saveData(defaultData);
      console.log('Successfully migrated legacy data to enhanced format');

    } catch (error) {
      console.error('Error migrating legacy data:', error);
    }

    return defaultData;
  }

  private static migrateData(oldData: LifeOSData): LifeOSData {
    // Handle version migrations here
    const newData = { ...oldData };
    newData.version = this.VERSION;
    
    // Ensure all required fields exist
    if (!newData.ai_insights) newData.ai_insights = [];
    if (!newData.ai_settings) {
      newData.ai_settings = {
        enabled: true,
        autoEnhance: true,
        confidenceThreshold: 0.7,
      };
    }

    // Enhance existing structures if needed
    newData.tasks = newData.tasks.map(task => this.enhanceTaskStructure(task));
    newData.cases = newData.cases.map(case_ => this.enhanceCaseStructure(case_));
    newData.contacts = newData.contacts.map(contact => this.enhanceContactStructure(contact));

    this.saveData(newData);
    return newData;
  }

  private static enhanceTaskStructure(task: any): EnhancedTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority || 'P3',
      status: task.status || 'inbox',
      case_ids: task.case_ids || [],
      tags: task.tags || [],
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || new Date().toISOString(),
      due_date: task.due_date,
      ai_enhanced: task.ai_enhanced || false,
      ai_confidence: task.ai_confidence,
      ai_suggestions: task.ai_suggestions,
      ai_insights: task.ai_insights || [],
    };
  }

  private static enhanceCaseStructure(case_: any): EnhancedCase {
    return {
      id: case_.id,
      title: case_.title,
      description: case_.description,
      case_type: case_.case_type,
      client_name: case_.client_name,
      status: case_.status || 'active',
      created_at: case_.created_at || new Date().toISOString(),
      updated_at: case_.updated_at || new Date().toISOString(),
      ai_analysis: case_.ai_analysis,
      ai_insights: case_.ai_insights || [],
    };
  }

  private static enhanceContactStructure(contact: any): EnhancedContact {
    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      type: contact.type || 'other',
      created_at: contact.created_at || new Date().toISOString(),
      updated_at: contact.updated_at || new Date().toISOString(),
      ai_insights: contact.ai_insights || [],
      ai_connections: contact.ai_connections,
    };
  }

  // AI Insight Management
  static addInsight(data: LifeOSData, insight: Omit<AIInsight, 'id' | 'createdAt'>): AIInsight {
    const newInsight: AIInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    data.ai_insights.push(newInsight);
    this.saveData(data);
    return newInsight;
  }

  static getInsightsForEntity(data: LifeOSData, entityId: string, entityType: string): AIInsight[] {
    return data.ai_insights.filter(
      insight => insight.entityId === entityId && insight.entityType === entityType && !insight.dismissed
    );
  }

  static dismissInsight(data: LifeOSData, insightId: string): void {
    const insight = data.ai_insights.find(i => i.id === insightId);
    if (insight) {
      insight.dismissed = true;
      this.saveData(data);
    }
  }

  static applyInsight(data: LifeOSData, insightId: string): void {
    const insight = data.ai_insights.find(i => i.id === insightId);
    if (insight) {
      insight.appliedAt = new Date().toISOString();
      this.saveData(data);
    }
  }

  // Cleanup old insights (older than 30 days)
  static cleanupOldInsights(data: LifeOSData): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.ai_insights = data.ai_insights.filter(insight => {
      const createdDate = new Date(insight.createdAt);
      return createdDate > thirtyDaysAgo || insight.appliedAt; // Keep applied insights
    });

    this.saveData(data);
  }
}
