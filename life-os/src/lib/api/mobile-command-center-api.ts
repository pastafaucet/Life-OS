// Mobile Command Center API
// Handles mobile-specific features, location-based intelligence, emergency systems, and voice processing

import { workflowDb } from '../database/workflow-automation-db';
import { 
  PushNotification, 
  BackgroundJob 
} from '../database/types';

export interface LocationContext {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
  venue_type?: 'courthouse' | 'office' | 'client_location' | 'home' | 'other';
  geofence_triggers?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'colleague' | 'supervisor' | 'emergency' | 'family' | 'client';
  phone: string;
  email?: string;
  priority: number;
  auto_notify_triggers: string[];
}

export interface VoiceCommand {
  id: string;
  command_text: string;
  intent: 'create_task' | 'update_case' | 'schedule_meeting' | 'send_message' | 'get_status' | 'emergency';
  confidence: number;
  entities: Record<string, any>;
  timestamp: Date;
  processed: boolean;
  result?: any;
}

export interface MobileQuickAction {
  id: string;
  title: string;
  icon: string;
  action_type: 'navigation' | 'api_call' | 'workflow_trigger' | 'emergency';
  config: Record<string, any>;
  context_triggers?: string[];
  enabled: boolean;
}

export interface OfflineAction {
  id: string;
  action_type: string;
  payload: Record<string, any>;
  timestamp: Date;
  sync_priority: number;
  retry_count: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface GeofenceRule {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
  trigger_type: 'enter' | 'exit' | 'dwell';
  dwell_time?: number; // minutes
  actions: {
    type: 'notification' | 'workflow' | 'context_switch' | 'reminder';
    config: Record<string, any>;
  }[];
  enabled: boolean;
}

class MobileCommandCenterAPI {
  private locationHistory: LocationContext[] = [];
  private emergencyContacts: EmergencyContact[] = [];
  private geofenceRules: GeofenceRule[] = [];
  private offlineQueue: OfflineAction[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.initializeMobileFeatures();
  }

  private async initializeMobileFeatures() {
    await this.loadEmergencyContacts();
    await this.loadGeofenceRules();
    await this.setupOfflineSupport();
    console.log('🚀 Mobile Command Center API initialized');
  }

  // Location-Based Intelligence
  async updateLocation(location: LocationContext): Promise<void> {
    try {
      // Store location in history
      this.locationHistory.unshift(location);
      if (this.locationHistory.length > 100) {
        this.locationHistory = this.locationHistory.slice(0, 100);
      }

      // Check geofence triggers
      await this.checkGeofenceTriggers(location);

      // Update context based on location
      await this.updateLocationContext(location);

      // Record location metric
      await workflowDb.recordMetric({
        metric_type: 'efficiency',
        metric_name: 'location_update',
        metric_value: 1,
        metric_unit: 'count',
        timestamp: new Date(),
        data_source: 'user_action',
        is_anomaly: false,
        metadata: JSON.stringify({
          venue_type: location.venue_type,
          accuracy: location.accuracy
        })
      });

      console.log(`📍 Location updated: ${location.venue_type || 'unknown'}`);
    } catch (error) {
      console.error('❌ Failed to update location:', error);
    }
  }

