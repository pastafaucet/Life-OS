// External API Orchestration System
// Manages integration with third-party APIs and services

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  type: 'rest' | 'graphql' | 'webhook' | 'websocket';
  authentication: APIAuthentication;
  rateLimit: RateLimit;
  timeout: number;
  retryConfig: RetryConfig;
  healthCheck: HealthCheckConfig;
  isEnabled: boolean;
  lastHealthCheck: Date;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  responseTime: number; // ms
  errorRate: number; // percentage
  uptime: number; // percentage
  metadata: {
    version: string;
    provider: string;
    category: 'legal' | 'communication' | 'productivity' | 'analytics' | 'storage' | 'ai';
    description: string;
    documentation: string;
    support: string;
  };
}

export interface APIAuthentication {
  type: 'bearer' | 'api_key' | 'oauth2' | 'basic' | 'custom';
  credentials: {
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    username?: string;
    password?: string;
    customHeaders?: Record<string, string>;
  };
  expiresAt?: Date;
  scope?: string[];
  isValid: boolean;
}

export interface RateLimit {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  currentUsage: {
    second: number;
    minute: number;
    hour: number;
    day: number;
  };
  resetTime: Date;
}

export interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number; // ms
  maxDelay: number; // ms
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface HealthCheckConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'HEAD';
  interval: number; // minutes
  timeout: number; // ms
  expectedStatus: number;
  expectedResponse?: string;
  isEnabled: boolean;
}

export interface APIRequest {
  id: string;
  endpointId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  body?: any;
  timestamp: Date;
  status: 'pending' | 'success' | 'error' | 'timeout' | 'rate_limited';
  responseTime?: number;
  responseStatus?: number;
  responseData?: any;
  error?: string;
  retryAttempt: number;
  context: {
    userId?: string;
    caseId?: string;
    taskId?: string;
    workflowId?: string;
    source: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
}

export interface APIResponse {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  timestamp: Date;
  cached: boolean;
  fromCache?: Date;
}

export interface APIIntegration {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'communication' | 'productivity' | 'analytics' | 'storage' | 'ai';
  endpoints: APIEndpoint[];
  webhooks: WebhookConfig[];
  schedules: ScheduledJob[];
  transformations: DataTransformation[];
  isEnabled: boolean;
  settings: IntegrationSettings;
  metrics: IntegrationMetrics;
}

export interface WebhookConfig {
  id: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  secret?: string;
  events: string[];
  isEnabled: boolean;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
  retryConfig: RetryConfig;
}

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  endpoint: string;
  params: Record<string, any>;
  isEnabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  successCount: number;
  errorCount: number;
  averageRunTime: number;
}

export interface DataTransformation {
  id: string;
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  transformFunction: string; // JavaScript function as string
  isEnabled: boolean;
  testCases: TransformationTestCase[];
}

export interface TransformationTestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  actualOutput?: any;
  passed: boolean;
  lastRun?: Date;
}

export interface IntegrationSettings {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableCaching: boolean;
  cacheTimeout: number; // minutes
  enableRateLimiting: boolean;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number; // error rate percentage
  enableNotifications: boolean;
  notificationChannels: string[];
  enableMetrics: boolean;
  metricsRetention: number; // days
}

export interface IntegrationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  lastUpdated: Date;
  dailyStats: DailyMetrics[];
  errorBreakdown: ErrorBreakdown[];
}

export interface DailyMetrics {
  date: string;
  requests: number;
  successes: number;
  failures: number;
  averageResponseTime: number;
  peakResponseTime: number;
  dataTransferred: number; // bytes
}

export interface ErrorBreakdown {
  errorType: string;
  count: number;
  percentage: number;
  lastOccurrence: Date;
  examples: string[];
}

export class ExternalAPIOrchestrator {
  private integrations: Map<string, APIIntegration> = new Map();
  private activeRequests: Map<string, APIRequest> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: OrchestrationMetrics;

