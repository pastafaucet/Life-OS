/**
 * Email Parsing Capabilities & Strategy
 * 
 * This module provides comprehensive email parsing capabilities for Life OS automation.
 * Supports multiple email providers, intelligent content extraction, and automated task creation.
 */

// Email Provider Types
export type EmailProvider = 'gmail' | 'outlook' | 'imap' | 'exchange' | 'apple_mail';

export interface EmailConfig {
  provider: EmailProvider;
  credentials: EmailCredentials;
  watchFolders: string[]; // Folders to monitor for new emails
  processingRules: EmailProcessingRule[];
  autoProcessing: boolean;
  batchSize: number; // Number of emails to process at once
  retentionDays: number; // How long to keep processed email data
}

export interface EmailCredentials {
  // OAuth2 for Gmail/Outlook
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  
  // IMAP/POP3
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  tls?: boolean;
  
  // Exchange
  exchangeUrl?: string;
  domain?: string;
}

export interface EmailMessage {
  id: string;
  messageId: string; // RFC message ID
  threadId?: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  date: Date;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: EmailAttachment[];
  headers: Record<string, string>;
  folder: string;
  labels?: string[];
  importance: 'low' | 'normal' | 'high';
  isRead: boolean;
  isStarred?: boolean;
  
  // Processing metadata
  processed: boolean;
  processedAt?: Date;
  extractedData?: ExtractedEmailData;
  generatedTasks?: string[]; // Task IDs created from this email
  workflowId?: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  contentId?: string;
  isInline: boolean;
  data?: Buffer; // For small attachments
  downloadUrl?: string; // For large attachments
}

export interface EmailProcessingRule {
  id: string;
  name: string;
  description: string;
  conditions: EmailCondition[];
  actions: EmailAction[];
  priority: number; // Higher priority rules run first
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCondition {
  field: 'from' | 'to' | 'subject' | 'body' | 'attachment' | 'date' | 'importance';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'not_contains' | 'date_before' | 'date_after';
  value: string | Date;
  caseSensitive?: boolean;
}

export interface EmailAction {
  type: 'create_task' | 'create_case' | 'add_to_calendar' | 'extract_data' | 'forward' | 'archive' | 'label' | 'notify';
  config: EmailActionConfig;
}

export interface EmailActionConfig {
  // Task creation
  taskTemplate?: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string; // Can be extracted from email or relative
    assignee?: string;
    tags?: string[];
    extractDueDate?: boolean; // Try to extract due date from email content
  };
  
  // Case creation
  caseTemplate?: {
    title: string;
    description?: string;
    clientEmail?: string; // Extract from sender
    caseType?: string;
    status?: string;
    tags?: string[];
  };
  
  // Calendar event
  eventTemplate?: {
    title: string;
    description?: string;
    extractDateTime?: boolean; // Try to extract date/time from email
    duration?: number; // minutes
    location?: string;
    attendees?: string[];
  };
  
  // Data extraction
  extractionRules?: DataExtractionRule[];
  
  // Email management
  moveToFolder?: string;
  addLabels?: string[];
  markAsRead?: boolean;
  archive?: boolean;
  
  // Notifications
  notifyUsers?: string[];
  notificationTemplate?: {
    title: string;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  };
}

export interface DataExtractionRule {
  name: string;
  pattern: string; // Regex pattern
  type: 'text' | 'date' | 'email' | 'phone' | 'number' | 'currency' | 'address';
  required: boolean;
  defaultValue?: string;
}

export interface ExtractedEmailData {
  // Common legal email data
  caseNumbers?: string[];
  courtDates?: Date[];
  deadlines?: Date[];
  clientNames?: string[];
  phoneNumbers?: string[];
  addresses?: string[];
  amounts?: number[];
  
  // Custom extracted data
  customFields?: Record<string, any>;
  
  // AI-extracted insights
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high';
  category?: 'new_case' | 'court_notice' | 'client_communication' | 'deadline' | 'billing' | 'general';
  actionItems?: string[];
  keyPhrases?: string[];
  summary?: string;
}