  private async checkGeofenceTriggers(location: LocationContext): Promise<void> {
    for (const rule of this.geofenceRules) {
      if (!rule.enabled) continue;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        rule.location.latitude,
        rule.location.longitude
      );

      const isInside = distance <= rule.location.radius;
      const wasInside = this.wasInsideGeofence(rule.id);

      // Trigger based on rule type
      if (rule.trigger_type === 'enter' && isInside && !wasInside) {
        await this.executeGeofenceActions(rule, 'enter', location);
      } else if (rule.trigger_type === 'exit' && !isInside && wasInside) {
        await this.executeGeofenceActions(rule, 'exit', location);
      }
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private wasInsideGeofence(ruleId: string): boolean {
    // Check previous location against geofence
    // Simplified implementation
    return false;
  }

  private async executeGeofenceActions(rule: GeofenceRule, triggerType: string, location: LocationContext): Promise<void> {
    console.log(`🏠 Geofence triggered: ${rule.name} (${triggerType})`);

    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'notification':
            await this.sendPushNotification({
              title: action.config.title || `${rule.name} - ${triggerType}`,
              body: action.config.message || `You have ${triggerType}ed ${rule.name}`,
              priority: 'high',
              category: 'location',
              data: { rule_id: rule.id, trigger_type: triggerType }
            });
            break;
          case 'workflow':
            await this.triggerLocationWorkflow(action.config.workflow_id, location, rule);
            break;
          case 'context_switch':
            await this.switchContext(action.config.context, location);
            break;
          case 'reminder':
            await this.createLocationReminder(action.config, location, rule);
            break;
        }
      } catch (error) {
        console.error(`❌ Failed to execute geofence action ${action.type}:`, error);
      }
    }
  }

  private async updateLocationContext(location: LocationContext): Promise<void> {
    const contextData = {
      current_location: location,
      suggested_actions: await this.generateLocationActions(location),
      nearby_deadlines: await this.getNearbyDeadlines(location),
      travel_time_warnings: await this.getTravelTimeWarnings(location)
    };

    // Store context for mobile UI
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobile_location_context', JSON.stringify(contextData));
    }
  }

  private async generateLocationActions(location: LocationContext): Promise<MobileQuickAction[]> {
    const actions: MobileQuickAction[] = [];

    switch (location.venue_type) {
      case 'courthouse':
        actions.push(
          {
            id: 'check_hearing_schedule',
            title: 'Check Today\'s Hearings',
            icon: 'calendar',
            action_type: 'api_call',
            config: { endpoint: '/api/hearings/today' },
            enabled: true
          },
          {
            id: 'courthouse_checkin',
            title: 'Court Check-in',
            icon: 'check-circle',
            action_type: 'workflow_trigger',
            config: { workflow_id: 'courthouse_checkin' },
            enabled: true
          }
        );
        break;
      case 'client_location':
        actions.push(
          {
            id: 'start_meeting_timer',
            title: 'Start Meeting Timer',
            icon: 'clock',
            action_type: 'api_call',
            config: { endpoint: '/api/time/start-meeting' },
            enabled: true
          },
          {
            id: 'quick_case_notes',
            title: 'Quick Case Notes',
            icon: 'edit',
            action_type: 'navigation',
            config: { route: '/mobile/quick-notes' },
            enabled: true
          }
        );
        break;
      case 'office':
        actions.push(
          {
            id: 'desk_mode',
            title: 'Switch to Desk Mode',
            icon: 'monitor',
            action_type: 'api_call',
            config: { endpoint: '/api/context/desk-mode' },
            enabled: true
          }
        );
        break;
    }

    return actions;
  }

  // Emergency Response System
  async triggerEmergency(level: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>): Promise<string> {
    const emergencyId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Log emergency
      await workflowDb.createJob({
        job_type: 'automation',
        job_name: `Emergency Response - Level ${level.toUpperCase()}`,
        priority: 1,
        payload: JSON.stringify({
          emergency_id: emergencyId,
          level,
          context,
          location: this.getCurrentLocation(),
          timestamp: new Date().toISOString()
        }),
        scheduled_at: new Date(),
        status: 'queued',
        attempts: 0,
        max_attempts: 5,
        progress_percentage: 0,
        created_by: 'system'
      });

      // Execute emergency protocols based on level
      await this.executeEmergencyProtocol(level, emergencyId, context);

      console.log(`🚨 Emergency triggered: ${emergencyId} (Level: ${level})`);
      return emergencyId;
    } catch (error) {
      console.error('❌ Failed to trigger emergency:', error);
      throw error;
    }
  }

  private async executeEmergencyProtocol(level: string, emergencyId: string, context?: Record<string, any>): Promise<void> {
    const protocols = {
      low: ['notify_supervisor'],
      medium: ['notify_supervisor', 'log_incident'],
      high: ['notify_supervisor', 'notify_emergency_contacts', 'log_incident', 'escalate_alerts'],
      critical: ['notify_all_contacts', 'send_location', 'activate_emergency_services', 'continuous_monitoring']
    };

    const actions = protocols[level as keyof typeof protocols] || [];

    for (const action of actions) {
      try {
        await this.executeEmergencyAction(action, emergencyId, context);
      } catch (error) {
        console.error(`❌ Emergency action failed: ${action}`, error);
      }
    }
  }

  private async executeEmergencyAction(action: string, emergencyId: string, context?: Record<string, any>): Promise<void> {
    switch (action) {
      case 'notify_supervisor':
        const supervisor = this.emergencyContacts.find(c => c.relationship === 'supervisor');
        if (supervisor) {
          await this.sendEmergencyNotification(supervisor, emergencyId, context);
        }
        break;
      case 'notify_emergency_contacts':
        const emergencyContacts = this.emergencyContacts
          .filter(c => c.relationship === 'emergency')
          .sort((a, b) => a.priority - b.priority);
        for (const contact of emergencyContacts.slice(0, 3)) {
          await this.sendEmergencyNotification(contact, emergencyId, context);
        }
        break;
      case 'send_location':
        await this.broadcastLocation(emergencyId);
        break;
      case 'log_incident':
        await this.logEmergencyIncident(emergencyId, context);
        break;
    }
  }

  private async sendEmergencyNotification(contact: EmergencyContact, emergencyId: string, context?: Record<string, any>): Promise<void> {
    await this.sendPushNotification({
      title: '🚨 EMERGENCY ALERT',
      body: `Emergency situation detected. Contact: ${contact.name}`,
      priority: 'critical',
      category: 'emergency',
      data: { 
        emergency_id: emergencyId, 
        contact_id: contact.id,
        requires_immediate_action: true
      }
    });

    console.log(`🚨 Emergency notification sent to: ${contact.name}`);
  }

  // Voice Command Processing
  async processVoiceCommand(audioData: ArrayBuffer | string): Promise<VoiceCommand> {
    const commandId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // In production, this would use actual speech-to-text service
      const commandText = typeof audioData === 'string' ? audioData : 'simulated voice command';
      
      const voiceCommand: VoiceCommand = {
        id: commandId,
        command_text: commandText,
        intent: this.parseIntent(commandText),
        confidence: 0.85 + Math.random() * 0.15,
        entities: this.extractEntities(commandText),
        timestamp: new Date(),
        processed: false
      };

      // Process the command
      voiceCommand.result = await this.executeVoiceCommand(voiceCommand);
      voiceCommand.processed = true;

      // Record voice interaction
      await workflowDb.recordMetric({
        metric_type: 'productivity',
        metric_name: 'voice_command_processed',
        metric_value: 1,
        metric_unit: 'count',
        timestamp: new Date(),
        data_source: 'user_action',
        is_anomaly: false,
        metadata: JSON.stringify({
          intent: voiceCommand.intent,
          confidence: voiceCommand.confidence
        })
      });

      console.log(`🎤 Voice command processed: ${voiceCommand.intent}`);
      return voiceCommand;
    } catch (error) {
      console.error('❌ Failed to process voice command:', error);
      throw error;
    }
  }

  private parseIntent(commandText: string): VoiceCommand['intent'] {
    const lowerText = commandText.toLowerCase();
    
    if (lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('new')) {
      return 'create_task';
    } else if (lowerText.includes('update') || lowerText.includes('change') || lowerText.includes('modify')) {
      return 'update_case';
    } else if (lowerText.includes('schedule') || lowerText.includes('meeting') || lowerText.includes('appointment')) {
      return 'schedule_meeting';
    } else if (lowerText.includes('send') || lowerText.includes('message') || lowerText.includes('email')) {
      return 'send_message';
    } else if (lowerText.includes('status') || lowerText.includes('how') || lowerText.includes('what')) {
      return 'get_status';
    } else if (lowerText.includes('emergency') || lowerText.includes('help') || lowerText.includes('urgent')) {
      return 'emergency';
    }
    
    return 'get_status';
  }

  private extractEntities(commandText: string): Record<string, any> {
    // Simple entity extraction - in production would use NLP service
    const entities: Record<string, any> = {};
    
    // Extract time references
    const timePatterns = [
      /tomorrow/i,
      /today/i,
      /next week/i,
      /(\d+)\s*(hour|minute|day)s?/i
    ];
    
    timePatterns.forEach(pattern => {
      const match = commandText.match(pattern);
      if (match) {
        entities.time_reference = match[0];
      }
    });

    // Extract case references
    const casePattern = /case\s+(\w+)/i;
    const caseMatch = commandText.match(casePattern);
    if (caseMatch) {
      entities.case_reference = caseMatch[1];
    }

    return entities;
  }

  private async executeVoiceCommand(command: VoiceCommand): Promise<any> {
    switch (command.intent) {
      case 'create_task':
        return await this.createTaskFromVoice(command);
      case 'update_case':
        return await this.updateCaseFromVoice(command);
      case 'schedule_meeting':
        return await this.scheduleMeetingFromVoice(command);
      case 'send_message':
        return await this.sendMessageFromVoice(command);
      case 'get_status':
        return await this.getStatusFromVoice(command);
      case 'emergency':
        return await this.handleEmergencyVoice(command);
      default:
        throw new Error(`Unknown voice intent: ${command.intent}`);
    }
  }

  private async createTaskFromVoice(command: VoiceCommand): Promise<any> {
    // Extract task details from voice command
    const taskTitle = command.command_text.replace(/create|add|new/gi, '').trim();
    
    return {
      action: 'task_created',
      task_id: `voice_task_${Date.now()}`,
      title: taskTitle || 'Voice-created task',
      source: 'voice_command',
      confidence: command.confidence
    };
  }

  // Push Notification System
  async sendPushNotification(notification: {
    title: string;
    body: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    data?: Record<string, any>;
  }): Promise<string> {
    const notificationId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Store notification in database using job system
      const pushNotificationData = {
        user_id: 'current_user', // Would be actual user ID
        title: notification.title,
        body: notification.body,
        priority: notification.priority,
        category: notification.category,
        status: 'sent',
        scheduled_at: new Date(),
        data: notification.data ? JSON.stringify(notification.data) : undefined,
        device_tokens: JSON.stringify(['mobile_device_token']) // Would be actual device tokens
      };
      
      // Use the job system to handle push notifications
      await workflowDb.createJob({
        job_type: 'automation',
        job_name: `Push Notification: ${notification.title}`,
        priority: notification.priority === 'critical' ? 1 : notification.priority === 'high' ? 2 : 3,
        payload: JSON.stringify(pushNotificationData),
        scheduled_at: new Date(),
        status: 'queued',
        attempts: 0,
        max_attempts: 3,
        progress_percentage: 0,
        created_by: 'system'
      });

      console.log(`📱 Push notification sent: ${notification.title}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      throw error;
    }
  }

  // Offline Support
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retry_count' | 'status'>): Promise<string> {
    const actionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineAction: OfflineAction = {
      ...action,
      id: actionId,
      timestamp: new Date(),
      retry_count: 0,
      status: 'pending'
    };

    this.offlineQueue.push(offlineAction);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    }

    console.log(`📴 Offline action queued: ${action.action_type}`);
    return actionId;
  }

  async syncOfflineActions(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    console.log(`🔄 Syncing ${this.offlineQueue.length} offline actions`);

    for (const action of this.offlineQueue) {
      if (action.status === 'pending') {
        try {
          action.status = 'syncing';
          await this.executeOfflineAction(action);
          action.status = 'completed';
          console.log(`✅ Offline action synced: ${action.id}`);
        } catch (error) {
          action.retry_count++;
          action.status = action.retry_count >= 3 ? 'failed' : 'pending';
          console.error(`❌ Failed to sync offline action ${action.id}:`, error);
        }
      }
    }

    // Remove completed and failed actions
    this.offlineQueue = this.offlineQueue.filter(action => 
      action.status !== 'completed' && action.status !== 'failed'
    );

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    }
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    // Execute the queued action based on type
    switch (action.action_type) {
      case 'create_task':
        // Create task in database
        break;
      case 'update_case':
        // Update case in database
        break;
      case 'record_time':
        // Record time entry
        break;
      default:
        console.log(`Processing offline action: ${action.action_type}`);
    }
  }

  // Mobile Data Management
  async getMobileDashboardData(): Promise<any> {
    try {
      const [metrics, alerts, quickActions] = await Promise.all([
        this.getMobileMetrics(),
        this.getMobileAlerts(),
        this.getMobileQuickActions()
      ]);

      return {
        location_context: this.getCurrentLocationContext(),
        metrics,
        alerts,
        quick_actions: quickActions,
        offline_status: {
          is_online: this.isOnline,
          pending_actions: this.offlineQueue.length,
          last_sync: new Date()
        }
      };
    } catch (error) {
      console.error('❌ Failed to get mobile dashboard data:', error);
      throw error;
    }
  }

  private async getMobileMetrics(): Promise<any> {
    return {
      today_tasks: Math.floor(Math.random() * 15) + 5,
      urgent_deadlines: Math.floor(Math.random() * 5),
      completion_rate: Math.floor(Math.random() * 30) + 70,
      focus_time: Math.floor(Math.random() * 6) + 2
    };
  }

  private async getMobileAlerts(): Promise<any[]> {
    return [
      {
        id: 'mobile_alert_1',
        type: 'deadline',
        severity: 'high',
        message: 'Court hearing in 2 hours',
        action_required: true
      },
      {
        id: 'mobile_alert_2',
        type: 'location',
        severity: 'medium',
        message: 'You\'re near the courthouse',
        action_required: false
      }
    ];
  }

  // Helper Methods
  private getCurrentLocation(): LocationContext | null {
    return this.locationHistory[0] || null;
  }

  private getCurrentLocationContext(): any {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mobile_location_context');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  private async getMobileQuickActions(): Promise<MobileQuickAction[]> {
    const location = this.getCurrentLocation();
    return location ? await this.generateLocationActions(location) : [];
  }

  private async loadEmergencyContacts(): Promise<void> {
    // Load from database or use defaults
    this.emergencyContacts = [
      {
        id: 'supervisor_1',
        name: 'Senior Partner',
        relationship: 'supervisor',
        phone: '+1-555-0101',
        email: 'supervisor@firm.com',
        priority: 1,
        auto_notify_triggers: ['high_emergency', 'critical_emergency']
      },
      {
        id: 'emergency_1',
        name: 'Emergency Contact',
        relationship: 'emergency',
        phone: '+1-555-0911',
        priority: 1,
        auto_notify_triggers: ['critical_emergency']
      }
    ];
  }

  private async loadGeofenceRules(): Promise<void> {
    // Load from database or use defaults
    this.geofenceRules = [
      {
        id: 'courthouse_main',
        name: 'Main Courthouse',
        location: { latitude: 37.7749, longitude: -122.4194, radius: 100 },
        trigger_type: 'enter',
        actions: [
          {
            type: 'notification',
            config: { title: 'Courthouse Check-in', message: 'Remember to check your hearing schedule' }
          },
          {
            type: 'context_switch',
            config: { context: 'courthouse_mode' }
          }
        ],
        enabled: true
      }
    ];
  }

  private async setupOfflineSupport(): Promise<void> {
    // Load offline queue from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }

      // Monitor online status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncOfflineActions();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Placeholder methods for referenced functions
  private async getNearbyDeadlines(location: LocationContext): Promise<any[]> { return []; }
  private async getTravelTimeWarnings(location: LocationContext): Promise<any[]> { return []; }
  private async triggerLocationWorkflow(workflowId: string, location: LocationContext, rule: GeofenceRule): Promise<void> {}
  private async switchContext(context: string, location: LocationContext): Promise<void> {}
  private async createLocationReminder(config: any, location: LocationContext, rule: GeofenceRule): Promise<void> {}
  private async broadcastLocation(emergencyId: string): Promise<void> {}
  private async logEmergencyIncident(emergencyId: string, context?: Record<string, any>): Promise<void> {}
  private async updateCaseFromVoice(command: VoiceCommand): Promise<any> { return { action: 'case_updated' }; }
  private async scheduleMeetingFromVoice(command: VoiceCommand): Promise<any> { return { action: 'meeting_scheduled' }; }
  private async sendMessageFromVoice(command: VoiceCommand): Promise<any> { return { action: 'message_sent' }; }
  private async getStatusFromVoice(command: VoiceCommand): Promise<any> { return { status: 'all_systems_operational' }; }
  private async handleEmergencyVoice(command: VoiceCommand): Promise<any> { 
    const emergencyId = await this.triggerEmergency('medium', { source: 'voice_command', command: command.command_text });
    return { action: 'emergency_triggered', emergency_id: emergencyId };
  }
}

// Export singleton instance
export const mobileCommandCenter = new MobileCommandCenterAPI();
export default MobileCommandCenterAPI;

// Utility functions for mobile features
export const getCurrentLocationContext = (): any => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mobile_location_context');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const isOfflineModeActive = (): boolean => {
  if (typeof window !== 'undefined') {
    return !navigator.onLine;
  }
  return false;
};

export const getPendingOfflineActions = (): number => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('offline_queue');
    return stored ? JSON.parse(stored).length : 0;
  }
  return 0;
};

export const formatEmergencyLevel = (level: string): { color: string; icon: string; label: string } => {
  switch (level) {
    case 'critical':
      return { color: 'text-red-400', icon: '🚨', label: 'CRITICAL' };
    case 'high':
      return { color: 'text-orange-400', icon: '⚠️', label: 'HIGH' };
    case 'medium':
      return { color: 'text-yellow-400', icon: '⚡', label: 'MEDIUM' };
    case 'low':
      return { color: 'text-blue-400', icon: 'ℹ️', label: 'LOW' };
    default:
      return { color: 'text-gray-400', icon: '📢', label: 'UNKNOWN' };
  }
};

// React Hook for mobile features
export const useMobileCommandCenter = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [pendingActions, setPendingActions] = React.useState(0);
  const [locationContext, setLocationContext] = React.useState<any>(null);

  React.useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  React.useEffect(() => {
    // Load location context
    const context = getCurrentLocationContext();
    setLocationContext(context);

    // Monitor offline actions
    const actions = getPendingOfflineActions();
    setPendingActions(actions);
  }, []);

  const triggerEmergency = React.useCallback(async (level: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => {
    return await mobileCommandCenter.triggerEmergency(level, context);
  }, []);

  const processVoiceCommand = React.useCallback(async (audioData: ArrayBuffer | string) => {
    return await mobileCommandCenter.processVoiceCommand(audioData);
  }, []);

  const updateLocation = React.useCallback(async (location: LocationContext) => {
    await mobileCommandCenter.updateLocation(location);
    setLocationContext(getCurrentLocationContext());
  }, []);

  const queueOfflineAction = React.useCallback(async (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retry_count' | 'status'>) => {
    const actionId = await mobileCommandCenter.queueOfflineAction(action);
    setPendingActions(getPendingOfflineActions());
    return actionId;
  }, []);

  const getDashboardData = React.useCallback(async () => {
    return await mobileCommandCenter.getMobileDashboardData();
  }, []);

  return {
    isOnline,
    pendingActions,
    locationContext,
    triggerEmergency,
    processVoiceCommand,
    updateLocation,
    queueOfflineAction,
    getDashboardData
  };
};

// Import React at the top for the hook
import React from 'react';
