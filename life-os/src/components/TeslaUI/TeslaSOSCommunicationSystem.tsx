'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, AlertTriangle, Clock, Users, Zap, CheckCircle, X, Send } from 'lucide-react';
import { TeslaCard, TeslaButton, TeslaAlert, TeslaMetric } from './index';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  priority: 1 | 2 | 3 | 4;
  responseTime: string;
  availability: 'available' | 'busy' | 'unavailable';
  lastContact: string;
}

interface SOSEvent {
  id: string;
  type: 'deadline' | 'medical' | 'regulatory' | 'manual';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  timestamp: string;
  contactsNotified: string[];
  status: 'initiated' | 'in_progress' | 'responded' | 'resolved';
  responseTime?: string;
}

const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Senior Partner',
    role: 'Emergency Legal Supervisor',
    phone: '+1 (555) 123-4567',
    email: 'senior.partner@lawfirm.com',
    priority: 1,
    responseTime: '< 5 min',
    availability: 'available',
    lastContact: '2 days ago'
  },
  {
    id: '2',
    name: 'Legal Emergency Hotline',
    role: 'Emergency Response Team',
    phone: '+1 (555) 999-HELP',
    email: 'emergency@legalhelp.com',
    priority: 1,
    responseTime: '< 2 min',
    availability: 'available',
    lastContact: 'Never'
  },
  {
    id: '3',
    name: 'Court Clerk Office',
    role: 'Filing Emergency Contact',
    phone: '+1 (555) 789-COURT',
    email: 'clerk@nevadacourt.gov',
    priority: 2,
    responseTime: '< 15 min',
    availability: 'busy',
    lastContact: '1 week ago'
  },
  {
    id: '4',
    name: 'Legal Supervisor',
    role: 'Backup Emergency Contact',
    phone: '+1 (555) 456-7890',
    email: 'supervisor@lawfirm.com',
    priority: 2,
    responseTime: '< 10 min',
    availability: 'available',
    lastContact: '3 days ago'
  }
];

const mockSOSEvents: SOSEvent[] = [
  {
    id: '1',
    type: 'deadline',
    severity: 'critical',
    title: 'Court Filing Deadline Emergency',
    description: 'Motion response due in 4 hours - requires immediate filing assistance',
    timestamp: '2025-07-12T14:30:00Z',
    contactsNotified: ['1', '2'],
    status: 'responded',
    responseTime: '3 min'
  },
  {
    id: '2',
    type: 'medical',
    severity: 'critical',
    title: 'Client Medical Emergency',
    description: 'Client hospitalized - needs immediate legal protection protocols',
    timestamp: '2025-07-11T09:15:00Z',
    contactsNotified: ['1', '2', '4'],
    status: 'resolved',
    responseTime: '2 min'
  }
];

