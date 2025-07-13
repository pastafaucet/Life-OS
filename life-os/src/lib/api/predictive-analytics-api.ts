'use client';

import { useState, useEffect, useCallback } from 'react';

// Types for predictive analytics
interface DeadlineRiskAssessment {
  taskId: string;
  taskTitle: string;
  deadline: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  timeRemaining: number; // hours
  estimatedTimeNeeded: number; // hours
  completionProbability: number; // 0-100
  recommendations: string[];
  mitigationActions: {
    action: string;
    urgency: 'low' | 'medium' | 'high';
    impact: number; // 0-100
  }[];
}

interface WorkloadPrediction {
  date: Date;
  predictedCapacity: number; // 0-100
  scheduledHours: number;
  availableHours: number;
  overloadRisk: boolean;
  recommendations: string[];
  optimalSchedule: {
    timeSlot: string;
    task: string;
    efficiency: number;
  }[];
}

interface ProductivityPattern {
  timeOfDay: string;
  averageProductivity: number; // 0-100
  taskTypes: string[];
  optimalDuration: number; // minutes
  energyLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface CaseComplexityScore {
  caseId: string;
  caseTitle: string;
  complexityScore: number; // 0-100
  factors: {
    factor: string;
    weight: number;
    score: number;
  }[];
  estimatedHours: number;
  similarCasesData: {
    caseTitle: string;
    actualHours: number;
    outcome: string;
  }[];
  riskFactors: string[];
}

interface PerformanceTrend {
  metric: string;
  currentValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  forecast: {
    date: Date;
    predictedValue: number;
  }[];
  alerts: {
    type: 'warning' | 'info' | 'success';
    message: string;
  }[];
}

interface PredictiveAnalyticsData {
  deadlineRisks: DeadlineRiskAssessment[];
  workloadPredictions: WorkloadPrediction[];
  productivityPatterns: ProductivityPattern[];
  caseComplexityScores: CaseComplexityScore[];
  performanceTrends: PerformanceTrend[];
  lastUpdated: Date;
}

class PredictiveAnalyticsAPI {
  private baseUrl = '/api/predictive-analytics';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getDeadlineRiskAssessment(): Promise<DeadlineRiskAssessment[]> {
    const cacheKey = 'deadline-risks';
    const cached = this.getCachedData<DeadlineRiskAssessment[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockData: DeadlineRiskAssessment[] = [
        {
          taskId: '1',
          taskTitle: 'Motion Response - Johnson v. State',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          riskLevel: 'high',
          riskScore: 78,
          timeRemaining: 48,
          estimatedTimeNeeded: 6,
          completionProbability: 45,
          recommendations: [
            'Schedule 4-hour focused work block tomorrow',
            'Delegate research tasks to paralegal',
            'Consider requesting extension if quality at risk'
          ],
          mitigationActions: [
            { action: 'Block calendar for focused work', urgency: 'high', impact: 85 },
            { action: 'Prepare outline tonight', urgency: 'medium', impact: 60 },
            { action: 'Set up research templates', urgency: 'low', impact: 40 }
          ]
        },
        {
          taskId: '2',
          taskTitle: 'Discovery Responses - ABC Corp',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          riskLevel: 'low',
          riskScore: 25,
          timeRemaining: 168,
          estimatedTimeNeeded: 4,
          completionProbability: 92,
          recommendations: [
            'On track for early completion',
            'Consider advancing other deadlines'
          ],
          mitigationActions: [
            { action: 'Schedule review session', urgency: 'low', impact: 30 }
          ]
        }
      ];

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Failed to get deadline risk assessment:', error);
      return [];
    }
  }

  async getWorkloadPredictions(): Promise<WorkloadPrediction[]> {
    const cacheKey = 'workload-predictions';
    const cached = this.getCachedData<WorkloadPrediction[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockData: WorkloadPrediction[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        mockData.push({
          date,
          predictedCapacity: 65 + Math.random() * 30,
          scheduledHours: 6 + Math.random() * 4,
          availableHours: 8,
          overloadRisk: Math.random() > 0.7,
          recommendations: [
            'Consider rescheduling non-urgent tasks',
            'Block time for unexpected urgent items'
          ],
          optimalSchedule: [
            { timeSlot: '9:00-11:00 AM', task: 'Complex legal research', efficiency: 95 },
            { timeSlot: '2:00-4:00 PM', task: 'Document review', efficiency: 85 },
            { timeSlot: '4:00-5:00 PM', task: 'Client communications', efficiency: 75 }
          ]
        });
      }

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Failed to get workload predictions:', error);
      return [];
    }
  }

