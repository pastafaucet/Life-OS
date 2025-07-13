// Automation Monitoring Framework
// Provides comprehensive monitoring, alerting, and analytics for all automation processes

import React from 'react';

export interface AutomationEvent {
  id: string;
  automationId: string;
  eventType: 'started' | 'completed' | 'failed' | 'paused' | 'resumed' | 'timeout' | 'retry';
  timestamp: Date;
  duration?: number; // in milliseconds
  status: 'success' | 'failure' | 'warning' | 'info';
  message: string;
  metadata?: Record<string, any>;
  error?: string;
  retryCount?: number;
}

export interface AutomationMetrics {
  automationId: string;
  automationName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted: Date | null;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  totalExecutionTime: number;
  currentStatus: 'active' | 'paused' | 'failed' | 'idle';
  errorCount: number;
  warningCount: number;
  retryCount: number;
  uptime: number; // percentage
  health: 'healthy' | 'degraded' | 'critical' | 'unknown';
}

export interface AutomationAlert {
  id: string;
  automationId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'failure' | 'timeout' | 'performance' | 'quota' | 'dependency' | 'resource';
  title: string;
  description: string;
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AutomationPerformanceData {
  automationId: string;
  timestamp: Date;
  executionTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkLatency?: number;
  queueSize?: number;
  throughput?: number;
}

export interface AutomationDependency {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'file' | 'network';
  status: 'up' | 'down' | 'degraded' | 'unknown';
  lastChecked: Date;
  responseTime?: number;
  errorRate?: number;
  uptime?: number;
}

export interface MonitoringThresholds {
  automationId: string;
  maxExecutionTime: number; // ms
  minSuccessRate: number; // percentage
  maxErrorRate: number; // percentage
  maxRetryCount: number;
  alertOnConsecutiveFailures: number;
  performanceThresholds: {
    maxMemoryUsage?: number; // MB
    maxCpuUsage?: number; // percentage
    maxNetworkLatency?: number; // ms
  };
}

export interface AutomationHealthCheck {
  automationId: string;
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'critical' | 'unknown';
  checks: {
    connectivity: boolean;
    performance: boolean;
    errorRate: boolean;
    dependencies: boolean;
    resources: boolean;
  };
  score: number; // 0-100
  recommendations: string[];
  nextCheckAt: Date;
}

class AutomationMonitoringFramework {
  private events: Map<string, AutomationEvent[]> = new Map();
  private metrics: Map<string, AutomationMetrics> = new Map();
  private alerts: Map<string, AutomationAlert[]> = new Map();
  private performanceData: Map<string, AutomationPerformanceData[]> = new Map();
  private dependencies: Map<string, AutomationDependency> = new Map();
  private thresholds: Map<string, MonitoringThresholds> = new Map();
  private healthChecks: Map<string, AutomationHealthCheck> = new Map();
  private subscribers: Map<string, ((event: AutomationEvent) => void)[]> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
    this.startHealthChecking();
  }

  private initializeDefaultThresholds() {
    // Set default monitoring thresholds
    const defaultThresholds: Omit<MonitoringThresholds, 'automationId'> = {
      maxExecutionTime: 300000, // 5 minutes
      minSuccessRate: 95, // 95%
      maxErrorRate: 5, // 5%
      maxRetryCount: 3,
      alertOnConsecutiveFailures: 3,
      performanceThresholds: {
        maxMemoryUsage: 512, // 512MB
        maxCpuUsage: 80, // 80%
        maxNetworkLatency: 5000, // 5 seconds
      }
    };

    // Initialize for known automations
    const knownAutomations = [
      'email-processing',
      'calendar-sync',
      'deadline-alerts',
      'task-creation',
      'document-processing',
      'workflow-orchestration'
    ];

    knownAutomations.forEach(id => {
      this.thresholds.set(id, { ...defaultThresholds, automationId: id });
    });
  }

  private startHealthChecking() {
    // Run health checks every 5 minutes
    setInterval(() => {
      this.runHealthChecks();
    }, 5 * 60 * 1000);
  }

  // Event Logging
  logEvent(event: Omit<AutomationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: AutomationEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };

    // Store event
    const automationEvents = this.events.get(event.automationId) || [];
    automationEvents.push(fullEvent);
    
    // Keep only last 1000 events per automation
    if (automationEvents.length > 1000) {
      automationEvents.splice(0, automationEvents.length - 1000);
    }
    
    this.events.set(event.automationId, automationEvents);

    // Update metrics
    this.updateMetrics(event.automationId, fullEvent);

