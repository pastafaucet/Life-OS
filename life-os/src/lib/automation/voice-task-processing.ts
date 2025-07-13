import { lifeOSAI } from '../ai/openai-client';
import { workflowEngine } from './workflow-engine';

export interface VoiceCommand {
  intent: VoiceIntent;
  entities: VoiceEntity[];
  confidence: number;
  originalText: string;
  processedText: string;
  context?: VoiceContext;
}

export interface VoiceEntity {
  type: EntityType;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface VoiceContext {
  currentModule?: string;
  currentCaseId?: string;
  currentTaskId?: string;
  currentPage?: string;
  userLocation?: string;
  timeOfDay?: string;
  workingHours?: boolean;
}

export enum VoiceIntent {
  CREATE_TASK = 'create_task',
  CREATE_CASE = 'create_case',
  ADD_DEADLINE = 'add_deadline',
  SCHEDULE_MEETING = 'schedule_meeting',
  ADD_NOTE = 'add_note',
  UPDATE_STATUS = 'update_status',
  SEARCH = 'search',
  NAVIGATE = 'navigate',
  QUICK_ACTION = 'quick_action',
  WORKFLOW_TRIGGER = 'workflow_trigger',
  QUESTION = 'question',
  UNKNOWN = 'unknown'
}

export enum EntityType {
  TASK_TITLE = 'task_title',
  CASE_NAME = 'case_name',
  PERSON_NAME = 'person_name',
  DATE = 'date',
  TIME = 'time',
  PRIORITY = 'priority',
  STATUS = 'status',
  LOCATION = 'location',
  DURATION = 'duration',
  CASE_TYPE = 'case_type',
  DOCUMENT_TYPE = 'document_type',
  PHONE_NUMBER = 'phone_number',
  EMAIL = 'email',
  MONEY_AMOUNT = 'money_amount',
  COURT_NAME = 'court_name',
  WORKFLOW_NAME = 'workflow_name'
}

export interface ProcessedVoiceTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedHours?: number;
  linkedCaseId?: string;
  linkedContacts?: string[];
  subtasks?: string[];
  status: 'pending_confirmation' | 'confirmed' | 'created';
  confidence: number;
  originalVoiceText: string;
  suggestedActions?: string[];
}

export class VoiceTaskProcessingService {
  private context: VoiceContext = {};

  constructor() {
    // Initialize with current context
    this.updateContext();
  }

