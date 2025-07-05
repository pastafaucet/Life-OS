'use client';

import Link from 'next/link';

interface ModuleTile {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  available: boolean;
}

export default function Dashboard() {
  const modules: ModuleTile[] = [
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Task & Project Management',
      href: '/tasks',
      icon: '📋',
      color: 'bg-blue-500 hover:bg-blue-600',
      available: true
    },
    {
      id: 'knowledge',
      title: 'Knowledge',
      description: 'Second Brain & Notes',
      href: '/knowledge',
      icon: '🧠',
      color: 'bg-purple-500 hover:bg-purple-600',
      available: false
    },
    {
      id: 'legal',
      title: 'Legal Cases',
      description: 'Case Management',
      href: '/legal',
      icon: '⚖️',
      color: 'bg-gray-700 hover:bg-gray-800',
      available: false
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Net Worth & Budgets',
      href: '/finance',
      icon: '💰',
      color: 'bg-green-500 hover:bg-green-600',
      available: false
    },
    {
      id: 'health',
      title: 'Health',
      description: 'Fitness & Wellness',
      href: '/health',
      icon: '💪',
      color: 'bg-red-500 hover:bg-red-600',
      available: false
    },
    {
      id: 'reviews',
      title: 'Reviews',
      description: 'Daily & Weekly Reviews',
      href: '/reviews',
      icon: '📝',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-white">Life OS</h1>
            <p className="mt-2 text-gray-300">Your Complete Life Management System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">Choose a module to get started with your day</p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div key={module.id} className="relative">
              {module.available ? (
                <Link href={module.href}>
                  <div className={`${module.color} text-white rounded-lg p-6 shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{module.icon}</div>
                      <div className="bg-white bg-opacity-20 rounded-full p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                    <p className="text-white text-opacity-90">{module.description}</p>
                  </div>
                </Link>
              ) : (
                <div className="bg-gray-700 text-gray-300 rounded-lg p-6 shadow-lg relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl opacity-50">{module.icon}</div>
                    <div className="bg-gray-600 rounded-full p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{module.title}</h3>
                  <p className="text-gray-400">{module.description}</p>
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-900 bg-opacity-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-gray-300">Active Tasks</div>
            </div>
            <div className="text-center p-4 bg-purple-900 bg-opacity-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-300">Knowledge Items</div>
            </div>
            <div className="text-center p-4 bg-green-900 bg-opacity-50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">1</div>
              <div className="text-sm text-gray-300">Active Modules</div>
            </div>
          </div>
        </div>

        {/* Development Progress */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">🚀 Development Progress</h3>
          <p className="text-blue-100 mb-4">Phase 1: Core Productivity Modules</p>
          <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div className="bg-white rounded-full h-2 w-1/6"></div>
          </div>
          <p className="text-sm text-blue-100">Tasks module active • Knowledge & Reviews coming next</p>
        </div>
      </div>
    </div>
  );
}
