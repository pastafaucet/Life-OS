import { addDays, addWeeks, addMonths, format, isWeekend, nextMonday, startOfDay } from 'date-fns';

// Types for deadline calculation
export interface DeadlineRule {
  id: string;
  name: string;
  jurisdiction: string;
  type: 'filing' | 'response' | 'discovery' | 'trial' | 'appeal';
  baseDays: number;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  businessDaysOnly: boolean;
  additionalRules?: string[];
}

export interface DeadlineCalculation {
  originalDate: Date;
  deadline: Date;
  preparationTime: number; // days needed for preparation
  alertDates: {
    warning90: Date;
    warning30: Date;
    warning7: Date;
    warning24h: Date;
  };
  jurisdiction: string;
  ruleApplied: DeadlineRule;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeadlineAlert {
  id: string;
  caseId?: string;
  taskId?: string;
  type: 'warning90' | 'warning30' | 'warning7' | 'warning24h' | 'overdue';
  deadline: Date;
  description: string;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  escalated: boolean;
  acknowledged: boolean;
  createdAt: Date;
}

// Jurisdiction-specific rules database
const JURISDICTION_RULES: Record<string, DeadlineRule[]> = {
  'federal': [
    {
      id: 'fed-civil-response',
      name: 'Federal Civil Response',
      jurisdiction: 'federal',
      type: 'response',
      baseDays: 21,
      excludeWeekends: true,
      excludeHolidays: true,
      businessDaysOnly: true,
      additionalRules: ['Rule 12(a)(1)(A) - 21 days after service']
    },
    {
      id: 'fed-summary-judgment',
      name: 'Federal Summary Judgment Response',
      jurisdiction: 'federal',
      type: 'response',
      baseDays: 21,
      excludeWeekends: true,
      excludeHolidays: true,
      businessDaysOnly: true,
      additionalRules: ['Rule 56(c) - 21 days after motion served']
    }
  ],
  'california': [
    {
      id: 'ca-demurrer',
      name: 'California Demurrer Response',
      jurisdiction: 'california',
      type: 'response',
      baseDays: 30,
      excludeWeekends: true,
      excludeHolidays: true,
      businessDaysOnly: true,
      additionalRules: ['CCP § 430.40 - 30 days after service']
    },
    {
      id: 'ca-discovery-response',
      name: 'California Discovery Response',
      jurisdiction: 'california',
      type: 'discovery',
      baseDays: 30,
      excludeWeekends: true,
      excludeHolidays: true,
      businessDaysOnly: true,
      additionalRules: ['CCP § 2030.260 - 30 days after service']
    }
  ],
  'nevada': [
    {
      id: 'nv-answer',
      name: 'Nevada Answer to Complaint',
      jurisdiction: 'nevada',
      type: 'response',
      baseDays: 21,
      excludeWeekends: true,
      excludeHolidays: true,
      businessDaysOnly: true,
      additionalRules: ['NRCP 12(a) - 21 days after service']
    }
  ]
};

// Federal holidays (simplified - would need complete list)
const FEDERAL_HOLIDAYS_2025 = [
  new Date('2025-01-01'), // New Year's Day
  new Date('2025-01-20'), // Martin Luther King Jr. Day
  new Date('2025-02-17'), // Presidents Day
  new Date('2025-05-26'), // Memorial Day
  new Date('2025-07-04'), // Independence Day
  new Date('2025-09-01'), // Labor Day
  new Date('2025-10-13'), // Columbus Day
  new Date('2025-11-11'), // Veterans Day
  new Date('2025-11-27'), // Thanksgiving
  new Date('2025-12-25'), // Christmas
];

export class DeadlineEngine {
  
