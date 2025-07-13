'use client';

import { useState, useEffect, useCallback } from 'react';

// Types for automation engine
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_created' | 'deadline_approaching' | 'case_status_change' | 'email_received' | 'calendar_event' | 'time_based' | 'manual';
    conditions: Record<string, any>;
    schedule?: string; // cron expression for time-based triggers
  };
  actions: AutomationAction[];
  enabled: boolean;
  priority: number;
  tags: string[];
  created_at: Date;
  last_executed?: Date;
  execution_count: number;
  success_rate: number;
}

interface AutomationAction {
  id: string;
  type: 'create_task' | 'send_email' | 'update_case' | 'set_reminder' | 'delegate_task' | 'block_calendar' | 'send_notification' | 'run_workflow';
  parameters: Record<string, any>;
  delay?: number; // seconds to wait before executing
  condition?: string; // conditional logic
}

interface AutomationExecution {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_data: Record<string, any>;
  actions_executed: {
    action_id: string;
    action_type: string;
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
    result?: any;
    error?: string;
    executed_at?: Date;
    duration_ms?: number;
  }[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: Date;
  completed_at?: Date;
  total_duration_ms?: number;
  metadata: Record<string, any>;
}

interface AutomationStats {
  total_rules: number;
  active_rules: number;
  total_executions_today: number;
  successful_executions_today: number;
  failed_executions_today: number;
  average_execution_time_ms: number;
  most_triggered_rules: {
    rule_id: string;
    rule_name: string;
    execution_count: number;
  }[];
  recent_failures: {
    rule_name: string;
    error: string;
    timestamp: Date;
  }[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'administrative' | 'client_communication' | 'case_management' | 'deadline_management';
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  estimated_duration_minutes: number;
  success_rate: number;
  usage_count: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'delay' | 'notification' | 'integration';
  parameters: Record<string, any>;
  next_step_id?: string;
  condition?: string;
  estimated_duration_minutes: number;
}

interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  required: boolean;
  default_value?: any;
  options?: string[];
  description: string;
}

class AutomationEngineAPI {
  private baseUrl = '/api/automation-engine';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes

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

  async getAutomationRules(): Promise<AutomationRule[]> {
    const cacheKey = 'automation-rules';
    const cached = this.getCachedData<AutomationRule[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockRules: AutomationRule[] = [
        {
          id: 'rule_1',
          name: 'Deadline Alert Cascade',
          description: 'Automatically create reminder tasks and block calendar time when deadlines approach',
          trigger: {
            type: 'deadline_approaching',
            conditions: {
              days_before: [30, 7, 1],
              case_types: ['litigation', 'filing']
            }
          },
          actions: [
            {
              id: 'action_1_1',
              type: 'create_task',
              parameters: {
                title: 'Deadline preparation for {case_name}',
                priority: 'high',
                estimated_hours: 4
              }
            },
            {
              id: 'action_1_2',
              type: 'block_calendar',
              parameters: {
                duration_hours: 4,
                preferred_time: '9:00 AM',
                buffer_days: 2
              },
              delay: 3600 // 1 hour after task creation
            }
          ],
          enabled: true,
          priority: 1,
          tags: ['deadlines', 'calendar', 'preparation'],
          created_at: new Date('2025-07-01'),
          last_executed: new Date('2025-07-12T10:00:00Z'),
          execution_count: 24,
          success_rate: 96
        },
        {
          id: 'rule_2',
          name: 'New Case Onboarding',
          description: 'Automatically create standard tasks and set up case structure when new cases are added',
          trigger: {
            type: 'case_status_change',
            conditions: {
              status: 'active',
              is_new_case: true
            }
          },
          actions: [
            {
              id: 'action_2_1',
              type: 'run_workflow',
              parameters: {
                workflow_template_id: 'onboarding_standard',
                case_id: '{case_id}',
                case_type: '{case_type}'
              }
            },
            {
              id: 'action_2_2',
              type: 'send_notification',
              parameters: {
                type: 'case_created',
                message: 'New case {case_name} has been set up with standard workflows'
              }
            }
          ],
          enabled: true,
          priority: 2,
          tags: ['onboarding', 'workflow', 'cases'],
          created_at: new Date('2025-06-15'),
          last_executed: new Date('2025-07-11T14:30:00Z'),
          execution_count: 8,
          success_rate: 100
        },
        {
          id: 'rule_3',
          name: 'Daily Focus Time Protection',
          description: 'Block daily focus time and set status to do not disturb',
          trigger: {
            type: 'time_based',
            conditions: {},
            schedule: '0 9 * * 1-5' // 9 AM weekdays
          },
          actions: [
            {
              id: 'action_3_1',
              type: 'block_calendar',
              parameters: {
                duration_hours: 2,
                title: 'Deep Work - Do Not Disturb',
                location: 'Focus Zone'
              }
            },
            {
              id: 'action_3_2',
              type: 'send_notification',
              parameters: {
                type: 'focus_time_starting',
                message: 'Focus time starting - notifications will be minimized'
              }
            }
          ],
          enabled: true,
          priority: 3,
          tags: ['focus', 'productivity', 'calendar'],
          created_at: new Date('2025-07-05'),
          last_executed: new Date('2025-07-12T09:00:00Z'),
          execution_count: 6,
          success_rate: 100
        }
      ];

      this.setCachedData(cacheKey, mockRules);
      return mockRules;
    } catch (error) {
      console.error('❌ Failed to get automation rules:', error);
      return [];
    }
  }