  constructor() {
    this.metrics = {
      totalIntegrations: 0,
      activeIntegrations: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      systemUptime: 100,
      lastUpdated: new Date()
    };

    this.initializeDefaultIntegrations();
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  private initializeDefaultIntegrations() {
    // Legal Research APIs
    this.registerIntegration({
      id: 'westlaw-api',
      name: 'Westlaw Edge API',
      description: 'Legal research and case law database',
      category: 'legal',
      endpoints: [
        {
          id: 'westlaw-search',
          name: 'Legal Search',
          url: 'https://api.westlaw.com/v1/search',
          type: 'rest',
          authentication: {
            type: 'bearer',
            credentials: { token: process.env.WESTLAW_API_KEY },
            isValid: true
          },
          rateLimit: {
            requestsPerSecond: 10,
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
            burstLimit: 20,
            currentUsage: { second: 0, minute: 0, hour: 0, day: 0 },
            resetTime: new Date()
          },
          timeout: 30000,
          retryConfig: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 10000,
            retryableStatusCodes: [429, 500, 502, 503, 504],
            retryableErrors: ['TIMEOUT', 'NETWORK_ERROR']
          },
          healthCheck: {
            endpoint: '/health',
            method: 'GET',
            interval: 5,
            timeout: 5000,
            expectedStatus: 200,
            isEnabled: true
          },
          isEnabled: true,
          lastHealthCheck: new Date(),
          status: 'healthy',
          responseTime: 245,
          errorRate: 2.1,
          uptime: 99.8,
          metadata: {
            version: 'v1',
            provider: 'Thomson Reuters',
            category: 'legal',
            description: 'Legal research and case law database',
            documentation: 'https://api.westlaw.com/docs',
            support: 'support@westlaw.com'
          }
        }
      ],
      webhooks: [],
      schedules: [],
      transformations: [],
      isEnabled: true,
      settings: {
        enableLogging: true,
        logLevel: 'info',
        enableCaching: true,
        cacheTimeout: 60,
        enableRateLimiting: true,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 50,
        enableNotifications: true,
        notificationChannels: ['email', 'slack'],
        enableMetrics: true,
        metricsRetention: 30
      },
      metrics: {
        totalRequests: 1245,
        successfulRequests: 1220,
        failedRequests: 25,
        averageResponseTime: 245,
        uptime: 99.8,
        errorRate: 2.1,
        lastUpdated: new Date(),
        dailyStats: [],
        errorBreakdown: []
      }
    });

    // Court Filing Systems
    this.registerIntegration({
      id: 'court-filing-api',
      name: 'Electronic Court Filing',
      description: 'Court document filing and case management',
      category: 'legal',
      endpoints: [
        {
          id: 'court-filing',
          name: 'File Document',
          url: 'https://api.courtfiling.gov/v2/file',
          type: 'rest',
          authentication: {
            type: 'oauth2',
            credentials: {
              clientId: process.env.COURT_CLIENT_ID,
              clientSecret: process.env.COURT_CLIENT_SECRET,
              token: process.env.COURT_ACCESS_TOKEN
            },
            isValid: true,
            scope: ['file_documents', 'read_cases', 'manage_calendar']
          },
          rateLimit: {
            requestsPerSecond: 2,
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 2000,
            burstLimit: 5,
            currentUsage: { second: 0, minute: 0, hour: 0, day: 0 },
            resetTime: new Date()
          },
          timeout: 60000,
          retryConfig: {
            maxRetries: 2,
            backoffStrategy: 'linear',
            baseDelay: 2000,
            maxDelay: 10000,
            retryableStatusCodes: [429, 500, 502, 503],
            retryableErrors: ['TIMEOUT']
          },
          healthCheck: {
            endpoint: '/status',
            method: 'GET',
            interval: 10,
            timeout: 10000,
            expectedStatus: 200,
            isEnabled: true
          },
          isEnabled: true,
          lastHealthCheck: new Date(),
          status: 'healthy',
          responseTime: 1850,
          errorRate: 0.5,
          uptime: 99.9,
          metadata: {
            version: 'v2',
            provider: 'Court System',
            category: 'legal',
            description: 'Electronic court filing system',
            documentation: 'https://api.courtfiling.gov/docs',
            support: 'tech-support@courts.gov'
          }
        }
      ],
      webhooks: [
        {
          id: 'filing-status-webhook',
          url: '/api/webhooks/court-filing-status',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          secret: process.env.COURT_WEBHOOK_SECRET,
          events: ['filing_accepted', 'filing_rejected', 'case_updated'],
          isEnabled: true,
          successCount: 156,
          errorCount: 3,
          retryConfig: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 30000,
            retryableStatusCodes: [500, 502, 503, 504],
            retryableErrors: ['TIMEOUT']
          }
        }
      ],
      schedules: [],
      transformations: [],
      isEnabled: true,
      settings: {
        enableLogging: true,
        logLevel: 'info',
        enableCaching: false,
        cacheTimeout: 0,
        enableRateLimiting: true,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 25,
        enableNotifications: true,
        notificationChannels: ['email', 'sms'],
        enableMetrics: true,
        metricsRetention: 90
      },
      metrics: {
        totalRequests: 387,
        successfulRequests: 385,
        failedRequests: 2,
        averageResponseTime: 1850,
        uptime: 99.9,
        errorRate: 0.5,
        lastUpdated: new Date(),
        dailyStats: [],
        errorBreakdown: []
      }
    });

