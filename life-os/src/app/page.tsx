'use client';

import React from 'react';
import { TeslaMainDashboard } from '../components/TeslaUI';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Tesla-Grade Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-gray-700">
        <div className="px-4 sm:px-6">
          <div className="py-6 sm:py-8">
            {/* Mobile-First Header Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Life OS Command Center
                </h1>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                  Tesla-level intelligence for your professional life
                </p>
              </div>
              
              {/* Status Indicator - Responsive */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
                <div className="flex items-center space-x-3 sm:hidden">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-sm font-bold text-green-400">ONLINE</div>
                </div>
                
                <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                  <div className="text-right">
                    <div className="text-xl lg:text-2xl font-bold text-green-400">ONLINE</div>
                    <div className="text-xs lg:text-sm text-gray-400">All systems operational</div>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        <TeslaMainDashboard />
      </div>

      {/* Tesla-Grade Footer */}
      <div className="mt-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm text-gray-400">
            Life OS v2.0 • Tesla-Grade Intelligence • {new Date().getFullYear()}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Powered by AI • Built for Excellence • Designed for Success
          </div>
        </div>
      </div>
    </div>
  );
}
