'use client';

import { useState, useEffect, useCallback } from 'react';

// External Integration Types
export interface CalendarIntegration {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'exchange';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  email: string;
  syncedEvents: number;
  upcomingEvents: number;
  autoTaskCreation: boolean;
  settings: {
    syncInterval: number; // minutes
    createTasksForMeetings: boolean;
    deadlineReminders: boolean;
    conflictDetection: boolean;
  };
}

export interface EmailIntegration {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'exchange' | 'imap';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  email: string;
  totalEmails: number;
  unreadEmails: number;
  autoTaskCreation: boolean;
  settings: {
    syncInterval: number; // minutes
    parseForTasks: boolean;
    filterRules: string[];
    createContactsFromEmails: boolean;
    attachmentExtraction: boolean;
  };
}

export interface DocumentIntegration {
  id: string;
  name: string;
  type: 'google_drive' | 'onedrive' | 'dropbox' | 'box' | 'sharepoint';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  totalDocuments: number;
  recentDocuments: number;
  storageUsed: string;
  settings: {
    syncInterval: number; // minutes
    autoOrganization: boolean;
    versionTracking: boolean;
    collaborationSync: boolean;
    templateGeneration: boolean;
  };
}

export interface CommunicationIntegration {
  id: string;
  name: string;
  type: 'slack' | 'teams' | 'discord' | 'zoom' | 'webex';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  messageCount: number;
  meetingCount: number;
  settings: {
    notifications: boolean;
    meetingReminders: boolean;
    statusSync: boolean;
    messageArchiving: boolean;
  };
}

export interface ExternalConnection {
  id: string;
  name: string;
  category: 'calendar' | 'email' | 'document' | 'communication' | 'other';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastActivity: Date;
  dataCount: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: number; // percentage
}

export interface IntegrationStats {
  totalConnections: number;
  activeConnections: number;
  syncOperations24h: number;
  dataTransferred24h: string;
  errorRate: number;
  averageResponseTime: number;
  uptime: number;
  lastFullSync: Date;
  nextScheduledSync: Date;
}

export interface SyncOperation {
  id: string;
  integrationId: string;
  integrationName: string;
  type: 'calendar' | 'email' | 'documents' | 'communication';
  operation: 'sync' | 'import' | 'export' | 'backup';
  status: 'running' | 'completed' | 'failed' | 'queued';
  startedAt: Date;
  completedAt?: Date;
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  error?: string;
  dataTransferred?: string;
}

// Mock data generators
const generateMockCalendarIntegrations = (): CalendarIntegration[] => [
  {
    id: '1',
    name: 'Google Calendar',
    type: 'google',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    email: 'user@gmail.com',
    syncedEvents: 234,
    upcomingEvents: 12,
    autoTaskCreation: true,
    settings: {
      syncInterval: 15,
      createTasksForMeetings: true,
      deadlineReminders: true,
      conflictDetection: true
    }
  },
  {
    id: '2',
    name: 'Outlook Calendar',
    type: 'outlook',
    status: 'connected',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    email: 'user@company.com',
    syncedEvents: 156,
    upcomingEvents: 8,
    autoTaskCreation: false,
    settings: {
      syncInterval: 30,
      createTasksForMeetings: false,
      deadlineReminders: true,
      conflictDetection: true
    }
  }
];

const generateMockEmailIntegrations = (): EmailIntegration[] => [
  {
    id: '1',
    name: 'Gmail',
    type: 'gmail',
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    email: 'user@gmail.com',
    totalEmails: 15420,
    unreadEmails: 23,
    autoTaskCreation: true,
    settings: {
      syncInterval: 5,
      parseForTasks: true,
      filterRules: ['from:client', 'subject:urgent', 'label:tasks'],
      createContactsFromEmails: true,
      attachmentExtraction: true
    }
  },
  {
    id: '2',
    name: 'Work Email',
    type: 'exchange',
    status: 'syncing',
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    email: 'user@company.com',
    totalEmails: 8930,
    unreadEmails: 45,
    autoTaskCreation: false,
    settings: {
      syncInterval: 15,
      parseForTasks: false,
      filterRules: [],
      createContactsFromEmails: false,
      attachmentExtraction: false
    }
  }
];

const generateMockDocumentIntegrations = (): DocumentIntegration[] => [
  {
    id: '1',
    name: 'Google Drive',
    type: 'google_drive',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    totalDocuments: 1247,
    recentDocuments: 34,
    storageUsed: '12.4 GB',
    settings: {
      syncInterval: 60,
      autoOrganization: true,
      versionTracking: true,
      collaborationSync: true,
      templateGeneration: true
    }
  },
  {
    id: '2',
    name: 'OneDrive Business',
    type: 'onedrive',
    status: 'connected',
    lastSync: new Date(Date.now() - 45 * 60 * 1000),
    totalDocuments: 892,
    recentDocuments: 18,
    storageUsed: '8.7 GB',
    settings: {
      syncInterval: 120,
      autoOrganization: false,
      versionTracking: true,
      collaborationSync: false,
      templateGeneration: false
    }
  }
];

