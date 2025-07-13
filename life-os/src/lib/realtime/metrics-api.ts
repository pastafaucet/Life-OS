// Real-Time Metrics API for Live Dashboards
// Note: This API uses localStorage directly since it's not a React component

export interface LiveDeadline {
  id: string;
  title: string;
  dueDate: Date;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'urgent' | 'warning' | 'normal' | 'overdue';
  category: string;
  associatedCase?: string;
  progressPercentage: number;
}

export interface CaseVelocity {
  caseId: string;
  title: string;
  expectedDuration: number; // days
  actualDuration: number; // days
  velocityRatio: number; // actual/expected
  status: 'ahead' | 'on-track' | 'behind' | 'critical';
  milestones: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface ProductivityMetrics {
  today: {
    tasksCompleted: number;
    hoursWorked: number;
    efficiency: number; // 0-100
    focusTime: number; // minutes
  };
  thisWeek: {
    tasksCompleted: number;
    hoursWorked: number;
    efficiency: number;
    averageDailyTasks: number;
  };
  trends: {
    efficiency: Array<{ date: string; value: number }>;
    tasksPerDay: Array<{ date: string; value: number }>;
    focusTime: Array<{ date: string; value: number }>;
  };
}

export interface WorkloadCapacity {
  current: number; // 0-100
  optimal: number; // 0-100
  peak: number; // 0-100
  status: 'underutilized' | 'optimal' | 'near-capacity' | 'overloaded';
  recommendations: string[];
  breakdown: {
    legal: number;
    tasks: number;
    mcle: number;
    administrative: number;
  };
}

export interface PerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number; // percentage
  trend: 'improving' | 'stable' | 'declining';
  period: string;
}

