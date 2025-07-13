// Entity Connections System - Cross-Module Intelligence Network
// Week 5-8: Cross-Module Intelligence Implementation

export interface EntityConnection {
  id: string;
  source_type: 'task' | 'case' | 'contact' | 'note' | 'deadline' | 'document';
  source_id: string;
  target_type: 'task' | 'case' | 'contact' | 'note' | 'deadline' | 'document';
  target_id: string;
  connection_type: 'related' | 'depends_on' | 'blocks' | 'references' | 'assigned_to' | 'part_of' | 'similar_to';
  strength: number; // 0-1 confidence score
  auto_detected: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    reason?: string;
    ai_confidence?: number;
    user_confirmed?: boolean;
    context?: string;
  };
}

export interface EntitySummary {
  id: string;
  type: 'task' | 'case' | 'contact' | 'note' | 'deadline' | 'document';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ConnectionNetwork {
  entities: Map<string, EntitySummary>;
  connections: EntityConnection[];
  clusters: EntityCluster[];
}

export interface EntityCluster {
  id: string;
  name: string;
  entities: string[];
  strength: number;
  type: 'project' | 'topic' | 'client' | 'deadline_group' | 'workflow';
}

export interface ConnectionSuggestion {
  id: string;
  source_id: string;
  target_id: string;
  connection_type: EntityConnection['connection_type'];
  confidence: number;
  reason: string;
  auto_apply: boolean;
  created_at: string;
}

class EntityConnectionsManager {
  private connections: Map<string, EntityConnection> = new Map();
  private entities: Map<string, EntitySummary> = new Map();
  private connectionsByEntity: Map<string, string[]> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Core Connection Management
  async createConnection(connection: Omit<EntityConnection, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newConnection: EntityConnection = {
      ...connection,
      id,
      created_at: now,
      updated_at: now
    };

    this.connections.set(id, newConnection);
    this.updateConnectionIndex(newConnection);
    this.saveToLocalStorage();
    
    return id;
  }

  async updateConnection(id: string, updates: Partial<EntityConnection>): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) throw new Error(`Connection ${id} not found`);

    const updated = {
      ...connection,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.connections.set(id, updated);
    this.updateConnectionIndex(updated);
    this.saveToLocalStorage();
  }

