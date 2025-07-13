'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar, 
  Mic, 
  MicOff, 
  Brain, 
  Target,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { TeslaCard, TeslaButton, TeslaStatusIndicator } from './index';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  availability: 'available' | 'busy' | 'offline';
  expertise: string[];
  responseTime: string;
  trustScore: number;
}

interface DelegationTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  deadline?: Date;
  assignee?: Contact;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
}

interface TeslaMobileTaskDelegationProps {
  onTaskDelegated?: (task: DelegationTask) => void;
  onEmergencyEscalation?: (task: DelegationTask) => void;
}

export function TeslaMobileTaskDelegation({ 
  onTaskDelegated, 
  onEmergencyEscalation 
}: TeslaMobileTaskDelegationProps) {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<DelegationTask>>({
    title: '',
    description: '',
    priority: 'medium',
    estimatedTime: '1 hour'
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [delegationHistory, setDelegationHistory] = useState<DelegationTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Mock contacts data with AI-suggested assignments
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Paralegal',
      email: 'sarah@lawfirm.com',
      phone: '(555) 123-4567',
      availability: 'available',
      expertise: ['Research', 'Document Review', 'Client Communication'],
      responseTime: '< 15 min',
      trustScore: 95
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Legal Assistant',
      email: 'marcus@lawfirm.com',
      phone: '(555) 234-5678',
      availability: 'busy',
      expertise: ['Filing', 'Court Documents', 'Scheduling'],
      responseTime: '< 30 min',
      trustScore: 88
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: 'Research Specialist',
      email: 'emily@lawfirm.com',
      phone: '(555) 345-6789',
      availability: 'available',
      expertise: ['Legal Research', 'Case Law', 'Precedent Analysis'],
      responseTime: '< 10 min',
      trustScore: 92
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'IT Support',
      email: 'david@lawfirm.com',
      phone: '(555) 456-7890',
      availability: 'offline',
      expertise: ['Technical Issues', 'System Administration', 'Security'],
      responseTime: '< 45 min',
      trustScore: 87
    }
  ];

  // AI-powered contact suggestions based on task content
  const getSuggestedContacts = (taskTitle: string, taskDescription: string): Contact[] => {
    const combinedText = `${taskTitle} ${taskDescription}`.toLowerCase();
    
    return contacts
      .map(contact => {
        let score = 0;
        
        // Expertise matching
        contact.expertise.forEach(skill => {
          if (combinedText.includes(skill.toLowerCase())) {
            score += 30;
          }
        });
        
        // Availability bonus
        if (contact.availability === 'available') score += 20;
        if (contact.availability === 'busy') score += 10;
        
        // Trust score factor
        score += contact.trustScore * 0.3;
        
        // Response time bonus
        if (contact.responseTime.includes('< 15')) score += 15;
        if (contact.responseTime.includes('< 30')) score += 10;
        
        return { ...contact, aiScore: score };
      })
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 3);
  };

  const suggestedContacts = getSuggestedContacts(currentTask.title || '', currentTask.description || '');

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Simple AI parsing for task delegation
        if (transcript.toLowerCase().includes('urgent') || transcript.toLowerCase().includes('emergency')) {
          setCurrentTask(prev => ({ 
            ...prev, 
            priority: 'critical',
            description: transcript 
          }));
        } else {
          setCurrentTask(prev => ({ 
            ...prev, 
            description: transcript 
          }));
        }
        
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };

  const handleQuickDelegate = (contact: Contact) => {
    if (!currentTask.title || !currentTask.description) return;
    
    const newTask: DelegationTask = {
      id: Date.now().toString(),
      title: currentTask.title,
      description: currentTask.description,
      priority: currentTask.priority || 'medium',
      estimatedTime: currentTask.estimatedTime || '1 hour',
      deadline: currentTask.deadline,
      assignee: contact,
      status: 'pending',
      createdAt: new Date()
    };
    
    setDelegationHistory(prev => [newTask, ...prev]);
    onTaskDelegated?.(newTask);
    
    // Reset form
    setCurrentTask({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: '1 hour'
    });
    setSelectedContact(null);
  };

  const handleEmergencyDelegate = () => {
    if (!currentTask.title || !currentTask.description) return;
    
    const emergencyTask: DelegationTask = {
      id: Date.now().toString(),
      title: `EMERGENCY: ${currentTask.title}`,
      description: currentTask.description,
      priority: 'critical',
      estimatedTime: 'ASAP',
      assignee: suggestedContacts[0], // Best available contact
      status: 'pending',
      createdAt: new Date()
    };
    
    setDelegationHistory(prev => [emergencyTask, ...prev]);
    onEmergencyEscalation?.(emergencyTask);
    
    // Reset form
    setCurrentTask({
      title: '',
      description: '',
      priority: 'medium',
      estimatedTime: '1 hour'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'accepted': return 'text-blue-400 bg-blue-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'rejected': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Mobile Task Delegation</h2>
          <p className="text-gray-400">Delegate tasks quickly from your mobile device</p>
        </div>
        <div className="flex items-center space-x-2">
          <TeslaStatusIndicator status="online" size="sm" />
          <span className="text-sm text-gray-300">AI Assistant Active</span>
        </div>
      </div>

      {/* Quick Delegation Form */}
      <TeslaCard>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Send className="w-6 h-6 mr-3 text-blue-400" />
          Quick Delegate
        </h3>
        
        <div className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={currentTask.title || ''}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
            />
          </div>
          
          {/* Task Description with Voice Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Description
            </label>
            <div className="relative">
              <textarea
                value={currentTask.description || ''}
                onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Describe the task or use voice input..."
                rows={3}
              />
              <button
                onClick={startVoiceInput}
                className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Priority and Time Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={currentTask.priority || 'medium'}
                onChange={(e) => setCurrentTask(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Est. Time
              </label>
              <select
                value={currentTask.estimatedTime || '1 hour'}
                onChange={(e) => setCurrentTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15 min">15 minutes</option>
                <option value="30 min">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="1 day">1 day</option>
              </select>
            </div>
          </div>
        </div>
      </TeslaCard>

      {/* AI Suggested Contacts */}
      {(currentTask.title || currentTask.description) && (
        <TeslaCard>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-3 text-purple-400" />
            AI Suggested Contacts
          </h3>
          
          <div className="space-y-3">
            {suggestedContacts.map((contact, index) => (
              <div
                key={contact.id}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{contact.name}</h4>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{contact.role}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-xs ${getAvailabilityColor(contact.availability)}`}>
                          ● {contact.availability}
                        </span>
                        <span className="text-xs text-gray-400">
                          Response: {contact.responseTime}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">{contact.trustScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TeslaButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuickDelegate(contact)}
                      disabled={!currentTask.title || !currentTask.description}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Delegate
                    </TeslaButton>
                  </div>
                </div>
                
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {contact.expertise.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TeslaCard>
      )}

      {/* Emergency Delegation */}
      <TeslaCard>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-400" />
          Emergency Delegation
        </h3>
        
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h4 className="font-semibold text-red-400">Crisis Mode Delegation</h4>
              <p className="text-sm text-gray-300">
                Instantly delegate to the most available qualified contact
              </p>
            </div>
          </div>
          
          <TeslaButton
            variant="danger"
            size="sm"
            onClick={handleEmergencyDelegate}
            disabled={!currentTask.title || !currentTask.description}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            Emergency Delegate Now
          </TeslaButton>
        </div>
      </TeslaCard>

      {/* Recent Delegations */}
      {delegationHistory.length > 0 && (
        <TeslaCard>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-green-400" />
            Recent Delegations
          </h3>
          
          <div className="space-y-3">
            {delegationHistory.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{task.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Assigned to: {task.assignee?.name}</span>
                    <span>Est: {task.estimatedTime}</span>
                  </div>
                  <span>{task.createdAt.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </TeslaCard>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <TeslaButton
          variant="secondary"
          size="lg"
          className="h-16"
          onClick={() => setShowContactSearch(true)}
        >
          <Users className="w-6 h-6 mr-3" />
          Browse All Contacts
        </TeslaButton>
        
        <TeslaButton
          variant="secondary"
          size="lg"
          className="h-16"
          onClick={() => setIsVoiceMode(!isVoiceMode)}
        >
          <Mic className="w-6 h-6 mr-3" />
          Voice Mode
        </TeslaButton>
      </div>
    </div>
  );
}

export default TeslaMobileTaskDelegation;