class RealTimeMetricsAPI {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: any) => void> = [];

  constructor() {
    this.startRealTimeUpdates();
  }

  private getStoredData() {
    // Get data from localStorage for server-side usage
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('life-os-data') : null;
    return storedData ? JSON.parse(storedData) : { legalCases: [], tasks: [] };
  }

  // Live Deadline Countdown
  async getLiveDeadlines(): Promise<LiveDeadline[]> {
    const { legalCases } = this.getStoredData();
    const now = new Date();
    
    const deadlines: LiveDeadline[] = [];
    
    // Process legal case deadlines
    legalCases.forEach((case_: any) => {
      case_.deadlines?.forEach((deadline: any) => {
        const dueDate = new Date(deadline.date);
        const timeRemaining = this.calculateTimeRemaining(dueDate, now);
        
        if (timeRemaining.totalMs > -86400000) { // Show up to 1 day overdue
          deadlines.push({
            id: `${case_.id}-${deadline.type}`,
            title: `${deadline.type} - ${case_.title}`,
            dueDate,
            timeRemaining,
            priority: this.calculatePriority(timeRemaining, deadline.type),
            status: this.calculateStatus(timeRemaining),
            category: 'Legal',
            associatedCase: case_.id,
            progressPercentage: this.calculateProgress(case_, deadline)
          });
        }
      });
    });

    // Sort by urgency (least time remaining first)
    return deadlines.sort((a, b) => a.timeRemaining.totalMs - b.timeRemaining.totalMs);
  }

  // Case Velocity Tracking
  async getCaseVelocity(): Promise<CaseVelocity[]> {
    const { legalCases } = this.getStoredData();
    
    return legalCases.map((case_: any) => {
      const createdDate = new Date(case_.dateCreated);
      const actualDuration = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedDuration = this.getExpectedDuration(case_.type);
      const velocityRatio = actualDuration / expectedDuration;
      
      const milestones = this.calculateMilestones(case_);
      
      return {
        caseId: case_.id,
        title: case_.title,
        expectedDuration,
        actualDuration,
        velocityRatio,
        status: this.getVelocityStatus(velocityRatio, milestones.percentage),
        milestones
      };
    });
  }

  // Productivity Metrics
  async getProductivityMetrics(): Promise<ProductivityMetrics> {
    const { tasks } = this.getStoredData();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Today's metrics
    const todayTasks = tasks.filter((task: any) => {
      const completedDate = task.completed ? new Date(task.dateCreated) : null;
      return completedDate && completedDate >= today;
    });
    
    // This week's metrics
    const weekTasks = tasks.filter((task: any) => {
      const completedDate = task.completed ? new Date(task.dateCreated) : null;
      return completedDate && completedDate >= weekAgo;
    });
    
    // Generate trend data (last 30 days)
    const trends = this.generateTrendData(tasks, 30);
    
    return {
      today: {
        tasksCompleted: todayTasks.length,
        hoursWorked: this.calculateHoursWorked(todayTasks),
        efficiency: this.calculateEfficiency(todayTasks),
        focusTime: this.calculateFocusTime(todayTasks)
      },
      thisWeek: {
        tasksCompleted: weekTasks.length,
        hoursWorked: this.calculateHoursWorked(weekTasks),
        efficiency: this.calculateEfficiency(weekTasks),
        averageDailyTasks: weekTasks.length / 7
      },
      trends
    };
  }

  // Workload Capacity Monitoring
  async getWorkloadCapacity(): Promise<WorkloadCapacity> {
    const { tasks, legalCases } = this.getStoredData();
    
    const activeTasks = tasks.filter((task: any) => !task.completed);
    const activeCases = legalCases.filter((case_: any) => case_.status !== 'Closed');
    
    // Calculate workload based on various factors
    const legalLoad = activeCases.length * 10; // Weight legal cases higher
    const taskLoad = activeTasks.length * 2;
    const urgentDeadlines = await this.getLiveDeadlines();
    const deadlineLoad = urgentDeadlines.filter(d => d.status === 'urgent').length * 15;
    
    const totalLoad = legalLoad + taskLoad + deadlineLoad;
    const maxCapacity = 100; // Configurable based on user preferences
    const current = Math.min((totalLoad / maxCapacity) * 100, 100);
    
    const status = current < 50 ? 'underutilized' :
                  current < 75 ? 'optimal' :
                  current < 90 ? 'near-capacity' : 'overloaded';
    
    return {
      current,
      optimal: 70,
      peak: 90,
      status,
      recommendations: this.generateCapacityRecommendations(current, status),
      breakdown: {
        legal: (legalLoad / totalLoad) * current,
        tasks: (taskLoad / totalLoad) * current,
        mcle: 5, // Estimated MCLE workload
        administrative: 10 // Estimated admin workload
      }
    };
  }

  // Performance Trend Analysis
  async getPerformanceTrends(): Promise<PerformanceTrend[]> {
    const currentMetrics = await this.getProductivityMetrics();
    
    // This would typically compare with historical data
    // For now, we'll simulate some trends
    return [
      {
        metric: 'Task Completion Rate',
        current: currentMetrics.today.tasksCompleted,
        previous: currentMetrics.today.tasksCompleted - 2,
        change: 15.5,
        trend: 'improving',
        period: 'vs yesterday'
      },
      {
        metric: 'Efficiency Score',
        current: currentMetrics.today.efficiency,
        previous: currentMetrics.today.efficiency - 5,
        change: 7.2,
        trend: 'improving',
        period: 'vs last week'
      },
      {
        metric: 'Focus Time',
        current: currentMetrics.today.focusTime,
        previous: currentMetrics.today.focusTime + 30,
        change: -12.3,
        trend: 'declining',
        period: 'vs yesterday'
      }
    ];
  }

  // Real-time updates
  startRealTimeUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.notifySubscribers();
    }, 10000); // Update every 10 seconds
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private async notifySubscribers() {
    const data = {
      deadlines: await this.getLiveDeadlines(),
      productivity: await this.getProductivityMetrics(),
      workload: await this.getWorkloadCapacity(),
      timestamp: new Date().toISOString()
    };
    
    this.subscribers.forEach(callback => callback(data));
  }

  // Helper methods
  private calculateTimeRemaining(dueDate: Date, now: Date) {
    const totalMs = dueDate.getTime() - now.getTime();
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, totalMs };
  }

  private calculatePriority(timeRemaining: any, deadlineType: string): 'critical' | 'high' | 'medium' | 'low' {
    const days = timeRemaining.days;
    
    if (days < 0) return 'critical';
    if (days <= 1) return 'critical';
    if (days <= 7) return 'high';
    if (days <= 30) return 'medium';
    return 'low';
  }

  private calculateStatus(timeRemaining: any): 'urgent' | 'warning' | 'normal' | 'overdue' {
    const days = timeRemaining.days;
    
    if (days < 0) return 'overdue';
    if (days <= 1) return 'urgent';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  private calculateProgress(case_: any, deadline: any): number {
    // Simplified progress calculation
    const totalTasks = case_.relatedItems?.length || 1;
    const completedTasks = case_.relatedItems?.filter((item: any) => item.completed)?.length || 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  private getExpectedDuration(caseType: string): number {
    // Expected duration in days based on case type
    const durations: Record<string, number> = {
      'Personal Injury': 180,
      'Contract Dispute': 90,
      'Family Law': 120,
      'Criminal Defense': 60,
      'Real Estate': 45,
      'Corporate': 120,
      'Immigration': 90,
      'Bankruptcy': 150
    };
    
    return durations[caseType] || 90;
  }

  private getVelocityStatus(ratio: number, milestonesPercent: number): 'ahead' | 'on-track' | 'behind' | 'critical' {
    if (ratio <= 0.8 && milestonesPercent >= 60) return 'ahead';
    if (ratio <= 1.2 && milestonesPercent >= 40) return 'on-track';
    if (ratio <= 1.5) return 'behind';
    return 'critical';
  }

  private calculateMilestones(case_: any) {
    const total = 5; // Standard milestones: filed, discovery, depositions, trial prep, resolution
    const completed = Math.floor(Math.random() * total); // Simplified for demo
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }

  private calculateHoursWorked(tasks: any[]): number {
    // Estimate based on task complexity and completion
    return tasks.reduce((total, task) => {
      const complexity = task.aiEnhancement?.complexity || 'medium';
      const hours = complexity === 'high' ? 2 : complexity === 'medium' ? 1 : 0.5;
      return total + hours;
    }, 0);
  }

  private calculateEfficiency(tasks: any[]): number {
    if (tasks.length === 0) return 0;
    
    // Simplified efficiency calculation
    const completedOnTime = tasks.filter((task: any) => {
      const estimated = task.aiEnhancement?.estimatedTime || 60;
      const actual = Math.random() * 120; // Simplified
      return actual <= estimated * 1.2;
    }).length;
    
    return Math.round((completedOnTime / tasks.length) * 100);
  }

  private calculateFocusTime(tasks: any[]): number {
    // Estimate focus time in minutes
    return tasks.length * 25; // Pomodoro-style estimation
  }

  private generateTrendData(tasks: any[], days: number) {
    const trends = {
      efficiency: [] as Array<{ date: string; value: number }>,
      tasksPerDay: [] as Array<{ date: string; value: number }>,
      focusTime: [] as Array<{ date: string; value: number }>
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate trend data
      trends.efficiency.push({
        date: dateStr,
        value: 70 + Math.random() * 30
      });
      
      trends.tasksPerDay.push({
        date: dateStr,
        value: Math.floor(Math.random() * 10) + 2
      });
      
      trends.focusTime.push({
        date: dateStr,
        value: Math.floor(Math.random() * 200) + 100
      });
    }
    
    return trends;
  }

  private generateCapacityRecommendations(current: number, status: string): string[] {
    const recommendations = [];
    
    if (status === 'overloaded') {
      recommendations.push('Consider delegating less critical tasks');
      recommendations.push('Reschedule non-urgent deadlines');
      recommendations.push('Focus on high-priority cases only');
    } else if (status === 'near-capacity') {
      recommendations.push('Monitor workload closely');
      recommendations.push('Prepare contingency plans for urgent items');
    } else if (status === 'underutilized') {
      recommendations.push('Consider taking on additional cases');
      recommendations.push('Focus on skill development or training');
      recommendations.push('Optimize processes for future capacity');
    }
    
    return recommendations;
  }
}

export const realTimeMetricsAPI = new RealTimeMetricsAPI();