    // Document Management
    this.registerIntegration({
      id: 'dropbox-api',
      name: 'Dropbox Business',
      description: 'Cloud document storage and collaboration',
      category: 'storage',
      endpoints: [
        {
          id: 'dropbox-files',
          name: 'File Operations',
          url: 'https://api.dropboxapi.com/2/files',
          type: 'rest',
          authentication: {
            type: 'bearer',
            credentials: { token: process.env.DROPBOX_ACCESS_TOKEN },
            isValid: true
          },
          rateLimit: {
            requestsPerSecond: 20,
            requestsPerMinute: 600,
            requestsPerHour: 12000,
            requestsPerDay: 100000,
            burstLimit: 50,
            currentUsage: { second: 0, minute: 0, hour: 0, day: 0 },
            resetTime: new Date()
          },
          timeout: 45000,
          retryConfig: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 8000,
            retryableStatusCodes: [429, 500, 502, 503, 504],
            retryableErrors: ['TIMEOUT', 'NETWORK_ERROR']
          },
          healthCheck: {
            endpoint: '/check/user',
            method: 'POST',
            interval: 15,
            timeout: 10000,
            expectedStatus: 200,
            isEnabled: true
          },
          isEnabled: true,
          lastHealthCheck: new Date(),
          status: 'healthy',
          responseTime: 320,
          errorRate: 1.2,
          uptime: 99.95,
          metadata: {
            version: '2',
            provider: 'Dropbox',
            category: 'storage',
            description: 'Cloud storage and file sharing',
            documentation: 'https://www.dropbox.com/developers/documentation',
            support: 'https://www.dropbox.com/support'
          }
        }
      ],
      webhooks: [],
      schedules: [
        {
          id: 'sync-documents',
          name: 'Document Sync',
          description: 'Sync document changes every 30 minutes',
          schedule: '*/30 * * * *',
          endpoint: '/sync/documents',
          params: { delta: true },
          isEnabled: true,
          nextRun: new Date(Date.now() + 30 * 60 * 1000),
          successCount: 48,
          errorCount: 2,
          averageRunTime: 1250
        }
      ],
      transformations: [],
      isEnabled: true,
      settings: {
        enableLogging: true,
        logLevel: 'info',
        enableCaching: true,
        cacheTimeout: 30,
        enableRateLimiting: true,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 30,
        enableNotifications: true,
        notificationChannels: ['email'],
        enableMetrics: true,
        metricsRetention: 30
      },
      metrics: {
        totalRequests: 2456,
        successfulRequests: 2427,
        failedRequests: 29,
        averageResponseTime: 320,
        uptime: 99.95,
        errorRate: 1.2,
        lastUpdated: new Date(),
        dailyStats: [],
        errorBreakdown: []
      }
    });

    // AI Services
    this.registerIntegration({
      id: 'openai-api',
      name: 'OpenAI GPT',
      description: 'AI language model for text processing',
      category: 'ai',
      endpoints: [
        {
          id: 'openai-completions',
          name: 'Text Completions',
          url: 'https://api.openai.com/v1/chat/completions',
          type: 'rest',
          authentication: {
            type: 'bearer',
            credentials: { token: process.env.OPENAI_API_KEY },
            isValid: true
          },
          rateLimit: {
            requestsPerSecond: 3,
            requestsPerMinute: 90,
            requestsPerHour: 3000,
            requestsPerDay: 50000,
            burstLimit: 10,
            currentUsage: { second: 0, minute: 0, hour: 0, day: 0 },
            resetTime: new Date()
          },
          timeout: 60000,
          retryConfig: {
            maxRetries: 2,
            backoffStrategy: 'exponential',
            baseDelay: 2000,
            maxDelay: 15000,
            retryableStatusCodes: [429, 500, 502, 503, 504],
            retryableErrors: ['TIMEOUT', 'RATE_LIMITED']
          },
          healthCheck: {
            endpoint: '/models',
            method: 'GET',
            interval: 30,
            timeout: 10000,
            expectedStatus: 200,
            isEnabled: true
          },
          isEnabled: true,
          lastHealthCheck: new Date(),
          status: 'healthy',
          responseTime: 2350,
          errorRate: 3.5,
          uptime: 99.7,
          metadata: {
            version: 'v1',
            provider: 'OpenAI',
            category: 'ai',
            description: 'Advanced AI language model',
            documentation: 'https://platform.openai.com/docs',
            support: 'help@openai.com'
          }
        }
      ],
      webhooks: [],
      schedules: [],
      transformations: [
        {
          id: 'legal-prompt-transform',
          name: 'Legal Text Transformation',
          description: 'Transform user input into legal analysis prompts',
          inputSchema: { text: 'string', context: 'object' },
          outputSchema: { prompt: 'string', parameters: 'object' },
          transformFunction: `
            function transform(input) {
              return {
                prompt: \`Analyze the following legal text in the context of \${input.context.type}: \${input.text}\`,
                parameters: {
                  max_tokens: 1000,
                  temperature: 0.3,
                  top_p: 0.9
                }
              };
            }
          `,
          isEnabled: true,
          testCases: []
        }
      ],
      isEnabled: true,
      settings: {
        enableLogging: true,
        logLevel: 'info',
        enableCaching: true,
        cacheTimeout: 120,
        enableRateLimiting: true,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 20,
        enableNotifications: true,
        notificationChannels: ['email', 'slack'],
        enableMetrics: true,
        metricsRetention: 30
      },
      metrics: {
        totalRequests: 5234,
        successfulRequests: 5051,
        failedRequests: 183,
        averageResponseTime: 2350,
        uptime: 99.7,
        errorRate: 3.5,
        lastUpdated: new Date(),
        dailyStats: [],
        errorBreakdown: []
      }
    });

    // Analytics and Monitoring
    this.registerIntegration({
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Web analytics and user behavior tracking',
      category: 'analytics',
      endpoints: [
        {
          id: 'ga-reporting',
          name: 'Analytics Reporting',
          url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
          type: 'rest',
          authentication: {
            type: 'oauth2',
            credentials: {
              clientId: process.env.GA_CLIENT_ID,
              clientSecret: process.env.GA_CLIENT_SECRET,
              refreshToken: process.env.GA_REFRESH_TOKEN
            },
            isValid: true,
            scope: ['https://www.googleapis.com/auth/analytics.readonly']
          },
          rateLimit: {
            requestsPerSecond: 10,
            requestsPerMinute: 100,
            requestsPerHour: 10000,
            requestsPerDay: 50000,
            burstLimit: 20,
            currentUsage: { second: 0, minute: 0, hour: 0, day: 0 },
            resetTime: new Date()
          },
          timeout: 30000,
          retryConfig: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 10000,
            retryableStatusCodes: [429, 500, 502, 503, 504],
            retryableErrors: ['TIMEOUT', 'QUOTA_EXCEEDED']
          },
          healthCheck: {
            endpoint: '/metadata/ga/columns',
            method: 'GET',
            interval: 60,
            timeout: 15000,
            expectedStatus: 200,
            isEnabled: true
          },
          isEnabled: true,
          lastHealthCheck: new Date(),
          status: 'healthy',
          responseTime: 890,
          errorRate: 1.8,
          uptime: 99.85,
          metadata: {
            version: 'v4',
            provider: 'Google',
            category: 'analytics',
            description: 'Web analytics and reporting',
            documentation: 'https://developers.google.com/analytics/devguides/reporting',
            support: 'https://support.google.com/analytics'
          }
        }
      ],
      webhooks: [],
      schedules: [
        {
          id: 'daily-analytics-report',
          name: 'Daily Analytics Report',
          description: 'Generate daily usage analytics report',
          schedule: '0 6 * * *', // 6 AM daily
          endpoint: '/analytics/daily-report',
          params: { dimensions: ['date', 'pagePath'], metrics: ['sessions', 'users'] },
          isEnabled: true,
          nextRun: new Date(new Date().setHours(6, 0, 0, 0) + 24 * 60 * 60 * 1000),
          successCount: 30,
          errorCount: 1,
          averageRunTime: 2450
        }
      ],
      transformations: [],
      isEnabled: true,
      settings: {
        enableLogging: true,
        logLevel: 'info',
        enableCaching: true,
        cacheTimeout: 60,
        enableRateLimiting: true,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 25,
        enableNotifications: false,
        notificationChannels: [],
        enableMetrics: true,
        metricsRetention: 90
      },
      metrics: {
        totalRequests: 892,
        successfulRequests: 876,
        failedRequests: 16,
        averageResponseTime: 890,
        uptime: 99.85,
        errorRate: 1.8,
        lastUpdated: new Date(),
        dailyStats: [],
        errorBreakdown: []
      }
    });

    this.updateMetrics();
  }

  async registerIntegration(integration: APIIntegration): Promise<void> {
    this.integrations.set(integration.id, integration);
    
    // Initialize rate limiters for each endpoint
    integration.endpoints.forEach(endpoint => {
      this.rateLimiters.set(endpoint.id, new RateLimiter(endpoint.rateLimit));
      this.circuitBreakers.set(endpoint.id, new CircuitBreaker(endpoint.id));
    });

    this.updateMetrics();
  }

  async makeRequest(
    endpointId: string,
    method: APIRequest['method'],
    path: string,
    params: Record<string, any> = {},
    body?: any,
    context: APIRequest['context'] = { source: 'manual', priority: 'medium' }
  ): Promise<APIResponse> {
    const request: APIRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      endpointId,
      method,
      path,
      headers: {},
      params,
      body,
      timestamp: new Date(),
      status: 'pending',
      retryAttempt: 0,
      context
    };

    this.activeRequests.set(request.id, request);

    try {
      // Check rate limits
      const rateLimiter = this.rateLimiters.get(endpointId);
      if (rateLimiter && !rateLimiter.canMakeRequest()) {
        request.status = 'rate_limited';
        request.error = 'Rate limit exceeded';
        throw new Error('Rate limit exceeded');
      }

      // Check circuit breaker
      const circuitBreaker = this.circuitBreakers.get(endpointId);
      if (circuitBreaker && circuitBreaker.isOpen()) {
        request.status = 'error';
        request.error = 'Circuit breaker is open';
        throw new Error('Circuit breaker is open');
      }

      // Check cache
      const cacheKey = this.generateCacheKey(endpointId, method, path, params);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Make the actual request
      const response = await this.executeRequest(request);
      
      // Cache successful responses if caching is enabled
      const integration = this.integrations.get(this.getIntegrationIdFromEndpoint(endpointId));
      if (integration?.settings.enableCaching && response.status < 400) {
        this.cacheResponse(cacheKey, response, integration.settings.cacheTimeout);
      }

      // Update metrics
      this.updateRequestMetrics(request, response);

      return response;
    } catch (error) {
      request.status = 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Record failure in circuit breaker
      const circuitBreaker = this.circuitBreakers.get(endpointId);
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }

      // Update metrics
      this.updateRequestMetrics(request);

      throw error;
    } finally {
      this.activeRequests.delete(request.id);
    }
  }

  async executeWebhook(webhookId: string, data: any): Promise<void> {
    const webhook = this.findWebhook(webhookId);
    if (!webhook || !webhook.isEnabled) {
      throw new Error(`Webhook ${webhookId} not found or disabled`);
    }

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          ...webhook.headers,
          'X-Webhook-Signature': this.generateWebhookSignature(data, webhook.secret)
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        webhook.successCount++;
        webhook.lastTriggered = new Date();
      } else {
        webhook.errorCount++;
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    } catch (error) {
      webhook.errorCount++;
      
      // Retry if configured
      if (webhook.retryConfig.maxRetries > 0) {
        await this.retryWebhook(webhook, data, 1);
      }
      
      throw error;
    }
  }

  getIntegrationMetrics(): OrchestrationMetrics {
    return this.metrics;
  }

  getIntegrationById(id: string): APIIntegration | undefined {
    return this.integrations.get(id);
  }

  getAllIntegrations(): APIIntegration[] {
    return Array.from(this.integrations.values());
  }

  getActiveIntegrations(): APIIntegration[] {
    return this.getAllIntegrations().filter(integration => integration.isEnabled);
  }

  getIntegrationsByCategory(category: APIIntegration['category']): APIIntegration[] {
    return this.getAllIntegrations().filter(integration => integration.category === category);
  }

  async enableIntegration(id: string): Promise<void> {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.isEnabled = true;
      this.updateMetrics();
    }
  }

  async disableIntegration(id: string): Promise<void> {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.isEnabled = false;
      this.updateMetrics();
    }
  }

  private async executeRequest(request: APIRequest): Promise<APIResponse> {
    const endpoint = this.findEndpoint(request.endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${request.endpointId} not found`);
    }

    const startTime = Date.now();
    const url = new URL(request.path, endpoint.url);
    
    // Add query parameters
    Object.entries(request.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    // Build headers
    const headers = {
      ...request.headers,
      ...this.buildAuthenticationHeaders(endpoint.authentication)
    };

    try {
      const response = await fetch(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: AbortSignal.timeout(endpoint.timeout)
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json().catch(() => null);

      const apiResponse: APIResponse = {
        id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        responseTime,
        timestamp: new Date(),
        cached: false
      };

      request.status = response.ok ? 'success' : 'error';
      request.responseTime = responseTime;
      request.responseStatus = response.status;
      request.responseData = data;

      return apiResponse;
    } catch (error) {
      request.status = error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'error';
      request.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private buildAuthenticationHeaders(auth: APIAuthentication): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (auth.type) {
      case 'bearer':
        if (auth.credentials.token) {
          headers['Authorization'] = `Bearer ${auth.credentials.token}`;
        }
        break;
      case 'api_key':
        if (auth.credentials.apiKey) {
          headers['X-API-Key'] = auth.credentials.apiKey;
        }
        break;
      case 'basic':
        if (auth.credentials.username && auth.credentials.password) {
          const credentials = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'custom':
        if (auth.credentials.customHeaders) {
          Object.assign(headers, auth.credentials.customHeaders);
        }
        break;
    }

    return headers;
  }

  private generateCacheKey(endpointId: string, method: string, path: string, params: Record<string, any>): string {
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    return `${endpointId}:${method}:${path}:${btoa(paramsString)}`;
  }

  private getCachedResponse(cacheKey: string): APIResponse | null {
    const entry = this.cache.get(cacheKey);
    if (entry && entry.expiresAt > new Date()) {
      return {
        ...entry.response,
        cached: true,
        fromCache: entry.createdAt
      };
    }
    return null;
  }

  private cacheResponse(cacheKey: string, response: APIResponse, timeoutMinutes: number): void {
    const entry: CacheEntry = {
      response: { ...response, cached: false },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000)
    };
    this.cache.set(cacheKey, entry);
  }

  private generateWebhookSignature(data: any, secret?: string): string {
    if (!secret) return '';
    
    const crypto = require('crypto');
    const payload = JSON.stringify(data);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private async retryWebhook(webhook: WebhookConfig, data: any, attempt: number): Promise<void> {
    if (attempt > webhook.retryConfig.maxRetries) {
      throw new Error(`Webhook ${webhook.id} failed after ${webhook.retryConfig.maxRetries} retries`);
    }

    const delay = this.calculateDelay(webhook.retryConfig, attempt);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await this.executeWebhook(webhook.id, data);
    } catch (error) {
      await this.retryWebhook(webhook, data, attempt + 1);
    }
  }

  private calculateDelay(retryConfig: RetryConfig, attempt: number): number {
    switch (retryConfig.backoffStrategy) {
      case 'linear':
        return Math.min(retryConfig.baseDelay * attempt, retryConfig.maxDelay);
      case 'exponential':
        return Math.min(retryConfig.baseDelay * Math.pow(2, attempt - 1), retryConfig.maxDelay);
      case 'fixed':
      default:
        return retryConfig.baseDelay;
    }
  }

  private findEndpoint(endpointId: string): APIEndpoint | undefined {
    for (const integration of this.integrations.values()) {
      const endpoint = integration.endpoints.find(ep => ep.id === endpointId);
      if (endpoint) return endpoint;
    }
    return undefined;
  }

  private findWebhook(webhookId: string): WebhookConfig | undefined {
    for (const integration of this.integrations.values()) {
      const webhook = integration.webhooks.find(wh => wh.id === webhookId);
      if (webhook) return webhook;
    }
    return undefined;
  }

  private getIntegrationIdFromEndpoint(endpointId: string): string {
    for (const [integrationId, integration] of this.integrations.entries()) {
      if (integration.endpoints.some(ep => ep.id === endpointId)) {
        return integrationId;
      }
    }
    return '';
  }

  private updateRequestMetrics(request: APIRequest, response?: APIResponse): void {
    const integrationId = this.getIntegrationIdFromEndpoint(request.endpointId);
    const integration = this.integrations.get(integrationId);
    
    if (integration) {
      integration.metrics.totalRequests++;
      
      if (request.status === 'success' && response) {
        integration.metrics.successfulRequests++;
        integration.metrics.averageResponseTime = 
          (integration.metrics.averageResponseTime * (integration.metrics.totalRequests - 1) + response.responseTime) / 
          integration.metrics.totalRequests;
      } else {
        integration.metrics.failedRequests++;
      }
      
      integration.metrics.errorRate = 
        (integration.metrics.failedRequests / integration.metrics.totalRequests) * 100;
      
      integration.metrics.lastUpdated = new Date();
    }
    
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const integrations = Array.from(this.integrations.values());
    
    this.metrics = {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.isEnabled).length,
      totalRequests: integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0),
      successfulRequests: integrations.reduce((sum, i) => sum + i.metrics.successfulRequests, 0),
      failedRequests: integrations.reduce((sum, i) => sum + i.metrics.failedRequests, 0),
      averageResponseTime: integrations.reduce((sum, i) => sum + i.metrics.averageResponseTime, 0) / integrations.length || 0,
      systemUptime: integrations.reduce((sum, i) => sum + i.metrics.uptime, 0) / integrations.length || 100,
      lastUpdated: new Date()
    };
  }

  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private async performHealthChecks(): Promise<void> {
    for (const integration of this.integrations.values()) {
      if (!integration.isEnabled) continue;
      
      for (const endpoint of integration.endpoints) {
        if (!endpoint.healthCheck.isEnabled) continue;
        
        try {
          const healthUrl = new URL(endpoint.healthCheck.endpoint, endpoint.url);
          const response = await fetch(healthUrl.toString(), {
            method: endpoint.healthCheck.method,
            signal: AbortSignal.timeout(endpoint.healthCheck.timeout)
          });
          
          if (response.status === endpoint.healthCheck.expectedStatus) {
            endpoint.status = 'healthy';
            endpoint.uptime = Math.min(endpoint.uptime + 0.1, 100);
          } else {
            endpoint.status = 'degraded';
            endpoint.uptime = Math.max(endpoint.uptime - 1, 0);
          }
          
          endpoint.responseTime = Date.now() - Date.now(); // This would be measured properly
          endpoint.lastHealthCheck = new Date();
          
        } catch (error) {
          endpoint.status = 'down';
          endpoint.uptime = Math.max(endpoint.uptime - 2, 0);
          endpoint.lastHealthCheck = new Date();
        }
      }
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectDailyMetrics();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private collectDailyMetrics(): void {
    const today = new Date().toISOString().split('T')[0];
    
    for (const integration of this.integrations.values()) {
      // This would collect actual daily metrics
      integration.metrics.dailyStats.push({
        date: today,
        requests: Math.floor(Math.random() * 100),
        successes: Math.floor(Math.random() * 95),
        failures: Math.floor(Math.random() * 5),
        averageResponseTime: Math.floor(Math.random() * 1000) + 200,
        peakResponseTime: Math.floor(Math.random() * 2000) + 500,
        dataTransferred: Math.floor(Math.random() * 1000000)
      });
      
      // Keep only last 30 days
      if (integration.metrics.dailyStats.length > 30) {
        integration.metrics.dailyStats = integration.metrics.dailyStats.slice(-30);
      }
    }
  }
}

// Supporting classes
interface CacheEntry {
  response: APIResponse;
  createdAt: Date;
  expiresAt: Date;
}

interface OrchestrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  systemUptime: number;
  lastUpdated: Date;
}

class RateLimiter {
  private buckets: Map<string, number> = new Map();
  private lastReset: Map<string, Date> = new Map();

  constructor(private limits: RateLimit) {}

  canMakeRequest(): boolean {
    const now = new Date();
    
    // Check each time window
    if (!this.checkLimit('second', now, this.limits.requestsPerSecond)) return false;
    if (!this.checkLimit('minute', now, this.limits.requestsPerMinute)) return false;
    if (!this.checkLimit('hour', now, this.limits.requestsPerHour)) return false;
    if (!this.checkLimit('day', now, this.limits.requestsPerDay)) return false;
    
    // Record the request
    this.recordRequest(now);
    return true;
  }

  private checkLimit(window: string, now: Date, limit: number): boolean {
    const bucket = this.buckets.get(window) || 0;
    const lastReset = this.lastReset.get(window) || new Date(0);
    
    // Reset bucket if time window has passed
    const windowMs = this.getWindowMs(window);
    if (now.getTime() - lastReset.getTime() >= windowMs) {
      this.buckets.set(window, 0);
      this.lastReset.set(window, now);
      return true;
    }
    
    return bucket < limit;
  }

  private recordRequest(now: Date): void {
    ['second', 'minute', 'hour', 'day'].forEach(window => {
      const current = this.buckets.get(window) || 0;
      this.buckets.set(window, current + 1);
    });
  }

  private getWindowMs(window: string): number {
    switch (window) {
      case 'second': return 1000;
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      default: return 1000;
    }
  }
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly failureThreshold = 5;
  private readonly timeoutMs = 60000; // 1 minute

  constructor(private endpointId: string) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() > this.timeoutMs) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}

// Export singleton instance
export const apiOrchestrator = new ExternalAPIOrchestrator();
