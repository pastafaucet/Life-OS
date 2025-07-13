// Database Access Functions for Workflow Automation and Real-Time Intelligence
// Browser-compatible version using mock data

import { 
  WorkflowAutomationLog, 
  RealTimeMetric, 
  MobileSyncStatus, 
  BackgroundJob, 
  PushNotification, 
  PerformanceMetric,
  WorkflowLogFilter,
  MetricsFilter,
  JobFilter,
  WorkflowExecutionResult,
  MetricsSummary,
  SyncResult
} from './types';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

class WorkflowAutomationDatabase {
  private mockData: {
    workflowLogs: WorkflowAutomationLog[];
    realTimeMetrics: RealTimeMetric[];
    mobileSyncStatus: MobileSyncStatus[];
    backgroundJobs: BackgroundJob[];
    pushNotifications: PushNotification[];
    performanceMetrics: PerformanceMetric[];
  };

  constructor(dbPath?: string) {
    // Initialize with mock data for browser compatibility
    this.mockData = {
      workflowLogs: [],
      realTimeMetrics: [],
      mobileSyncStatus: [],
      backgroundJobs: [],
      pushNotifications: [],
      performanceMetrics: []
    };
    
    this.initializeDatabase();
    console.log('📱 Workflow automation database initialized with mock data for browser compatibility');
  }

  private initializeDatabase() {
    if (isBrowser) {
      // Generate some sample data for demo purposes
      this.generateSampleData();
      console.log('🎨 Sample data generated for Tesla UI demonstration');
    } else {
      console.log('🚀 Server environment detected - would initialize real database');
    }
  }

