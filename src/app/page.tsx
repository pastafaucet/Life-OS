'use client';

import Link from 'next/link';
import { useData } from '../lib/dataContext';

export default function Home() {
  const { tasks, cases, projects, goals } = useData();

  // Calculate stats
  const activeTasks = tasks.filter(task => task.status !== 'done').length;
  const completedToday = tasks.filter(task => {
    if (task.status !== 'done') return false;
    const today = new Date().toDateString();
    const taskDate = new Date(task.updated_at).toDateString();
    return today === taskDate;
  }).length;
  const knowledgeItems = 0; // Placeholder for future knowledge system

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Life OS
              </h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                v1.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome back!
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Your personal operating system for life optimization
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Tasks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Knowledge Items</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{knowledgeItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Management */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Task Management
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                Phase 1
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Central command for all work and personal tasks with AI-driven prioritization.
            </p>
            <Link href="/tasks" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
              Open Tasks
            </Link>
          </div>

          {/* Case Management */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Case Management
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                Phase 1
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Manage legal cases, track time sessions, and monitor client work.
            </p>
            <Link href="/work" className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
              Open Cases
            </Link>
          </div>

          {/* Goals & Projects */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Goals & Projects
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                Phase 1
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Set and track long-term goals with connected project management.
            </p>
            <Link href="/goals" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
              Open Goals
            </Link>
          </div>

          {/* Review System */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Review System
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                Phase 1
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Daily, weekly, and monthly reviews for continuous life optimization.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Start Review
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Coming Soon
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Legal Practice", phase: "Phase 2", icon: "⚖️" },
              { name: "Financial Tracking", phase: "Phase 3", icon: "💰" },
              { name: "Health & Fitness", phase: "Phase 4", icon: "💪" },
              { name: "AI Assistant", phase: "Phase 6", icon: "🤖" }
            ].map((module) => (
              <div key={module.name} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{module.icon}</div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{module.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{module.phase}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
