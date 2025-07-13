'use client';

import { TeslaRealTimeIntelligence, TeslaProductivityMetricsDashboard, TeslaPerformanceTrendAnalysis, TeslaPredictiveInsightsEngine, TeslaRealTimeIntelligenceDashboard } from '../../components/TeslaUI';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Real-Time Intelligence</h1>
              <p className="text-blue-200 text-lg">Live command center with predictive analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Real-Time Intelligence Dashboard - Primary Command Center */}
        <TeslaRealTimeIntelligenceDashboard />
        
        {/* Original Real-Time Intelligence */}
        <TeslaRealTimeIntelligence />
        
        {/* Productivity Metrics Dashboard */}
        <TeslaProductivityMetricsDashboard />
        
        {/* Performance Trend Analysis */}
        <TeslaPerformanceTrendAnalysis />
        
        {/* Predictive Insights Engine */}
        <TeslaPredictiveInsightsEngine />
      </div>
    </div>
  );
}
