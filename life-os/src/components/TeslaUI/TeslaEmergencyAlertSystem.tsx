'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  Siren, 
  Shield,
  Zap,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Volume2,
  VolumeX,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaAlert from './TeslaAlert';
import TeslaStatusIndicator from './TeslaStatusIndicator';

interface EmergencyAlert {
  id: string;
  type: 'critical' | 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  deadline?: Date;
  actions?: EmergencyAction[];
  dismissed: boolean;
  source: 'deadline' | 'case' | 'system' | 'external';
  priority: number; // 1-10, 10 being highest
  persistent: boolean;
}

interface EmergencyAction {
  id: string;
  label: string;
  type: 'call' | 'email' | 'navigate' | 'document' | 'task';
  data: any;
  urgent?: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  priority: number;
}

interface TeslaEmergencyAlertSystemProps {
  className?: string;
}

export const TeslaEmergencyAlertSystem: React.FC<TeslaEmergencyAlertSystemProps> = ({
  className = ""
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  const [dismissedCount, setDismissedCount] = useState(0);

  // Mock emergency contacts
  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Law Partner',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@lawfirm.com',
      priority: 1
    },
    {
      id: '2',
      name: 'Court Clerk',
      role: 'Superior Court',
      phone: '+1 (555) 987-6543',
      email: 'clerk@superiorcourt.gov',
      priority: 2
    },
    {
      id: '3',
      name: 'Emergency Legal Hotline',
      role: 'Bar Association',
      phone: '+1 (555) 911-5555',
      email: 'emergency@bar.org',
      priority: 3
    }
  ];

  // Mock alerts generation
  useEffect(() => {
    const generateMockAlerts = () => {
      const mockAlerts: EmergencyAlert[] = [
        {
          id: '1',
          type: 'critical',
          title: '🚨 MOTION DEADLINE - 2 HOURS',
          message: 'Johnson v. State motion response due at 5:00 PM today. Document status: INCOMPLETE',
          timestamp: new Date(),
          deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          actions: [
            { id: '1', label: 'Open Document', type: 'document', data: { caseId: 'johnson-v-state' } },
            { id: '2', label: 'Call Partner', type: 'call', data: { phone: '+1 (555) 123-4567' }, urgent: true },
            { id: '3', label: 'Request Extension', type: 'email', data: { recipient: 'court@example.com' } }
          ],
          dismissed: false,
          source: 'deadline',
          priority: 10,
          persistent: true
        },
        {
          id: '2',
          type: 'urgent',
          title: '⚡ CLIENT EMERGENCY CALL',
          message: 'ABC Corp requesting immediate legal consultation. Client marked as HIGH PRIORITY.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          actions: [
            { id: '1', label: 'Call Client', type: 'call', data: { phone: '+1 (555) 555-0123' }, urgent: true },
            { id: '2', label: 'View Case File', type: 'navigate', data: { url: '/legal' } },
            { id: '3', label: 'Send Status Update', type: 'email', data: { template: 'status_update' } }
          ],
          dismissed: false,
          source: 'case',
          priority: 8,
          persistent: false
        },
        {
          id: '3',
          type: 'warning',
          title: '📅 CALENDAR CONFLICT DETECTED',
          message: 'Court hearing tomorrow 9:00 AM conflicts with ABC Corp deposition at 10:00 AM.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          actions: [
            { id: '1', label: 'Reschedule Deposition', type: 'task', data: { action: 'reschedule' } },
            { id: '2', label: 'View Calendar', type: 'navigate', data: { url: '/calendar' } },
            { id: '3', label: 'Contact Court', type: 'call', data: { phone: '+1 (555) 987-6543' } }
          ],
          dismissed: false,
          source: 'system',
          priority: 6,
          persistent: false
        },
        {
          id: '4',
          type: 'info',
          title: '📋 MCLE DEADLINE REMINDER',
          message: 'Nevada MCLE requirements: 11 hours remaining, due December 31, 2025.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          deadline: new Date('2025-12-31'),
          actions: [
            { id: '1', label: 'View MCLE Status', type: 'navigate', data: { url: '/mcle' } },
            { id: '2', label: 'Find CLE Courses', type: 'navigate', data: { url: '/cle-search' } }
          ],
          dismissed: false,
          source: 'system',
          priority: 3,
          persistent: false
        }
      ];
      
      setAlerts(mockAlerts);
      setLastAlertTime(new Date());
    };

    generateMockAlerts();
    
    // Simulate new alerts every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new alert
        generateMockAlerts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <Siren className="w-5 h-5 text-red-400 animate-pulse" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'from-red-900 to-red-800 border-red-500';
      case 'urgent': return 'from-orange-900 to-orange-800 border-orange-500';
      case 'warning': return 'from-yellow-900 to-yellow-800 border-yellow-500';
      case 'info': return 'from-blue-900 to-blue-800 border-blue-500';
      default: return 'from-gray-900 to-gray-800 border-gray-500';
    }
  };

  const getTimeUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return 'OVERDUE';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    if (hours < 24) return `${hours}h ${minutes}m`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    setDismissedCount(prev => prev + 1);
    
    if (soundEnabled) {
      // Would play dismiss sound
      console.log('Playing dismiss sound');
    }
  };

  const executeAction = (action: EmergencyAction) => {
    console.log('Executing action:', action);
    
    switch (action.type) {
      case 'call':
        if (action.data.phone) {
          window.open(`tel:${action.data.phone}`, '_blank');
        }
        break;
      case 'email':
        if (action.data.recipient) {
          window.open(`mailto:${action.data.recipient}`, '_blank');
        }
        break;
      case 'navigate':
        if (action.data.url) {
          window.open(action.data.url, '_blank');
        }
        break;
      case 'document':
        console.log('Opening document for case:', action.data.caseId);
        break;
      case 'task':
        console.log('Creating task:', action.data.action);
        break;
    }
  };

  const activateEmergencyMode = () => {
    setEmergencyMode(true);
    setSoundEnabled(true);
    setNotificationsEnabled(true);
    
    // Would trigger emergency protocols
    console.log('Emergency mode activated');
  };

  const deactivateEmergencyMode = () => {
    setEmergencyMode(false);
    console.log('Emergency mode deactivated');
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');
  const urgentAlerts = activeAlerts.filter(alert => alert.type === 'urgent');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Emergency Control Panel */}
      <TeslaCard className={`${emergencyMode ? 'bg-gradient-to-r from-red-900 to-red-800 border-red-500' : ''}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className={`w-6 h-6 ${emergencyMode ? 'text-red-400' : 'text-purple-400'}`} />
              <div>
                <h2 className="text-xl font-bold text-white">
                  🚨 Emergency Alert System
                </h2>
                <p className="text-gray-300 text-sm">
                  {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'Critical notifications and alerts'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TeslaStatusIndicator 
                status={emergencyMode ? 'error' : activeAlerts.length > 0 ? 'warning' : 'online'} 
                size="sm" 
              />
              <div className="text-xs text-gray-400">
                {activeAlerts.length} active
              </div>
            </div>
          </div>

          {/* Alert Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{criticalAlerts.length}</div>
              <div className="text-xs text-red-300">Critical</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{urgentAlerts.length}</div>
              <div className="text-xs text-orange-300">Urgent</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-300">{dismissedCount}</div>
              <div className="text-xs text-gray-400">Resolved</div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="grid grid-cols-2 gap-3">
            <TeslaButton
              variant={emergencyMode ? "danger" : "primary"}
              onClick={emergencyMode ? deactivateEmergencyMode : activateEmergencyMode}
              className="flex items-center justify-center space-x-2"
            >
              <Siren className="w-4 h-4" />
              <span>{emergencyMode ? 'Deactivate' : 'Emergency Mode'}</span>
            </TeslaButton>

            <div className="flex space-x-2">
              <TeslaButton
                variant="secondary"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-center space-x-1 flex-1"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>Sound</span>
              </TeslaButton>
              
              <TeslaButton
                variant="secondary"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="flex items-center justify-center space-x-1 flex-1"
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span>Alerts</span>
              </TeslaButton>
            </div>
          </div>
        </div>
      </TeslaCard>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <TeslaCard>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-4">🔔 Active Alerts</h3>
            
            <div className="space-y-3">
              {activeAlerts
                .sort((a, b) => b.priority - a.priority)
                .map((alert) => (
                <div 
                  key={alert.id} 
                  className={`bg-gradient-to-r ${getAlertColor(alert.type)} border rounded-lg p-4 relative`}
                >
                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start space-x-3 mb-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                        {alert.deadline && (
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock className="w-3 h-3" />
                            <span className={`${alert.type === 'critical' ? 'text-red-300' : 'text-gray-300'}`}>
                              {getTimeUntilDeadline(alert.deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-200 mb-2">{alert.message}</p>
                      <div className="text-xs text-gray-400">
                        {alert.timestamp.toLocaleTimeString()} • Priority: {alert.priority}/10
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {alert.actions.map((action) => (
                        <TeslaButton
                          key={action.id}
                          size="sm"
                          variant={action.urgent ? "danger" : "secondary"}
                          onClick={() => executeAction(action)}
                          className="text-xs"
                        >
                          {action.label}
                        </TeslaButton>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TeslaCard>
      )}

      {/* Emergency Contacts */}
      <TeslaCard>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-4">📞 Emergency Contacts</h3>
          
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white text-sm">{contact.name}</div>
                    <div className="text-xs text-gray-400">{contact.role}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Priority {contact.priority}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <TeslaButton
                    size="sm"
                    onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
                    className="flex items-center space-x-1 flex-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </TeslaButton>
                  
                  <TeslaButton
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                    className="flex items-center space-x-1 flex-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </TeslaButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>

      {/* System Status */}
      <TeslaCard>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Alert System Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Emergency Mode</span>
              <TeslaStatusIndicator status={emergencyMode ? 'error' : 'offline'} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Sound Alerts</span>
              <TeslaStatusIndicator status={soundEnabled ? 'online' : 'offline'} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Push Notifications</span>
              <TeslaStatusIndicator status={notificationsEnabled ? 'online' : 'offline'} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Last Alert</span>
              <span className="text-gray-400 text-xs">
                {lastAlertTime ? lastAlertTime.toLocaleTimeString() : 'None'}
              </span>
            </div>
          </div>
        </div>
      </TeslaCard>

      {/* No Active Alerts State */}
      {activeAlerts.length === 0 && (
        <TeslaCard>
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">✅ All Clear</h3>
            <p className="text-gray-400 text-sm mb-4">
              No active emergency alerts. System monitoring for critical deadlines and urgent matters.
            </p>
            <TeslaButton 
              variant="secondary" 
              size="sm"
              onClick={activateEmergencyMode}
            >
              Test Emergency Mode
            </TeslaButton>
          </div>
        </TeslaCard>
      )}
    </div>
  );
};

export default TeslaEmergencyAlertSystem;
