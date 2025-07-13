'use client';

import React from 'react';

// Real-Time Metrics API for Tesla Intelligence System
// Provides live data feeds for dashboards and monitoring

export interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
  category: 'productivity' | 'workload' | 'deadlines' | 'quality' | 'efficiency';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  active_processes: number;
  last_update: string;
}

export interface WorkloadMetrics {
  current_capacity: number;
  max_capacity: number;
  utilization_percent: number;
  active_tasks: number;
  overdue_tasks: number;
  today_completed: number;
  efficiency_score: number;
  burnout_risk: number;
}

export interface DeadlineMetrics {
  upcoming_24h: number;
  upcoming_7d: number;
  upcoming_30d: number;
  overdue: number;
  at_risk: number;
  completion_rate: number;
  average_prep_time: number;
}

export interface ProductivityMetrics {
  focus_time_today: number;
  interruptions_count: number;
  tasks_completed: number;
  quality_score: number;
  velocity: number;
  peak_hours: string[];
  energy_level: number;
}

export interface CaseMetrics {
  active_cases: number;
  new_this_week: number;
  completed_this_month: number;
  average_case_duration: number;
  client_satisfaction: number;
  revenue_pipeline: number;
  billable_hours_today: number;
}

export interface AlertMetric {
  id: string;
  type: 'deadline' | 'workload' | 'quality' | 'system' | 'client';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  entity_id?: string;
  created_at: string;
  acknowledged: boolean;
  auto_dismiss_at?: string;
}