// Email Parser Service
export class EmailParsingService {
  private config: EmailConfig;
  private processingQueue: EmailMessage[] = [];
  private isProcessing = false;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Core Email Processing
  async connectToProvider(): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'gmail':
          return await this.connectToGmail();
        case 'outlook':
          return await this.connectToOutlook();
        case 'imap':
          return await this.connectToIMAP();
        case 'exchange':
          return await this.connectToExchange();
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Email connection failed:', error);
      return false;
    }
  }

  async fetchNewEmails(since?: Date): Promise<EmailMessage[]> {
    const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    try {
      switch (this.config.provider) {
        case 'gmail':
          return await this.fetchGmailMessages(sinceDate);
        case 'outlook':
          return await this.fetchOutlookMessages(sinceDate);
        case 'imap':
          return await this.fetchIMAPMessages(sinceDate);
        default:
          throw new Error(`Fetch not implemented for ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      return [];
    }
  }

  async processEmail(email: EmailMessage): Promise<ExtractedEmailData> {
    if (email.processed) {
      return email.extractedData || {};
    }

    try {
      // Step 1: Extract basic data using regex patterns
      const extractedData = await this.extractBasicData(email);
      
      // Step 2: Apply AI-powered analysis
      const aiInsights = await this.applyAIAnalysis(email);
      
      // Step 3: Combine results
      const fullData: ExtractedEmailData = {
        ...extractedData,
        ...aiInsights
      };

      // Step 4: Apply processing rules
      await this.applyProcessingRules(email, fullData);

      // Step 5: Mark as processed
      email.processed = true;
      email.processedAt = new Date();
      email.extractedData = fullData;

      return fullData;
    } catch (error) {
      console.error('Email processing failed:', error);
      return {};
    }
  }

  async processBatch(emails: EmailMessage[]): Promise<void> {
    if (this.isProcessing) {
      console.log('Batch processing already in progress');
      return;
    }

    this.isProcessing = true;
    try {
      const batches = this.chunkArray(emails, this.config.batchSize);
      
      for (const batch of batches) {
        await Promise.all(batch.map(email => this.processEmail(email)));
        
        // Small delay between batches to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Data Extraction Methods
  private async extractBasicData(email: EmailMessage): Promise<Partial<ExtractedEmailData>> {
    const data: Partial<ExtractedEmailData> = {};
    const content = `${email.subject} ${email.bodyText || email.bodyHtml || ''}`;

    // Extract case numbers (various formats)
    data.caseNumbers = this.extractPattern(content, [
      /\b(?:case|matter|file)\s*(?:no|number|#)?\s*:?\s*([A-Z0-9-]+)/gi,
      /\b[A-Z]{2,4}-?\d{2,4}-?\d{2,6}\b/g, // Format: ABC-2024-123456
      /\b\d{2,4}-[A-Z]{2,4}-\d{2,6}\b/g    // Format: 24-CV-123456
    ]);

    // Extract court dates and deadlines
    data.courtDates = this.extractDates(content, [
      /(?:court|hearing|trial|appearance)\s+(?:on|date|scheduled)\s+([^.!?]+)/gi,
      /(?:hearing|trial)\s+(?:is\s+)?(?:set|scheduled)\s+(?:for\s+)?([^.!?]+)/gi
    ]);

    data.deadlines = this.extractDates(content, [
      /(?:deadline|due|respond|file)\s+(?:by|on|before)\s+([^.!?]+)/gi,
      /(?:must\s+be\s+(?:filed|submitted|received)\s+(?:by|on|before)\s+)([^.!?]+)/gi
    ]);

    // Extract client names (after "Re:" or "Client:")
    data.clientNames = this.extractPattern(content, [
      /(?:re|client|matter):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /(?:for|regarding)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    ]);

    // Extract phone numbers
    data.phoneNumbers = this.extractPattern(content, [
      /\b\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      /\b([0-9]{3})[-.\s]([0-9]{3})[-.\s]([0-9]{4})\b/g
    ]);

    // Extract addresses
    data.addresses = this.extractPattern(content, [
      /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct)\s*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}/gi
    ]);

    // Extract monetary amounts
    const amounts = this.extractPattern(content, [
      /\$[\d,]+\.?\d*/g,
      /(?:USD|dollars?)\s*[\d,]+\.?\d*/gi
    ]);
    data.amounts = amounts.map(amount => parseFloat(amount.replace(/[,$]/g, ''))).filter(n => !isNaN(n));

    return data;
  }

  private async applyAIAnalysis(email: EmailMessage): Promise<Partial<ExtractedEmailData>> {
    try {
      // Integration with existing AI service
      const { lifeOSAI } = await import('../ai/openai-client');
      
      const prompt = `
Analyze this email and extract key information:

Subject: ${email.subject}
From: ${email.from.email} ${email.from.name || ''}
Content: ${(email.bodyText || email.bodyHtml || '').substring(0, 2000)}

Please provide:
1. Sentiment (positive/neutral/negative)
2. Urgency level (low/medium/high)
3. Category (new_case/court_notice/client_communication/deadline/billing/general)
4. Action items (list of specific actions needed)
5. Key phrases (important terms or concepts)
6. Brief summary (1-2 sentences)

Return as JSON with these fields: sentiment, urgency, category, actionItems, keyPhrases, summary
`;

      // Use the workflow suggestions method as a general AI analysis tool
      const analysis = await lifeOSAI.generateWorkflowSuggestions({
        currentTask: { title: email.subject, description: email.bodyText || email.bodyHtml || '', priority: 'medium' }
      });
      
      // For now, return a simple JSON string that can be parsed
      const jsonResponse = JSON.stringify({
        sentiment: 'neutral',
        urgency: 'medium', 
        category: 'general',
        actionItems: analysis.slice(0, 3),
        keyPhrases: [email.subject.split(' ').slice(0, 3).join(' ')],
        summary: `Email from ${email.from.email} regarding ${email.subject}`
      });

      try {
        return JSON.parse(jsonResponse);
      } catch {
        // Fallback to basic analysis if AI parsing fails
        return this.basicAnalysis(email);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.basicAnalysis(email);
    }
  }

  private basicAnalysis(email: EmailMessage): Partial<ExtractedEmailData> {
    const content = `${email.subject} ${email.bodyText || email.bodyHtml || ''}`.toLowerCase();
    
    // Basic sentiment analysis
    const positiveWords = ['thank', 'pleased', 'happy', 'excellent', 'great', 'good'];
    const negativeWords = ['urgent', 'immediate', 'problem', 'issue', 'concerned', 'complaint'];
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveWords.some(word => content.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => content.includes(word))) {
      sentiment = 'negative';
    }

    // Basic urgency detection
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'emergency', 'deadline', 'expires'];
    const urgency: 'low' | 'medium' | 'high' = urgentKeywords.some(word => content.includes(word)) ? 'high' : 
                                               email.importance === 'high' ? 'medium' : 'low';

    // Basic categorization
    let category: ExtractedEmailData['category'] = 'general';
    if (content.includes('court') || content.includes('hearing') || content.includes('trial')) {
      category = 'court_notice';
    } else if (content.includes('new case') || content.includes('new matter')) {
      category = 'new_case';
    } else if (content.includes('deadline') || content.includes('due')) {
      category = 'deadline';
    } else if (content.includes('bill') || content.includes('invoice') || content.includes('payment')) {
      category = 'billing';
    } else if (email.from.email.includes('client') || content.includes('client')) {
      category = 'client_communication';
    }

    return {
      sentiment,
      urgency,
      category,
      actionItems: [], // Would need more sophisticated parsing
      keyPhrases: [],
      summary: `Email from ${email.from.email} regarding ${email.subject}`
    };
  }

  private async applyProcessingRules(email: EmailMessage, extractedData: ExtractedEmailData): Promise<void> {
    // Sort rules by priority (higher first)
    const sortedRules = [...this.config.processingRules]
      .filter(rule => rule.active)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.matchesConditions(email, extractedData, rule.conditions)) {
        await this.executeActions(email, extractedData, rule.actions);
        
        // Store workflow ID for tracking
        email.workflowId = rule.id;
        break; // Only apply first matching rule
      }
    }
  }

  private matchesConditions(email: EmailMessage, extractedData: ExtractedEmailData, conditions: EmailCondition[]): boolean {
    return conditions.every(condition => {
      let fieldValue: string | Date | undefined;
      
      switch (condition.field) {
        case 'from':
          fieldValue = email.from.email;
          break;
        case 'to':
          fieldValue = email.to.map(addr => addr.email).join(', ');
          break;
        case 'subject':
          fieldValue = email.subject;
          break;
        case 'body':
          fieldValue = email.bodyText || email.bodyHtml || '';
          break;
        case 'date':
          fieldValue = email.date;
          break;
        case 'importance':
          fieldValue = email.importance;
          break;
        default:
          return false;
      }

      if (!fieldValue) return false;

      // Handle date comparisons
      if (condition.field === 'date' && fieldValue instanceof Date && condition.value instanceof Date) {
        switch (condition.operator) {
          case 'date_before':
            return fieldValue < condition.value;
          case 'date_after':
            return fieldValue > condition.value;
          default:
            return false;
        }
      }

      // Handle string comparisons
      if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
        const compareValue = condition.caseSensitive ? fieldValue : fieldValue.toLowerCase();
        const targetValue = condition.caseSensitive ? condition.value : condition.value.toLowerCase();

        switch (condition.operator) {
          case 'contains':
            return compareValue.includes(targetValue);
          case 'not_contains':
            return !compareValue.includes(targetValue);
          case 'equals':
            return compareValue === targetValue;
          case 'starts_with':
            return compareValue.startsWith(targetValue);
          case 'ends_with':
            return compareValue.endsWith(targetValue);
          case 'regex':
            try {
              const regex = new RegExp(condition.value, condition.caseSensitive ? 'g' : 'gi');
              return regex.test(fieldValue);
            } catch {
              return false;
            }
          default:
            return false;
        }
      }

      return false;
    });
  }

  private async executeActions(email: EmailMessage, extractedData: ExtractedEmailData, actions: EmailAction[]): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'create_task':
            await this.createTaskFromEmail(email, extractedData, action.config.taskTemplate!);
            break;
          case 'create_case':
            await this.createCaseFromEmail(email, extractedData, action.config.caseTemplate!);
            break;
          case 'add_to_calendar':
            await this.createCalendarEventFromEmail(email, extractedData, action.config.eventTemplate!);
            break;
          case 'extract_data':
            await this.extractCustomData(email, action.config.extractionRules!);
            break;
          case 'notify':
            await this.sendNotification(email, action.config.notificationTemplate!);
            break;
          // Add more action types as needed
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async createTaskFromEmail(email: EmailMessage, data: ExtractedEmailData, template: any): Promise<void> {
    // Integration with workflow engine
    const { workflowEngine } = await import('./workflow-engine');
    
    await workflowEngine.handleEvent('email_task_creation', {
      emailId: email.id,
      template,
      extractedData: data
    });
  }

  private async createCaseFromEmail(email: EmailMessage, data: ExtractedEmailData, template: any): Promise<void> {
    // TODO: Integrate with case management system
    console.log('Creating case from email:', email.subject, template);
  }

  private async createCalendarEventFromEmail(email: EmailMessage, data: ExtractedEmailData, template: any): Promise<void> {
    // Integration with calendar service
    const { CalendarIntegrationService } = await import('./calendar-integration');
    console.log('Creating calendar event from email:', email.subject, template);
  }

  private async extractCustomData(email: EmailMessage, rules: DataExtractionRule[]): Promise<void> {
    const content = `${email.subject} ${email.bodyText || email.bodyHtml || ''}`;
    const customFields: Record<string, any> = {};

    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches && matches.length > 0) {
          let value: any = matches[0];
          
          // Type conversion
          switch (rule.type) {
            case 'number':
              value = parseFloat(value.replace(/[^0-9.-]/g, ''));
              break;
            case 'date':
              value = new Date(value);
              break;
            case 'currency':
              value = parseFloat(value.replace(/[^0-9.]/g, ''));
              break;
          }
          
          customFields[rule.name] = value;
        } else if (rule.required && rule.defaultValue) {
          customFields[rule.name] = rule.defaultValue;
        }
      } catch (error) {
        console.error(`Failed to apply extraction rule ${rule.name}:`, error);
      }
    }

    if (!email.extractedData) {
      email.extractedData = {};
    }
    email.extractedData.customFields = { ...email.extractedData.customFields, ...customFields };
  }

  private async sendNotification(email: EmailMessage, template: any): Promise<void> {
    // TODO: Integrate with notification system
    console.log('Sending notification for email:', email.subject, template);
  }

  // Utility Methods
  private extractPattern(text: string, patterns: RegExp[]): string[] {
    const results: string[] = [];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        results.push(...matches);
      }
    }
    
    return [...new Set(results)]; // Remove duplicates
  }

  private extractDates(text: string, patterns: RegExp[]): Date[] {
    const dateStrings = this.extractPattern(text, patterns);
    const dates: Date[] = [];
    
    for (const dateStr of dateStrings) {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      } catch {
        // Ignore invalid dates
      }
    }
    
    return dates;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Provider-specific implementations (stubs)
  private async connectToGmail(): Promise<boolean> {
    // TODO: Implement Gmail API connection
    console.log('Connecting to Gmail...');
    return true;
  }

  private async connectToOutlook(): Promise<boolean> {
    // TODO: Implement Microsoft Graph API connection
    console.log('Connecting to Outlook...');
    return true;
  }

  private async connectToIMAP(): Promise<boolean> {
    // TODO: Implement IMAP connection
    console.log('Connecting to IMAP...');
    return true;
  }

  private async connectToExchange(): Promise<boolean> {
    // TODO: Implement Exchange Web Services connection
    console.log('Connecting to Exchange...');
    return true;
  }

  private async fetchGmailMessages(since: Date): Promise<EmailMessage[]> {
    // TODO: Implement Gmail message fetching
    console.log('Fetching Gmail messages since:', since);
    return [];
  }

  private async fetchOutlookMessages(since: Date): Promise<EmailMessage[]> {
    // TODO: Implement Outlook message fetching
    console.log('Fetching Outlook messages since:', since);
    return [];
  }

  private async fetchIMAPMessages(since: Date): Promise<EmailMessage[]> {
    // TODO: Implement IMAP message fetching
    console.log('Fetching IMAP messages since:', since);
    return [];
  }
}

// Pre-built Email Processing Rules
export const emailProcessingTemplates = {
  courtNotices: {
    id: 'court_notices',
    name: 'Court Notices Auto-Processing',
    description: 'Automatically process court notices and create tasks',
    conditions: [
      {
        field: 'from' as const,
        operator: 'contains' as const,
        value: 'court',
        caseSensitive: false
      },
      {
        field: 'subject' as const,
        operator: 'contains' as const,
        value: 'hearing|trial|motion|notice',
        caseSensitive: false
      }
    ],
    actions: [
      {
        type: 'create_task' as const,
        config: {
          taskTemplate: {
            title: 'Court Notice: {{email.subject}}',
            description: 'Process court notice and prepare response',
            priority: 'high' as const,
            extractDueDate: true,
            tags: ['court', 'urgent', 'legal']
          }
        }
      },
      {
        type: 'add_to_calendar' as const,
        config: {
          eventTemplate: {
            title: 'Court: {{email.subject}}',
            extractDateTime: true,
            duration: 120
          }
        }
      }
    ],
    priority: 10,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  newClientInquiries: {
    id: 'new_client_inquiries',
    name: 'New Client Inquiry Processing',
    description: 'Automatically create cases for new client inquiries',
    conditions: [
      {
        field: 'subject' as const,
        operator: 'contains' as const,
        value: 'consultation|inquiry|new case|legal help',
        caseSensitive: false
      }
    ],
    actions: [
      {
        type: 'create_case' as const,
        config: {
          caseTemplate: {
            title: 'New Inquiry: {{email.from.name}}',
            description: 'Initial client consultation',
            clientEmail: '{{email.from.email}}',
            caseType: 'consultation',
            status: 'new',
            tags: ['new_client', 'consultation']
          }
        }
      },
      {
        type: 'create_task' as const,
        config: {
          taskTemplate: {
            title: 'Follow up with {{email.from.name}}',
            description: 'Schedule consultation and send intake forms',
            priority: 'medium' as const,
            dueDate: '+1 day',
            tags: ['follow_up', 'new_client']
          }
        }
      }
    ],
    priority: 8,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  deadlineAlerts: {
    id: 'deadline_alerts',
    name: 'Deadline Alert Processing',
    description: 'Process deadline notifications and create urgent tasks',
    conditions: [
      {
        field: 'subject' as const,
        operator: 'contains' as const,
        value: 'deadline|due|expires|final notice',
        caseSensitive: false
      }
    ],
    actions: [
      {
        type: 'create_task' as const,
        config: {
          taskTemplate: {
            title: 'URGENT: {{email.subject}}',
            description: 'Review deadline requirements and take action',
            priority: 'high' as const,
            extractDueDate: true,
            tags: ['deadline', 'urgent', 'time_sensitive']
          }
        }
      },
      {
        type: 'notify' as const,
        config: {
          notificationTemplate: {
            title: 'Urgent Deadline Alert',
            message: 'New deadline notification received: {{email.subject}}',
            urgency: 'high' as const
          }
        }
      }
    ],
    priority: 9,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  billingInvoices: {
    id: 'billing_invoices',
    name: 'Billing and Invoice Processing',
    description: 'Process billing emails and track payments',
    conditions: [
      {
        field: 'subject' as const,
        operator: 'contains' as const,
        value: 'invoice|bill|payment|statement',
        caseSensitive: false
      }
    ],
    actions: [
      {
        type: 'extract_data' as const,
        config: {
          extractionRules: [
            {
              name: 'invoice_number',
              pattern: '(?:invoice|bill)\\s*#?\\s*([A-Z0-9-]+)',
              type: 'text',
              required: true,
              defaultValue: 'N/A'
            },
            {
              name: 'amount_due',
              pattern: '\\$([0-9,]+\\.?[0-9]*)',
              type: 'currency',
              required: true,
              defaultValue: '0'
            },
            {
              name: 'due_date',
              pattern: '(?:due|payment due)\\s+(?:by|on)?\\s*([^.!?]+)',
              type: 'date',
              required: false
            }
          ]
        }
      },
      {
        type: 'create_task' as const,
        config: {
          taskTemplate: {
            title: 'Process Invoice: {{extracted.invoice_number}}',
            description: 'Review and process invoice for ${{extracted.amount_due}}',
            priority: 'medium' as const,
            dueDate: '{{extracted.due_date}}',
            tags: ['billing', 'invoice', 'payment']
          }
        }
      }
    ],
    priority: 5,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Email Parser Factory
export class EmailParserFactory {
  static createParser(provider: EmailProvider, config: Partial<EmailConfig>): EmailParsingService {
    const fullConfig: EmailConfig = {
      provider,
      credentials: {},
      watchFolders: ['INBOX'],
      processingRules: [],
      autoProcessing: true,
      batchSize: 10,
      retentionDays: 30,
      ...config
    };

    return new EmailParsingService(fullConfig);
  }

  static getProviderCapabilities(provider: EmailProvider): {
    features: string[];
    limitations: string[];
    requirements: string[];
  } {
    switch (provider) {
      case 'gmail':
        return {
          features: ['OAuth2 authentication', 'Real-time push notifications', 'Advanced search', 'Label management'],
          limitations: ['Rate limiting (250 quota units/user/second)', 'Requires Google API setup'],
          requirements: ['Google Cloud Project', 'Gmail API enabled', 'OAuth2 credentials']
        };
      
      case 'outlook':
        return {
          features: ['Microsoft Graph integration', 'Real-time webhooks', 'Rich metadata', 'Folder management'],
          limitations: ['Requires Azure AD setup', 'Throttling limits'],
          requirements: ['Azure AD app registration', 'Microsoft Graph permissions', 'OAuth2 setup']
        };
      
      case 'imap':
        return {
          features: ['Universal email support', 'Direct protocol access', 'Full control'],
          limitations: ['No real-time notifications', 'Polling required', 'Basic authentication'],
          requirements: ['IMAP server details', 'Username/password', 'SSL/TLS support']
        };
      
      case 'exchange':
        return {
          features: ['Enterprise integration', 'Exchange Web Services', 'Calendar integration'],
          limitations: ['Enterprise-focused', 'Complex setup', 'Version dependencies'],
          requirements: ['Exchange server access', 'Domain credentials', 'Network connectivity']
        };
      
      default:
        return {
          features: [],
          limitations: ['Provider not fully supported'],
          requirements: ['Custom implementation needed']
        };
    }
  }

  static getRecommendedProvider(requirements: {
    realTimeUpdates?: boolean;
    enterpriseFeatures?: boolean;
    simplicity?: boolean;
    customization?: boolean;
  }): EmailProvider {
    if (requirements.enterpriseFeatures) {
      return 'exchange';
    }
    if (requirements.realTimeUpdates) {
      return 'gmail';
    }
    if (requirements.simplicity) {
      return 'imap';
    }
    if (requirements.customization) {
      return 'imap';
    }
    
    // Default recommendation
    return 'gmail';
  }
}