  private generateSampleData() {
    // Generate sample workflow logs
    const sampleWorkflowLogs: WorkflowAutomationLog[] = [
      {
        id: 1,
        workflow_id: 'email-task-creation',
        workflow_name: 'Email to Task Conversion',
        trigger_type: 'email_received',
        trigger_data: JSON.stringify({ sender: 'client@example.com', subject: 'Urgent: Case Update Needed' }),
        status: 'completed',
        started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        execution_time_ms: 60000,
        actions_executed: 3,
        success_count: 3,
        failure_count: 0,
        error_message: null,
        error_details: null,
        retry_count: 0,
        max_retries: 3,
        user_id: 'user123',
        entity_type: 'email',
        entity_id: 'email_001',
        context_data: JSON.stringify({ priority: 'high' }),
        ai_confidence_score: 0.92,
        ai_reasoning: 'High confidence email classification based on urgency keywords',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        workflow_id: 'deadline-alert',
        workflow_name: 'Deadline Alert System',
        trigger_type: 'schedule',
        trigger_data: JSON.stringify({ cron: '0 9 * * *' }),
        status: 'running',
        started_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        completed_at: null,
        execution_time_ms: null,
        actions_executed: 1,
        success_count: 1,
        failure_count: 0,
        error_message: null,
        error_details: null,
        retry_count: 0,
        max_retries: 3,
        user_id: 'user123',
        entity_type: 'deadline',
        entity_id: 'deadline_003',
        context_data: JSON.stringify({ case: 'Johnson v. State' }),
        ai_confidence_score: 0.88,
        ai_reasoning: 'Scheduled deadline check with high priority case',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ];

    // Generate sample real-time metrics
    const sampleMetrics: RealTimeMetric[] = [
      {
        id: 1,
        metric_type: 'productivity',
        metric_name: 'tasks_completed_today',
        metric_value: 8,
        metric_unit: 'count',
        timestamp: new Date().toISOString(),
        time_bucket: 'hour',
        user_id: 'user123',
        entity_type: 'task',
        entity_id: null,
        category: 'performance',
        subcategory: 'daily_productivity',
        metadata: JSON.stringify({ context: 'workday_progress' }),
        calculation_method: 'count',
        data_source: 'task_system',
        confidence_level: 'high',
        is_anomaly: false,
        trend_direction: 'increasing',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        metric_type: 'workload',
        metric_name: 'active_cases',
        metric_value: 12,
        metric_unit: 'count',
        timestamp: new Date().toISOString(),
        time_bucket: 'day',
        user_id: 'user123',
        entity_type: 'case',
        entity_id: null,
        category: 'capacity',
        subcategory: 'case_load',
        metadata: JSON.stringify({ priority_breakdown: { high: 3, medium: 6, low: 3 } }),
        calculation_method: 'count',
        data_source: 'case_system',
        confidence_level: 'high',
        is_anomaly: false,
        trend_direction: 'stable',
        created_at: new Date().toISOString()
      }
    ];

    this.mockData.workflowLogs = sampleWorkflowLogs;
    this.mockData.realTimeMetrics = sampleMetrics;
  }

  // Workflow Automation Logs
  createWorkflowLog(log: Omit<WorkflowAutomationLog, 'id' | 'created_at' | 'updated_at'>): number {
    const now = new Date().toISOString();
    const newLog: WorkflowAutomationLog = {
      ...log,
      id: this.mockData.workflowLogs.length + 1,
      created_at: now,
      updated_at: now
    };
    this.mockData.workflowLogs.push(newLog);
    return newLog.id;
  }

  updateWorkflowLog(id: number, updates: Partial<WorkflowAutomationLog>): boolean {
    const index = this.mockData.workflowLogs.findIndex(log => log.id === id);
    if (index === -1) return false;

    this.mockData.workflowLogs[index] = {
      ...this.mockData.workflowLogs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return true;
  }

  getWorkflowLogs(filter?: WorkflowLogFilter, limit = 50, offset = 0): WorkflowAutomationLog[] {
    let logs = [...this.mockData.workflowLogs];

    if (filter) {
      if (filter.workflow_id) {
        logs = logs.filter(log => log.workflow_id === filter.workflow_id);
      }
      if (filter.status) {
        logs = logs.filter(log => log.status === filter.status);
      }
      if (filter.user_id) {
        logs = logs.filter(log => log.user_id === filter.user_id);
      }
      if (filter.entity_type) {
        logs = logs.filter(log => log.entity_type === filter.entity_type);
      }
      if (filter.entity_id) {
        logs = logs.filter(log => log.entity_id === filter.entity_id);
      }
      if (filter.start_date) {
        logs = logs.filter(log => new Date(log.created_at) >= filter.start_date!);
      }
      if (filter.end_date) {
        logs = logs.filter(log => new Date(log.created_at) <= filter.end_date!);
      }
    }

    return logs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
  }

  // Real-Time Metrics
  recordMetric(metric: Omit<RealTimeMetric, 'id' | 'created_at'>): number {
    const newMetric: RealTimeMetric = {
      ...metric,
      id: this.mockData.realTimeMetrics.length + 1,
      timestamp: metric.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    this.mockData.realTimeMetrics.push(newMetric);
    return newMetric.id;
  }

  getMetrics(filter?: MetricsFilter, limit = 100, offset = 0): RealTimeMetric[] {
    let metrics = [...this.mockData.realTimeMetrics];

    if (filter) {
      if (filter.metric_type) {
        metrics = metrics.filter(m => m.metric_type === filter.metric_type);
      }
      if (filter.user_id) {
        metrics = metrics.filter(m => m.user_id === filter.user_id);
      }
      if (filter.entity_type) {
        metrics = metrics.filter(m => m.entity_type === filter.entity_type);
      }
      if (filter.entity_id) {
        metrics = metrics.filter(m => m.entity_id === filter.entity_id);
      }
      if (filter.time_bucket) {
        metrics = metrics.filter(m => m.time_bucket === filter.time_bucket);
      }
      if (filter.start_date) {
        metrics = metrics.filter(m => new Date(m.timestamp) >= filter.start_date!);
      }
      if (filter.end_date) {
        metrics = metrics.filter(m => new Date(m.timestamp) <= filter.end_date!);
      }
    }

    return metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }

  getMetricsSummary(metricType: string, userId?: string): MetricsSummary[] {
    const metrics = this.mockData.realTimeMetrics
      .filter(m => m.metric_type === metricType && (!userId || m.user_id === userId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = [];
      }
      acc[metric.metric_name].push(metric);
      return acc;
    }, {} as Record<string, RealTimeMetric[]>);

    return Object.entries(grouped).map(([metricName, metricList]) => {
      const current = metricList[0];
      const previous = metricList[1];
      
      return {
        metric_type: metricName,
        current_value: current.metric_value,
        previous_value: previous?.metric_value || 0,
        change_percentage: previous ? 
          ((current.metric_value - previous.metric_value) / previous.metric_value) * 100 : 0,
        trend: current.trend_direction === 'increasing' ? 'up' : 
               current.trend_direction === 'decreasing' ? 'down' : 'stable',
        anomaly_detected: current.is_anomaly
      };
    });
  }

  // Background Jobs
  createJob(job: Omit<BackgroundJob, 'id' | 'created_at' | 'updated_at'>): number {
    const now = new Date().toISOString();
    const newJob: BackgroundJob = {
      ...job,
      id: this.mockData.backgroundJobs.length + 1,
      created_at: now,
      updated_at: now
    };
    this.mockData.backgroundJobs.push(newJob);
    return newJob.id;
  }

  updateJob(id: number, updates: Partial<BackgroundJob>): boolean {
    const index = this.mockData.backgroundJobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.mockData.backgroundJobs[index] = {
      ...this.mockData.backgroundJobs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return true;
  }

  getJobs(filter?: JobFilter, limit = 50, offset = 0): BackgroundJob[] {
    let jobs = [...this.mockData.backgroundJobs];

    if (filter) {
      if (filter.job_type) {
        jobs = jobs.filter(job => job.job_type === filter.job_type);
      }
      if (filter.status) {
        jobs = jobs.filter(job => job.status === filter.status);
      }
      if (filter.user_id) {
        jobs = jobs.filter(job => job.user_id === filter.user_id);
      }
      if (filter.priority_min) {
        jobs = jobs.filter(job => job.priority >= filter.priority_min!);
      }
      if (filter.priority_max) {
        jobs = jobs.filter(job => job.priority <= filter.priority_max!);
      }
    }

    return jobs
      .sort((a, b) => a.priority - b.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(offset, offset + limit);
  }

  getNextJob(): BackgroundJob | null {
    const now = new Date();
    const availableJobs = this.mockData.backgroundJobs.filter(job => 
      job.status === 'queued' &&
      (!job.scheduled_at || new Date(job.scheduled_at) <= now) &&
      (!job.expires_at || new Date(job.expires_at) > now)
    );

    if (availableJobs.length === 0) return null;

    return availableJobs.sort((a, b) => 
      a.priority - b.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
  }

  // Mobile Sync Status
  createSyncStatus(sync: Omit<MobileSyncStatus, 'id' | 'created_at' | 'updated_at'>): number {
    const now = new Date().toISOString();
    const newSync: MobileSyncStatus = {
      ...sync,
      id: this.mockData.mobileSyncStatus.length + 1,
      created_at: now,
      updated_at: now
    };
    this.mockData.mobileSyncStatus.push(newSync);
    return newSync.id;
  }

  updateSyncStatus(userId: string, deviceId: string, updates: Partial<MobileSyncStatus>): boolean {
    const index = this.mockData.mobileSyncStatus.findIndex(
      sync => sync.user_id === userId && sync.device_id === deviceId
    );
    if (index === -1) return false;

    this.mockData.mobileSyncStatus[index] = {
      ...this.mockData.mobileSyncStatus[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return true;
  }

  getSyncStatus(userId: string, deviceId?: string): MobileSyncStatus[] {
    return this.mockData.mobileSyncStatus
      .filter(sync => 
        sync.user_id === userId && (!deviceId || sync.device_id === deviceId)
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  // Performance Metrics
  recordPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): number {
    const newMetric: PerformanceMetric = {
      ...metric,
      id: this.mockData.performanceMetrics.length + 1,
      timestamp: new Date().toISOString()
    };
    this.mockData.performanceMetrics.push(newMetric);
    return newMetric.id;
  }

  getPerformanceMetrics(
    metricType?: string, 
    component?: string, 
    startDate?: Date, 
    endDate?: Date,
    limit = 100
  ): PerformanceMetric[] {
    let metrics = [...this.mockData.performanceMetrics];

    if (metricType) {
      metrics = metrics.filter(m => m.metric_type === metricType);
    }
    if (component) {
      metrics = metrics.filter(m => m.component === component);
    }
    if (startDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) >= startDate);
    }
    if (endDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) <= endDate);
    }

    return metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Utility methods
  cleanup(olderThanDays = 30): { deleted: number } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deleted = 0;

    // Clean up old completed workflow logs
    const initialWorkflowCount = this.mockData.workflowLogs.length;
    this.mockData.workflowLogs = this.mockData.workflowLogs.filter(log => 
      !(log.status === 'completed' && new Date(log.created_at) < cutoffDate)
    );
    deleted += initialWorkflowCount - this.mockData.workflowLogs.length;

    // Clean up old metrics
    const initialMetricsCount = this.mockData.realTimeMetrics.length;
    this.mockData.realTimeMetrics = this.mockData.realTimeMetrics.filter(metric => 
      new Date(metric.created_at) >= cutoffDate
    );
    deleted += initialMetricsCount - this.mockData.realTimeMetrics.length;

    // Clean up old performance metrics
    const initialPerfCount = this.mockData.performanceMetrics.length;
    this.mockData.performanceMetrics = this.mockData.performanceMetrics.filter(metric => 
      new Date(metric.timestamp) >= cutoffDate
    );
    deleted += initialPerfCount - this.mockData.performanceMetrics.length;

    return { deleted };
  }

  close(): void {
    console.log('📦 Mock database connection closed');
  }
}

// Export singleton instance
export const workflowDb = new WorkflowAutomationDatabase();
export default WorkflowAutomationDatabase;