  async getAutomationExecutions(limit: number = 50): Promise<AutomationExecution[]> {
    const cacheKey = `automation-executions-${limit}`;
    const cached = this.getCachedData<AutomationExecution[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockExecutions: AutomationExecution[] = [
        {
          id: 'exec_1',
          rule_id: 'rule_1',
          rule_name: 'Deadline Alert Cascade',
          trigger_data: {
            case_name: 'Johnson v. State',
            deadline_date: '2025-07-15',
            days_remaining: 3
          },
          actions_executed: [
            {
              action_id: 'action_1_1',
              action_type: 'create_task',
              status: 'success',
              result: { task_id: 'task_123' },
              executed_at: new Date('2025-07-12T10:00:00Z'),
              duration_ms: 1200
            },
            {
              action_id: 'action_1_2',
              action_type: 'block_calendar',
              status: 'success',
              result: { calendar_event_id: 'cal_456' },
              executed_at: new Date('2025-07-12T11:00:00Z'),
              duration_ms: 800
            }
          ],
          status: 'completed',
          started_at: new Date('2025-07-12T10:00:00Z'),
          completed_at: new Date('2025-07-12T11:00:05Z'),
          total_duration_ms: 3605000,
          metadata: {
            triggered_by: 'deadline_monitor',
            context: 'litigation_case'
          }
        },
        {
          id: 'exec_2',
          rule_id: 'rule_3',
          rule_name: 'Daily Focus Time Protection',
          trigger_data: {
            scheduled_time: '9:00 AM',
            date: '2025-07-12'
          },
          actions_executed: [
            {
              action_id: 'action_3_1',
              action_type: 'block_calendar',
              status: 'success',
              result: { calendar_event_id: 'cal_789' },
              executed_at: new Date('2025-07-12T09:00:00Z'),
              duration_ms: 600
            },
            {
              action_id: 'action_3_2',
              action_type: 'send_notification',
              status: 'success',
              result: { notification_id: 'notif_101' },
              executed_at: new Date('2025-07-12T09:00:01Z'),
              duration_ms: 200
            }
          ],
          status: 'completed',
          started_at: new Date('2025-07-12T09:00:00Z'),
          completed_at: new Date('2025-07-12T09:00:02Z'),
          total_duration_ms: 2000,
          metadata: {
            triggered_by: 'cron_scheduler',
            context: 'daily_routine'
          }
        }
      ];

      this.setCachedData(cacheKey, mockExecutions);
      return mockExecutions;
    } catch (error) {
      console.error('❌ Failed to get automation executions:', error);
      return [];
    }
  }

  async getAutomationStats(): Promise<AutomationStats> {
    const cacheKey = 'automation-stats';
    const cached = this.getCachedData<AutomationStats>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockStats: AutomationStats = {
        total_rules: 12,
        active_rules: 9,
        total_executions_today: 27,
        successful_executions_today: 25,
        failed_executions_today: 2,
        average_execution_time_ms: 1850,
        most_triggered_rules: [
          { rule_id: 'rule_3', rule_name: 'Daily Focus Time Protection', execution_count: 6 },
          { rule_id: 'rule_1', rule_name: 'Deadline Alert Cascade', execution_count: 4 },
          { rule_id: 'rule_7', rule_name: 'Email to Task Conversion', execution_count: 3 }
        ],
        recent_failures: [
          {
            rule_name: 'Client Email Auto-Response',
            error: 'SMTP server connection timeout',
            timestamp: new Date('2025-07-12T08:30:00Z')
          },
          {
            rule_name: 'Calendar Sync',
            error: 'Google Calendar API rate limit exceeded',
            timestamp: new Date('2025-07-11T16:45:00Z')
          }
        ]
      };

      this.setCachedData(cacheKey, mockStats);
      return mockStats;
    } catch (error) {
      console.error('❌ Failed to get automation stats:', error);
      throw error;
    }
  }

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const cacheKey = 'workflow-templates';
    const cached = this.getCachedData<WorkflowTemplate[]>(cacheKey);
    if (cached) return cached;