  /**
   * Process voice input and create tasks/actions
   */
  async processVoiceInput(transcript: string, confidence: number): Promise<ProcessedVoiceTask | null> {
    try {
      // Clean and normalize the transcript
      const cleanedText = this.cleanTranscript(transcript);
      
      // Parse the voice command
      const command = await this.parseVoiceCommand(cleanedText, confidence);
      
      // Process based on intent
      switch (command.intent) {
        case VoiceIntent.CREATE_TASK:
          return await this.processTaskCreation(command);
        case VoiceIntent.CREATE_CASE:
          return await this.processCaseCreation(command);
        case VoiceIntent.ADD_DEADLINE:
          return await this.processDeadlineCreation(command);
        case VoiceIntent.SCHEDULE_MEETING:
          return await this.processMeetingScheduling(command);
        case VoiceIntent.WORKFLOW_TRIGGER:
          return await this.processWorkflowTrigger(command);
        case VoiceIntent.QUICK_ACTION:
          return await this.processQuickAction(command);
        default:
          console.log('Unhandled voice intent:', command.intent);
          return null;
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      return null;
    }
  }

  /**
   * Parse voice command using AI
   */
  private async parseVoiceCommand(text: string, confidence: number): Promise<VoiceCommand> {
    const prompt = `
Analyze this voice command and extract the intent and entities.

Voice input: "${text}"
Context: Currently in ${this.context.currentModule || 'unknown'} module
${this.context.currentCaseId ? `Viewing case: ${this.context.currentCaseId}` : ''}

Extract:
1. Intent (create_task, create_case, add_deadline, schedule_meeting, add_note, update_status, search, navigate, quick_action, workflow_trigger, question, unknown)
2. Entities with their types and values
3. Confidence level (0-1)

Common voice patterns:
- "Create task [title] by [date] [priority]"
- "New case [case name] [case type]"
- "Add deadline [description] due [date]"
- "Schedule meeting with [person] [date/time]"
- "Discovery response workflow"
- "Morning briefing"
- "Add note [text]"
- "Mark as [status]"

Return JSON format:
{
  "intent": "create_task",
  "entities": [
    {"type": "task_title", "value": "Review contract", "confidence": 0.9, "startIndex": 12, "endIndex": 25},
    {"type": "date", "value": "Friday", "confidence": 0.8, "startIndex": 29, "endIndex": 35}
  ],
  "confidence": 0.85,
  "processedText": "cleaned version of the text"
}`;

    try {
      if (!lifeOSAI.isAIEnabled()) {
        throw new Error('AI not configured');
      }
      
      // Use the existing AI service with a simple completion call
      const response = await (lifeOSAI as any).openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      });

      const result = JSON.parse(response?.choices[0]?.message?.content || '{}');
      
      return {
        intent: result.intent || VoiceIntent.UNKNOWN,
        entities: result.entities || [],
        confidence: Math.min(result.confidence || 0, confidence),
        originalText: text,
        processedText: result.processedText || text,
        context: this.context
      };
    } catch (error) {
      console.error('AI parsing error:', error);
      return {
        intent: VoiceIntent.UNKNOWN,
        entities: [],
        confidence: 0,
        originalText: text,
        processedText: text,
        context: this.context
      };
    }
  }

  /**
   * Process task creation from voice command
   */
  private async processTaskCreation(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const entities = this.extractEntitiesByType(command.entities);
    
    // Extract task details
    const title = entities.task_title || this.inferTaskTitle(command.processedText);
    const priority = this.mapPriorityFromVoice(entities.priority);
    const dueDate = this.parseDateFromVoice(entities.date, entities.time);
    const estimatedHours = this.estimateTaskHours(title, entities);

    // Generate description using AI if not explicit
    const description = await this.generateTaskDescription(command, entities);

    const processedTask: ProcessedVoiceTask = {
      id: `voice-task-${Date.now()}`,
      title: title || 'Voice Task',
      description,
      priority,
      dueDate,
      estimatedHours,
      linkedCaseId: this.context.currentCaseId,
      linkedContacts: this.extractContacts(entities),
      status: 'pending_confirmation',
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      suggestedActions: await this.generateSuggestedActions(command, entities)
    };

    return processedTask;
  }

  /**
   * Process case creation from voice command
   */
  private async processCaseCreation(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const entities = this.extractEntitiesByType(command.entities);
    
    const caseName = entities.case_name || 'New Case';
    const caseType = entities.case_type || 'General';
    
    // Create a task to set up the new case
    const processedTask: ProcessedVoiceTask = {
      id: `voice-case-${Date.now()}`,
      title: `Create new case: ${caseName}`,
      description: `Set up new ${caseType} case: ${caseName}`,
      priority: 'medium',
      estimatedHours: 1,
      status: 'pending_confirmation',
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      subtasks: [
        'Create case file',
        'Set up client contact',
        'Generate initial documents',
        'Schedule intake meeting'
      ],
      suggestedActions: [
        `workflow:new_case_onboarding:${caseType}`,
        'open:legal_cases'
      ]
    };

    return processedTask;
  }

  /**
   * Process deadline creation from voice command
   */
  private async processDeadlineCreation(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const entities = this.extractEntitiesByType(command.entities);
    
    const deadlineText = entities.task_title || command.processedText;
    const dueDate = this.parseDateFromVoice(entities.date, entities.time);
    
    if (!dueDate) {
      throw new Error('Deadline requires a due date');
    }

    const processedTask: ProcessedVoiceTask = {
      id: `voice-deadline-${Date.now()}`,
      title: `Deadline: ${deadlineText}`,
      description: `Court deadline: ${deadlineText}`,
      priority: 'urgent',
      dueDate,
      linkedCaseId: this.context.currentCaseId,
      status: 'pending_confirmation',
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      suggestedActions: [
        'workflow:deadline_task_sequence',
        'open:deadlines'
      ]
    };

    return processedTask;
  }

  /**
   * Process meeting scheduling from voice command
   */
  private async processMeetingScheduling(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const entities = this.extractEntitiesByType(command.entities);
    
    const personName = entities.person_name || 'Client';
    const meetingDate = this.parseDateFromVoice(entities.date, entities.time);
    const location = entities.location;

    const processedTask: ProcessedVoiceTask = {
      id: `voice-meeting-${Date.now()}`,
      title: `Meeting with ${personName}`,
      description: `Scheduled meeting with ${personName}${location ? ` at ${location}` : ''}`,
      priority: 'medium',
      dueDate: meetingDate,
      estimatedHours: 1,
      linkedCaseId: this.context.currentCaseId,
      status: 'pending_confirmation',
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      suggestedActions: [
        'workflow:meeting_preparation',
        'calendar:create_event'
      ]
    };

    return processedTask;
  }

  /**
   * Process workflow trigger from voice command
   */
  private async processWorkflowTrigger(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const entities = this.extractEntitiesByType(command.entities);
    const workflowName = entities.workflow_name || this.inferWorkflowFromText(command.processedText);

    const processedTask: ProcessedVoiceTask = {
      id: `voice-workflow-${Date.now()}`,
      title: `Execute workflow: ${workflowName}`,
      description: `Triggered workflow: ${workflowName}`,
      priority: 'medium',
      status: 'pending_confirmation',
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      suggestedActions: [
        `workflow:${workflowName}`
      ]
    };

    return processedTask;
  }

  /**
   * Process quick actions from voice command
   */
  private async processQuickAction(command: VoiceCommand): Promise<ProcessedVoiceTask> {
    const actionType = this.identifyQuickAction(command.processedText);

    const processedTask: ProcessedVoiceTask = {
      id: `voice-action-${Date.now()}`,
      title: `Quick action: ${actionType}`,
      description: `Executed quick action: ${actionType}`,
      priority: 'low',
      status: 'confirmed', // Quick actions are auto-confirmed
      confidence: command.confidence,
      originalVoiceText: command.originalText,
      suggestedActions: [
        `action:${actionType}`
      ]
    };

    return processedTask;
  }

  /**
   * Helper methods
   */
  private cleanTranscript(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractEntitiesByType(entities: VoiceEntity[]): Record<string, string> {
    const result: Record<string, string> = {};
    entities.forEach(entity => {
      result[entity.type] = entity.value;
    });
    return result;
  }

  private mapPriorityFromVoice(priority?: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (!priority) return 'medium';
    
    const p = priority.toLowerCase();
    if (p.includes('urgent') || p.includes('asap') || p.includes('emergency')) return 'urgent';
    if (p.includes('high') || p.includes('important')) return 'high';
    if (p.includes('low') || p.includes('minor')) return 'low';
    return 'medium';
  }

  private parseDateFromVoice(dateStr?: string, timeStr?: string): Date | undefined {
    if (!dateStr) return undefined;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Handle relative dates
    const date = dateStr.toLowerCase();
    if (date.includes('today')) return today;
    if (date.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (date.includes('friday')) {
      const friday = new Date(today);
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      friday.setDate(friday.getDate() + daysUntilFriday);
      return friday;
    }

    // Try to parse actual dates
    try {
      return new Date(dateStr);
    } catch {
      return undefined;
    }
  }

  private inferTaskTitle(text: string): string {
    // Remove command words and extract the main content
    const cleaned = text
      .replace(/^(create|add|new|make)\s+(task|todo|item)\s*/i, '')
      .replace(/\s+(by|due|for)\s+\w+.*$/i, '')
      .trim();
    
    return cleaned || 'Voice Task';
  }

  private estimateTaskHours(title: string, entities: Record<string, string>): number {
    const t = title.toLowerCase();
    
    // Legal-specific time estimates
    if (t.includes('research')) return 4;
    if (t.includes('draft') || t.includes('write')) return 3;
    if (t.includes('review')) return 2;
    if (t.includes('call') || t.includes('meeting')) return 1;
    if (t.includes('filing') || t.includes('submit')) return 0.5;
    
    return 2; // Default
  }

  private async generateTaskDescription(command: VoiceCommand, entities: Record<string, string>): Promise<string> {
    // Use existing email parsing logic adapted for voice
    return `Task created from voice command: "${command.originalText}"`;
  }

  private async generateSuggestedActions(command: VoiceCommand, entities: Record<string, string>): Promise<string[]> {
    const actions: string[] = [];
    
    if (entities.case_name || this.context.currentCaseId) {
      actions.push('open:legal_cases');
    }
    
    if (entities.person_name) {
      actions.push('open:contacts');
    }
    
    if (entities.date) {
      actions.push('open:calendar');
    }
    
    return actions;
  }

  private extractContacts(entities: Record<string, string>): string[] {
    const contacts: string[] = [];
    
    if (entities.person_name) {
      contacts.push(entities.person_name);
    }
    
    return contacts;
  }

  private inferWorkflowFromText(text: string): string {
    const t = text.toLowerCase();
    
    if (t.includes('discovery response')) return 'discovery_response';
    if (t.includes('motion response')) return 'motion_response';
    if (t.includes('new case')) return 'new_case_onboarding';
    if (t.includes('morning briefing')) return 'daily_briefing';
    if (t.includes('end of day')) return 'daily_wrap_up';
    
    return 'custom_workflow';
  }

  private identifyQuickAction(text: string): string {
    const t = text.toLowerCase();
    
    if (t.includes('show') || t.includes('display')) return 'display_info';
    if (t.includes('open') || t.includes('navigate')) return 'navigate';
    if (t.includes('search') || t.includes('find')) return 'search';
    if (t.includes('refresh') || t.includes('reload')) return 'refresh';
    
    return 'custom_action';
  }

  /**
   * Update context based on current application state
   */
  updateContext(newContext?: Partial<VoiceContext>): void {
    if (newContext) {
      this.context = { ...this.context, ...newContext };
    }
    
    // Update time-based context
    const now = new Date();
    this.context.timeOfDay = this.getTimeOfDay(now);
    this.context.workingHours = this.isWorkingHours(now);
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private isWorkingHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  /**
   * Confirm and create a voice task
   */
  async confirmAndCreateTask(task: ProcessedVoiceTask): Promise<void> {
    task.status = 'confirmed';
    
    // Create the actual task using workflow engine
    const workflowData = {
      task_title: task.title,
      task_description: task.description,
      task_priority: task.priority,
      task_due_date: task.dueDate?.toISOString(),
      estimated_hours: task.estimatedHours,
      linked_case_id: task.linkedCaseId,
      linked_contacts: task.linkedContacts,
      subtasks: task.subtasks,
      source: 'voice_command',
      original_voice_text: task.originalVoiceText
    };

    await workflowEngine.executeWorkflow('voice-task-creation', JSON.stringify(workflowData));
    
    // Execute suggested actions
    if (task.suggestedActions) {
      for (const action of task.suggestedActions) {
        await this.executeSuggestedAction(action);
      }
    }
    
    task.status = 'created';
  }

  private async executeSuggestedAction(action: string): Promise<void> {
    const [type, ...params] = action.split(':');
    
    switch (type) {
      case 'workflow':
        await workflowEngine.executeWorkflow(params[0], params[1] || '{}');
        break;
      case 'open':
        // Navigate to module/page
        console.log(`Navigate to: ${params[0]}`);
        break;
      case 'calendar':
        // Calendar action
        console.log(`Calendar action: ${params[0]}`);
        break;
      case 'action':
        // Custom action
        console.log(`Execute action: ${params[0]}`);
        break;
    }
  }
}

// Export singleton instance
export const voiceTaskProcessingService = new VoiceTaskProcessingService();

// Example usage
export function testVoiceProcessing() {
  const service = new VoiceTaskProcessingService();
  
  // Test various voice commands
  const testCommands = [
    'Create task review Smith contract by Friday high priority',
    'New case personal injury auto accident',
    'Add deadline motion to dismiss due July 20th',
    'Schedule meeting with Johnson next Tuesday at 2 PM',
    'Discovery response workflow',
    'Morning briefing'
  ];
  
  testCommands.forEach(async (command, index) => {
    console.log(`\nTesting command ${index + 1}: "${command}"`);
    const result = await service.processVoiceInput(command, 0.9);
    console.log('Result:', result);
  });
  
  return service;
}