const generateMockCommunicationIntegrations = (): CommunicationIntegration[] => [
  {
    id: '1',
    name: 'Slack Workspace',
    type: 'slack',
    status: 'connected',
    lastSync: new Date(Date.now() - 1 * 60 * 1000),
    messageCount: 2341,
    meetingCount: 45,
    settings: {
      notifications: true,
      meetingReminders: true,
      statusSync: true,
      messageArchiving: false
    }
  },
  {
    id: '2',
    name: 'Microsoft Teams',
    type: 'teams',
    status: 'connected',
    lastSync: new Date(Date.now() - 8 * 60 * 1000),
    messageCount: 1876,
    meetingCount: 67,
    settings: {
      notifications: true,
      meetingReminders: true,
      statusSync: false,
      messageArchiving: true
    }
  }
];

const generateMockSyncOperations = (): SyncOperation[] => [
  {
    id: '1',
    integrationId: '1',
    integrationName: 'Google Calendar',
    type: 'calendar',
    operation: 'sync',
    status: 'completed',
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    completedAt: new Date(Date.now() - 5 * 60 * 1000),
    progress: 100,
    itemsProcessed: 12,
    totalItems: 12,
    dataTransferred: '2.3 KB'
  },
  {
    id: '2',
    integrationId: '1',
    integrationName: 'Gmail',
    type: 'email',
    operation: 'sync',
    status: 'running',
    startedAt: new Date(Date.now() - 2 * 60 * 1000),
    progress: 75,
    itemsProcessed: 45,
    totalItems: 60,
    dataTransferred: '15.7 KB'
  },
  {
    id: '3',
    integrationId: '2',
    integrationName: 'Work Email',
    type: 'email',
    operation: 'sync',
    status: 'failed',
    startedAt: new Date(Date.now() - 30 * 60 * 1000),
    completedAt: new Date(Date.now() - 25 * 60 * 1000),
    progress: 45,
    itemsProcessed: 23,
    totalItems: 51,
    error: 'Authentication expired. Please reconnect.',
    dataTransferred: '8.1 KB'
  }
];