class RealTimeMetricsAPI {
  private subscribers: Map<string, (data: any) => void> = new Map();
  private metricsCache: Map<string, any> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initializeRealTimeConnection();
  }

  // Initialize real-time connection
  private async initializeRealTimeConnection() {
    try {
      // Simulate WebSocket connection for real-time updates
      this.isConnected = true;
      this.startMetricsRefresh();
      console.log('Real-time metrics API connected');
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      this.isConnected = false;
    }
  }

  // Start periodic metrics refresh
  private startMetricsRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.refreshAllMetrics();
    }, 5000); // Refresh every 5 seconds

    // Initial load
    this.refreshAllMetrics();
  }

  // Refresh all metrics
  private async refreshAllMetrics() {
    const metrics = [
      'system_health',
      'workload',
      'deadlines',
      'productivity',
      'cases',
      'alerts'
    ];

    for (const metric of metrics) {
      try {
        const data = await this.fetchMetricData(metric);
        this.metricsCache.set(metric, data);
        this.notifySubscribers(metric, data);
      } catch (error) {
        console.error(`Failed to refresh ${metric}:`, error);
      }
    }
  }

  // Fetch metric data (simulated for now)
  private async fetchMetricData(metricType: string): Promise<any> {
    // In production, this would make actual API calls
    // For now, we'll generate realistic mock data
    const now = new Date().toISOString();

    switch (metricType) {
      case 'system_health':
        return this.generateSystemHealthData(now);
      case 'workload':
        return this.generateWorkloadData(now);
      case 'deadlines':
        return this.generateDeadlineData(now);
      case 'productivity':
        return this.generateProductivityData(now);
      case 'cases':
        return this.generateCaseData(now);
      case 'alerts':
        return this.generateAlertData(now);
      default:
        throw new Error(`Unknown metric type: ${metricType}`);
    }
  }

  // Generate mock system health data
  private generateSystemHealthData(timestamp: string): SystemHealth {
    return {
      status: Math.random() > 0.1 ? 'healthy' : 'warning',
      uptime: Math.floor(Math.random() * 720) + 24, // 24-744 hours
      cpu_usage: Math.floor(Math.random() * 60) + 20, // 20-80%
      memory_usage: Math.floor(Math.random() * 40) + 30, // 30-70%
      active_processes: Math.floor(Math.random() * 20) + 15, // 15-35
      last_update: timestamp
    };
  }

  // Generate mock workload data
  private generateWorkloadData(timestamp: string): WorkloadMetrics {
    const maxCapacity = 40; // 40 hours per week
    const currentCapacity = Math.floor(Math.random() * 45) + 25; // 25-70 hours
    
    return {
      current_capacity: currentCapacity,
      max_capacity: maxCapacity,
      utilization_percent: Math.min(Math.floor((currentCapacity / maxCapacity) * 100), 150),
      active_tasks: Math.floor(Math.random() * 25) + 8, // 8-33
      overdue_tasks: Math.floor(Math.random() * 5), // 0-5
      today_completed: Math.floor(Math.random() * 12) + 3, // 3-15
      efficiency_score: Math.floor(Math.random() * 30) + 70, // 70-100
      burnout_risk: Math.floor(Math.random() * 40) + 10 // 10-50
    };
  }

  // Generate mock deadline data
  private generateDeadlineData(timestamp: string): DeadlineMetrics {
    return {
      upcoming_24h: Math.floor(Math.random() * 5) + 1, // 1-6
      upcoming_7d: Math.floor(Math.random() * 15) + 5, // 5-20
      upcoming_30d: Math.floor(Math.random() * 40) + 20, // 20-60
      overdue: Math.floor(Math.random() * 3), // 0-3
      at_risk: Math.floor(Math.random() * 8) + 2, // 2-10
      completion_rate: Math.floor(Math.random() * 20) + 80, // 80-100%
      average_prep_time: Math.floor(Math.random() * 10) + 5 // 5-15 hours
    };
  }

  // Generate mock productivity data
  private generateProductivityData(timestamp: string): ProductivityMetrics {
    return {
      focus_time_today: Math.floor(Math.random() * 4) + 2, // 2-6 hours
      interruptions_count: Math.floor(Math.random() * 12) + 3, // 3-15
      tasks_completed: Math.floor(Math.random() * 10) + 5, // 5-15
      quality_score: Math.floor(Math.random() * 25) + 75, // 75-100
      velocity: Math.floor(Math.random() * 30) + 70, // 70-100%
      peak_hours: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'],
      energy_level: Math.floor(Math.random() * 40) + 60 // 60-100
    };
  }

  // Generate mock case data
  private generateCaseData(timestamp: string): CaseMetrics {
    return {
      active_cases: Math.floor(Math.random() * 20) + 15, // 15-35
      new_this_week: Math.floor(Math.random() * 5) + 1, // 1-6
      completed_this_month: Math.floor(Math.random() * 12) + 8, // 8-20
      average_case_duration: Math.floor(Math.random() * 60) + 30, // 30-90 days
      client_satisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
      revenue_pipeline: Math.floor(Math.random() * 200000) + 300000, // $300k-$500k
      billable_hours_today: Math.floor(Math.random() * 6) + 2 // 2-8 hours
    };
  }

  // Generate mock alert data
  private generateAlertData(timestamp: string): AlertMetric[] {
    const alertTypes = ['deadline', 'workload', 'quality', 'system', 'client'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    const alerts: AlertMetric[] = [];
    const alertCount = Math.floor(Math.random() * 5) + 2; // 2-7 alerts

    for (let i = 0; i < alertCount; i++) {
      alerts.push({
        id: `alert_${Date.now()}_${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: this.generateAlertMessage(),
        entity_id: Math.random() > 0.5 ? `entity_${Math.floor(Math.random() * 100)}` : undefined,
        created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
        acknowledged: Math.random() > 0.7,
        auto_dismiss_at: Math.random() > 0.8 ? new Date(Date.now() + 3600000).toISOString() : undefined
      });
    }

    return alerts;
  }

  // Generate realistic alert messages
  private generateAlertMessage(): string {
    const messages = [
      'Johnson case deadline approaching in 2 days',
      'Workload at 135% capacity - consider delegation',
      'Client satisfaction below threshold for Anderson case',
      'System backup completed successfully',
      'New urgent case requires immediate attention',
      'Quality score dropped 10% this week',
      'Deadline prep time insufficient for Wilson matter',
      'Calendar conflict detected for tomorrow',
      'Document review overdue by 3 days',
      'Client payment pending for 30+ days'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Subscribe to metric updates
  public subscribe(metricType: string, callback: (data: any) => void): () => void {
    const subscriptionId = `${metricType}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(subscriptionId, callback);
    
    // Send cached data immediately if available
    const cachedData = this.metricsCache.get(metricType);
    if (cachedData) {
      callback(cachedData);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriptionId);
    };
  }

  // Notify subscribers of updates
  private notifySubscribers(metricType: string, data: any) {
    this.subscribers.forEach((callback, subscriptionId) => {
      if (subscriptionId.startsWith(metricType)) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      }
    });
  }

  // Get current metric value
  public getCurrentMetric(metricType: string): any {
    return this.metricsCache.get(metricType);
  }

  // Get all current metrics
  public getAllMetrics(): Map<string, any> {
    return new Map(this.metricsCache);
  }

  // Check connection status
  public isConnectedToRealTime(): boolean {
    return this.isConnected;
  }

  // Manual refresh of specific metric
  public async refreshMetric(metricType: string): Promise<any> {
    try {
      const data = await this.fetchMetricData(metricType);
      this.metricsCache.set(metricType, data);
      this.notifySubscribers(metricType, data);
      return data;
    } catch (error) {
      console.error(`Failed to refresh ${metricType}:`, error);
      throw error;
    }
  }

  // Cleanup resources
  public disconnect() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.subscribers.clear();
    this.metricsCache.clear();
    this.isConnected = false;
  }

  // Acknowledge alert
  public async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      // In production, this would make an API call
      console.log(`Alert ${alertId} acknowledged`);
      return true;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      return false;
    }
  }

  // Update metric threshold
  public async updateThreshold(metricType: string, threshold: number): Promise<boolean> {
    try {
      // In production, this would update server-side thresholds
      console.log(`Updated ${metricType} threshold to ${threshold}`);
      return true;
    } catch (error) {
      console.error('Failed to update threshold:', error);
      return false;
    }
  }
}

