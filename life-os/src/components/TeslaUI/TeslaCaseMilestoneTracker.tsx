'use client';

import React, { useState, useEffect } from 'react';
import TeslaCard from './TeslaCard';
import TeslaProgressBar from './TeslaProgressBar';
import TeslaStatusIndicator from './TeslaStatusIndicator';
import TeslaButton from './TeslaButton';

interface CaseMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  expectedDate: Date;
  completedDate?: Date;
  estimatedDuration: number; // days
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'discovery' | 'filing' | 'hearing' | 'settlement' | 'trial' | 'appeal';
  progress: number; // 0-100
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    assignee?: string;
  }[];
}

interface CaseProgress {
  caseId: string;
  caseTitle: string;
  caseType: string;
  currentPhase: string;
  overallProgress: number;
  milestones: CaseMilestone[];
  riskFactors: string[];
  nextCriticalDate: Date;
}

export function TeslaCaseMilestoneTracker({ caseId }: { caseId?: string }) {
  // TODO: In a real implementation, this would fetch actual case data based on caseId
  // For now, show clean placeholder without fake data
  if (!caseId) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Case Milestone Tracking</h3>
          <p className="text-gray-400 mb-4">Select a case to view milestone progress and timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Case Milestones</h3>
        <p className="text-gray-400 mb-4">Milestone tracking will be available when case data is loaded</p>
      </div>
    </div>
  );

  const [caseProgress, setCaseProgress] = useState<CaseProgress>({
    caseId: caseId || 'unknown',
    caseTitle: 'Case milestones will load here',
    caseType: 'TBD',
    currentPhase: 'Loading',
    overallProgress: 0,
    nextCriticalDate: new Date(),
    riskFactors: [],
    milestones: [
      {
        id: 'mil-001',
        title: 'Case Intake & Investigation',
        description: 'Initial client intake, case evaluation, and preliminary investigation',
        status: 'completed',
        expectedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        estimatedDuration: 7,
        dependencies: [],
        priority: 'high',
        category: 'filing',
        progress: 100,
        tasks: [
          { id: 't1', title: 'Client interview', completed: true },
          { id: 't2', title: 'Incident investigation', completed: true },
          { id: 't3', title: 'Medical records request', completed: true }
        ]
      },
      {
        id: 'mil-002',
        title: 'Complaint Filing',
        description: 'Draft and file initial complaint with court',
        status: 'completed',
        expectedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        estimatedDuration: 5,
        dependencies: ['mil-001'],
        priority: 'critical',
        category: 'filing',
        progress: 100,
        tasks: [
          { id: 't4', title: 'Draft complaint', completed: true },
          { id: 't5', title: 'Client review', completed: true },
          { id: 't6', title: 'File with court', completed: true },
          { id: 't7', title: 'Serve defendant', completed: true }
        ]
      },
      {
        id: 'mil-003',
        title: 'Discovery Phase',
        description: 'Exchange of information, depositions, and evidence gathering',
        status: 'in-progress',
        expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedDuration: 90,
        dependencies: ['mil-002'],
        priority: 'high',
        category: 'discovery',
        progress: 65,
        tasks: [
          { id: 't8', title: 'Serve discovery requests', completed: true },
          { id: 't9', title: 'Review defendant responses', completed: true },
          { id: 't10', title: 'Schedule depositions', completed: false },
          { id: 't11', title: 'Expert witness preparation', completed: false },
          { id: 't12', title: 'Medical record analysis', completed: true }
        ]
      },
      {
        id: 'mil-004',
        title: 'Expert Witness Designation',
        description: 'Identify, retain, and designate expert witnesses',
        status: 'in-progress',
        expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        estimatedDuration: 21,
        dependencies: ['mil-003'],
        priority: 'critical',
        category: 'discovery',
        progress: 40,
        tasks: [
          { id: 't13', title: 'Identify potential experts', completed: true },
          { id: 't14', title: 'Retain medical expert', completed: true },
          { id: 't15', title: 'Prepare expert reports', completed: false },
          { id: 't16', title: 'File expert designations', completed: false }
        ]
      },
      {
        id: 'mil-005',
        title: 'Mediation Conference',
        description: 'Court-ordered mediation attempt',
        status: 'upcoming',
        expectedDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1,
        dependencies: ['mil-003', 'mil-004'],
        priority: 'medium',
        category: 'settlement',
        progress: 0,
        tasks: [
          { id: 't17', title: 'Prepare mediation brief', completed: false },
          { id: 't18', title: 'Client preparation', completed: false },
          { id: 't19', title: 'Settlement demand calculation', completed: false }
        ]
      },
      {
        id: 'mil-006',
        title: 'Trial Preparation',
        description: 'Final preparation for trial including witness prep and exhibits',
        status: 'upcoming',
        expectedDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        estimatedDuration: 30,
        dependencies: ['mil-005'],
        priority: 'critical',
        category: 'trial',
        progress: 0,
        tasks: [
          { id: 't20', title: 'Witness preparation', completed: false },
          { id: 't21', title: 'Exhibit preparation', completed: false },
          { id: 't22', title: 'Trial brief', completed: false },
          { id: 't23', title: 'Jury instructions', completed: false }
        ]
      }
    ]
  });

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const getMilestoneStatusColor = (status: CaseMilestone['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'upcoming': return 'text-gray-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMilestoneIcon = (category: CaseMilestone['category']) => {
    switch (category) {
      case 'discovery': return '🔍';
      case 'filing': return '📄';
      case 'hearing': return '⚖️';
      case 'settlement': return '🤝';
      case 'trial': return '🏛️';
      case 'appeal': return '📈';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: CaseMilestone['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDateDistance = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const completedTasks = caseProgress.milestones.reduce((acc, milestone) => {
    return acc + milestone.tasks.filter(task => task.completed).length;
  }, 0);

  const totalTasks = caseProgress.milestones.reduce((acc, milestone) => {
    return acc + milestone.tasks.length;
  }, 0);

  const nextMilestone = caseProgress.milestones.find(m => m.status === 'in-progress' || m.status === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeslaCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{caseProgress.caseTitle}</h2>
              <p className="text-gray-400 text-sm">{caseProgress.caseType} • Current Phase: {caseProgress.currentPhase}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">{caseProgress.overallProgress}%</div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
          </div>
          
          <TeslaProgressBar 
            value={caseProgress.overallProgress} 
            max={100}
            color="blue"
            className="h-3 mb-4"
          />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Tasks Completed:</span>
              <span className="text-white ml-2">{completedTasks}/{totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-400">Next Critical Date:</span>
              <span className="text-yellow-400 ml-2">{formatDateDistance(caseProgress.nextCriticalDate)}</span>
            </div>
          </div>
        </TeslaCard>

        <TeslaCard>
          <h3 className="text-lg font-semibold text-white mb-3">Risk Factors</h3>
          <div className="space-y-2">
            {caseProgress.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="text-yellow-400 mt-0.5">⚠️</div>
                <span className="text-sm text-gray-300">{risk}</span>
              </div>
            ))}
          </div>
          
          {nextMilestone && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Next Milestone</h4>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getMilestoneIcon(nextMilestone.category)}</span>
                <div>
                  <div className="text-sm font-medium text-white">{nextMilestone.title}</div>
                  <div className="text-xs text-gray-400">{formatDateDistance(nextMilestone.expectedDate)}</div>
                </div>
              </div>
            </div>
          )}
        </TeslaCard>
      </div>

      {/* Milestone Timeline */}
      <TeslaCard>
        <h3 className="text-lg font-semibold text-white mb-4">Case Timeline</h3>
        <div className="space-y-4">
          {caseProgress.milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`relative p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedMilestone === milestone.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
              onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
            >
              {/* Timeline Line */}
              {index < caseProgress.milestones.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-600"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Milestone Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                  milestone.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' :
                  milestone.status === 'in-progress' ? 'bg-blue-500/20 border-2 border-blue-500' :
                  milestone.status === 'overdue' ? 'bg-red-500/20 border-2 border-red-500' :
                  'bg-gray-500/20 border-2 border-gray-500'
                }`}>
                  {milestone.status === 'completed' ? '✅' : getMilestoneIcon(milestone.category)}
                </div>

                {/* Milestone Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                        {milestone.priority.toUpperCase()}
                      </span>
                      <TeslaStatusIndicator 
                        status={milestone.status === 'completed' ? 'online' : 
                               milestone.status === 'in-progress' ? 'processing' : 
                               milestone.status === 'overdue' ? 'error' : 'offline'} 
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Progress Bar for In-Progress Milestones */}
                  {milestone.status === 'in-progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-blue-400">{milestone.progress}%</span>
                      </div>
                      <TeslaProgressBar 
                        value={milestone.progress} 
                        max={100}
                        color="blue"
                        className="h-1"
                      />
                    </div>
                  )}

                  {/* Date Information */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-400">
                        {milestone.completedDate ? 'Completed:' : 'Expected:'} 
                      </span>
                      <span className={`ml-2 ${
                        milestone.status === 'overdue' ? 'text-red-400' : 
                        milestone.completedDate ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        {formatDateDistance(milestone.completedDate || milestone.expectedDate)}
                      </span>
                    </div>
                    
                    <div className="text-gray-400">
                      {milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} tasks
                    </div>
                  </div>

                  {/* Expanded Task Details */}
                  {selectedMilestone === milestone.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-gray-300 mb-3">Tasks</h5>
                      <div className="space-y-2">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'
                            }`}>
                              {task.completed && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                              {task.title}
                            </span>
                            {task.assignee && (
                              <span className="text-xs text-blue-400">@{task.assignee}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {milestone.status === 'in-progress' && (
                        <div className="mt-4 flex space-x-2">
                          <TeslaButton variant="secondary" size="sm">
                            Update Progress
                          </TeslaButton>
                          <TeslaButton variant="secondary" size="sm">
                            Add Task
                          </TeslaButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </TeslaCard>
    </div>
  );
}