  async deleteConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) return;

    this.connections.delete(id);
    this.removeFromConnectionIndex(connection);
    this.saveToLocalStorage();
  }

  // Entity Management
  async registerEntity(entity: EntitySummary): Promise<void> {
    this.entities.set(entity.id, entity);
    this.saveToLocalStorage();
  }

  async updateEntity(id: string, updates: Partial<EntitySummary>): Promise<void> {
    const entity = this.entities.get(id);
    if (!entity) throw new Error(`Entity ${id} not found`);

    const updated = {
      ...entity,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.entities.set(id, updated);
    this.saveToLocalStorage();
  }

  // Connection Queries
  getConnectionsForEntity(entityId: string): EntityConnection[] {
    const connectionIds = this.connectionsByEntity.get(entityId) || [];
    return connectionIds.map(id => this.connections.get(id)).filter(Boolean) as EntityConnection[];
  }

  getRelatedEntities(entityId: string, maxDepth: number = 2): EntitySummary[] {
    const visited = new Set<string>();
    const related = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: entityId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id) || depth >= maxDepth) continue;
      visited.add(id);

      const connections = this.getConnectionsForEntity(id);
      connections.forEach(conn => {
        const relatedId = conn.source_id === id ? conn.target_id : conn.source_id;
        if (!visited.has(relatedId)) {
          related.add(relatedId);
          queue.push({ id: relatedId, depth: depth + 1 });
        }
      });
    }

    return Array.from(related)
      .map(id => this.entities.get(id))
      .filter(Boolean) as EntitySummary[];
  }

  // AI-Powered Connection Detection
  async detectPotentialConnections(entityId: string): Promise<ConnectionSuggestion[]> {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    const suggestions: ConnectionSuggestion[] = [];
    const now = new Date().toISOString();

    // Find entities with similar keywords
    const entityKeywords = this.extractKeywords(entity.title + ' ' + (entity.description || ''));
    
    for (const [otherId, otherEntity] of this.entities) {
      if (otherId === entityId) continue;
      
      const otherKeywords = this.extractKeywords(otherEntity.title + ' ' + (otherEntity.description || ''));
      const similarity = this.calculateSimilarity(entityKeywords, otherKeywords);
      
      if (similarity > 0.3) {
        suggestions.push({
          id: `sugg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source_id: entityId,
          target_id: otherId,
          connection_type: 'related',
          confidence: similarity,
          reason: `Similar keywords: ${this.getCommonKeywords(entityKeywords, otherKeywords).join(', ')}`,
          auto_apply: similarity > 0.7,
          created_at: now
        });
      }
    }

    // Task-Case connections
    if (entity.type === 'task') {
      const caseSuggestions = await this.suggestTaskCaseConnections(entityId);
      suggestions.push(...caseSuggestions);
    }

    // Deadline-Task connections
    if (entity.type === 'deadline') {
      const taskSuggestions = await this.suggestDeadlineTaskConnections(entityId);
      suggestions.push(...taskSuggestions);
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Connection Strength Scoring
  calculateConnectionStrength(connection: EntityConnection): number {
    let strength = 0.5; // Base strength

    // Type-specific strength adjustments
    switch (connection.connection_type) {
      case 'depends_on':
      case 'blocks':
        strength += 0.3;
        break;
      case 'part_of':
      case 'assigned_to':
        strength += 0.2;
        break;
      case 'related':
      case 'similar_to':
        strength += 0.1;
        break;
    }

    // AI confidence bonus
    if (connection.metadata?.ai_confidence) {
      strength += connection.metadata.ai_confidence * 0.2;
    }

    // User confirmation bonus
    if (connection.metadata?.user_confirmed) {
      strength += 0.2;
    }

    return Math.min(strength, 1.0);
  }

  // Network Analysis
  getConnectionClusters(): EntityCluster[] {
    const clusters: EntityCluster[] = [];
    const visited = new Set<string>();

    for (const [entityId] of this.entities) {
      if (visited.has(entityId)) continue;

      const cluster = this.findCluster(entityId, visited);
      if (cluster.entities.length > 1) {
        clusters.push(cluster);
      }
    }

    return clusters.sort((a, b) => b.strength - a.strength);
  }

  private findCluster(startId: string, visited: Set<string>): EntityCluster {
    const clusterEntities = new Set<string>();
    const queue = [startId];
    let totalStrength = 0;
    let connectionCount = 0;

    while (queue.length > 0) {
      const entityId = queue.shift()!;
      if (visited.has(entityId)) continue;

      visited.add(entityId);
      clusterEntities.add(entityId);

      const connections = this.getConnectionsForEntity(entityId);
      connections.forEach(conn => {
        const relatedId = conn.source_id === entityId ? conn.target_id : conn.source_id;
        if (!visited.has(relatedId)) {
          queue.push(relatedId);
        }
        totalStrength += this.calculateConnectionStrength(conn);
        connectionCount++;
      });
    }

    const entities = Array.from(clusterEntities);
    const avgStrength = connectionCount > 0 ? totalStrength / connectionCount : 0;

    return {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateClusterName(entities),
      entities,
      strength: avgStrength,
      type: this.determineClusterType(entities)
    };
  }

  // Utility Methods
  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private getCommonKeywords(keywords1: string[], keywords2: string[]): string[] {
    const set1 = new Set(keywords1);
    return keywords2.filter(word => set1.has(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
    return stopWords.includes(word);
  }

  private generateClusterName(entities: string[]): string {
    const entityTitles = entities.map(id => this.entities.get(id)?.title || '').filter(Boolean);
    const keywords = entityTitles.flatMap(title => this.extractKeywords(title));
    const mostCommon = this.getMostCommonKeyword(keywords);
    return mostCommon ? `${mostCommon} cluster` : 'Related items';
  }

  private getMostCommonKeyword(keywords: string[]): string {
    const freq = new Map<string, number>();
    keywords.forEach(word => freq.set(word, (freq.get(word) || 0) + 1));
    
    let maxCount = 0;
    let mostCommon = '';
    for (const [word, count] of freq) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = word;
      }
    }
    
    return mostCommon;
  }

  private determineClusterType(entities: string[]): EntityCluster['type'] {
    const types = entities.map(id => this.entities.get(id)?.type).filter(Boolean);
    if (types.every(type => type === 'task')) return 'workflow';
    if (types.every(type => type === 'case')) return 'client';
    if (types.some(type => type === 'deadline')) return 'deadline_group';
    return 'project';
  }

  // Task-Case Connection Suggestions
  private async suggestTaskCaseConnections(taskId: string): Promise<ConnectionSuggestion[]> {
    const suggestions: ConnectionSuggestion[] = [];
    const task = this.entities.get(taskId);
    if (!task || task.type !== 'task') return suggestions;

    const taskKeywords = this.extractKeywords(task.title + ' ' + (task.description || ''));
    
    for (const [caseId, caseEntity] of this.entities) {
      if (caseEntity.type !== 'case') continue;
      
      const caseKeywords = this.extractKeywords(caseEntity.title + ' ' + (caseEntity.description || ''));
      const similarity = this.calculateSimilarity(taskKeywords, caseKeywords);
      
      if (similarity > 0.2) {
        suggestions.push({
          id: `sugg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source_id: taskId,
          target_id: caseId,
          connection_type: 'part_of',
          confidence: similarity,
          reason: `Task appears to be part of case: ${caseEntity.title}`,
          auto_apply: similarity > 0.6,
          created_at: new Date().toISOString()
        });
      }
    }

    return suggestions;
  }

  // Deadline-Task Connection Suggestions
  private async suggestDeadlineTaskConnections(deadlineId: string): Promise<ConnectionSuggestion[]> {
    const suggestions: ConnectionSuggestion[] = [];
    const deadline = this.entities.get(deadlineId);
    if (!deadline || deadline.type !== 'deadline') return suggestions;

    const deadlineKeywords = this.extractKeywords(deadline.title + ' ' + (deadline.description || ''));
    
    for (const [taskId, taskEntity] of this.entities) {
      if (taskEntity.type !== 'task') continue;
      
      const taskKeywords = this.extractKeywords(taskEntity.title + ' ' + (taskEntity.description || ''));
      const similarity = this.calculateSimilarity(deadlineKeywords, taskKeywords);
      
      if (similarity > 0.3) {
        suggestions.push({
          id: `sugg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source_id: taskId,
          target_id: deadlineId,
          connection_type: 'depends_on',
          confidence: similarity,
          reason: `Task may be preparation for deadline: ${deadline.title}`,
          auto_apply: similarity > 0.7,
          created_at: new Date().toISOString()
        });
      }
    }

    return suggestions;
  }

  // Index Management
  private updateConnectionIndex(connection: EntityConnection): void {
    // Add to source entity index
    const sourceConnections = this.connectionsByEntity.get(connection.source_id) || [];
    if (!sourceConnections.includes(connection.id)) {
      sourceConnections.push(connection.id);
      this.connectionsByEntity.set(connection.source_id, sourceConnections);
    }

    // Add to target entity index
    const targetConnections = this.connectionsByEntity.get(connection.target_id) || [];
    if (!targetConnections.includes(connection.id)) {
      targetConnections.push(connection.id);
      this.connectionsByEntity.set(connection.target_id, targetConnections);
    }
  }

  private removeFromConnectionIndex(connection: EntityConnection): void {
    // Remove from source entity index
    const sourceConnections = this.connectionsByEntity.get(connection.source_id) || [];
    const sourceIndex = sourceConnections.indexOf(connection.id);
    if (sourceIndex !== -1) {
      sourceConnections.splice(sourceIndex, 1);
      this.connectionsByEntity.set(connection.source_id, sourceConnections);
    }

    // Remove from target entity index
    const targetConnections = this.connectionsByEntity.get(connection.target_id) || [];
    const targetIndex = targetConnections.indexOf(connection.id);
    if (targetIndex !== -1) {
      targetConnections.splice(targetIndex, 1);
      this.connectionsByEntity.set(connection.target_id, targetConnections);
    }
  }

  // Persistence
  private saveToLocalStorage(): void {
    const data = {
      connections: Array.from(this.connections.entries()),
      entities: Array.from(this.entities.entries()),
      connectionsByEntity: Array.from(this.connectionsByEntity.entries())
    };
    localStorage.setItem('life-os-entity-connections', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('life-os-entity-connections');
      if (data) {
        const parsed = JSON.parse(data);
        this.connections = new Map(parsed.connections || []);
        this.entities = new Map(parsed.entities || []);
        this.connectionsByEntity = new Map(parsed.connectionsByEntity || []);
      }
    } catch (error) {
      console.error('Failed to load entity connections from localStorage:', error);
    }
  }

  // Public API
  getAllConnections(): EntityConnection[] {
    return Array.from(this.connections.values());
  }

  getAllEntities(): EntitySummary[] {
    return Array.from(this.entities.values());
  }

  getConnectionNetwork(): ConnectionNetwork {
    return {
      entities: this.entities,
      connections: this.getAllConnections(),
      clusters: this.getConnectionClusters()
    };
  }
}

// Global instance
export const entityConnectionsManager = new EntityConnectionsManager();

// Helper functions for integration
export async function autoLinkTaskToCase(taskId: string, caseId: string): Promise<string> {
  return entityConnectionsManager.createConnection({
    source_type: 'task',
    source_id: taskId,
    target_type: 'case',
    target_id: caseId,
    connection_type: 'part_of',
    strength: 0.8,
    auto_detected: true,
    metadata: {
      reason: 'Auto-linked task to case',
      ai_confidence: 0.8,
      user_confirmed: false
    }
  });
}

export async function suggestRelatedItems(entityId: string): Promise<EntitySummary[]> {
  const suggestions = await entityConnectionsManager.detectPotentialConnections(entityId);
  const relatedIds = suggestions.slice(0, 5).map(s => s.target_id);
  
  return relatedIds.map(id => entityConnectionsManager.getAllEntities().find(e => e.id === id))
    .filter(Boolean) as EntitySummary[];
}

export async function registerTaskEntity(task: any): Promise<void> {
  const entity: EntitySummary = {
    id: task.id,
    type: 'task',
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: task.tags || [],
    created_at: task.created_at,
    updated_at: task.updated_at
  };
  
  await entityConnectionsManager.registerEntity(entity);
}

export async function registerCaseEntity(case_: any): Promise<void> {
  const entity: EntitySummary = {
    id: case_.id,
    type: 'case',
    title: case_.title,
    description: case_.description,
    status: case_.status,
    priority: case_.priority,
    tags: case_.tags || [],
    created_at: case_.created_at,
    updated_at: case_.updated_at
  };
  
  await entityConnectionsManager.registerEntity(entity);
}