export function TeslaSOSCommunicationSystem() {
  const [sosActive, setSOSActive] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [contactingInProgress, setContactingInProgress] = useState(false);
  const [lastSOSTime, setLastSOSTime] = useState<Date | null>(null);

  const triggerSOS = () => {
    if (!selectedEmergencyType || !emergencyDescription.trim()) {
      return;
    }

    setContactingInProgress(true);
    setLastSOSTime(new Date());
    
    // Simulate SOS activation process
    setTimeout(() => {
      setSOSActive(true);
      setContactingInProgress(false);
    }, 2000);
  };

  const deactivateSOS = () => {
    setSOSActive(false);
    setSelectedEmergencyType('');
    setEmergencyDescription('');
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'border-red-500 bg-red-500/10';
      case 2: return 'border-orange-500 bg-orange-500/10';
      case 3: return 'border-yellow-500 bg-yellow-500/10';
      case 4: return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* SOS Status Header */}
      <TeslaCard className={`${sosActive ? 'border-red-500 bg-red-500/5' : 'border-gray-700'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${sosActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h2 className="text-xl font-bold text-white">
              🆘 SOS Communication System
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Status: {sosActive ? 'ACTIVE' : 'Standby'}</span>
          </div>
        </div>

        {sosActive && (
          <TeslaAlert 
            type="warning"
            title="Emergency SOS Active"
          >
            <div className="flex items-center justify-between">
              <span>Emergency contacts have been notified. Response expected within 5 minutes.</span>
              <TeslaButton 
                variant="secondary" 
                size="sm" 
                onClick={deactivateSOS}
              >
                <X className="w-4 h-4 mr-2" />
                Deactivate SOS
              </TeslaButton>
            </div>
          </TeslaAlert>
        )}

        {lastSOSTime && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">Last SOS Activation</div>
            <div className="text-white font-medium">{lastSOSTime.toLocaleString()}</div>
          </div>
        )}
      </TeslaCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOS Trigger Panel */}
        <TeslaCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Emergency SOS Trigger
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emergency Type
              </label>
              <select
                value={selectedEmergencyType}
                onChange={(e) => setSelectedEmergencyType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select emergency type...</option>
                <option value="deadline">Court Filing Deadline Emergency</option>
                <option value="medical">Client Medical Emergency</option>
                <option value="regulatory">Regulatory Compliance Crisis</option>
                <option value="malpractice">Malpractice Risk Situation</option>
                <option value="manual">Manual Emergency Escalation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emergency Description
              </label>
              <textarea
                value={emergencyDescription}
                onChange={(e) => setEmergencyDescription(e.target.value)}
                placeholder="Describe the emergency situation in detail..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <TeslaButton
              onClick={triggerSOS}
              disabled={!selectedEmergencyType || !emergencyDescription.trim() || contactingInProgress || sosActive}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
            >
              {contactingInProgress ? (
                <>
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                  Activating SOS...
                </>
              ) : sosActive ? (
                'SOS Active'
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  🚨 ACTIVATE SOS
                </>
              )}
            </TeslaButton>
          </div>
        </TeslaCard>

        {/* SOS Communication Status */}
        <TeslaCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Communication Status
          </h3>

          <div className="space-y-3">
            <TeslaMetric
              label="Emergency Contacts"
              value={`${mockEmergencyContacts.filter(c => c.availability === 'available').length}/${mockEmergencyContacts.length}`}
              unit="available"
              trend="neutral"
              color="blue"
            />

            <TeslaMetric
              label="Average Response Time"
              value="3.2"
              unit="min"
              trend="down"
              color="green"
            />

            <TeslaMetric
              label="SOS Success Rate"
              value="98.5"
              unit="%"
              trend="up"
              color="green"
            />

            {sosActive && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-white">Current SOS Status:</div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400">Contacting Priority 1 contacts...</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-400">SMS & Email notifications sent</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Emergency documented & logged</span>
                </div>
              </div>
            )}
          </div>
        </TeslaCard>
      </div>

      {/* Emergency Contacts Directory */}
      <TeslaCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Phone className="w-5 h-5 mr-2 text-green-400" />
          Emergency Contacts Directory
        </h3>

        <div className="space-y-3">
          {mockEmergencyContacts.map((contact) => (
            <div key={contact.id} className={`border-l-4 ${getPriorityColor(contact.priority)} p-4 rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(contact.availability)}`}></div>
                  <div>
                    <h4 className="font-semibold text-white">{contact.name}</h4>
                    <p className="text-sm text-gray-400">{contact.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">Priority {contact.priority}</div>
                  <div className="text-xs text-gray-400">{contact.responseTime}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  <div>📞 {contact.phone}</div>
                  <div>📧 {contact.email}</div>
                  <div className="text-xs text-gray-400 mt-1">Last contact: {contact.lastContact}</div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition">
                    <Phone className="w-4 h-4 text-white" />
                  </button>
                  <button className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </button>
                  <button className="bg-orange-600 p-2 rounded-lg hover:bg-orange-700 transition">
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TeslaCard>

      {/* Recent SOS Events */}
      <TeslaCard>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Recent SOS Events
        </h3>

        <div className="space-y-4">
          {mockSOSEvents.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'resolved' ? 'bg-green-500' : 
                    event.status === 'responded' ? 'bg-blue-500' :
                    event.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold text-white">{event.title}</h4>
                    <p className="text-sm text-gray-400">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)} • {event.severity} severity
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white capitalize">{event.status.replace('_', ' ')}</div>
                  {event.responseTime && (
                    <div className="text-xs text-green-400">Response: {event.responseTime}</div>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3">{event.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                <span>{event.contactsNotified.length} contacts notified</span>
              </div>
            </div>
          ))}
        </div>
      </TeslaCard>
    </div>
  );
}
