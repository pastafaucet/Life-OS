import { CalendarIntegrationService, CalendarEvent, CalendarAttendee } from './calendar-integration';
import { workflowEngine } from './workflow-engine';

export interface TaskFromCalendarConfig {
  eventTypes: string[];
  taskTemplates: Record<string, TaskTemplate>;
  autoCreateTasks: boolean;
  requiresConfirmation: boolean;
}

export interface TaskTemplate {
  titlePattern: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  preparationTime: number; // days before event
  subtasks?: string[];
  linkedFields?: string[];
}

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  estimatedHours: number;
  sourceEvent: CalendarEvent;
  subtasks: string[];
  status: 'generated' | 'confirmed' | 'created';
}

const DEFAULT_TASK_TEMPLATES: Record<string, TaskTemplate> = {
  'court-hearing': {
    titlePattern: 'Prepare for {eventTitle}',
    description: 'Preparation tasks for court hearing: {eventTitle}',
    priority: 'high',
    estimatedHours: 4,
    preparationTime: 3,
    subtasks: [
      'Review case file and evidence',
      'Prepare witness list and exhibits',
      'Draft opening statement',
      'Review opposing counsel arguments',
      'Organize trial binder',
      'Confirm witness availability'
    ],
    linkedFields: ['location', 'judge', 'case_number']
  },
  'client-meeting': {
    titlePattern: 'Prepare for client meeting: {eventTitle}',
    description: 'Preparation for client meeting: {eventTitle}',
    priority: 'medium',
    estimatedHours: 1,
    preparationTime: 1,
    subtasks: [
      'Review client file',
      'Prepare meeting agenda',
      'Update case status summary',
      'Prepare billing summary if needed'
    ],
    linkedFields: ['client_name', 'matter']
  },
  'deposition': {
    titlePattern: 'Prepare for deposition: {eventTitle}',
    description: 'Deposition preparation: {eventTitle}',
    priority: 'high',
    estimatedHours: 6,
    preparationTime: 5,
    subtasks: [
      'Review discovery materials',
      'Prepare deposition outline',
      'Research relevant case law',
      'Prepare exhibits',
      'Coordinate with court reporter',
      'Brief client on deposition process'
    ],
    linkedFields: ['deponent', 'case_number', 'location']
  },
  'deadline': {
    titlePattern: 'Complete: {eventTitle}',
    description: 'Work required for deadline: {eventTitle}',
    priority: 'urgent',
    estimatedHours: 8,
    preparationTime: 7,
    subtasks: [
      'Research and draft document',
      'Review and revise',
      'Cite check and proofread',
      'Client review and approval',
      'File with court/opposing counsel'
    ],
    linkedFields: ['case_number', 'document_type']
  },
  'consultation': {
    titlePattern: 'Prepare for consultation: {eventTitle}',
    description: 'New client consultation preparation',
    priority: 'medium',
    estimatedHours: 0.5,
    preparationTime: 1,
    subtasks: [
      'Review intake form',
      'Research relevant law',
      'Prepare fee agreement',
      'Setup client file'
    ],
    linkedFields: ['potential_client', 'practice_area']
  }
};

export class CalendarTaskAutomation {
  private calendarIntegration: CalendarIntegrationService;
  private config: TaskFromCalendarConfig;

  constructor(calendarIntegration: CalendarIntegrationService) {
    this.calendarIntegration = calendarIntegration;
    this.config = {
      eventTypes: ['court-hearing', 'client-meeting', 'deposition', 'deadline', 'consultation'],
      taskTemplates: DEFAULT_TASK_TEMPLATES,
      autoCreateTasks: true,
      requiresConfirmation: false
    };
  }

  /**
   * Monitor calendar for new events and generate tasks
   */
  async monitorCalendarEvents(): Promise<GeneratedTask[]> {
    const upcomingEvents = await this.getUpcomingEvents(30); // Next 30 days
    const generatedTasks: GeneratedTask[] = [];

    for (const event of upcomingEvents) {
      const eventType = this.categorizeEvent(event);
      if (eventType && this.config.eventTypes.includes(eventType)) {
        const task = await this.generateTaskFromEvent(event, eventType);
        if (task) {
          generatedTasks.push(task);
        }
      }
    }

    return generatedTasks;
  }

  /**
   * Categorize calendar event to determine task template
   */
  private categorizeEvent(event: CalendarEvent): string | null {
    const title = event.title.toLowerCase();
    const description = event.description?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';

    // Court-related keywords
    if (title.includes('hearing') || title.includes('trial') || 
        title.includes('court') || location.includes('courthouse') ||
        title.includes('motion') || title.includes('arraignment')) {
      return 'court-hearing';
    }

    // Deposition keywords
    if (title.includes('deposition') || title.includes('depo') ||
        description.includes('deposition')) {
      return 'deposition';
    }

    // Client meeting keywords
    if (title.includes('client') || title.includes('meeting') ||
        title.includes('conference') && !title.includes('court')) {
      return 'client-meeting';
    }

    // Deadline keywords
    if (title.includes('deadline') || title.includes('due') ||
        title.includes('filing') || title.includes('response due')) {
      return 'deadline';
    }

    // Consultation keywords
    if (title.includes('consultation') || title.includes('intake') ||
        title.includes('initial meeting')) {
      return 'consultation';
    }

    return null;
  }

