import OpenAI from 'openai';
import { z } from 'zod';

// AI Enhancement Schemas
export const TaskEnhancementSchema = z.object({
  enhancedTitle: z.string(),
  suggestedDescription: z.string(),
  estimatedHours: z.number(),
  suggestedPriority: z.enum(['P1', 'P2', 'P3', 'deadline']),
  suggestedStatus: z.enum(['inbox', 'next_action', 'in_progress', 'done']),
  suggestedTags: z.array(z.string()),
  relatedCaseTypes: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
  keyContacts: z.array(z.string()),
  confidence: z.number(),
  reasoning: z.string()
});

export const CaseAnalysisSchema = z.object({
  caseComplexity: z.enum(['low', 'medium', 'high']),
  estimatedDuration: z.number(),
  successProbability: z.number(),
  riskFactors: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  requiredResources: z.array(z.string()),
  confidence: z.number()
});

export const CrossModuleConnectionSchema = z.object({
  sourceType: z.string(),
  sourceId: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  connectionType: z.enum(['related', 'dependency', 'conflict', 'opportunity']),
  strength: z.number(),
  reasoning: z.string()
});

export type TaskEnhancement = z.infer<typeof TaskEnhancementSchema>;
export type CaseAnalysis = z.infer<typeof CaseAnalysisSchema>;
export type CrossModuleConnection = z.infer<typeof CrossModuleConnectionSchema>;

