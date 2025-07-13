/**
 * Workflow Automation Engine Architecture
 * 
 * This module provides the core architecture for Life OS automation workflows.
 * Supports trigger-based automation, conditional logic, and template workflows.
 */

// Core Types
export interface WorkflowTrigger {
  id: string;
  type: 'schedule' | 'event' | 'condition' | 'manual';
  name: string;
  description: string;
  config: TriggerConfig;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerConfig {
  // Schedule triggers
  cron?: string;
  timezone?: string;
  
  // Event triggers
  eventType?: 'task_created' | 'task_completed' | 'deadline_approaching' | 'case_status_changed';
  eventFilters?: Record<string, any>;
  
  // Condition triggers
  condition?: string; // JSON Logic expression
  checkInterval?: number; // minutes
  
  // Manual triggers
  requiresConfirmation?: boolean;
}

export interface WorkflowAction {
  id: string;
  type: 'create_task' | 'send_notification' | 'update_status' | 'schedule_event' | 'send_email';
  name: string;
  config: ActionConfig;
  order: number;
  conditions?: string; // JSON Logic for conditional execution
}

export interface ActionConfig {
  // Task creation
  taskTemplate?: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string; // relative or absolute
    assignee?: string;
    tags?: string[];
  };
  
  // Notifications
  notificationTemplate?: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    channels: ('in_app' | 'email' | 'sms')[];
  };
  
  // Status updates
  statusUpdate?: {
    entityType: 'task' | 'case' | 'contact';
    entityId?: string; // can be dynamic
    newStatus: string;
    reason?: string;
  };
  
  // Email
  emailTemplate?: {
    to: string | string[];
    subject: string;
    body: string;
    attachments?: string[];
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'task_management' | 'deadline_tracking' | 'case_management' | 'communication' | 'custom';
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  variables: WorkflowVariable[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionHistory: WorkflowExecution[];
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  value: any;
  description?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  context: Record<string, any>;
  actionResults: ActionResult[];
}

export interface ActionResult {
  actionId: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  executedAt?: Date;
}

// Core Workflow Engine Class
export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private triggerCheckers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeTriggerMonitoring();
  }

  // Workflow Management
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionHistory'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      executionHistory: []
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    
    if (newWorkflow.active) {
      await this.activateWorkflowTriggers(newWorkflow);
    }

    return newWorkflow;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date()
    };

    this.workflows.set(id, updatedWorkflow);

    // Reactivate triggers if workflow is active
    if (updatedWorkflow.active) {
      await this.deactivateWorkflowTriggers(id);
      await this.activateWorkflowTriggers(updatedWorkflow);
    } else {
      await this.deactivateWorkflowTriggers(id);
    }

    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    await this.deactivateWorkflowTriggers(id);
    return this.workflows.delete(id);
  }

  getWorkflow(id: string): Workflow | null {
    return this.workflows.get(id) || null;
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // Execution Methods
  async executeWorkflow(workflowId: string, triggerId: string, context: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.active) {
      throw new Error(`Workflow ${workflowId} not found or inactive`);
    }

    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId,
      triggerId,
      status: 'pending',
      startedAt: new Date(),
      context,
      actionResults: []
    };

    this.activeExecutions.set(execution.id, execution);

    try {
      execution.status = 'running';
      await this.executeActions(workflow, execution);
      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
    }

    // Store execution in workflow history
    workflow.executionHistory.push(execution);
    this.activeExecutions.delete(execution.id);

    return execution;
  }

  private async executeActions(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    // Sort actions by order
    const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

    for (const action of sortedActions) {
      const result: ActionResult = {
        actionId: action.id,
        status: 'pending'
      };

      execution.actionResults.push(result);

      try {
        // Check conditional execution
        if (action.conditions && !this.evaluateCondition(action.conditions, execution.context)) {
          result.status = 'skipped';
          continue;
        }

        result.result = await this.executeAction(action, execution.context);
        result.status = 'completed';
        result.executedAt = new Date();
      } catch (error) {
        result.status = 'failed';
        result.error = error instanceof Error ? error.message : 'Unknown error';
        throw error; // Stop execution on action failure
      }
    }
  }

  private async executeAction(action: WorkflowAction, context: Record<string, any>): Promise<any> {
    switch (action.type) {
      case 'create_task':
        return await this.createTaskAction(action.config.taskTemplate!, context);
      
      case 'send_notification':
        return await this.sendNotificationAction(action.config.notificationTemplate!, context);
      
      case 'update_status':
        return await this.updateStatusAction(action.config.statusUpdate!, context);
      
      case 'send_email':
        return await this.sendEmailAction(action.config.emailTemplate!, context);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Action Implementations (to be integrated with existing systems)
  private async createTaskAction(template: any, context: Record<string, any>): Promise<any> {
    // TODO: Integrate with existing task creation system
    console.log('Creating task:', template, context);
    return { taskId: this.generateId(), created: true };
  }

  private async sendNotificationAction(template: any, context: Record<string, any>): Promise<any> {
    // TODO: Integrate with notification system
    console.log('Sending notification:', template, context);
    return { notificationId: this.generateId(), sent: true };
  }

  private async updateStatusAction(template: any, context: Record<string, any>): Promise<any> {
    // TODO: Integrate with entity status update system
    console.log('Updating status:', template, context);
    return { updated: true };
  }

  private async sendEmailAction(template: any, context: Record<string, any>): Promise<any> {
    // TODO: Integrate with email service
    console.log('Sending email:', template, context);
    return { emailId: this.generateId(), sent: true };
  }

  // Trigger Management
  private async activateWorkflowTriggers(workflow: Workflow): Promise<void> {
    for (const trigger of workflow.triggers) {
      if (!trigger.active) continue;

      switch (trigger.type) {
        case 'schedule':
          this.activateScheduleTrigger(workflow.id, trigger);
          break;
        case 'condition':
          this.activateConditionTrigger(workflow.id, trigger);
          break;
        // Event triggers are handled by external event system
      }
    }
  }

  private async deactivateWorkflowTriggers(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    for (const trigger of workflow.triggers) {
      const checkerId = `${workflowId}-${trigger.id}`;
      const checker = this.triggerCheckers.get(checkerId);
      if (checker) {
        clearInterval(checker);
        this.triggerCheckers.delete(checkerId);
      }
    }
  }

  private activateScheduleTrigger(workflowId: string, trigger: WorkflowTrigger): void {
    // TODO: Implement cron-based scheduling
    console.log(`Activating schedule trigger for workflow ${workflowId}:`, trigger);
  }

  private activateConditionTrigger(workflowId: string, trigger: WorkflowTrigger): void {
    const checkInterval = trigger.config.checkInterval || 5; // Default 5 minutes
    const checkerId = `${workflowId}-${trigger.id}`;

    const checker = setInterval(async () => {
      try {
        if (trigger.config.condition && this.evaluateCondition(trigger.config.condition, {})) {
          await this.executeWorkflow(workflowId, trigger.id);
        }
      } catch (error) {
        console.error(`Condition check failed for trigger ${trigger.id}:`, error);
      }
    }, checkInterval * 60 * 1000);

    this.triggerCheckers.set(checkerId, checker);
  }

  // Utility Methods
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // TODO: Implement JSON Logic evaluation
    console.log('Evaluating condition:', condition, context);
    return true; // Placeholder
  }

  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTriggerMonitoring(): void {
    // Initialize any global trigger monitoring
    console.log('Workflow engine initialized');
  }

  // Event Handling (for external events)
  async handleEvent(eventType: string, eventData: Record<string, any>): Promise<void> {
    for (const workflow of this.workflows.values()) {
      if (!workflow.active) continue;

      for (const trigger of workflow.triggers) {
        if (trigger.type === 'event' && 
            trigger.config.eventType === eventType &&
            this.matchesEventFilters(eventData, trigger.config.eventFilters)) {
          
          await this.executeWorkflow(workflow.id, trigger.id, { event: eventData });
        }
      }
    }
  }

  private matchesEventFilters(eventData: Record<string, any>, filters?: Record<string, any>): boolean {
    if (!filters) return true;
    
    for (const [key, expectedValue] of Object.entries(filters)) {
      if (eventData[key] !== expectedValue) {
        return false;
      }
    }
    
    return true;
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

// Template Workflows
export const workflowTemplates = {
  deadlineReminder: {
    name: "Deadline Reminder",
    description: "Send reminders as deadlines approach",
    category: "deadline_tracking" as const,
    triggers: [{
      id: "deadline_approaching",
      type: "condition" as const,
      name: "Deadline Approaching",
      description: "Check for deadlines in the next 7 days",
      config: {
        condition: "deadline_within_days(7)",
        checkInterval: 360 // Check every 6 hours
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }],
    actions: [{
      id: "send_reminder",
      type: "send_notification" as const,
      name: "Send Deadline Reminder",
      config: {
        notificationTemplate: {
          title: "Deadline Approaching",
          message: "You have a deadline approaching in the next 7 days",
          type: "warning" as const,
          channels: ["in_app", "email"] as const
        }
      },
      order: 1
    }],
    variables: [],
    active: false
  },

  newCaseSetup: {
    name: "New Case Setup",
    description: "Automatically create initial tasks when a new case is created",
    category: "case_management" as const,
    triggers: [{
      id: "case_created",
      type: "event" as const,
      name: "Case Created",
      description: "Triggered when a new case is created",
      config: {
        eventType: "case_created"
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }],
    actions: [
      {
        id: "create_intake_task",
        type: "create_task" as const,
        name: "Create Client Intake Task",
        config: {
          taskTemplate: {
            title: "Complete client intake for {{case.client_name}}",
            description: "Gather all necessary documentation and information",
            priority: "high" as const,
            dueDate: "+3 days",
            tags: ["intake", "urgent"]
          }
        },
        order: 1
      },
      {
        id: "create_research_task",
        type: "create_task" as const,
        name: "Create Legal Research Task",
        config: {
          taskTemplate: {
            title: "Research legal precedents for {{case.type}}",
            description: "Conduct thorough legal research",
            priority: "medium" as const,
            dueDate: "+1 week",
            tags: ["research"]
          }
        },
        order: 2
      }
    ],
    variables: [],
    active: false
  }
};