    try {
      // Mock data for now - replace with actual API call
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: 'onboarding_standard',
          name: 'Standard Case Onboarding',
          description: 'Complete case setup workflow including document requests, calendar blocking, and team assignments',
          category: 'case_management',
          steps: [
            {
              id: 'step_1',
              name: 'Create Client Intake Checklist',
              type: 'task',
              parameters: {
                task_template: 'client_intake',
                assigned_to: 'paralegal',
                due_days: 1
              },
              next_step_id: 'step_2',
              estimated_duration_minutes: 30
            },
            {
              id: 'step_2',
              name: 'Schedule Initial Client Meeting',
              type: 'task',
              parameters: {
                duration_hours: 1,
                meeting_type: 'initial_consultation',
                location: 'office'
              },
              next_step_id: 'step_3',
              estimated_duration_minutes: 15
            },
            {
              id: 'step_3',
              name: 'Set Up Case File Structure',
              type: 'integration',
              parameters: {
                create_folders: true,
                folder_template: 'standard_case',
                document_categories: ['pleadings', 'discovery', 'correspondence']
              },
              estimated_duration_minutes: 10
            }
          ],
          variables: [
            {
              name: 'case_type',
              type: 'select',
              required: true,
              options: ['litigation', 'contract', 'corporate', 'family'],
              description: 'Type of legal case'
            },
            {
              name: 'client_name',
              type: 'string',
              required: true,
              description: 'Client name for the case'
            },
            {
              name: 'priority_level',
              type: 'select',
              required: false,
              default_value: 'medium',
              options: ['low', 'medium', 'high', 'urgent'],
              description: 'Case priority level'
            }
          ],
          estimated_duration_minutes: 55,
          success_rate: 94,
          usage_count: 28
        },
        {
          id: 'deadline_prep',
          name: 'Deadline Preparation Workflow',
          description: 'Comprehensive deadline preparation including research, drafting, and review cycles',
          category: 'deadline_management',
          steps: [
            {
              id: 'step_1',
              name: 'Block Preparation Time',
              type: 'task',
              parameters: {
                calendar_block_hours: 4,
                block_type: 'focused_work',
                advance_days: 7
              },
              next_step_id: 'step_2',
              estimated_duration_minutes: 5
            },
            {
              id: 'step_2',
              name: 'Create Research Tasks',
              type: 'task',
              parameters: {
                task_count: 3,
                task_types: ['legal_research', 'case_law', 'precedent_analysis'],
                assigned_to: 'research_team'
              },
              next_step_id: 'step_3',
              estimated_duration_minutes: 15
            },
            {
              id: 'step_3',
              name: 'Schedule Review Meetings',
              type: 'notification',
              parameters: {
                meeting_count: 2,
                review_stages: ['draft_review', 'final_review'],
                stakeholders: ['attorney', 'paralegal', 'client']
              },
              estimated_duration_minutes: 10
            }
          ],
          variables: [
            {
              name: 'deadline_date',
              type: 'date',
              required: true,
              description: 'Filing or submission deadline'
            },
            {
              name: 'document_type',
              type: 'select',
              required: true,
              options: ['motion', 'brief', 'response', 'petition'],
              description: 'Type of document to prepare'
            }
          ],
          estimated_duration_minutes: 30,
          success_rate: 98,
          usage_count: 45
        }
      ];

      this.setCachedData(cacheKey, mockTemplates);
      return mockTemplates;
    } catch (error) {
      console.error('❌ Failed to get workflow templates:', error);
      return [];
    }
  }

  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'created_at' | 'execution_count' | 'success_rate'>): Promise<AutomationRule> {
    try {
      // Mock implementation - replace with actual API call
      const newRule: AutomationRule = {
        ...rule,
        id: `rule_${Date.now()}`,
        created_at: new Date(),
        execution_count: 0,
        success_rate: 0
      };

      console.log('✅ Created automation rule:', newRule);
      this.cache.delete('automation-rules'); // Invalidate cache
      return newRule;
    } catch (error) {
      console.error('❌ Failed to create automation rule:', error);
      throw error;
    }
  }

  async updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    try {
      // Mock implementation - replace with actual API call
      const rules = await this.getAutomationRules();
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) throw new Error('Rule not found');

      const updatedRule = { ...rule, ...updates };
      console.log('✅ Updated automation rule:', updatedRule);
      this.cache.delete('automation-rules'); // Invalidate cache
      return updatedRule;
    } catch (error) {
      console.error('❌ Failed to update automation rule:', error);
      throw error;
    }
  }

  async deleteAutomationRule(ruleId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log('✅ Deleted automation rule:', ruleId);
      this.cache.delete('automation-rules'); // Invalidate cache
    } catch (error) {
      console.error('❌ Failed to delete automation rule:', error);
      throw error;
    }
  }

  async executeRule(ruleId: string, triggerData?: Record<string, any>): Promise<AutomationExecution> {
    try {
      // Mock implementation - replace with actual API call
      const execution: AutomationExecution = {
        id: `exec_${Date.now()}`,
        rule_id: ruleId,
        rule_name: 'Manual Execution',
        trigger_data: triggerData || {},
        actions_executed: [],
        status: 'pending',
        started_at: new Date(),
        metadata: { triggered_by: 'manual', context: 'user_request' }
      };

      console.log('✅ Started rule execution:', execution);
      return execution;
    } catch (error) {
      console.error('❌ Failed to execute rule:', error);
      throw error;
    }
  }

  async pauseRule(ruleId: string): Promise<void> {
    try {
      await this.updateAutomationRule(ruleId, { enabled: false });
      console.log('⏸️ Paused automation rule:', ruleId);
    } catch (error) {
      console.error('❌ Failed to pause rule:', error);
      throw error;
    }
  }

  async resumeRule(ruleId: string): Promise<void> {
    try {
      await this.updateAutomationRule(ruleId, { enabled: true });
      console.log('▶️ Resumed automation rule:', ruleId);
    } catch (error) {
      console.error('❌ Failed to resume rule:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Automation Engine API cache cleared');
  }
}