export class LifeOSAI {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. AI features will be disabled.');
      this.isConfigured = false;
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for development
    });
    this.isConfigured = true;
  }

  async enhanceTask(taskInput: {
    title: string;
    description?: string;
    existingCases?: Array<{ id: string; title: string; case_type: string }>;
    existingContacts?: Array<{ id: string; first_name: string; last_name: string; type: string }>;
  }): Promise<TaskEnhancement | null> {
    if (!this.isConfigured || !this.openai) {
      console.warn('AI not configured, returning null enhancement');
      return null;
    }

    try {
      const prompt = `
Analyze this legal task and provide intelligent enhancements:

Task Title: "${taskInput.title}"
Task Description: "${taskInput.description || 'No description provided'}"

Available Cases: ${JSON.stringify(taskInput.existingCases || [])}
Available Contacts: ${JSON.stringify(taskInput.existingContacts || [])}

Please provide:
1. Enhanced title (more specific and actionable)
2. Suggested description (detailed and professional)
3. Estimated hours (realistic time estimate)
4. Suggested priority (P1=urgent, P2=important, P3=normal, deadline=time-sensitive)
5. Suggested status (inbox=new, next_action=ready to work, in_progress=active, done=complete)
6. Suggested tags (relevant keywords)
7. Related case types (litigation, transactional, etc.)
8. Required documents (what documents might be needed)
9. Key contacts (who should be involved)
10. Confidence score (0-1, how confident you are in these suggestions)
11. Reasoning (brief explanation of your analysis)

Respond with a JSON object matching this schema:
{
  "enhancedTitle": "string",
  "suggestedDescription": "string", 
  "estimatedHours": number,
  "suggestedPriority": "P1" | "P2" | "P3" | "deadline",
  "suggestedStatus": "inbox" | "next_action" | "in_progress" | "done",
  "suggestedTags": ["string"],
  "relatedCaseTypes": ["string"],
  "requiredDocuments": ["string"],
  "keyContacts": ["string"],
  "confidence": number,
  "reasoning": "string"
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in legal practice management. Provide intelligent, practical suggestions for legal tasks. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse and validate the response
      const parsedResponse = JSON.parse(content);
      const validatedResponse = TaskEnhancementSchema.parse(parsedResponse);
      
      return validatedResponse;
    } catch (error) {
      console.error('Error enhancing task:', error);
      return null;
    }
  }

  async analyzeCaseComplexity(caseData: {
    title: string;
    description?: string;
    case_type: string;
    client_name: string;
  }): Promise<CaseAnalysis | null> {
    if (!this.isConfigured || !this.openai) {
      return null;
    }

    try {
      const prompt = `
Analyze this legal case for complexity and provide strategic insights:

Case Title: "${caseData.title}"
Case Type: "${caseData.case_type}"
Client: "${caseData.client_name}"
Description: "${caseData.description || 'No description provided'}"

Please analyze and provide:
1. Case complexity (low, medium, high)
2. Estimated duration in weeks
3. Success probability (0-1)
4. Risk factors
5. Recommended actions
6. Required resources
7. Confidence in analysis (0-1)

Respond with JSON matching this schema:
{
  "caseComplexity": "low" | "medium" | "high",
  "estimatedDuration": number,
  "successProbability": number,
  "riskFactors": ["string"],
  "recommendedActions": ["string"],
  "requiredResources": ["string"],
  "confidence": number
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI legal analyst. Provide realistic, professional case analysis based on the information provided."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(content);
      const validatedResponse = CaseAnalysisSchema.parse(parsedResponse);
      
      return validatedResponse;
    } catch (error) {
      console.error('Error analyzing case:', error);
      return null;
    }
  }

  async findCrossModuleConnections(context: {
    tasks: Array<{ id: string; title: string; description?: string; case_ids: string[] }>;
    cases: Array<{ id: string; title: string; case_type: string; description?: string }>;
    contacts: Array<{ id: string; first_name: string; last_name: string; type: string }>;
  }): Promise<CrossModuleConnection[]> {
    if (!this.isConfigured || !this.openai) {
      return [];
    }

    try {
      const prompt = `
Analyze these entities and identify intelligent connections between them:

Tasks: ${JSON.stringify(context.tasks)}
Cases: ${JSON.stringify(context.cases)}
Contacts: ${JSON.stringify(context.contacts)}

Find connections where:
- Tasks relate to cases not currently linked
- Cases share similar characteristics or parties
- Contacts should be involved in specific tasks/cases
- Dependencies exist between tasks
- Conflicts might arise between cases/tasks

For each connection, provide:
1. Source type and ID
2. Target type and ID  
3. Connection type (related, dependency, conflict, opportunity)
4. Strength (0-1, how strong the connection is)
5. Reasoning

Respond with JSON array of connections:
[{
  "sourceType": "string",
  "sourceId": "string", 
  "targetType": "string",
  "targetId": "string",
  "connectionType": "related" | "dependency" | "conflict" | "opportunity",
  "strength": number,
  "reasoning": "string"
}]
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI that identifies intelligent connections between legal tasks, cases, and contacts. Focus on practical, actionable connections."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const parsedResponse = JSON.parse(content);
      const connections = Array.isArray(parsedResponse) ? parsedResponse : [];
      
      // Validate each connection
      const validatedConnections = connections
        .map(conn => {
          try {
            return CrossModuleConnectionSchema.parse(conn);
          } catch {
            return null;
          }
        })
        .filter(conn => conn !== null) as CrossModuleConnection[];
      
      return validatedConnections;
    } catch (error) {
      console.error('Error finding connections:', error);
      return [];
    }
  }

  async generateWorkflowSuggestions(context: {
    currentTask?: { title: string; description?: string; priority: string };
    upcomingDeadlines?: Array<{ title: string; due_date: string }>;
    workloadCapacity?: number;
  }): Promise<string[]> {
    if (!this.isConfigured || !this.openai) {
      return [];
    }

    try {
      const prompt = `
Based on this context, provide 3-5 intelligent workflow suggestions:

Current Task: ${JSON.stringify(context.currentTask)}
Upcoming Deadlines: ${JSON.stringify(context.upcomingDeadlines)}
Workload Capacity: ${context.workloadCapacity || 'Unknown'}

Provide actionable suggestions for:
- Task prioritization
- Time management
- Deadline preparation
- Workflow optimization
- Risk mitigation

Return as JSON array of strings: ["suggestion1", "suggestion2", ...]
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI productivity coach for legal professionals. Provide practical, actionable workflow suggestions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 600
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('Error generating workflow suggestions:', error);
      return [];
    }
  }

  isAIEnabled(): boolean {
    return this.isConfigured;
  }
}

// Singleton instance
export const lifeOSAI = new LifeOSAI();