  /**
   * Calculate deadline based on jurisdiction and case type
   */
  calculateDeadline(
    startDate: Date,
    jurisdiction: string,
    caseType: DeadlineRule['type'],
    preparationDays: number = 7
  ): DeadlineCalculation {
    
    const rules = JURISDICTION_RULES[jurisdiction.toLowerCase()] || JURISDICTION_RULES['federal'];
    const applicableRule = rules.find(rule => rule.type === caseType) || rules[0];
    
    let deadline = new Date(startDate);
    let daysAdded = 0;
    
    // Add days according to the rule
    while (daysAdded < applicableRule.baseDays) {
      deadline = addDays(deadline, 1);
      
      // Skip weekends if required
      if (applicableRule.excludeWeekends && isWeekend(deadline)) {
        continue;
      }
      
      // Skip holidays if required
      if (applicableRule.excludeHolidays && this.isHoliday(deadline)) {
        continue;
      }
      
      daysAdded++;
    }
    
    // If deadline falls on weekend, move to next Monday
    if (applicableRule.businessDaysOnly && isWeekend(deadline)) {
      deadline = nextMonday(deadline);
    }
    
    // Calculate alert dates
    const alertDates = this.calculateAlertDates(deadline, preparationDays);
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(deadline, preparationDays);
    
    return {
      originalDate: startDate,
      deadline,
      preparationTime: preparationDays,
      alertDates,
      jurisdiction,
      ruleApplied: applicableRule,
      riskLevel
    };
  }
  
  /**
   * Calculate cascade alert dates (90d, 30d, 7d, 24h)
   */
  private calculateAlertDates(deadline: Date, preparationDays: number) {
    const prepStart = addDays(deadline, -preparationDays);
    
    return {
      warning90: addDays(deadline, -90),
      warning30: addDays(deadline, -30),
      warning7: addDays(prepStart, -7), // 7 days before prep starts
      warning24h: addDays(deadline, -1)
    };
  }
  
  /**
   * Determine risk level based on time remaining and complexity
   */
  private calculateRiskLevel(deadline: Date, preparationDays: number): 'low' | 'medium' | 'high' | 'critical' {
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'critical'; // Overdue
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 7) return 'high';
    if (daysRemaining <= preparationDays + 7) return 'medium';
    return 'low';
  }
  
  /**
   * Check if date is a federal holiday
   */
  private isHoliday(date: Date): boolean {
    const dateStr = format(date, 'yyyy-MM-dd');
    return FEDERAL_HOLIDAYS_2025.some(holiday => 
      format(holiday, 'yyyy-MM-dd') === dateStr
    );
  }
  
  /**
   * Generate alerts for upcoming deadlines
   */
  generateAlerts(calculations: DeadlineCalculation[]): DeadlineAlert[] {
    const now = new Date();
    const alerts: DeadlineAlert[] = [];
    
    calculations.forEach(calc => {
      const { alertDates, deadline, riskLevel } = calc;
      
      // Check each alert threshold
      Object.entries(alertDates).forEach(([alertType, alertDate]) => {
        if (now >= alertDate && now < deadline) {
          alerts.push({
            id: `alert-${calc.ruleApplied.id}-${alertType}-${Date.now()}`,
            type: alertType as any,
            deadline,
            description: this.generateAlertDescription(calc, alertType as any),
            urgencyLevel: this.getUrgencyLevel(alertType as any, riskLevel),
            escalated: riskLevel === 'critical',
            acknowledged: false,
            createdAt: now
          });
        }
      });
      
      // Check for overdue
      if (now > deadline) {
        alerts.push({
          id: `alert-${calc.ruleApplied.id}-overdue-${Date.now()}`,
          type: 'overdue',
          deadline,
          description: `OVERDUE: ${calc.ruleApplied.name} was due ${format(deadline, 'MMM d, yyyy')}`,
          urgencyLevel: 5,
          escalated: true,
          acknowledged: false,
          createdAt: now
        });
      }
    });
    
    return alerts.sort((a, b) => b.urgencyLevel - a.urgencyLevel);
  }
  