// External Integrations API Class
class ExternalIntegrationsAPI {
  private static instance: ExternalIntegrationsAPI;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ExternalIntegrationsAPI {
    if (!ExternalIntegrationsAPI.instance) {
      ExternalIntegrationsAPI.instance = new ExternalIntegrationsAPI();
    }
    return ExternalIntegrationsAPI.instance;
  }

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`External Integrations API Error [${key}]:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      throw new Error(`Failed to fetch ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calendar Integrations
  async getCalendarIntegrations(): Promise<CalendarIntegration[]> {
    return this.fetchWithCache('calendar-integrations', async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateMockCalendarIntegrations();
    });
  }

  async connectCalendar(type: CalendarIntegration['type'], email: string): Promise<CalendarIntegration> {
    const newIntegration: CalendarIntegration = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Calendar`,
      type,
      status: 'connected',
      lastSync: new Date(),
      email,
      syncedEvents: 0,
      upcomingEvents: 0,
      autoTaskCreation: false,
      settings: {
        syncInterval: 15,
        createTasksForMeetings: false,
        deadlineReminders: true,
        conflictDetection: true
      }
    };

    this.cache.delete('calendar-integrations');
    return newIntegration;
  }

  async disconnectCalendar(integrationId: string): Promise<void> {
    this.cache.delete('calendar-integrations');
  }

  async syncCalendar(integrationId: string): Promise<void> {
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.cache.delete('calendar-integrations');
  }

  // Email Integrations
  async getEmailIntegrations(): Promise<EmailIntegration[]> {
    return this.fetchWithCache('email-integrations', async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return generateMockEmailIntegrations();
    });
  }

  async connectEmail(type: EmailIntegration['type'], email: string): Promise<EmailIntegration> {
    const newIntegration: EmailIntegration = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      status: 'connected',
      lastSync: new Date(),
      email,
      totalEmails: 0,
      unreadEmails: 0,
      autoTaskCreation: false,
      settings: {
        syncInterval: 15,
        parseForTasks: false,
        filterRules: [],
        createContactsFromEmails: false,
        attachmentExtraction: false
      }
    };

    this.cache.delete('email-integrations');
    return newIntegration;
  }

  async disconnectEmail(integrationId: string): Promise<void> {
    this.cache.delete('email-integrations');
  }

  async syncEmail(integrationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.cache.delete('email-integrations');
  }

  // Document Integrations
  async getDocumentIntegrations(): Promise<DocumentIntegration[]> {
    return this.fetchWithCache('document-integrations', async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return generateMockDocumentIntegrations();
    });
  }

  async connectDocument(type: DocumentIntegration['type']): Promise<DocumentIntegration> {
    const newIntegration: DocumentIntegration = {
      id: Date.now().toString(),
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type,
      status: 'connected',
      lastSync: new Date(),
      totalDocuments: 0,
      recentDocuments: 0,
      storageUsed: '0 GB',
      settings: {
        syncInterval: 60,
        autoOrganization: false,
        versionTracking: true,
        collaborationSync: false,
        templateGeneration: false
      }
    };

    this.cache.delete('document-integrations');
    return newIntegration;
  }

  async disconnectDocument(integrationId: string): Promise<void> {
    this.cache.delete('document-integrations');
  }

  async syncDocument(integrationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 4000));
    this.cache.delete('document-integrations');
  }

  // Communication Integrations
  async getCommunicationIntegrations(): Promise<CommunicationIntegration[]> {
    return this.fetchWithCache('communication-integrations', async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockCommunicationIntegrations();
    });
  }

  async connectCommunication(type: CommunicationIntegration['type']): Promise<CommunicationIntegration> {
    const newIntegration: CommunicationIntegration = {
      id: Date.now().toString(),
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      status: 'connected',
      lastSync: new Date(),
      messageCount: 0,
      meetingCount: 0,
      settings: {
        notifications: true,
        meetingReminders: true,
        statusSync: false,
        messageArchiving: false
      }
    };

    this.cache.delete('communication-integrations');
    return newIntegration;
  }

  async disconnectCommunication(integrationId: string): Promise<void> {
    this.cache.delete('communication-integrations');
  }

  // Overall Integration Management
  async getAllConnections(): Promise<ExternalConnection[]> {
    return this.fetchWithCache('all-connections', async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const connections: ExternalConnection[] = [
        {
          id: '1',
          name: 'Google Calendar',
          category: 'calendar',
          status: 'connected',
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          dataCount: 234,
          health: 'excellent',
          uptime: 99.8
        },
        {
          id: '2',
          name: 'Gmail',
          category: 'email',
          status: 'connected',
          lastActivity: new Date(Date.now() - 2 * 60 * 1000),
          dataCount: 15420,
          health: 'excellent',
          uptime: 99.9
        },
        {
          id: '3',
          name: 'Google Drive',
          category: 'document',
          status: 'connected',
          lastActivity: new Date(Date.now() - 15 * 60 * 1000),
          dataCount: 1247,
          health: 'good',
          uptime: 98.5
        },
        {
          id: '4',
          name: 'Slack',
          category: 'communication',
          status: 'connected',
          lastActivity: new Date(Date.now() - 1 * 60 * 1000),
          dataCount: 2341,
          health: 'excellent',
          uptime: 99.7
        },
        {
          id: '5',
          name: 'Work Email',
          category: 'email',
          status: 'error',
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          dataCount: 8930,
          health: 'poor',
          uptime: 85.2
        }
      ];

      return connections;
    });
  }

  async getIntegrationStats(): Promise<IntegrationStats> {
    return this.fetchWithCache('integration-stats', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        totalConnections: 5,
        activeConnections: 4,
        syncOperations24h: 247,
        dataTransferred24h: '142.7 MB',
        errorRate: 2.3,
        averageResponseTime: 340,
        uptime: 98.8,
        lastFullSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextScheduledSync: new Date(Date.now() + 30 * 60 * 1000)
      };
    });
  }

  async getSyncOperations(): Promise<SyncOperation[]> {
    return this.fetchWithCache('sync-operations', async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return generateMockSyncOperations();
    });
  }

  async testConnection(integrationId: string): Promise<{ success: boolean; responseTime: number; error?: string }> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.1; // 90% success rate
    const responseTime = Math.floor(Math.random() * 1000) + 100;
    
    return {
      success,
      responseTime,
      error: success ? undefined : 'Connection timeout - please check credentials'
    };
  }

  async triggerFullSync(): Promise<void> {
    // Simulate full sync operation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clear all caches to force refresh
    this.cache.clear();
  }

  async exportIntegrationData(integrationId: string, format: 'json' | 'csv' | 'xml'): Promise<{ downloadUrl: string; fileSize: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      downloadUrl: `/api/integrations/${integrationId}/export.${format}`,
      fileSize: `${Math.floor(Math.random() * 500) + 100} KB`
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// React Hook for External Integrations
export function useExternalIntegrations() {
  const [calendarIntegrations, setCalendarIntegrations] = useState<CalendarIntegration[]>([]);
  const [emailIntegrations, setEmailIntegrations] = useState<EmailIntegration[]>([]);
  const [documentIntegrations, setDocumentIntegrations] = useState<DocumentIntegration[]>([]);
  const [communicationIntegrations, setCommunicationIntegrations] = useState<CommunicationIntegration[]>([]);
  const [allConnections, setAllConnections] = useState<ExternalConnection[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = ExternalIntegrationsAPI.getInstance();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        calendarData,
        emailData,
        documentData,
        communicationData,
        connectionsData,
        statsData,
        syncData
      ] = await Promise.all([
        api.getCalendarIntegrations(),
        api.getEmailIntegrations(),
        api.getDocumentIntegrations(),
        api.getCommunicationIntegrations(),
        api.getAllConnections(),
        api.getIntegrationStats(),
        api.getSyncOperations()
      ]);

      setCalendarIntegrations(calendarData);
      setEmailIntegrations(emailData);
      setDocumentIntegrations(documentData);
      setCommunicationIntegrations(communicationData);
      setAllConnections(connectionsData);
      setStats(statsData);
      setSyncOperations(syncData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const refreshData = useCallback(async () => {
    api.clearCache();
    await loadData();
  }, [api, loadData]);

  // Individual integration actions
  const connectCalendar = useCallback(async (type: CalendarIntegration['type'], email: string) => {
    try {
      await api.connectCalendar(type, email);
      await refreshData();
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      throw error;
    }
  }, [api, refreshData]);

  const disconnectCalendar = useCallback(async (integrationId: string) => {
    try {
      await api.disconnectCalendar(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
      throw error;
    }
  }, [api, refreshData]);

  const syncCalendar = useCallback(async (integrationId: string) => {
    try {
      await api.syncCalendar(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      throw error;
    }
  }, [api, refreshData]);

  const connectEmail = useCallback(async (type: EmailIntegration['type'], email: string) => {
    try {
      await api.connectEmail(type, email);
      await refreshData();
    } catch (error) {
      console.error('Failed to connect email:', error);
      throw error;
    }
  }, [api, refreshData]);

  const disconnectEmail = useCallback(async (integrationId: string) => {
    try {
      await api.disconnectEmail(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to disconnect email:', error);
      throw error;
    }
  }, [api, refreshData]);

  const syncEmail = useCallback(async (integrationId: string) => {
    try {
      await api.syncEmail(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to sync email:', error);
      throw error;
    }
  }, [api, refreshData]);

  const connectDocument = useCallback(async (type: DocumentIntegration['type']) => {
    try {
      await api.connectDocument(type);
      await refreshData();
    } catch (error) {
      console.error('Failed to connect document service:', error);
      throw error;
    }
  }, [api, refreshData]);

  const disconnectDocument = useCallback(async (integrationId: string) => {
    try {
      await api.disconnectDocument(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to disconnect document service:', error);
      throw error;
    }
  }, [api, refreshData]);

  const syncDocument = useCallback(async (integrationId: string) => {
    try {
      await api.syncDocument(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to sync document service:', error);
      throw error;
    }
  }, [api, refreshData]);

  const connectCommunication = useCallback(async (type: CommunicationIntegration['type']) => {
    try {
      await api.connectCommunication(type);
      await refreshData();
    } catch (error) {
      console.error('Failed to connect communication service:', error);
      throw error;
    }
  }, [api, refreshData]);

  const disconnectCommunication = useCallback(async (integrationId: string) => {
    try {
      await api.disconnectCommunication(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Failed to disconnect communication service:', error);
      throw error;
    }
  }, [api, refreshData]);

  const testConnection = useCallback(async (integrationId: string) => {
    try {
      return await api.testConnection(integrationId);
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw error;
    }
  }, [api]);

  const triggerFullSync = useCallback(async () => {
    try {
      await api.triggerFullSync();
      await refreshData();
    } catch (error) {
      console.error('Failed to trigger full sync:', error);
      throw error;
    }
  }, [api, refreshData]);

  const exportData = useCallback(async (integrationId: string, format: 'json' | 'csv' | 'xml') => {
    try {
      return await api.exportIntegrationData(integrationId, format);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    calendarIntegrations,
    emailIntegrations,
    documentIntegrations,
    communicationIntegrations,
    allConnections,
    stats,
    syncOperations,
    loading,
    error,

    // Actions
    refreshData,
    connectCalendar,
    disconnectCalendar,
    syncCalendar,
    connectEmail,
    disconnectEmail,
    syncEmail,
    connectDocument,
    disconnectDocument,
    syncDocument,
    connectCommunication,
    disconnectCommunication,
    testConnection,
    triggerFullSync,
    exportData
  };
}

export default ExternalIntegrationsAPI;
