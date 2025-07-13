// Database Types for Workflow Automation and Real-Time Intelligence
// Generated from workflow-automation-schema.sql

export interface WorkflowAutomationLog {
  id?: number;
  workflow_id: string;
  workflow_name: string;
  trigger_type: 'calendar_event' | 'deadline_alert' | 'email_received' | 'manual' | 'scheduled';
  trigger_data?: string; // JSON string
  
  // Execution details
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: Date;
  completed_at?: Date;
  execution_time_ms?: number;
  
  // Results and actions
  actions_executed?: string; // JSON string
  success_count: number;
  failure_count: number;
  
  // Error handling
  error_message?: string;
  error_details?: string; // JSON string
  retry_count: number;
  max_retries: number;
  
  // Context and metadata
  user_id?: string;
  entity_type?: 'task' | 'case' | 'deadline' | 'calendar_event';
  entity_id?: string;
  context_data?: string; // JSON string
  
  // AI insights
  ai_confidence_score?: number;
  ai_reasoning?: string;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface RealTimeMetric {
  id?: number;
  metric_type: 'productivity' | 'workload' | 'deadline_risk' | 'case_velocity' | 'efficiency';
  metric_name: string;
  metric_value: number;
  metric_unit?: 'percentage' | 'hours' | 'count' | 'score';
  
  // Time series data
  timestamp?: Date;
  time_bucket?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // Context and filtering
  user_id?: string;
  entity_type?: 'task' | 'case' | 'user' | 'system';
  entity_id?: string;
  category?: string;
  subcategory?: string;
  
  // Additional data
  metadata?: string; // JSON string
  calculation_method?: string;
  data_source?: 'ai_analysis' | 'user_action' | 'system_calculation' | 'external_api';
  
  // Quality indicators
  confidence_level?: number;
  is_anomaly: boolean;
  trend_direction?: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  
  created_at?: Date;
}

export interface MobileSyncStatus {
  id?: number;
  user_id: string;
  device_id: string;
  device_type?: 'ios' | 'android' | 'web';
  
  // Sync status
  last_sync_at?: Date;
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed';
  sync_direction?: 'up' | 'down' | 'bidirectional';
  
  // Data tracking
  entities_to_sync?: string; // JSON string
  synced_entities?: string; // JSON string
  failed_entities?: string; // JSON string
  
  // Performance metrics
  sync_duration_ms?: number;
  data_size_bytes?: number;
  bandwidth_used_kb?: number;
  
  // Conflict resolution
  conflicts_detected: number;
  conflicts_resolved: number;
  conflict_resolution_strategy?: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  
  // Error handling
  error_message?: string;
  error_code?: string;
  retry_count: number;
  
  // Network conditions
  network_type?: 'wifi' | 'cellular' | 'offline';
  network_quality?: 'excellent' | 'good' | 'poor' | 'very_poor';
  
  created_at?: Date;
  updated_at?: Date;
}

export interface BackgroundJob {
  id?: number;
  job_type: 'ai_analysis' | 'email_parsing' | 'deadline_calculation' | 'sync' | 'automation';
  job_name: string;
  priority: number; // 1 (highest) to 10 (lowest)
  
  // Job data
  payload?: string; // JSON string
  context?: string; // JSON string
  
  // Scheduling
  scheduled_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  expires_at?: Date;
  
  // Status tracking
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'expired';
  attempts: number;
  max_attempts: number;
  
  // Progress tracking
  progress_percentage: number;
  current_step?: string;
  total_steps?: number;
  
  // Results and errors
  result?: string; // JSON string
  error_message?: string;
  error_details?: string;
  
  // Dependencies
  depends_on_job_id?: number;
  blocks_job_ids?: string; // JSON string
  
  // Performance
  estimated_duration_ms?: number;
  actual_duration_ms?: number;
  
  // Metadata
  user_id?: string;
  created_by?: 'system' | 'user' | 'automation';
  
  created_at?: Date;
  updated_at?: Date;
}

export interface PushNotification {
  id?: number;
  user_id: string;
  device_tokens?: string; // JSON string
  
  // Notification content
  title: string;
  body: string;
  icon?: string;
  badge_count?: number;
  sound?: string;
  
  // Delivery settings
  priority: 'low' | 'normal' | 'high' | 'critical';
  category?: 'deadline' | 'task' | 'case' | 'emergency' | 'system';
  
  // Scheduling
  scheduled_at?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  
  // Status tracking
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  delivery_attempts: number;
  max_attempts: number;
  
  // Content data
  action_url?: string;
  action_data?: string; // JSON string
  custom_data?: string; // JSON string
  
  // Analytics
  click_through_rate?: number;
  engagement_score?: number;
  
  // Error handling
  error_message?: string;
  error_code?: string;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface PerformanceMetric {
  id?: number;
  metric_type: 'api_response_time' | 'database_query' | 'ai_processing' | 'ui_render';
  component: string;
  operation?: string;
  
  // Performance data
  duration_ms: number;
  memory_usage_mb?: number;
  cpu_usage_percentage?: number;
  
  // Context
  user_id?: string;
  session_id?: string;
  request_id?: string;
  
  // Additional metrics
  success: boolean;
  error_message?: string;
  metadata?: string; // JSON string
  
  // Environment
  environment?: 'development' | 'staging' | 'production';
  version?: string;
  device_type?: string;
  browser_type?: string;
  
  timestamp?: Date;
}

// Utility types for API responses
export interface WorkflowExecutionResult {
  workflow_id: string;
  status: 'success' | 'error' | 'partial';
  execution_time_ms: number;
  actions_completed: number;
  actions_failed: number;
  error_message?: string;
}

export interface MetricsSummary {
  metric_type: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  anomaly_detected: boolean;
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  conflicts_count: number;
  duration_ms: number;
  error_message?: string;
}

// Database query filters
export interface WorkflowLogFilter {
  workflow_id?: string;
  status?: WorkflowAutomationLog['status'];
  user_id?: string;
  entity_type?: WorkflowAutomationLog['entity_type'];
  entity_id?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface MetricsFilter {
  metric_type?: RealTimeMetric['metric_type'];
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  start_date?: Date;
  end_date?: Date;
  time_bucket?: RealTimeMetric['time_bucket'];
}

export interface JobFilter {
  job_type?: BackgroundJob['job_type'];
  status?: BackgroundJob['status'];
  user_id?: string;
  priority_min?: number;
  priority_max?: number;
}