  /**
   * Generate human-readable alert descriptions
   */
  private generateAlertDescription(calc: DeadlineCalculation, alertType: string): string {
    const deadline = format(calc.deadline, 'MMM d, yyyy');
    const rule = calc.ruleApplied;
    
    switch (alertType) {
      case 'warning90':
        return `90-day notice: ${rule.name} due ${deadline}`;
      case 'warning30':
        return `30-day notice: ${rule.name} due ${deadline}`;
      case 'warning7':
        return `Final week: Start preparing for ${rule.name} due ${deadline}`;
      case 'warning24h':
        return `URGENT: ${rule.name} due tomorrow (${deadline})`;
      default:
        return `${rule.name} alert for ${deadline}`;
    }
  }
  
  /**
   * Get urgency level for alert type and risk combination
   */
  private getUrgencyLevel(alertType: string, riskLevel: string): 1 | 2 | 3 | 4 | 5 {
    const baseUrgency = {
      'warning90': 1,
      'warning30': 2,
      'warning7': 3,
      'warning24h': 4,
      'overdue': 5
    }[alertType] as 1 | 2 | 3 | 4 | 5;
    
    // Increase urgency for high-risk cases
    if (riskLevel === 'critical' && baseUrgency < 5) {
      return Math.min(5, baseUrgency + 1) as 1 | 2 | 3 | 4 | 5;
    }
    
    return baseUrgency;
  }
  
  /**
   * Calculate preparation time based on case complexity
   */
  calculatePreparationTime(
    caseType: DeadlineRule['type'],
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
  ): number {
    const basePrep = {
      'filing': 3,
      'response': 7,
      'discovery': 5,
      'trial': 30,
      'appeal': 14
    };
    
    const multiplier = {
      'simple': 0.7,
      'moderate': 1.0,
      'complex': 1.5
    };
    
    return Math.ceil(basePrep[caseType] * multiplier[complexity]);
  }
  
  /**
   * Get available jurisdiction rules
   */
  getAvailableJurisdictions(): string[] {
    return Object.keys(JURISDICTION_RULES);
  }
  
  /**
   * Get rules for a specific jurisdiction
   */
  getJurisdictionRules(jurisdiction: string): DeadlineRule[] {
    return JURISDICTION_RULES[jurisdiction.toLowerCase()] || [];
  }
  
  /**
   * Add custom deadline rule
   */
  addCustomRule(jurisdiction: string, rule: DeadlineRule): void {
    if (!JURISDICTION_RULES[jurisdiction.toLowerCase()]) {
      JURISDICTION_RULES[jurisdiction.toLowerCase()] = [];
    }
    JURISDICTION_RULES[jurisdiction.toLowerCase()].push(rule);
  }
  
  /**
   * Emergency escalation protocol
   */
  escalateDeadline(alert: DeadlineAlert): {
    escalationType: 'email' | 'sms' | 'call' | 'all';
    recipients: string[];
    message: string;
    priority: 'high' | 'critical';
  } {
    const isUrgent = alert.urgencyLevel >= 4;
    const isCritical = alert.type === 'overdue' || alert.urgencyLevel === 5;
    
    return {
      escalationType: isCritical ? 'all' : isUrgent ? 'sms' : 'email',
      recipients: isCritical ? ['primary', 'backup', 'assistant'] : ['primary'],
      message: `${isCritical ? '🚨 CRITICAL' : '⚠️ URGENT'}: ${alert.description}`,
      priority: isCritical ? 'critical' : 'high'
    };
  }
}

// Export singleton instance
export const deadlineEngine = new DeadlineEngine();

// Example usage and testing
export function testDeadlineEngine() {
  const engine = new DeadlineEngine();
  
  // Test federal civil response deadline
  const calc = engine.calculateDeadline(
    new Date('2025-07-01'), // Service date
    'federal',
    'response',
    7 // 7 days prep time
  );
  
  console.log('Deadline Calculation:', {
    originalDate: calc.originalDate,
    deadline: calc.deadline,
    preparationTime: calc.preparationTime,
    alertDates: calc.alertDates,
    riskLevel: calc.riskLevel,
    rule: calc.ruleApplied.name
  });
  
  // Test alert generation
  const alerts = engine.generateAlerts([calc]);
  console.log('Generated Alerts:', alerts);
  
  return { calc, alerts };
}
