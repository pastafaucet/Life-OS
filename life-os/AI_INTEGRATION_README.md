# Life OS AI Integration

## Overview

This document describes the AI integration implemented in Life OS, transforming it from a basic task management system into an intelligent, AI-enhanced productivity platform.

## Architecture

### Core Components

1. **OpenAI Client** (`src/lib/ai/openai-client.ts`)
   - Handles all OpenAI API interactions
   - Provides task enhancement, case analysis, and workflow suggestions
   - Includes proper error handling and type safety with Zod schemas

2. **Enhanced Storage** (`src/lib/ai/enhanced-storage.ts`)
   - Extends the original data structures with AI capabilities
   - Manages AI insights and metadata
   - Handles data migration from legacy formats
   - Provides cleanup utilities for old insights

3. **Enhanced Data Context** (`src/lib/ai/enhanced-data-context.tsx`)
   - Wraps the original data context with AI functionality
   - Maintains backward compatibility
   - Provides both enhanced and legacy interfaces
   - Manages AI processing states

4. **AI Test Component** (`src/components/AITestComponent.tsx`)
   - Interactive testing interface for AI features
   - Shows AI status and configuration requirements
   - Provides step-by-step testing workflow

## AI Features

### 1. Task Enhancement
- **Intelligent Title Suggestions**: AI analyzes task descriptions to suggest more specific, actionable titles
- **Estimated Time Calculation**: Provides realistic time estimates based on task complexity
- **Priority Recommendations**: Suggests appropriate priority levels (P1, P2, P3, deadline)
- **Related Case Detection**: Identifies connections to existing legal cases
- **Document Requirements**: Suggests what documents might be needed
- **Key Contact Identification**: Recommends relevant contacts for the task

### 2. Case Analysis
- **Complexity Assessment**: Analyzes cases as low, medium, or high complexity
- **Duration Estimation**: Provides realistic timeline estimates in weeks
- **Success Probability**: Calculates likelihood of favorable outcomes
- **Risk Factor Identification**: Highlights potential risks and challenges
- **Action Recommendations**: Suggests next steps and strategies
- **Resource Requirements**: Identifies needed resources and expertise

### 3. Cross-Module Connections
- **Intelligent Linking**: Finds relationships between tasks, cases, and contacts
- **Dependency Detection**: Identifies task dependencies and conflicts
- **Opportunity Recognition**: Suggests beneficial connections and collaborations
- **Conflict Identification**: Warns about potential scheduling or resource conflicts

### 4. Workflow Optimization
- **Smart Prioritization**: AI-driven task ordering based on deadlines and importance
- **Workload Balancing**: Suggests optimal task distribution
- **Deadline Management**: Proactive deadline preparation recommendations
- **Efficiency Insights**: Identifies workflow bottlenecks and improvements

## Data Structures

### Enhanced Task
```typescript
interface EnhancedTask {
  // Original fields
  id: string;
  title: string;
  description?: string;
  priority: 'P1' | 'P2' | 'P3' | 'deadline';
  status: 'inbox' | 'next_action' | 'in_progress' | 'done';
  case_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  due_date?: string;
  
  // AI Enhancements
  ai_enhanced?: boolean;
  ai_confidence?: number;
  ai_suggestions?: {
    estimatedHours?: number;
    relatedCaseTypes?: string[];
    requiredDocuments?: string[];
    keyContacts?: string[];
    reasoning?: string;
  };
  ai_insights?: string[];
}
```

### Enhanced Case
```typescript
interface EnhancedCase {
  // Original fields
  id: string;
  title: string;
  description?: string;
  case_type: string;
  client_name: string;
  status: 'active' | 'closed' | 'on_hold';
  created_at: string;
  updated_at: string;
  
  // AI Enhancements
  ai_analysis?: {
    complexity?: 'low' | 'medium' | 'high';
    estimatedDuration?: number;
    successProbability?: number;
    riskFactors?: string[];
    recommendedActions?: string[];
    requiredResources?: string[];
    confidence?: number;
  };
  ai_insights?: string[];
}
```

### AI Insight
```typescript
interface AIInsight {
  id: string;
  type: 'task_enhancement' | 'case_analysis' | 'cross_connection' | 'workflow_suggestion';
  entityId: string;
  entityType: 'task' | 'case' | 'contact';
  data: TaskEnhancement | CaseAnalysis | CrossModuleConnection | string[];
  confidence: number;
  createdAt: string;
  appliedAt?: string;
  dismissed?: boolean;
}
```

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key for configuration