// Export singleton instance
export const realTimeMetricsAPI = new RealTimeMetricsAPI();

// Database Integration Layer
// Connect the real-time API to the new database layer
import { workflowDb } from '../database/workflow-automation-db';

// Enhanced database-connected functions
export const recordRealTimeMetric = async (
  type: 'productivity' | 'workload' | 'deadline_risk' | 'case_velocity' | 'efficiency',
  name: string,
  value: number,
  metadata?: Record<string, any>
) => {
  try {
    await workflowDb.recordMetric({
      metric_type: type,
      metric_name: name,
      metric_value: value,
      metric_unit: 'count',
      timestamp: new Date(),
      data_source: 'system_calculation',
      is_anomaly: false,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    });
    console.log(`✅ Real-time metric recorded: ${type}.${name} = ${value}`);
  } catch (error) {
    console.error('❌ Failed to record real-time metric:', error);
  }
};

export const getDatabaseMetrics = async (
  metricType: 'productivity' | 'workload' | 'deadline_risk' | 'case_velocity' | 'efficiency',
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
) => {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    const metrics = await workflowDb.getMetrics({
      metric_type: metricType,
      start_date: startDate,
      end_date: endDate
    }, 100);
    
    return metrics;
  } catch (error) {
    console.error('❌ Failed to get database metrics:', error);
    return [];
  }
};

// Initialize database with sample metrics
export const initializeDatabaseMetrics = async () => {
  try {
    const sampleMetrics = [
      { type: 'productivity', name: 'focus_time_hours', value: Math.random() * 8 + 2 },
      { type: 'workload', name: 'utilization_percent', value: Math.random() * 60 + 70 },
      { type: 'deadline_risk', name: 'completion_rate', value: Math.random() * 20 + 80 },
      { type: 'case_velocity', name: 'cases_per_week', value: Math.random() * 10 + 5 },
      { type: 'efficiency', name: 'task_completion_rate', value: Math.random() * 30 + 70 }
    ];
    
    for (const metric of sampleMetrics) {
      await recordRealTimeMetric(
        metric.type as any,
        metric.name,
        metric.value,
        { source: 'initialization', timestamp: new Date().toISOString() }
      );
    }
    
    console.log('✅ Database metrics initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database metrics:', error);
  }
};

// Export utility functions
export const formatMetricValue = (value: number, unit: string): string => {
  switch (unit) {
    case 'percentage':
      return `${value}%`;
    case 'hours':
      return `${value}h`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'days':
      return `${value}d`;
    default:
      return value.toString();
  }
};

export const getMetricTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '↗️';
    case 'down':
      return '↘️';
    case 'stable':
      return '→';
    default:
      return '→';
  }
};

export const getMetricColor = (
  value: number,
  thresholds: { good: number; warning: number; critical: number }
): string => {
  if (value >= thresholds.good) return 'text-green-400';
  if (value >= thresholds.warning) return 'text-yellow-400';
  if (value >= thresholds.critical) return 'text-orange-400';
  return 'text-red-400';
};

// Hook for React components
export const useRealTimeMetric = (metricType: string) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = realTimeMetricsAPI.subscribe(metricType, (newData) => {
      setData(newData);
      setLoading(false);
    });

    // Handle subscription errors
    const currentData = realTimeMetricsAPI.getCurrentMetric(metricType);
    if (currentData) {
      setData(currentData);
      setLoading(false);
    }

    return unsubscribe;
  }, [metricType]);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      await realTimeMetricsAPI.refreshMetric(metricType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh metric');
    } finally {
      setLoading(false);
    }
  }, [metricType]);

  return { data, loading, error, refresh };
};

export default realTimeMetricsAPI;