  async getProductivityPatterns(): Promise<ProductivityPattern[]> {
    const cacheKey = 'productivity-patterns';
    const cached = this.getCachedData<ProductivityPattern[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockData: ProductivityPattern[] = [
        {
          timeOfDay: '9:00-11:00 AM',
          averageProductivity: 95,
          taskTypes: ['Legal Research', 'Writing', 'Complex Analysis'],
          optimalDuration: 120,
          energyLevel: 'high',
          recommendations: ['Schedule most challenging work during this time']
        },
        {
          timeOfDay: '11:00 AM-1:00 PM',
          averageProductivity: 75,
          taskTypes: ['Document Review', 'Client Calls', 'Email'],
          optimalDuration: 90,
          energyLevel: 'medium',
          recommendations: ['Good for routine tasks and communications']
        },
        {
          timeOfDay: '2:00-4:00 PM',
          averageProductivity: 85,
          taskTypes: ['Case Preparation', 'Filing', 'Organization'],
          optimalDuration: 90,
          energyLevel: 'medium',
          recommendations: ['Focus on case preparation and administrative tasks']
        },
        {
          timeOfDay: '4:00-6:00 PM',
          averageProductivity: 60,
          taskTypes: ['Email', 'Planning', 'Light Review'],
          optimalDuration: 60,
          energyLevel: 'low',
          recommendations: ['Wind down with lighter tasks and planning']
        }
      ];

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Failed to get productivity patterns:', error);
      return [];
    }
  }

  async getCaseComplexityScores(): Promise<CaseComplexityScore[]> {
    const cacheKey = 'case-complexity';
    const cached = this.getCachedData<CaseComplexityScore[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockData: CaseComplexityScore[] = [
        {
          caseId: '1',
          caseTitle: 'Johnson v. State Criminal Defense',
          complexityScore: 85,
          factors: [
            { factor: 'Multiple charges', weight: 0.3, score: 90 },
            { factor: 'Evidence volume', weight: 0.25, score: 80 },
            { factor: 'Witness count', weight: 0.2, score: 85 },
            { factor: 'Legal precedent complexity', weight: 0.25, score: 85 }
          ],
          estimatedHours: 45,
          similarCasesData: [
            { caseTitle: 'Smith v. State', actualHours: 42, outcome: 'Favorable plea' },
            { caseTitle: 'Jones v. State', actualHours: 48, outcome: 'Trial victory' }
          ],
          riskFactors: ['Complex evidence', 'Multiple witnesses', 'High stakes']
        }
      ];

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Failed to get case complexity scores:', error);
      return [];
    }
  }