    // Check for alerts
    this.checkForAlerts(event.automationId, fullEvent);

    // Notify subscribers
    this.notifySubscribers(event.automationId, fullEvent);
  }

  // Metrics Management
  private updateMetrics(automationId: string, event: AutomationEvent): void {
    const current = this.metrics.get(automationId) || this.createEmptyMetrics(automationId);
    
    current.totalExecutions++;
    current.lastExecuted = event.timestamp;

    if (event.eventType === 'completed') {
      if (event.status === 'success') {
        current.successfulExecutions++;
        current.lastSuccess = event.timestamp;
      } else {
        current.failedExecutions++;
        current.lastFailure = event.timestamp;
      }

      if (event.duration) {
        current.totalExecutionTime += event.duration;
        current.averageExecutionTime = current.totalExecutionTime / current.totalExecutions;
      }
    }

    if (event.eventType === 'failed') {
      current.errorCount++;
      current.failedExecutions++;
      current.lastFailure = event.timestamp;
    }

    if (event.status === 'warning') {
      current.warningCount++;
    }

    if (event.retryCount) {
      current.retryCount += event.retryCount;
    }

    // Calculate success rate
    current.successRate = current.totalExecutions > 0 
      ? (current.successfulExecutions / current.totalExecutions) * 100 
      : 0;

    // Update health status
    current.health = this.calculateHealth(current);

    this.metrics.set(automationId, current);
  }

  private createEmptyMetrics(automationId: string): AutomationMetrics {
    return {
      automationId,
      automationName: automationId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastExecuted: null,
      lastSuccess: null,
      lastFailure: null,
      totalExecutionTime: 0,
      currentStatus: 'idle',
      errorCount: 0,
      warningCount: 0,
      retryCount: 0,
      uptime: 100,
      health: 'unknown'
    };
  }

  private calculateHealth(metrics: AutomationMetrics): 'healthy' | 'degraded' | 'critical' | 'unknown' {
    const thresholds = this.thresholds.get(metrics.automationId);
    if (!thresholds) return 'unknown';

    if (metrics.successRate < thresholds.minSuccessRate - 20) return 'critical';
    if (metrics.successRate < thresholds.minSuccessRate) return 'degraded';
    if (metrics.errorCount > thresholds.maxRetryCount * 2) return 'degraded';
    
    return 'healthy';
  }

  // Alert Management
  private checkForAlerts(automationId: string, event: AutomationEvent): void {
    const thresholds = this.thresholds.get(automationId);
    if (!thresholds) return;

    const metrics = this.metrics.get(automationId);
    if (!metrics) return;

    // Check for consecutive failures
    if (event.eventType === 'failed') {
      const recentEvents = this.getRecentEvents(automationId, 10);
      const consecutiveFailures = this.countConsecutiveFailures(recentEvents);
      
      if (consecutiveFailures >= thresholds.alertOnConsecutiveFailures) {
        this.createAlert(automationId, {
          severity: 'high',
          type: 'failure',
          title: 'Consecutive Failures Detected',
          description: `Automation has failed ${consecutiveFailures} times in a row`,
          metadata: { consecutiveFailures, threshold: thresholds.alertOnConsecutiveFailures }
        });
      }
    }

    // Check execution time threshold
    if (event.duration && event.duration > thresholds.maxExecutionTime) {
      this.createAlert(automationId, {
        severity: 'medium',
        type: 'performance',
        title: 'Execution Time Exceeded',
        description: `Execution took ${Math.round(event.duration / 1000)}s (threshold: ${Math.round(thresholds.maxExecutionTime / 1000)}s)`,
        metadata: { duration: event.duration, threshold: thresholds.maxExecutionTime }
      });
    }

    // Check success rate threshold
    if (metrics.successRate < thresholds.minSuccessRate && metrics.totalExecutions >= 10) {
      this.createAlert(automationId, {
        severity: 'high',
        type: 'performance',
        title: 'Low Success Rate',
        description: `Success rate (${metrics.successRate.toFixed(1)}%) below threshold (${thresholds.minSuccessRate}%)`,
        metadata: { successRate: metrics.successRate, threshold: thresholds.minSuccessRate }
      });
    }
  }

  private createAlert(automationId: string, alertData: Omit<AutomationAlert, 'id' | 'automationId' | 'timestamp' | 'isResolved'>): void {
    const alert: AutomationAlert = {
      ...alertData,
      id: this.generateId(),
      automationId,
      timestamp: new Date(),
      isResolved: false
    };

    const automationAlerts = this.alerts.get(automationId) || [];
    automationAlerts.push(alert);
    this.alerts.set(automationId, automationAlerts);
  }

  private countConsecutiveFailures(events: AutomationEvent[]): number {
    let count = 0;
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].eventType === 'failed' || events[i].status === 'failure') {
        count++;
      } else if (events[i].eventType === 'completed' && events[i].status === 'success') {
        break;
      }
    }
    return count;
  }

  // Health Checking
  private runHealthChecks(): void {
    for (const [automationId] of this.metrics) {
      this.performHealthCheck(automationId);
    }
  }

  private performHealthCheck(automationId: string): void {
    const metrics = this.metrics.get(automationId);
    const thresholds = this.thresholds.get(automationId);
    
    if (!metrics || !thresholds) return;

    const healthCheck: AutomationHealthCheck = {
      automationId,
      timestamp: new Date(),
      overallHealth: 'healthy',
      checks: {
        connectivity: true,
        performance: metrics.averageExecutionTime < thresholds.maxExecutionTime,
        errorRate: metrics.successRate >= thresholds.minSuccessRate,
        dependencies: this.checkDependencies(automationId),
        resources: true // Would check actual resource usage
      },
      score: 0,
      recommendations: [],
      nextCheckAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };

    // Calculate health score
    const checkResults = Object.values(healthCheck.checks);
    healthCheck.score = Math.round((checkResults.filter(Boolean).length / checkResults.length) * 100);

    // Determine overall health
    if (healthCheck.score >= 80) {
      healthCheck.overallHealth = 'healthy';
    } else if (healthCheck.score >= 60) {
      healthCheck.overallHealth = 'degraded';
    } else {
      healthCheck.overallHealth = 'critical';
    }

    // Generate recommendations
    if (!healthCheck.checks.performance) {
      healthCheck.recommendations.push('Consider optimizing execution performance');
    }
    if (!healthCheck.checks.errorRate) {
      healthCheck.recommendations.push('Investigate and fix recurring errors');
    }
    if (!healthCheck.checks.dependencies) {
      healthCheck.recommendations.push('Check external service dependencies');
    }

    this.healthChecks.set(automationId, healthCheck);
  }

  private checkDependencies(automationId: string): boolean {
    // In a real implementation, this would check external dependencies
    // For now, return true
    return true;
  }

  // Performance Tracking
  recordPerformanceData(automationId: string, data: Omit<AutomationPerformanceData, 'automationId' | 'timestamp'>): void {
    const performanceEntry: AutomationPerformanceData = {
      ...data,
      automationId,
      timestamp: new Date()
    };

    const automationPerformance = this.performanceData.get(automationId) || [];
    automationPerformance.push(performanceEntry);
    
    // Keep only last 1000 performance entries
    if (automationPerformance.length > 1000) {
      automationPerformance.splice(0, automationPerformance.length - 1000);
    }
    
    this.performanceData.set(automationId, automationPerformance);
  }

  // Subscription Management
  subscribe(automationId: string, callback: (event: AutomationEvent) => void): () => void {
    const callbacks = this.subscribers.get(automationId) || [];
    callbacks.push(callback);
    this.subscribers.set(automationId, callbacks);

    // Return unsubscribe function
    return () => {
      const updatedCallbacks = this.subscribers.get(automationId) || [];
      const index = updatedCallbacks.indexOf(callback);
      if (index > -1) {
        updatedCallbacks.splice(index, 1);
        this.subscribers.set(automationId, updatedCallbacks);
      }
    };
  }

  private notifySubscribers(automationId: string, event: AutomationEvent): void {
    const callbacks = this.subscribers.get(automationId) || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in automation monitoring subscriber:', error);
      }
    });
  }

  // Data Retrieval Methods
  getMetrics(automationId?: string): AutomationMetrics[] {
    if (automationId) {
      const metrics = this.metrics.get(automationId);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.metrics.values());
  }

  getEvents(automationId: string, limit?: number): AutomationEvent[] {
    const events = this.events.get(automationId) || [];
    if (limit) {
      return events.slice(-limit);
    }
    return events;
  }

  getRecentEvents(automationId: string, minutes: number = 60): AutomationEvent[] {
    const events = this.events.get(automationId) || [];
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return events.filter(event => event.timestamp >= cutoff);
  }

  getAlerts(automationId?: string, unresolved = false): AutomationAlert[] {
    let allAlerts: AutomationAlert[] = [];
    
    if (automationId) {
      allAlerts = this.alerts.get(automationId) || [];
    } else {
      for (const alerts of this.alerts.values()) {
        allAlerts.push(...alerts);
      }
    }

    if (unresolved) {
      allAlerts = allAlerts.filter(alert => !alert.isResolved);
    }

    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getHealthChecks(): AutomationHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  getPerformanceData(automationId: string, hours: number = 24): AutomationPerformanceData[] {
    const data = this.performanceData.get(automationId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return data.filter(entry => entry.timestamp >= cutoff);
  }

  // Alert Management Methods
  acknowledgeAlert(alertId: string): void {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledgedAt = new Date();
        break;
      }
    }
  }

  resolveAlert(alertId: string): void {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isResolved = true;
        alert.resolvedAt = new Date();
        break;
      }
    }
  }

  // Configuration Methods
  setThresholds(automationId: string, thresholds: Partial<MonitoringThresholds>): void {
    const existing = this.thresholds.get(automationId) || this.createDefaultThresholds(automationId);
    this.thresholds.set(automationId, { ...existing, ...thresholds });
  }

  private createDefaultThresholds(automationId: string): MonitoringThresholds {
    return {
      automationId,
      maxExecutionTime: 300000,
      minSuccessRate: 95,
      maxErrorRate: 5,
      maxRetryCount: 3,
      alertOnConsecutiveFailures: 3,
      performanceThresholds: {
        maxMemoryUsage: 512,
        maxCpuUsage: 80,
        maxNetworkLatency: 5000,
      }
    };
  }

  // Utility Methods
  private generateId(): string {
    return `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Dashboard Data
  getDashboardData(): {
    overview: {
      totalAutomations: number;
      healthyAutomations: number;
      activeAlerts: number;
      averageSuccessRate: number;
    };
    topIssues: AutomationAlert[];
    performanceTrends: { automationId: string; trend: 'up' | 'down' | 'stable' }[];
    healthStatus: { automationId: string; health: string; score: number }[];
  } {
    const allMetrics = this.getMetrics();
    const activeAlerts = this.getAlerts(undefined, true);
    
    const overview = {
      totalAutomations: allMetrics.length,
      healthyAutomations: allMetrics.filter(m => m.health === 'healthy').length,
      activeAlerts: activeAlerts.length,
      averageSuccessRate: allMetrics.reduce((sum, m) => sum + m.successRate, 0) / (allMetrics.length || 1)
    };

    const topIssues = activeAlerts
      .filter(alert => alert.severity === 'high' || alert.severity === 'critical')
      .slice(0, 5);

    const healthStatus = Array.from(this.healthChecks.values()).map(hc => ({
      automationId: hc.automationId,
      health: hc.overallHealth,
      score: hc.score
    }));

    return {
      overview,
      topIssues,
      performanceTrends: [], // Would calculate actual trends
      healthStatus
    };
  }
}

// Singleton instance
export const automationMonitoringFramework = new AutomationMonitoringFramework();

// React Hook for monitoring data
export function useAutomationMonitoring() {
  const [dashboardData, setDashboardData] = React.useState(automationMonitoringFramework.getDashboardData());
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const updateData = () => {
      setDashboardData(automationMonitoringFramework.getDashboardData());
    };

    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = React.useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDashboardData(automationMonitoringFramework.getDashboardData());
      setIsLoading(false);
    }, 500);
  }, []);

  return {
    dashboardData,
    isLoading,
    refreshData,
    framework: automationMonitoringFramework
  };
}

// Initialize with some sample data
export function initializeSampleMonitoringData() {
  const framework = automationMonitoringFramework;
  
  // Sample automations
  const automations = [
    'email-processing',
    'calendar-sync', 
    'deadline-alerts',
    'task-creation',
    'document-processing',
    'workflow-orchestration'
  ];

  automations.forEach(automationId => {
    // Log some sample events
    framework.logEvent({
      automationId,
      eventType: 'started',
      status: 'info',
      message: 'Automation started'
    });

    framework.logEvent({
      automationId,
      eventType: 'completed',
      status: 'success',
      message: 'Automation completed successfully',
      duration: Math.random() * 10000 + 1000
    });

    // Log some performance data
    framework.recordPerformanceData(automationId, {
      executionTime: Math.random() * 5000 + 500,
      memoryUsage: Math.random() * 200 + 50,
      cpuUsage: Math.random() * 50 + 10
    });
  });

  // Create a sample alert
  framework.logEvent({
    automationId: 'email-processing',
    eventType: 'failed',
    status: 'failure',
    message: 'Failed to connect to email server',
    error: 'Connection timeout'
  });
}

export default automationMonitoringFramework;