  /**
   * Generate task from calendar event
   */
  private async generateTaskFromEvent(event: CalendarEvent, eventType: string): Promise<GeneratedTask | null> {
    const template = this.config.taskTemplates[eventType];
    if (!template) return null;

    // Calculate due date (preparation time before event)
    const dueDate = new Date(event.startTime);
    dueDate.setDate(dueDate.getDate() - template.preparationTime);

    // Don't create tasks for past due dates
    if (dueDate < new Date()) return null;

    // Replace placeholders in title and description
    const title = this.replacePlaceholders(template.titlePattern, event);
    const description = this.replacePlaceholders(template.description, event);

    const generatedTask: GeneratedTask = {
      id: `cal-task-${event.id}-${Date.now()}`,
      title,
      description,
      priority: template.priority,
      dueDate,
      estimatedHours: template.estimatedHours,
      sourceEvent: event,
      subtasks: template.subtasks || [],
      status: this.config.requiresConfirmation ? 'generated' : 'confirmed'
    };

    // Auto-create if configured
    if (this.config.autoCreateTasks && !this.config.requiresConfirmation) {
      await this.createTaskInSystem(generatedTask);
      generatedTask.status = 'created';
    }

    return generatedTask;
  }

  /**
   * Replace placeholders in template strings
   */
  private replacePlaceholders(template: string, event: CalendarEvent): string {
    return template
      .replace('{eventTitle}', event.title)
      .replace('{eventDate}', event.startTime.toLocaleDateString())
      .replace('{eventTime}', event.startTime.toLocaleTimeString())
      .replace('{location}', event.location || '')
      .replace('{description}', event.description || '');
  }

  /**
   * Create task in the system using workflow engine
   */
  private async createTaskInSystem(task: GeneratedTask): Promise<void> {
    const workflowData = {
      triggerType: 'calendar_event',
      eventData: {
        task_title: task.title,
        task_description: task.description,
        task_priority: task.priority,
        task_due_date: task.dueDate.toISOString(),
        estimated_hours: task.estimatedHours,
        subtasks: task.subtasks,
        source_event_id: task.sourceEvent.id,
        source_event_title: task.sourceEvent.title
      }
    };

    await workflowEngine.executeWorkflow('calendar-task-creation', JSON.stringify(workflowData.eventData));
  }

  /**
   * Get pending tasks that need confirmation
   */
  async getPendingConfirmations(): Promise<GeneratedTask[]> {
    // In a real implementation, this would query a database
    // For now, return empty array
    return [];
  }

  /**
   * Confirm and create a generated task
   */
  async confirmTask(taskId: string): Promise<void> {
    // In a real implementation, this would update the task status and create it
    console.log(`Confirming task: ${taskId}`);
  }

  /**
   * Reject a generated task
   */
  async rejectTask(taskId: string): Promise<void> {
    // In a real implementation, this would mark the task as rejected
    console.log(`Rejecting task: ${taskId}`);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TaskFromCalendarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Add custom task template
   */
  addTaskTemplate(eventType: string, template: TaskTemplate): void {
    this.config.taskTemplates[eventType] = template;
    if (!this.config.eventTypes.includes(eventType)) {
      this.config.eventTypes.push(eventType);
    }
  }

  /**
   * Start monitoring (would run periodically)
   */
  async startMonitoring(): Promise<void> {
    console.log('Starting calendar task automation monitoring...');
    
    // Run initial scan
    const tasks = await this.monitorCalendarEvents();
    console.log(`Generated ${tasks.length} tasks from calendar events`);

    // In a real implementation, this would set up periodic monitoring
    // For example, check every hour for new calendar events
  }

  /**
   * Generate tasks for specific time period
   */
  async generateTasksForPeriod(startDate: Date, endDate: Date): Promise<GeneratedTask[]> {
    const events = await this.getEventsInRange(startDate, endDate);
    const generatedTasks: GeneratedTask[] = [];

    for (const event of events) {
      const eventType = this.categorizeEvent(event);
      if (eventType && this.config.eventTypes.includes(eventType)) {
        const task = await this.generateTaskFromEvent(event, eventType);
        if (task) {
          generatedTasks.push(task);
        }
      }
    }

    return generatedTasks;
  }

  /**
   * Get upcoming events (convenience method)
   */
  async getUpcomingEvents(days: number): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return this.calendarIntegration.syncEvents({ start: startDate, end: endDate });
  }

  /**
   * Get events in date range (convenience method) 
   */
  async getEventsInRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return this.calendarIntegration.syncEvents({ start: startDate, end: endDate });
  }
}

// Export singleton instance
export const calendarTaskAutomation = new CalendarTaskAutomation(
  new CalendarIntegrationService({
    provider: 'google',
    credentials: {},
    syncInterval: 15,
    timeZone: 'America/Los_Angeles',
    businessHours: { start: '09:00', end: '17:00', workDays: [1,2,3,4,5] }
  })
);

// Example usage and testing
export function testCalendarTaskAutomation() {
  const automation = new CalendarTaskAutomation(
    new CalendarIntegrationService({
      provider: 'google',
      credentials: {},
      syncInterval: 15,
      timeZone: 'America/Los_Angeles',
      businessHours: { start: '09:00', end: '17:00', workDays: [1,2,3,4,5] }
    })
  );
  
  // Example calendar event
  const mockEvent: CalendarEvent = {
    id: 'test-event-1',
    calendarId: 'primary',
    title: 'Smith v. Jones Hearing',
    description: 'Motion to dismiss hearing',
    startTime: new Date('2025-07-20T10:00:00'),
    endTime: new Date('2025-07-20T11:00:00'),
    location: 'Courthouse Room 101',
    attendees: [{ email: 'john.doe@firm.com', name: 'John Doe', status: 'accepted' }],
    isAllDay: false,
    status: 'confirmed',
    visibility: 'private',
    metadata: {},
    category: 'court'
  };

  const eventType = automation['categorizeEvent'](mockEvent);
  console.log('Event type:', eventType);

  if (eventType) {
    const task = automation['generateTaskFromEvent'](mockEvent, eventType);
    console.log('Generated task:', task);
  }

  return automation;
}