  async getPerformanceTrends(): Promise<PerformanceTrend[]> {
    const cacheKey = 'performance-trends';
    const cached = this.getCachedData<PerformanceTrend[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockData: PerformanceTrend[] = [
        {
          metric: 'Task Completion Rate',
          currentValue: 87,
          trend: 'increasing',
          trendPercentage: 12,
          forecast: [
            { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), predictedValue: 89 },
            { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), predictedValue: 91 },
            { date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), predictedValue: 92 }
          ],
          alerts: [
            { type: 'success', message: 'Productivity trend is positive - keep it up!' }
          ]
        },
        {
          metric: 'Average Case Velocity',
          currentValue: 4.2,
          trend: 'stable',
          trendPercentage: 2,
          forecast: [
            { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), predictedValue: 4.3 },
            { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), predictedValue: 4.2 },
            { date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), predictedValue: 4.4 }
          ],
          alerts: [
            { type: 'info', message: 'Case velocity is stable and healthy' }
          ]
        },
        {
          metric: 'Deadline Compliance',
          currentValue: 100,
          trend: 'stable',
          trendPercentage: 0,
          forecast: [
            { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), predictedValue: 98 },
            { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), predictedValue: 97 },
            { date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), predictedValue: 95 }
          ],
          alerts: [
            { type: 'warning', message: 'Upcoming heavy workload may impact deadline compliance' }
          ]
        }
      ];

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Failed to get performance trends:', error);
      return [];
    }
  }

  async getAllPredictiveAnalytics(): Promise<PredictiveAnalyticsData> {
    try {
      const [
        deadlineRisks,
        workloadPredictions,
        productivityPatterns,
        caseComplexityScores,
        performanceTrends
      ] = await Promise.all([
        this.getDeadlineRiskAssessment(),
        this.getWorkloadPredictions(),
        this.getProductivityPatterns(),
        this.getCaseComplexityScores(),
        this.getPerformanceTrends()
      ]);

      return {
        deadlineRisks,
        workloadPredictions,
        productivityPatterns,
        caseComplexityScores,
        performanceTrends,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to get all predictive analytics:', error);
      throw error;
    }
  }

  async getTaskCompletionPrediction(taskId: string): Promise<{
    estimatedHours: number;
    completionProbability: number;
    riskFactors: string[];
  }> {
    try {
      // Mock implementation - replace with actual API call
      return {
        estimatedHours: 4 + Math.random() * 8,
        completionProbability: 70 + Math.random() * 25,
        riskFactors: ['Complex research required', 'Multiple stakeholder coordination']
      };
    } catch (error) {
      console.error('❌ Failed to get task completion prediction:', error);
      throw error;
    }
  }

  async getOptimalScheduleSuggestion(date: Date): Promise<{
    timeSlots: {
      start: string;
      end: string;
      taskType: string;
      reason: string;
    }[];
  }> {
    try {
      // Mock implementation - replace with actual API call
      return {
        timeSlots: [
          {
            start: '9:00 AM',
            end: '11:00 AM',
            taskType: 'Deep work (research, writing)',
            reason: 'Peak cognitive performance time'
          },
          {
            start: '11:00 AM',
            end: '12:00 PM',
            taskType: 'Client communications',
            reason: 'Good for interactive tasks'
          },
          {
            start: '2:00 PM',
            end: '4:00 PM',
            taskType: 'Document review',
            reason: 'Steady focus without peak demands'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Failed to get optimal schedule suggestion:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Predictive Analytics API cache cleared');
  }
}

// Singleton instance
export const predictiveAnalytics = new PredictiveAnalyticsAPI();

// React hook for using Predictive Analytics API
export function usePredictiveAnalytics() {
  const [data, setData] = useState<PredictiveAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await predictiveAnalytics.getAllPredictiveAnalytics();
      setData(analyticsData);
      console.log('📊 Predictive analytics data refreshed:', analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load predictive analytics';
      setError(errorMessage);
      console.error('❌ Error loading predictive analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeadlineRisks = useCallback(async () => {
    try {
      return await predictiveAnalytics.getDeadlineRiskAssessment();
    } catch (err) {
      console.error('❌ Error getting deadline risks:', err);
      return [];
    }
  }, []);

  const getWorkloadForecast = useCallback(async (days: number = 7) => {
    try {
      const predictions = await predictiveAnalytics.getWorkloadPredictions();
      return predictions.slice(0, days);
    } catch (err) {
      console.error('❌ Error getting workload forecast:', err);
      return [];
    }
  }, []);

  const getProductivityInsights = useCallback(async () => {
    try {
      return await predictiveAnalytics.getProductivityPatterns();
    } catch (err) {
      console.error('❌ Error getting productivity insights:', err);
      return [];
    }
  }, []);

  const getPerformanceForecasts = useCallback(async () => {
    try {
      return await predictiveAnalytics.getPerformanceTrends();
    } catch (err) {
      console.error('❌ Error getting performance forecasts:', err);
      return [];
    }
  }, []);

  const predictTaskCompletion = useCallback(async (taskId: string) => {
    try {
      return await predictiveAnalytics.getTaskCompletionPrediction(taskId);
    } catch (err) {
      console.error('❌ Error predicting task completion:', err);
      return null;
    }
  }, []);

  const getOptimalSchedule = useCallback(async (date: Date) => {
    try {
      return await predictiveAnalytics.getOptimalScheduleSuggestion(date);
    } catch (err) {
      console.error('❌ Error getting optimal schedule:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    data,
    loading,
    error,
    refreshData,
    getDeadlineRisks,
    getWorkloadForecast,
    getProductivityInsights,
    getPerformanceForecasts,
    predictTaskCompletion,
    getOptimalSchedule
  };
}

export default predictiveAnalytics;