### 2. Configure Environment
1. Create `.env.local` file in the project root:
```bash
# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

2. Restart the development server:
```bash
npm run dev
```

### 3. Test AI Integration
1. Navigate to the main dashboard
2. Scroll down to the "AI Integration Test" section
3. Click "Run AI Test" to verify functionality
4. Check that AI Status shows "Enabled" (green dot)

## Usage Examples

### Creating an AI-Enhanced Task
```typescript
const { addTask } = useAIEnhancedData();

// Create a task - AI will automatically enhance it
const taskId = await addTask({
  title: "Review contract",
  description: "Need to review employment agreement for new client",
  priority: "P2",
  status: "inbox",
  case_ids: [],
  tags: []
});

// AI will automatically:
// - Suggest a more specific title
// - Estimate time required
// - Identify related case types
// - Suggest required documents
// - Recommend key contacts
```

### Analyzing Case Complexity
```typescript
const { analyzeCase } = useAIEnhancedData();

// Analyze an existing case
await analyzeCase(caseId);

// AI will provide:
// - Complexity assessment (low/medium/high)
// - Duration estimate
// - Success probability
// - Risk factors
// - Recommended actions
// - Required resources
```

### Getting Workflow Suggestions
```typescript
const { getWorkflowSuggestions } = useAIEnhancedData();

// Get AI-powered workflow recommendations
const suggestions = await getWorkflowSuggestions();

// Returns array of actionable suggestions like:
// - "Focus on P1 tasks with approaching deadlines"
// - "Consider delegating research tasks to free up time for client meetings"
// - "Schedule case preparation 2 days before court date"
```

## Configuration Options

### AI Settings
```typescript
interface AISettings {
  enabled: boolean;              // Enable/disable AI features
  autoEnhance: boolean;         // Auto-enhance new tasks/cases
  confidenceThreshold: number;  // Minimum confidence for suggestions (0-1)
  lastAnalysis?: string;        // Timestamp of last analysis
}
```

### Confidence Thresholds
- **0.9+**: High confidence - Auto-apply suggestions
- **0.7-0.9**: Medium confidence - Show as recommendations
- **0.5-0.7**: Low confidence - Show with warnings
- **<0.5**: Very low confidence - Don't show

## Performance Considerations

### API Usage Optimization
- **Batching**: Multiple requests are batched when possible
- **Caching**: Results are cached to avoid redundant API calls
- **Rate Limiting**: Built-in rate limiting to respect OpenAI limits
- **Error Handling**: Graceful degradation when API is unavailable

### Data Management
- **Insight Cleanup**: Old insights are automatically cleaned up after 30 days
- **Storage Efficiency**: Only store high-confidence insights
- **Migration Support**: Seamless migration from legacy data formats

## Security Considerations

### API Key Management
- **Environment Variables**: API keys stored in environment variables only
- **Client-Side Warning**: Development-only client-side usage (not recommended for production)
- **Server-Side Recommendation**: Use server-side API routes for production

### Data Privacy
- **Local Storage**: All data remains in browser localStorage
- **No Data Persistence**: OpenAI doesn't store conversation data
- **Minimal Data Sharing**: Only necessary data sent to OpenAI API

## Troubleshooting

### Common Issues

1. **AI Status: Disabled**
   - Check that `NEXT_PUBLIC_OPENAI_API_KEY` is set in `.env.local`
   - Restart the development server
   - Verify API key is valid

2. **API Errors**
   - Check OpenAI API key permissions
   - Verify account has sufficient credits
   - Check network connectivity

3. **Performance Issues**
   - Reduce confidence threshold to limit API calls
   - Disable auto-enhancement for large datasets
   - Clear old insights to reduce storage usage

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=lifeos:ai
```

## Future Enhancements

### Planned Features
1. **Document Analysis**: AI-powered document review and summarization
2. **Calendar Integration**: Smart scheduling based on task priorities
3. **Email Integration**: Automatic task creation from emails
4. **Voice Commands**: Voice-to-task conversion
5. **Predictive Analytics**: Workload forecasting and capacity planning

### Advanced AI Features
1. **Custom Models**: Fine-tuned models for legal-specific tasks
2. **Multi-Modal Input**: Support for images and documents
3. **Real-Time Collaboration**: AI-powered team coordination
4. **Learning Adaptation**: AI learns from user preferences over time

## Contributing

### Adding New AI Features
1. Extend the OpenAI client with new methods
2. Update the enhanced data structures
3. Add corresponding UI components
4. Update tests and documentation

### Testing AI Features
1. Use the AI Test Component for basic functionality
2. Add unit tests for AI client methods
3. Test with various confidence thresholds
4. Verify error handling and edge cases

## License

This AI integration is part of the Life OS project and follows the same licensing terms.
