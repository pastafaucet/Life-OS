'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MessageSquare, MapPin, Clock, User, FileText, Shield, Zap, CheckCircle2, X, ExternalLink, Users, Bell } from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';

interface EscalationProtocol {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  estimatedTime: string;
  description: string;
  steps: string[];
  contacts: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'escalated';
  triggeredAt?: Date;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  priority: number;
  responseTime: string;
  available: boolean;
}

export default function TeslaEmergencyEscalationInterface() {
  const [escalationMode, setEscalationMode] = useState(false);
  const [activeProtocols, setActiveProtocols] = useState<EscalationProtocol[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [escalationHistory, setEscalationHistory] = useState<any[]>([]);

  // Mock data initialization
  useEffect(() => {
    const mockProtocols: EscalationProtocol[] = [
      {
        id: 'proto-1',
        title: 'Court Filing Deadline Emergency',
        severity: 'critical',
        estimatedTime: '2 hours',
        description: 'Critical court filing deadline with risk of case dismissal',
        steps: [
          'Contact supervising partner immediately',
          'Notify court clerk of emergency filing request',
          'Prepare emergency motion for extension',
          'File emergency documents electronically',
          'Follow up with opposing counsel notification'
        ],
        contacts: ['partner-1', 'clerk-1', 'paralegal-1'],
        status: 'in-progress',
        triggeredAt: new Date()
      },
      {
        id: 'proto-2',
        title: 'Client Medical Emergency',
        severity: 'critical',
        estimatedTime: '30 minutes',
        description: 'Client involved in serious accident requiring immediate legal protection',
        steps: [
          'Contact client or family member for status',
          'Notify insurance carrier of potential claim',
          'Coordinate with medical team for documentation',
          'Prepare emergency protective orders',
          'Contact media relations if high-profile'
        ],
        contacts: ['emergency-1', 'insurance-1', 'medical-1'],
        status: 'pending'
      },
      {
        id: 'proto-3',
        title: 'Regulatory Compliance Crisis',
        severity: 'high',
        estimatedTime: '4 hours',
        description: 'Urgent regulatory investigation requiring immediate response',
        steps: [
          'Assemble compliance team',
          'Secure all relevant documents',
          'Prepare initial response strategy',
          'Contact regulatory affairs specialist',
          'Draft preliminary compliance report'
        ],
        contacts: ['compliance-1', 'specialist-1'],
        status: 'completed'
      }
    ];

    const mockContacts: EmergencyContact[] = [
      {
        id: 'partner-1',
        name: 'Sarah Martinez',
        role: 'Senior Partner',
        phone: '(555) 123-4567',
        email: 'smartinez@lawfirm.com',
        priority: 1,
        responseTime: '< 5 min',
        available: true
      },
      {
        id: 'clerk-1',
        name: 'Court Clerk Office',
        role: 'Court Administration',
        phone: '(555) 987-6543',
        email: 'clerk@court.gov',
        priority: 2,
        responseTime: '< 15 min',
        available: true
      },
      {
        id: 'emergency-1',
        name: 'Legal Emergency Hotline',
        role: 'Emergency Response',
        phone: '(555) 911-HELP',
        email: 'emergency@legalaid.org',
        priority: 1,
        responseTime: '< 2 min',
        available: true
      },
      {
        id: 'insurance-1',
        name: 'Insurance Liaison',
        role: 'Claims Coordinator',
        phone: '(555) 456-7890',
        email: 'claims@insurance.com',
        priority: 3,
        responseTime: '< 30 min',
        available: false
      }
    ];

    setActiveProtocols(mockProtocols);
    setEmergencyContacts(mockContacts);

    // Mock escalation history
    setEscalationHistory([
      {
        id: 'hist-1',
        protocol: 'Motion Filing Emergency',
        escalatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'resolved',
        outcome: 'Successfully filed emergency motion, deadline extended'
      },
      {
        id: 'hist-2',
        protocol: 'Client Communication Crisis',
        escalatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        status: 'resolved',
        outcome: 'Client contacted, misunderstanding resolved'
      }
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-600 to-red-800';
      case 'high': return 'from-orange-500 to-orange-700';
      case 'medium': return 'from-yellow-500 to-yellow-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Zap className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleProtocolAction = (protocolId: string, action: string) => {
    setActiveProtocols(prev => prev.map(p => 
      p.id === protocolId 
        ? { ...p, status: action === 'start' ? 'in-progress' : action === 'complete' ? 'completed' : p.status }
        : p
    ));
  };

  const handleEmergencyContact = (contact: EmergencyContact) => {
    // Simulate contact action
    alert(`Contacting ${contact.name} at ${contact.phone}`);
  };

  const triggerEmergencyProtocol = () => {
    setEscalationMode(true);
    // Simulate adding new emergency protocol
    const newProtocol: EscalationProtocol = {
      id: `proto-new-${Date.now()}`,
      title: 'Manual Emergency Escalation',
      severity: 'critical',
      estimatedTime: '1 hour',
      description: 'Manual emergency escalation triggered by user',
      steps: [
        'Assess situation urgency',
        'Contact appropriate emergency contacts',
        'Document emergency details',
        'Initiate crisis management protocol'
      ],
      contacts: ['partner-1', 'emergency-1'],
      status: 'pending',
      triggeredAt: new Date()
    };
    setActiveProtocols(prev => [newProtocol, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Emergency Escalation Header */}
      <TeslaCard className="bg-gradient-to-r from-red-900 to-red-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${escalationMode ? 'bg-red-500 animate-pulse' : 'bg-red-600'}`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Emergency Escalation</h2>
                <p className="text-red-200">Crisis Management & Emergency Response</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-full ${escalationMode ? 'bg-red-500' : 'bg-red-600'} text-white text-sm font-medium`}>
                {escalationMode ? 'ACTIVE CRISIS' : 'STANDBY MODE'}
              </div>
              <TeslaButton
                onClick={triggerEmergencyProtocol}
                className={`${escalationMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {escalationMode ? 'New Crisis' : 'Trigger Emergency'}
              </TeslaButton>
            </div>
          </div>

          {/* Crisis Management Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{activeProtocols.filter(p => p.status === 'in-progress').length}</div>
              <div className="text-red-200 text-sm">Active Protocols</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{emergencyContacts.filter(c => c.available).length}</div>
              <div className="text-red-200 text-sm">Available Contacts</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{activeProtocols.filter(p => p.severity === 'critical').length}</div>
              <div className="text-red-200 text-sm">Critical Issues</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{escalationHistory.length}</div>
              <div className="text-red-200 text-sm">Resolved Today</div>
            </div>
          </div>
        </div>
      </TeslaCard>

      {/* Active Emergency Protocols */}
      <TeslaCard>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Active Emergency Protocols
          </h3>
          <div className="space-y-4">
            {activeProtocols.filter(p => p.status !== 'completed').map((protocol) => (
              <div key={protocol.id} className={`bg-gradient-to-r ${getSeverityColor(protocol.severity)} rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(protocol.status)}
                      <h4 className="font-bold text-white">{protocol.title}</h4>
                      <span className="px-2 py-1 bg-white/20 rounded text-xs text-white uppercase">
                        {protocol.severity}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm mb-2">{protocol.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        ETA: {protocol.estimatedTime}
                      </span>
                      {protocol.triggeredAt && (
                        <span className="flex items-center">
                          <Bell className="w-4 h-4 mr-1" />
                          Started: {protocol.triggeredAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {protocol.status === 'pending' && (
                      <TeslaButton
                        onClick={() => handleProtocolAction(protocol.id, 'start')}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Start Protocol
                      </TeslaButton>
                    )}
                    {protocol.status === 'in-progress' && (
                      <TeslaButton
                        onClick={() => handleProtocolAction(protocol.id, 'complete')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        Mark Complete
                      </TeslaButton>
                    )}
                  </div>
                </div>

                {/* Protocol Steps */}
                <div className="bg-white/10 rounded p-3 mb-3">
                  <h5 className="font-semibold text-white mb-2">Emergency Steps:</h5>
                  <div className="space-y-1">
                    {protocol.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-white/90">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <TeslaButton className="bg-white/20 hover:bg-white/30 text-white text-sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call Team
                  </TeslaButton>
                  <TeslaButton className="bg-white/20 hover:bg-white/30 text-white text-sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Send Alert
                  </TeslaButton>
                  <TeslaButton className="bg-white/20 hover:bg-white/30 text-white text-sm">
                    <FileText className="w-4 h-4 mr-1" />
                    Open Documents
                  </TeslaButton>
                  <TeslaButton className="bg-white/20 hover:bg-white/30 text-white text-sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Case Details
                  </TeslaButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>

      {/* Emergency Contacts */}
      <TeslaCard>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${contact.available ? 'bg-green-600' : 'bg-gray-600'}`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{contact.name}</h4>
                      <p className="text-gray-400 text-sm">{contact.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs ${contact.available ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                      {contact.available ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Priority {contact.priority}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Response: {contact.responseTime}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <TeslaButton
                    onClick={() => handleEmergencyContact(contact)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm flex-1"
                    disabled={!contact.available}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call Now
                  </TeslaButton>
                  <TeslaButton className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    <MessageSquare className="w-4 h-4" />
                  </TeslaButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>

      {/* Escalation History */}
      <TeslaCard>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-400" />
            Recent Escalation History
          </h3>
          <div className="space-y-3">
            {escalationHistory.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{item.protocol}</h4>
                    <p className="text-gray-400 text-sm">{item.outcome}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium">Resolved</div>
                    <div className="text-gray-400 text-xs">
                      {Math.round((item.resolvedAt - item.escalatedAt) / (1000 * 60))} minutes
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TeslaCard>
    </div>
  );
}
