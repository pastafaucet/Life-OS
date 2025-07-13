import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Bell, AlertTriangle, CheckCircle, Brain, 
  TrendingUp, Users, Phone, Mail, MessageSquare, Zap,
  Eye, MoreHorizontal, ArrowRight, Target, FileText,
  Gavel, Scale, DollarSign, Timer, ChevronRight, Star
} from 'lucide-react';

// Mock data for the intelligent dashboard
const mockIntelligentData = {
  aiInsights: {
    criticalPath: "Motion response due tomorrow - 6h work needed",
    prediction: "On track for all deadlines with current pace",
    recommendation: "Focus 9-11 AM (peak productivity) on legal research",
    efficiency: "+23% vs last week"
  },
  
  tasks: [
    {
      id: 1,
      title: "Research opposition to motion to compel - Johnson v. Smith",
      type: "legal_research",
      priority: "P1",
      status: "ai_prioritized",
      estimatedHours: 3.5,
      aiInsights: {
        complexity: "medium",
        successProbability: 0.85,
        optimalTiming: "Tuesday 9-12:30 AM",
        keyFocus: ["Work product doctrine", "Privilege protections", "Proportionality analysis"],
        relatedPrecedents: ["Hickman v. Taylor", "Recent circuit decisions"]
      },
      deadline: "2025-07-15T17:00:00",
      caseLinked: "Johnson v. Smith",
      progress: 0.2
    },
    {
      id: 2,
      title: "Monitor settlement approval status - Baly matter ($45K)",
      type: "client_dependency", 
      priority: "P2",
      status: "waiting_followup",
      estimatedHours: 0.5,
      aiInsights: {
        daysSent: 22,
        expectedResponse: "4-6 weeks",
        nextAction: "Gentle check-in due July 8",
        riskLevel: "medium",
        clientPattern: "Usually responds in 3-4 weeks"
      },
      followUpDate: "2025-07-08T10:00:00",
      caseLinked: "Baly Settlement",
      settlementAmount: 45000
    },
    {
      id: 3,
      title: "Review transcript - Johnson v. Smith hearing (July 2nd)",
      type: "background_review",
      priority: "P3", 
      status: "background_ready",
      estimatedHours: 1.5,
      aiInsights: {
        taskType: "Strategic background work",
        optimalTiming: "Friday afternoon or 20-min chunks",
        futureValue: "high",
        chunkable: true,
        reviewFocus: ["Judge's comments", "Appeal preparation", "Strategy insights"]
      },
      suggestedSlots: ["Friday 2-4 PM", "Between meetings", "Low energy periods"],
      caseLinked: "Johnson v. Smith"
    }
  ],

  settlements: [
    {
      id: 1,
      caseName: "Baly Settlement",
      amount: 45000,
      status: "awaiting_approval",
      sentDate: "2025-06-15",
      daysPending: 22,
      expectedRange: "4-6 weeks",
      nextAction: "Check-in due July 8",
      riskLevel: "medium",
      client: "Tim Kral"
    },
    {
      id: 2, 
      caseName: "Rodriguez Settlement",
      amount: 12500,
      status: "approved",
      approvedDate: "2025-07-05",
      nextAction: "Draft settlement docs",
      riskLevel: "low",
      client: "Maria Rodriguez"
    }
  ],

  deadlines: [
    {
      id: 1,
      title: "Motion to Dismiss Response",
      case: "Johnson v. Smith",
      dueDate: "2025-07-08T17:00:00",
      hoursLeft: 18,
      priority: "critical",
      preparedness: 0.67,
      aiPrediction: "On track with auto-scheduled work blocks"
    },
    {
      id: 2,
      title: "Discovery Responses", 
      case: "ABC Corp Contract",
      dueDate: "2025-07-11T17:00:00",
      hoursLeft: 114,
      priority: "high",
      preparedness: 0.45,
      aiPrediction: "Begin preparation Monday"
    }
  ],

  workloadAnalysis: {
    currentCapacity: 78,
    taskVelocity: 4.2,
    efficiencyTrend: "increasing",
    recommendedActions: ["Can accept 2 more cases", "Optimal focus: Tuesday AM"]
  }
};

