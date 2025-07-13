'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { TeslaEmergencyEscalationInterface, TeslaSOSCommunicationSystem, TeslaVoiceBriefingInterface } from '../../components/TeslaUI';

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Emergency Command Center</h1>
                <p className="text-gray-300">Crisis management and emergency escalation protocols</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="text-gray-300 text-sm">Emergency Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6">
        <div className="max-w-6xl mx-auto text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-300" />
            <h2 className="text-xl font-bold">Emergency Escalation Center</h2>
            <AlertTriangle className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-red-100 mb-4">
            Comprehensive crisis management system for handling legal emergencies, critical deadlines, and urgent situations requiring immediate escalation.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">🚨 Crisis Protocols</div>
              <div className="text-red-200">Automated emergency procedures</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">📞 Emergency Contacts</div>
              <div className="text-red-200">Instant access to critical contacts</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">⚡ Rapid Response</div>
              <div className="text-red-200">Time-critical action protocols</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="font-semibold">📊 Real-time Tracking</div>
              <div className="text-red-200">Emergency status monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Emergency Escalation Interface */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🚨</span>
            Emergency Escalation Interface
          </h2>
          <TeslaEmergencyEscalationInterface />
        </div>

        {/* SOS Communication System */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🆘</span>
            SOS Communication System
          </h2>
          <TeslaSOSCommunicationSystem />
        </div>

        {/* Voice Briefing Interface */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🎤</span>
            Voice Briefing Interface
          </h2>
          <TeslaVoiceBriefingInterface />
        </div>
      </div>

      {/* Emergency Instructions */}
      <div className="max-w-6xl mx-auto p-6 mt-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">🆘 Emergency Protocol Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">When to Use Emergency Escalation</h4>
              <ul className="text-sm space-y-1">
                <li>• Critical court filing deadlines (same day)</li>
                <li>• Client medical or legal emergencies</li>
                <li>• Regulatory investigation notifications</li>
                <li>• Malpractice risk situations</li>
                <li>• Time-sensitive injunction requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Escalation Process</h4>
              <ul className="text-sm space-y-1">
                <li>• 1. Trigger emergency protocol</li>
                <li>• 2. Contact primary emergency contacts</li>
                <li>• 3. Follow automated step sequence</li>
                <li>• 4. Document all emergency actions</li>
                <li>• 5. Complete post-crisis review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Contact Priority Levels</h4>
              <ul className="text-sm space-y-1">
                <li>• Priority 1: Senior Partner, Emergency Hotline</li>
                <li>• Priority 2: Court Clerk, Legal Supervisor</li>
                <li>• Priority 3: Insurance, External Specialists</li>
                <li>• Priority 4: Support Staff, Vendors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Crisis Management Features</h4>
              <ul className="text-sm space-y-1">
                <li>• Automated emergency contact sequences</li>
                <li>• Real-time protocol status tracking</li>
                <li>• Emergency document preparation</li>
                <li>• Crisis communication templates</li>
                <li>• Post-incident reporting and analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
