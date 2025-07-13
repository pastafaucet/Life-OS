'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Navigation,
  Calendar,
  Phone,
  FileText,
  Car,
  Building,
  Home,
  Briefcase,
  Coffee,
  Users,
  Bell,
  Zap,
  Target,
  CheckCircle2
} from 'lucide-react';
import TeslaCard from './TeslaCard';
import TeslaButton from './TeslaButton';
import TeslaMetric from './TeslaMetric';
import TeslaAlert from './TeslaAlert';
import TeslaStatusIndicator from './TeslaStatusIndicator';

interface LocationContext {
  id: string;
  name: string;
  type: 'courthouse' | 'office' | 'home' | 'client' | 'unknown';
  address: string;
  latitude?: number;
  longitude?: number;
  suggestedActions: string[];
  relevantCases: string[];
  upcomingDeadlines: number;
  estimatedTravelTime?: number;
}

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'reminder' | 'action' | 'preparation' | 'warning';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  timeRelevant?: boolean;
}

interface TeslaContextAwareMobileDashboardProps {
  className?: string;
}

export const TeslaContextAwareMobileDashboard: React.FC<TeslaContextAwareMobileDashboardProps> = ({
  className = ""
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationContext | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [contextualSuggestions, setContextualSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock location contexts for demonstration
  const mockLocations: LocationContext[] = [
    {
      id: 'courthouse_downtown',
      name: 'Downtown Courthouse',
      type: 'courthouse',
      address: '200 W 3rd Ave, San Mateo, CA 94401',
      suggestedActions: [
        'Check court calendar',
        'Review case files for today',
        'Ensure all documents are ready',
        'Call client for updates'
      ],
      relevantCases: ['Johnson v. State', 'ABC Corp Discovery'],
      upcomingDeadlines: 2,
      estimatedTravelTime: 15
    },
    {
      id: 'law_office',
      name: 'Law Office',
      type: 'office',
      address: '123 Main St, San Mateo, CA 94401',
      suggestedActions: [
        'Review today\'s schedule',
        'Prepare for client meetings',
        'Complete pending research',
        'Return client calls'
      ],
      relevantCases: ['Smith Case Prep', 'Contract Review'],
      upcomingDeadlines: 4,
      estimatedTravelTime: 0
    },
    {
      id: 'home_office',
      name: 'Home Office',
      type: 'home',
      address: 'Home',
      suggestedActions: [
        'Focus on deep work',
        'Complete research tasks',
        'Review case strategies',
        'Prepare for tomorrow'
      ],
      relevantCases: ['Research Project', 'Writing Tasks'],
      upcomingDeadlines: 1,
      estimatedTravelTime: 0
    },
    {
      id: 'client_office',
      name: 'Client Office - ABC Corp',
      type: 'client',
      address: '456 Business Blvd, San Mateo, CA 94402',
      suggestedActions: [
        'Review meeting agenda',
        'Bring contract documents',
        'Prepare status update',
        'Discussion points ready'
      ],
      relevantCases: ['ABC Corp Contract'],
      upcomingDeadlines: 1,
      estimatedTravelTime: 20
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate location detection and context generation
  useEffect(() => {
    // Simulate detecting current location context
    const simulateLocationDetection = () => {
      const hour = currentTime.getHours();
      let location: LocationContext;

      if (hour >= 9 && hour <= 17) {
        // Business hours - likely at office or courthouse
        location = Math.random() > 0.5 ? mockLocations[1] : mockLocations[0];
      } else if (hour >= 18 || hour <= 8) {
        // After hours - likely at home
        location = mockLocations[2];
      } else {
        // Other times - could be anywhere
        location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      }

      setCurrentLocation(location);
      generateContextualSuggestions(location);
    };

    if (locationPermission === 'granted') {
      simulateLocationDetection();
    }
  }, [currentTime, locationPermission]);

  const generateContextualSuggestions = (location: LocationContext) => {
    const suggestions: ContextualSuggestion[] = [];
    const hour = currentTime.getHours();

    // Location-based suggestions
    if (location.type === 'courthouse') {
      suggestions.push({
        id: 'courthouse_prep',
        title: '⚖️ Courthouse Preparation',
        description: 'You\'re at the courthouse. Review today\'s cases and ensure documents are ready.',
        type: 'preparation',
        priority: 'high',
        location: location.name,
        timeRelevant: true
      });

      if (hour < 9) {
        suggestions.push({
          id: 'early_arrival',
          title: '🕐 Early Arrival Opportunity',
          description: 'You arrived early! Perfect time to review case files and prepare.',
          type: 'reminder',
          priority: 'medium',
          location: location.name,
          timeRelevant: true
        });
      }
    }

    if (location.type === 'office') {
      suggestions.push({
        id: 'office_focus',
        title: '🎯 Office Focus Time',
        description: 'Great time for client calls and document preparation.',
        type: 'action',
        priority: 'medium',
        location: location.name,
        timeRelevant: true
      });

      if (hour >= 9 && hour <= 11) {
        suggestions.push({
          id: 'peak_productivity',
          title: '⚡ Peak Productivity Window',
          description: 'You\'re most productive 9-11 AM. Tackle complex legal research now.',
          type: 'reminder',
          priority: 'high',
          location: location.name,
          timeRelevant: true
        });
      }
    }

    if (location.type === 'home') {
      suggestions.push({
        id: 'home_deep_work',
        title: '🏠 Deep Work Environment',
        description: 'Perfect setting for focused research and writing tasks.',
        type: 'action',
        priority: 'medium',
        location: location.name,
        timeRelevant: false
      });

      if (hour >= 18) {
        suggestions.push({
          id: 'end_of_day',
          title: '🌅 End of Day Planning',
          description: 'Review today\'s progress and plan tomorrow\'s priorities.',
          type: 'preparation',
          priority: 'low',
          location: location.name,
          timeRelevant: true
        });
      }
    }

    if (location.type === 'client') {
      suggestions.push({
        id: 'client_meeting',
        title: '🤝 Client Meeting Ready',
        description: 'You\'re at the client location. Review meeting agenda and key points.',
        type: 'preparation',
        priority: 'high',
        location: location.name,
        timeRelevant: true
      });
    }

    // Time-based suggestions
    if (hour === 8 && location.type !== 'courthouse') {
      suggestions.push({
        id: 'court_travel_reminder',
        title: '🚗 Court Travel Reminder',
        description: 'If you have court today, consider leaving soon to avoid traffic.',
        type: 'warning',
        priority: 'high',
        timeRelevant: true
      });
    }

    setContextualSuggestions(suggestions);
  };

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          setLocationPermission('granted');
          // In a real app, you'd get actual coordinates and match to known locations
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Location:', position.coords);
              setLocationPermission('granted');
            },
            (error) => {
              console.error('Location error:', error);
              setLocationPermission('denied');
            }
          );
        } else if (permission.state === 'denied') {
          setLocationPermission('denied');
        } else {
          // Prompt for permission
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationPermission('granted');
            },
            (error) => {
              setLocationPermission('denied');
            }
          );
        }
      } else {
        setLocationPermission('denied');
      }
    } catch (error) {
      setLocationPermission('denied');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'courthouse': return <Building className="w-6 h-6 text-blue-400" />;
      case 'office': return <Briefcase className="w-6 h-6 text-green-400" />;
      case 'home': return <Home className="w-6 h-6 text-purple-400" />;
      case 'client': return <Users className="w-6 h-6 text-orange-400" />;
      default: return <MapPin className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'medium': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Bell className="w-4 h-4" />;
      case 'action': return <Zap className="w-4 h-4" />;
      case 'preparation': return <Target className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Permission Request */}
      {locationPermission === 'prompt' && (
        <TeslaCard className="bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">📍 Enable Location Context</h3>
                  <p className="text-blue-200 text-sm">Get personalized suggestions based on your location</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-blue-200">
                <p>Location-aware features include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Courthouse arrival reminders</li>
                  <li>Context-based task suggestions</li>
                  <li>Travel time estimates</li>
                  <li>Meeting preparation alerts</li>
                </ul>
              </div>
              <TeslaButton 
                onClick={requestLocationPermission}
                disabled={isLoadingLocation}
                className="w-full"
              >
                {isLoadingLocation ? '📍 Detecting Location...' : '🔓 Enable Location Context'}
              </TeslaButton>
            </div>
          </div>
        </TeslaCard>
      )}

      {/* Location Permission Denied */}
      {locationPermission === 'denied' && (
        <TeslaCard>
          <div className="p-4">
            <TeslaAlert type="warning" title="Location Access Disabled">
              Location context features are disabled. You can still use manual location selection.
            </TeslaAlert>
            <div className="mt-4">
              <TeslaButton 
                variant="secondary"
                onClick={() => setLocationPermission('granted')}
                className="w-full"
              >
                🎯 Use Simulated Location Context
              </TeslaButton>
            </div>
          </div>
        </TeslaCard>
      )}

      {/* Current Location Context */}
      {locationPermission === 'granted' && currentLocation && (
        <TeslaCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getLocationIcon(currentLocation.type)}
                <div>
                  <h3 className="text-lg font-bold text-white">📍 Current Context</h3>
                  <p className="text-gray-300 text-sm">{currentLocation.name}</p>
                </div>
              </div>
              <TeslaStatusIndicator status="online" size="sm" />
            </div>

            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{currentLocation.address}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-blue-900/30 rounded-lg p-2">
                    <div className="text-blue-400 text-xs">Relevant Cases</div>
                    <div className="text-blue-300 font-bold">{currentLocation.relevantCases.length}</div>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-2">
                    <div className="text-red-400 text-xs">Deadlines</div>
                    <div className="text-red-300 font-bold">{currentLocation.upcomingDeadlines}</div>
                  </div>
                </div>
              </div>

              {/* Location-Specific Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">⚡ Suggested Actions</h4>
                {currentLocation.suggestedActions.slice(0, 3).map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TeslaCard>
      )}

      {/* Contextual Suggestions */}
      {locationPermission === 'granted' && contextualSuggestions.length > 0 && (
        <TeslaCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">🔮 Smart Suggestions</h3>
              <span className="text-xs text-gray-400">{contextualSuggestions.length} insights</span>
            </div>

            <div className="space-y-3">
              {contextualSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className={`border rounded-lg p-3 ${getPriorityColor(suggestion.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{suggestion.title}</h4>
                      <p className="text-xs text-gray-300 mt-1">{suggestion.description}</p>
                      
                      {suggestion.location && (
                        <div className="flex items-center space-x-1 mt-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{suggestion.location}</span>
                        </div>
                      )}
                      
                      {suggestion.timeRelevant && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Time-sensitive</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <TeslaButton variant="secondary" size="sm" className="w-full">
                📱 View All Contextual Actions
              </TeslaButton>
            </div>
          </div>
        </TeslaCard>
      )}

      {/* Location-Based Quick Actions */}
      {locationPermission === 'granted' && currentLocation && (
        <TeslaCard>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-4">🎯 Location Actions</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {currentLocation.type === 'courthouse' && (
                <>
                  <TeslaButton variant="primary" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Court Calendar
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Case Files
                  </TeslaButton>
                </>
              )}
              
              {currentLocation.type === 'office' && (
                <>
                  <TeslaButton variant="primary" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Client Calls
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Team Sync
                  </TeslaButton>
                </>
              )}
              
              {currentLocation.type === 'home' && (
                <>
                  <TeslaButton variant="primary" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Deep Work
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Research
                  </TeslaButton>
                </>
              )}
              
              {currentLocation.type === 'client' && (
                <>
                  <TeslaButton variant="primary" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Meeting Prep
                  </TeslaButton>
                  <TeslaButton variant="secondary" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </TeslaButton>
                </>
              )}

              <TeslaButton variant="secondary" size="sm" className="col-span-2">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate to Next Location
              </TeslaButton>
            </div>
          </div>
        </TeslaCard>
      )}
    </div>
  );
};

export default TeslaContextAwareMobileDashboard;