// Singleton instance
export const automationEngine = new AutomationEngineAPI();

// React hook for using Automation Engine API
export function useAutomationEngine() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesData, executionsData, statsData, templatesData] = await Promise.all([
        automationEngine.getAutomationRules(),
        automationEngine.getAutomationExecutions(),
        automationEngine.getAutomationStats(),
        automationEngine.getWorkflowTemplates()
      ]);

      setRules(rulesData);
      setExecutions(executionsData);
      setStats(statsData);
      setTemplates(templatesData);
      console.log('🤖 Automation engine data refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load automation data';
      setError(errorMessage);
      console.error('❌ Error loading automation data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(async (rule: Omit<AutomationRule, 'id' | 'created_at' | 'execution_count' | 'success_rate'>) => {
    try {
      const newRule = await automationEngine.createAutomationRule(rule);
      setRules(prev => [newRule, ...prev]);
      return newRule;
    } catch (err) {
      console.error('❌ Error creating rule:', err);
      throw err;
    }
  }, []);

  const updateRule = useCallback(async (ruleId: string, updates: Partial<AutomationRule>) => {
    try {
      const updatedRule = await automationEngine.updateAutomationRule(ruleId, updates);
      setRules(prev => prev.map(rule => rule.id === ruleId ? updatedRule : rule));
      return updatedRule;
    } catch (err) {
      console.error('❌ Error updating rule:', err);
      throw err;
    }
  }, []);

  const deleteRule = useCallback(async (ruleId: string) => {
    try {
      await automationEngine.deleteAutomationRule(ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('❌ Error deleting rule:', err);
      throw err;
    }
  }, []);

  const executeRule = useCallback(async (ruleId: string, triggerData?: Record<string, any>) => {
    try {
      const execution = await automationEngine.executeRule(ruleId, triggerData);
      setExecutions(prev => [execution, ...prev]);
      return execution;
    } catch (err) {
      console.error('❌ Error executing rule:', err);
      throw err;
    }
  }, []);

  const pauseRule = useCallback(async (ruleId: string) => {
    try {
      await automationEngine.pauseRule(ruleId);
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: false } : rule
      ));
    } catch (err) {
      console.error('❌ Error pausing rule:', err);
      throw err;
    }
  }, []);

  const resumeRule = useCallback(async (ruleId: string) => {
    try {
      await automationEngine.resumeRule(ruleId);
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: true } : rule
      ));
    } catch (err) {
      console.error('❌ Error resuming rule:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    rules,
    executions,
    stats,
    templates,
    loading,
    error,
    refreshData,
    createRule,
    updateRule,
    deleteRule,
    executeRule,
    pauseRule,
    resumeRule
  };
}

export default automationEngine;
