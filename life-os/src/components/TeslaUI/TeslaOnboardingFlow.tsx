'use client';

import React, { useState, useEffect } from 'react';
import { 
  TeslaCard, 
  TeslaButton, 
  TeslaProgressBar,
  TeslaStatusIndicator,
  TeslaMetric 
} from './index';
import { 
  Rocket, 
  Brain, 
  Target, 
  Calendar, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Sparkles,
  Zap,
  Users,
  FileText,
  Settings,
  X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  actionText: string;
  completedText: string;
  estimatedTime: string;
}

interface TeslaOnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function TeslaOnboardingFlow({ onComplete, onSkip }: TeslaOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Life OS',
      description: 'Your Tesla-level AI-powered life operating system',
      icon: <Rocket className="w-8 h-8" />,
      estimatedTime: '1 min',
      actionText: 'Begin Journey',
      completedText: 'Welcome Complete',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to the Future of Productivity
            </h2>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Life OS transforms your professional workflow with Tesla-grade intelligence. 
              AI-powered task management, predictive analytics, and automated workflows 
              designed for legal professionals who demand excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
              <Brain className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">AI Intelligence</h3>
              <p className="text-sm text-gray-300">Smart task categorization, deadline prediction, and workflow optimization</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
              <Zap className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Automation</h3>
              <p className="text-sm text-gray-300">Automated workflows, calendar integration, and intelligent reminders</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/20">
              <Shield className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">Compliance</h3>
              <p className="text-sm text-gray-300">MCLE tracking, deadline management, and professional compliance monitoring</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Command Center Dashboard',
      description: 'Your mission control for professional life',
      icon: <Target className="w-8 h-8" />,
      estimatedTime: '2 min',
      actionText: 'Explore Dashboard',
      completedText: 'Dashboard Mastered',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">Tesla-Style Command Center</h3>
            <p className="text-gray-300">Everything you need at your fingertips, designed for speed and efficiency</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                Key Features
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Live Intelligence Panel</p>
                    <p className="text-sm text-gray-400">Real-time insights and AI recommendations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Critical Deadlines</p>
                    <p className="text-sm text-gray-400">Never miss important dates with smart alerts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Workload Analysis</p>
                    <p className="text-sm text-gray-400">Optimize your productivity with capacity insights</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Dashboard Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Active Tasks</span>
                  <span className="text-xs text-blue-400">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Deadlines This Week</span>
                  <span className="text-xs text-yellow-400">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">AI Insights</span>
                  <span className="text-xs text-green-400">8 New</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Productivity Score: 75%</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-setup',
      title: 'AI Intelligence Setup',
      description: 'Configure your AI assistant for maximum effectiveness',
      icon: <Brain className="w-8 h-8" />,
      estimatedTime: '3 min',
      actionText: 'Configure AI',
      completedText: 'AI Ready',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">Activate Your AI Assistant</h3>
            <p className="text-gray-300">Enable intelligent features to supercharge your workflow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">AI Capabilities</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Task categorization & prioritization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Deadline risk assessment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Productivity pattern analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Smart case connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Automated workflow suggestions</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">AI System Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">OpenAI Integration</span>
                  <TeslaStatusIndicator status="online" size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Learning Engine</span>
                  <TeslaStatusIndicator status="online" size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Pattern Recognition</span>
                  <TeslaStatusIndicator status="online" size="sm" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-gray-400">
                  AI will learn from your workflow patterns to provide increasingly personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'modules',
      title: 'Explore Core Modules',
      description: 'Discover the power of integrated workflow management',
      icon: <FileText className="w-8 h-8" />,
      estimatedTime: '4 min',
      actionText: 'Tour Modules',
      completedText: 'Modules Explored',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">Your Complete Workflow Suite</h3>
            <p className="text-gray-300">Each module works together to create a seamless professional experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
              <Target className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Tasks</h4>
              <p className="text-sm text-gray-300 mb-3">AI-enhanced task management with smart prioritization</p>
              <div className="text-xs text-blue-400">✓ Smart categorization ✓ Time estimation ✓ Priority scoring</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/20">
              <Shield className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Legal Cases</h4>
              <p className="text-sm text-gray-300 mb-3">Comprehensive case management with compliance tracking</p>
              <div className="text-xs text-green-400">✓ Case linking ✓ Deadline tracking ✓ MCLE integration</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
              <Calendar className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Automation</h4>
              <p className="text-sm text-gray-300 mb-3">Intelligent workflow automation and scheduling</p>
              <div className="text-xs text-purple-400">✓ Smart scheduling ✓ Auto-reminders ✓ Workflow triggers</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20">
              <Brain className="w-8 h-8 text-yellow-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Intelligence</h4>
              <p className="text-sm text-gray-300 mb-3">Real-time analytics and predictive insights</p>
              <div className="text-xs text-yellow-400">✓ Pattern recognition ✓ Predictive analytics ✓ Risk assessment</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/20">
              <Shield className="w-8 h-8 text-red-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Emergency</h4>
              <p className="text-sm text-gray-300 mb-3">Crisis management and emergency protocols</p>
              <div className="text-xs text-red-400">✓ Emergency alerts ✓ Escalation protocols ✓ Crisis workflows</div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-4 border border-cyan-500/20">
              <Users className="w-8 h-8 text-cyan-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Mobile</h4>
              <p className="text-sm text-gray-300 mb-3">On-the-go access with mobile command center</p>
              <div className="text-xs text-cyan-400">✓ Mobile dashboard ✓ Voice commands ✓ Location awareness</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready for Takeoff',
      description: 'Your Life OS is configured and ready to accelerate your productivity',
      icon: <CheckCircle className="w-8 h-8" />,
      estimatedTime: '1 min',
      actionText: 'Launch Life OS',
      completedText: 'Mission Complete',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              🚀 Life OS is Ready!
            </h2>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              You've successfully configured your Tesla-level AI assistant. 
              Your professional workflow is about to reach new heights of efficiency and intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TeslaMetric
              label="AI Features"
              value="Active"
              color="green"
              size="sm"
            />
            <TeslaMetric
              label="Modules"
              value="6"
              color="blue"
              size="sm"
            />
            <TeslaMetric
              label="Automation"
              value="Ready"
              color="purple"
              size="sm"
            />
            <TeslaMetric
              label="Intelligence"
              value="Online"
              color="cyan"
              size="sm"
            />
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
              What's Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300 mb-2">• Create your first AI-enhanced task</p>
                <p className="text-gray-300 mb-2">• Explore the intelligent dashboard</p>
                <p className="text-gray-300">• Set up your case management workflow</p>
              </div>
              <div>
                <p className="text-gray-300 mb-2">• Configure automation rules</p>
                <p className="text-gray-300 mb-2">• Review MCLE compliance status</p>
                <p className="text-gray-300">• Experience mobile command center</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = steps[currentStep];
  const isCompleted = completedSteps.has(currentStepData.id);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-xl">
                {currentStepData.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentStepData.title}</h1>
                <p className="text-blue-100">{currentStepData.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white text-sm">Step {currentStep + 1} of {steps.length}</div>
                <div className="text-blue-100 text-xs">{currentStepData.estimatedTime}</div>
              </div>
              <button
                onClick={onSkip}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <TeslaProgressBar value={progress} color="white" size="sm" />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleSkipToStep(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                )}
                <span>{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip Onboarding
              </button>
            </div>

            <TeslaButton
              variant="primary"
              size="md"
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>
                {currentStep === steps.length - 1 
                  ? 'Launch Life OS' 
                  : isCompleted 
                    ? currentStepData.completedText 
                    : currentStepData.actionText
                }
              </span>
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </TeslaButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeslaOnboardingFlow;