export default function IntelligentLifeOSDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeUntilDeadline = (dueDate) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffInHours = Math.max(0, Math.floor((deadline - now) / (1000 * 60 * 60)));
    
    if (diffInHours < 24) return `${diffInHours}h`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d ${diffInHours % 24}h`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': case 'P1': return 'bg-red-500';
      case 'high': case 'P2': return 'bg-orange-500';
      case 'medium': case 'P3': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ai_prioritized': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'waiting_followup': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'background_ready': return <Eye className="w-4 h-4 text-blue-400" />;
      default: return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* AI-Powered Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Good morning! 🌅</h1>
              <p className="text-blue-200 text-lg">AI analyzed your workflow - here's your intelligent priority guide</p>
            </div>
            <div className="text-right text-blue-200">
              <div className="text-sm">{currentTime.toLocaleDateString()}</div>
              <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
          
          {/* AI Intelligence Bar */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Brain className="w-6 h-6 text-purple-300" />
                <div>
                  <h3 className="font-bold text-white">🧠 AI Strategic Analysis</h3>
                  <p className="text-blue-200 text-sm">{mockIntelligentData.aiInsights.criticalPath}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-sm text-blue-300">Efficiency</div>
                  <div className="text-lg font-bold text-green-400">{mockIntelligentData.aiInsights.efficiency}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-300">Prediction</div>
                  <div className="text-lg font-bold text-blue-300">✅ On Track</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Intelligence Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-bold text-white">🚨 Critical Path Detected</h3>
                <p className="text-red-100">Motion response due tomorrow - AI scheduled 6h optimal work time</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                🎯 Execute Plan
              </button>
              <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                📱 Mobile Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: AI-Prioritized Tasks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Intelligent Task Queue */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  🎯 AI-Prioritized Task Queue
                </h2>
                <button className="bg-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
                  ✨ Smart Create
                </button>
              </div>

              <div className="space-y-4">
                {mockIntelligentData.tasks.map(task => (
                  <div key={task.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(task.status)}
                          <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></span>
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                            {task.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-300 mb-2">📁 {task.caseLinked}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">{task.estimatedHours}h est.</div>
                        {task.deadline && (
                          <div className="text-xs text-orange-400">
                            Due: {getTimeUntilDeadline(task.deadline)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">🤖 AI Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {task.type === 'legal_research' && (
                          <>
                            <div className="text-gray-300">
                              <span className="text-purple-400">Optimal Time:</span> {task.aiInsights.optimalTiming}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-purple-400">Success Rate:</span> {Math.round(task.aiInsights.successProbability * 100)}%
                            </div>
                            <div className="text-gray-300 md:col-span-2">
                              <span className="text-purple-400">Focus Areas:</span> {task.aiInsights.keyFocus.join(', ')}
                            </div>
                          </>
                        )}
                        {task.type === 'client_dependency' && (
                          <>
                            <div className="text-gray-300">
                              <span className="text-orange-400">Days Pending:</span> {task.aiInsights.daysSent}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-orange-400">Expected:</span> {task.aiInsights.expectedResponse}
                            </div>
                            <div className="text-gray-300 md:col-span-2">
                              <span className="text-orange-400">Next Action:</span> {task.aiInsights.nextAction}
                            </div>
                          </>
                        )}
                        {task.type === 'background_review' && (
                          <>
                            <div className="text-gray-300">
                              <span className="text-blue-400">Future Value:</span> {task.aiInsights.futureValue}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-blue-400">Chunkable:</span> Yes
                            </div>
                            <div className="text-gray-300 md:col-span-2">
                              <span className="text-blue-400">Best Times:</span> {task.suggestedSlots.join(', ')}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                        🎯 Start Now
                      </button>
                      <button className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-700 transition">
                        📅 Schedule
                      </button>
                      <button className="bg-purple-600 px-3 py-1 rounded text-xs hover:bg-purple-700 transition">
                        🤖 AI Assist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement Monitoring Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                💰 Settlement Status Monitor
              </h2>

              <div className="space-y-4">
                {mockIntelligentData.settlements.map(settlement => (
                  <div key={settlement.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{settlement.caseName}</h3>
                        <p className="text-green-400 font-mono">${settlement.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          settlement.status === 'awaiting_approval' ? 'bg-orange-100 text-orange-800' :
                          settlement.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {settlement.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {settlement.status === 'awaiting_approval' && (
                      <div className="bg-orange-900 bg-opacity-30 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-orange-400">Days Pending:</span>
                            <span className="text-white ml-2">{settlement.daysPending}</span>
                          </div>
                          <div>
                            <span className="text-orange-400">Expected Range:</span>
                            <span className="text-white ml-2">{settlement.expectedRange}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-orange-400">Next Action:</span>
                            <span className="text-white ml-2">{settlement.nextAction}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {settlement.status === 'approved' && (
                      <div className="bg-green-900 bg-opacity-30 rounded-lg p-3 mb-3">
                        <div className="text-sm">
                          <span className="text-green-400">Approved:</span>
                          <span className="text-white ml-2">{new Date(settlement.approvedDate).toLocaleDateString()}</span>
                          <span className="text-green-400 ml-4">Next:</span>
                          <span className="text-white ml-2">{settlement.nextAction}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition">
                        📞 Call Client
                      </button>
                      <button className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-700 transition">
                        📧 Send Update
                      </button>
                      <button className="bg-purple-600 px-3 py-1 rounded text-xs hover:bg-purple-700 transition">
                        📄 Prep Docs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Intelligence */}
          <div className="space-y-6">
            
            {/* Critical Deadlines */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                🚨 Critical Deadlines
              </h2>

              <div className="space-y-3">
                {mockIntelligentData.deadlines.map(deadline => (
                  <div key={deadline.id} className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{deadline.title}</h4>
                        <p className="text-red-300 text-xs">{deadline.case}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-bold text-sm">
                          {getTimeUntilDeadline(deadline.dueDate)}
                        </div>
                        <div className="text-red-300 text-xs">
                          {new Date(deadline.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-300">Preparedness</span>
                        <span className="text-red-300">{Math.round(deadline.preparedness * 100)}%</span>
                      </div>
                      <div className="w-full bg-red-900 rounded-full h-1">
                        <div 
                          className="bg-red-400 h-1 rounded-full" 
                          style={{ width: `${deadline.preparedness * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-xs text-red-200 mb-2">🤖 {deadline.aiPrediction}</p>
                    
                    <div className="flex space-x-1">
                      <button className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700 transition">
                        🎯 Work Now
                      </button>
                      <button className="bg-orange-600 px-2 py-1 rounded text-xs hover:bg-orange-700 transition">
                        📅 Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Workload Analysis */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                📊 Live Workload Analysis
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 text-sm">Capacity</span>
                    <span className="text-blue-400 font-bold">{mockIntelligentData.workloadAnalysis.currentCapacity}%</span>
                  </div>
                  <div className="w-full bg-blue-900 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${mockIntelligentData.workloadAnalysis.currentCapacity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-900 bg-opacity-30 rounded-lg p-3">
                    <div className="text-green-400 text-xs">Task Velocity</div>
                    <div className="text-green-300 font-bold">{mockIntelligentData.workloadAnalysis.taskVelocity}/day</div>
                  </div>
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3">
                    <div className="text-purple-400 text-xs">Efficiency</div>
                    <div className="text-purple-300 font-bold">↗️ +23%</div>
                  </div>
                </div>

                <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-3">
                  <h4 className="text-yellow-400 text-sm font-semibold mb-2">🤖 AI Recommendations</h4>
                  <ul className="text-yellow-200 text-xs space-y-1">
                    {mockIntelligentData.workloadAnalysis.recommendedActions.map((action, index) => (
                      <li key={index}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                ⚡ Quick Actions
              </h2>

              <div className="space-y-2">
                <button className="w-full bg-blue-600 p-3 rounded-lg text-left hover:bg-blue-700 transition">
                  🎯 Auto-Schedule Critical Tasks
                </button>
                <button className="w-full bg-green-600 p-3 rounded-lg text-left hover:bg-green-700 transition">
                  📧 Send All Pending Follow-ups
                </button>
                <button className="w-full bg-purple-600 p-3 rounded-lg text-left hover:bg-purple-700 transition">
                  🤖 Get AI Productivity Report
                </button>
                <button className="w-full bg-orange-600 p-3 rounded-lg text-left hover:bg-orange-700 transition">
                  📱 Switch to Mobile Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}