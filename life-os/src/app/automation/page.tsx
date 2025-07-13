'use client';

import { 
  TeslaAutomationMonitoring,
  TeslaMeetingPreparationAutomation,
  TeslaOptimalWorkTime,
  TeslaEnergyPatternRecognition,
  TeslaFocusTimeProtection,
  TeslaDocumentManagement,
  TeslaCommunicationPlatforms,
  TeslaExternalAPIOrchestration
} from '../../components/TeslaUI';
import Link from 'next/link';
import { ArrowLeft, Settings, Zap, Brain, Clock } from 'lucide-react';

export default function AutomationPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 via-red-900 to-pink-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="text-orange-400 hover:text-orange-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Zap className="w-8 h-8 mr-3 text-orange-400" />
                Workflow Automation Center
              </h1>
              <p className="text-orange-200 text-lg">AI-powered automation and workflow orchestration</p>
            </div>
          </div>
          
          {/* Automation Status Banner */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Brain className="w-6 h-6 text-orange-300" />
                <div>
                  <h3 className="font-bold text-white">🤖 AI Automation Engine</h3>
                  <p className="text-orange-200 text-sm">Monitoring 12 active workflows • 94% efficiency rate</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-sm text-orange-300">Tasks Automated</div>
                  <div className="text-lg font-bold text-green-400">847</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-orange-300">Time Saved</div>
                  <div className="text-lg font-bold text-blue-300">32h this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Primary Automation Monitoring Dashboard */}
        <TeslaAutomationMonitoring />
        
        {/* Workflow Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Time Management Automation */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                ⏰ Time Management Intelligence
              </h2>
              
              {/* Optimal Work Time Component */}
              <div className="mb-6">
                <TeslaOptimalWorkTime />
              </div>
              
              {/* Energy Pattern Recognition */}
              <div className="mb-6">
                <TeslaEnergyPatternRecognition />
              </div>
              
              {/* Focus Time Protection */}
              <TeslaFocusTimeProtection />
            </div>
          </div>
          
          {/* Meeting & Communication Automation */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-400" />
                🤝 Communication & Meetings
              </h2>
              
              {/* Meeting Preparation Automation */}
              <div className="mb-6">
                <TeslaMeetingPreparationAutomation />
              </div>
              
              {/* Communication Platforms */}
              <TeslaCommunicationPlatforms />
            </div>
          </div>
        </div>
        
        {/* Document & Integration Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Document Management */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📄 Document Automation
            </h2>
            <TeslaDocumentManagement />
          </div>
          
          {/* External API Orchestration */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              🔗 External Integrations
            </h2>
            <TeslaExternalAPIOrchestration />
          </div>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="bg-gradient-to-r from-blue-800 to-purple-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Automation Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition">
              <div className="text-center">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold text-white">Create Workflow</h3>
                <p className="text-sm text-blue-200">Build new automation</p>
              </div>
            </button>
            
            <button className="bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-white">View Analytics</h3>
                <p className="text-sm text-blue-200">Automation performance</p>
              </div>
            </button>
            
            <button className="bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition">
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-semibold text-white">Manage Settings</h3>
                <p className="text-sm text-blue-200">Configure automations</p>
              </div>
            </button>
          </div>
        </div>
        
        {/* Automation Stats */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📈 Automation Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-green-400">94%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">32h</div>
              <div className="text-sm text-gray-400">Time Saved/Week</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">847</div>
              <div className="text-sm text-gray-400">Tasks Automated</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-orange-400">12</div>
              <div className="text-sm text-gray-400">Active Workflows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
