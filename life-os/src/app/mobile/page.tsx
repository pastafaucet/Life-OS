'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { TeslaMobileCommandCenter, TeslaContextAwareMobileDashboard, TeslaVoiceCommandInterface, TeslaEmergencyAlertSystem, TeslaMobileTaskDelegation } from '../../components/TeslaUI';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop Header (hidden on mobile) */}
      <div className="hidden md:block bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Mobile Command Center</h1>
                <p className="text-gray-300">Emergency-focused mobile interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-6 h-6 text-purple-400" />
              <span className="text-gray-300 text-sm">Optimized for mobile use</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Interface Info (desktop only) */}
      <div className="hidden md:block bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-xl font-bold mb-2">📱 Tesla Mobile Command Center</h2>
          <p className="text-purple-100 mb-4">
            This interface is optimized for mobile devices. Try resizing your browser window or access from your phone for the full mobile experience.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">🚨 Critical Deadlines</div>
              <div className="text-purple-200">Real-time countdown timers</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">📊 Live Metrics</div>
              <div className="text-purple-200">Performance monitoring</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">🔮 AI Insights</div>
              <div className="text-purple-200">Predictive analysis</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">⚡ Quick Actions</div>
              <div className="text-purple-200">Instant controls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alert System */}
      <div className="md:max-w-md md:mx-auto md:mt-6 md:rounded-lg md:overflow-hidden md:shadow-2xl">
        <TeslaEmergencyAlertSystem />
      </div>

      {/* Voice Command Interface */}
      <div className="md:max-w-md md:mx-auto md:mt-6 md:rounded-lg md:overflow-hidden md:shadow-2xl">
        <TeslaVoiceCommandInterface />
      </div>

      {/* Context-Aware Mobile Dashboard */}
      <div className="md:max-w-md md:mx-auto md:mt-6 md:rounded-lg md:overflow-hidden md:shadow-2xl">
        <TeslaContextAwareMobileDashboard />
      </div>

      {/* Mobile Task Delegation */}
      <div className="md:max-w-md md:mx-auto md:mt-6 md:rounded-lg md:overflow-hidden md:shadow-2xl">
        <TeslaMobileTaskDelegation 
          onTaskDelegated={(task) => console.log('Task delegated:', task)}
          onEmergencyEscalation={(task) => console.log('Emergency escalation:', task)}
        />
      </div>

      {/* Mobile Command Center Interface */}
      <div className="md:max-w-md md:mx-auto md:mt-6 md:rounded-lg md:overflow-hidden md:shadow-2xl">
        <TeslaMobileCommandCenter />
      </div>

      {/* Desktop Instructions */}
      <div className="hidden md:block max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">🎯 Mobile Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Emergency-Focused Design</h4>
              <ul className="text-sm space-y-1">
                <li>• Critical deadline alerts with countdown timers</li>
                <li>• Emergency action buttons for quick access</li>
                <li>• Collapsible sections for focused viewing</li>
                <li>• Fullscreen mode for immersive experience</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Real-Time Intelligence</h4>
              <ul className="text-sm space-y-1">
                <li>• Live metrics updating every 30 seconds</li>
                <li>• AI-powered predictive insights</li>
                <li>• Workload capacity monitoring</li>
                <li>• Performance trend analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Context-Aware Actions</h4>
              <ul className="text-sm space-y-1">
                <li>• Smart task scheduling based on deadlines</li>
                <li>• Location-based courthouse reminders</li>
                <li>• Emergency contact integration</li>
                <li>• Voice command interface ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Professional Features</h4>
              <ul className="text-sm space-y-1">
                <li>• MCLE deadline tracking</li>
                <li>• Case milestone monitoring</li>
                <li>• Client communication alerts</li>
                <li>• Document deadline management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
