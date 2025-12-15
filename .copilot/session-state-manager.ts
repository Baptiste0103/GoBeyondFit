/**
 * Session State Manager
 * 
 * Persistent session state management for GitHub Copilot agents.
 * Features:
 * - Save/restore session context across conversations
 * - Track progress and task completion
 * - Resume workflows from interruptions
 * - Store conversation history and decisions
 * - Maintain agent state and context
 * 
 * @version 1.0.0
 * @author GoBeyondFit Agent System
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface SessionState {
  sessionId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  status: SessionStatus;
  context: SessionContext;
  history: ConversationEntry[];
  tasks: TaskState[];
  metadata: SessionMetadata;
}

export interface SessionContext {
  currentGoal: string;
  activeAgents: string[];
  loadedFiles: string[];
  keyDecisions: Decision[];
  contextWindow: ContextSnapshot[];
}

export interface ConversationEntry {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  agent?: string;
  content: string;
  action?: string;
  result?: string;
}

export interface TaskState {
  id: number;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  assignedAgent?: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  deliverables: string[];
  dependencies: number[];
}

export interface Decision {
  timestamp: Date;
  description: string;
  options: string[];
  chosen: string;
  rationale: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ContextSnapshot {
  timestamp: Date;
  files: string[];
  agents: string[];
  tokenCount: number;
  summary: string;
}

export interface SessionMetadata {
  workspaceRoot: string;
  branch: string;
  lastCommit: string;
  projectPhase: string;
  totalTasks: number;
  completedTasks: number;
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

interface SaveOptions {
  compress?: boolean;
  backup?: boolean;
}

interface LoadOptions {
  includeHistory?: boolean;
  maxHistoryEntries?: number;
}

// =============================================================================
// Constants
// =============================================================================

const WORKSPACE_ROOT = process.cwd();
const STATE_DIR = path.join(WORKSPACE_ROOT, '.copilot', 'state');
const BACKUP_DIR = path.join(STATE_DIR, 'backups');
const MAX_SESSIONS = 10;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// =============================================================================
// Session State Manager Class
// =============================================================================

export class SessionStateManager {
  private currentSession: SessionState | null = null;

  constructor() {
    this.initializeDirectories();
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, goal: string): Promise<SessionState> {
    const sessionId = this.generateSessionId();
    
    const session: SessionState = {
      sessionId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      status: SessionStatus.ACTIVE,
      context: {
        currentGoal: goal,
        activeAgents: [],
        loadedFiles: [],
        keyDecisions: [],
        contextWindow: [],
      },
      history: [],
      tasks: [],
      metadata: await this.collectMetadata(),
    };
    
    this.currentSession = session;
    await this.saveSession(session);
    
    return session;
  }

  /**
   * Load existing session
   */
  async loadSession(sessionId: string, options: LoadOptions = {}): Promise<SessionState | null> {
    const sessionPath = this.getSessionPath(sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(sessionPath, 'utf-8');
      const session: SessionState = JSON.parse(data, this.dateReviver);
      
      // Optionally limit history
      if (options.includeHistory === false) {
        session.history = [];
      } else if (options.maxHistoryEntries) {
        session.history = session.history.slice(-options.maxHistoryEntries);
      }
      
      this.currentSession = session;
      return session;
    } catch (error) {
      console.error(`Failed to load session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Save session to disk
   */
  async saveSession(session: SessionState, options: SaveOptions = {}): Promise<void> {
    session.updatedAt = new Date();
    session.lastActivity = new Date();
    
    const sessionPath = this.getSessionPath(session.sessionId);
    
    // Create backup if requested
    if (options.backup && fs.existsSync(sessionPath)) {
      await this.createBackup(session.sessionId);
    }
    
    const data = JSON.stringify(session, null, 2);
    fs.writeFileSync(sessionPath, data, 'utf-8');
    
    // Update current session reference
    if (this.currentSession?.sessionId === session.sessionId) {
      this.currentSession = session;
    }
  }

  /**
   * Get current active session
   */
  getCurrentSession(): SessionState | null {
    return this.currentSession;
  }

  /**
   * Add conversation entry
   */
  async addConversation(
    role: 'user' | 'agent' | 'system',
    content: string,
    agent?: string,
    action?: string,
    result?: string
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const entry: ConversationEntry = {
      timestamp: new Date(),
      role,
      content,
      agent,
      action,
      result,
    };
    
    this.currentSession.history.push(entry);
    await this.saveSession(this.currentSession);
  }

  /**
   * Update task status
   */
  async updateTask(taskId: number, updates: Partial<TaskState>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const task = this.currentSession.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    Object.assign(task, updates);
    
    if (updates.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
      task.progress = 100;
    }
    
    await this.saveSession(this.currentSession);
  }

  /**
   * Add task to session
   */
  async addTask(task: Omit<TaskState, 'progress'>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const newTask: TaskState = {
      ...task,
      progress: 0,
    };
    
    this.currentSession.tasks.push(newTask);
    await this.saveSession(this.currentSession);
  }

  /**
   * Record decision
   */
  async recordDecision(decision: Omit<Decision, 'timestamp'>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const fullDecision: Decision = {
      timestamp: new Date(),
      ...decision,
    };
    
    this.currentSession.context.keyDecisions.push(fullDecision);
    await this.saveSession(this.currentSession);
  }

  /**
   * Update context window
   */
  async updateContext(files: string[], agents: string[], tokenCount: number, summary: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const snapshot: ContextSnapshot = {
      timestamp: new Date(),
      files,
      agents,
      tokenCount,
      summary,
    };
    
    this.currentSession.context.contextWindow.push(snapshot);
    
    // Keep only last 10 snapshots
    if (this.currentSession.context.contextWindow.length > 10) {
      this.currentSession.context.contextWindow = this.currentSession.context.contextWindow.slice(-10);
    }
    
    this.currentSession.context.loadedFiles = files;
    this.currentSession.context.activeAgents = agents;
    
    await this.saveSession(this.currentSession);
  }

  /**
   * Pause session
   */
  async pauseSession(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    this.currentSession.status = SessionStatus.PAUSED;
    await this.saveSession(this.currentSession, { backup: true });
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string): Promise<SessionState | null> {
    const session = await this.loadSession(sessionId);
    
    if (session) {
      session.status = SessionStatus.ACTIVE;
      await this.saveSession(session);
    }
    
    return session;
  }

  /**
   * Complete session
   */
  async completeSession(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    this.currentSession.status = SessionStatus.COMPLETED;
    await this.saveSession(this.currentSession, { backup: true });
  }

  /**
   * Archive old session
   */
  async archiveSession(sessionId: string): Promise<void> {
    const session = await this.loadSession(sessionId);
    
    if (session) {
      session.status = SessionStatus.ARCHIVED;
      await this.saveSession(session);
    }
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<Array<{ sessionId: string; createdAt: Date; status: SessionStatus; goal: string }>> {
    const sessions: Array<{ sessionId: string; createdAt: Date; status: SessionStatus; goal: string }> = [];
    
    if (!fs.existsSync(STATE_DIR)) {
      return sessions;
    }
    
    const files = fs.readdirSync(STATE_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const data = fs.readFileSync(path.join(STATE_DIR, file), 'utf-8');
          const session: SessionState = JSON.parse(data, this.dateReviver);
          
          sessions.push({
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            status: session.status,
            goal: session.context.currentGoal,
          });
        } catch {
          // Skip invalid files
        }
      }
    }
    
    return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clean up old sessions
   */
  async cleanup(): Promise<number> {
    const sessions = await this.listSessions();
    let cleaned = 0;
    
    const now = Date.now();
    
    for (const session of sessions) {
      const age = now - session.createdAt.getTime();
      
      // Archive sessions older than TTL
      if (age > SESSION_TTL && session.status !== SessionStatus.ARCHIVED) {
        await this.archiveSession(session.sessionId);
        cleaned++;
      }
    }
    
    // Keep only MAX_SESSIONS most recent
    if (sessions.length > MAX_SESSIONS) {
      const toRemove = sessions.slice(MAX_SESSIONS);
      for (const session of toRemove) {
        const sessionPath = this.getSessionPath(session.sessionId);
        if (fs.existsSync(sessionPath)) {
          fs.unlinkSync(sessionPath);
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Get session summary
   */
  getSessionSummary(): string {
    if (!this.currentSession) {
      return 'No active session';
    }
    
    const { sessionId, context, tasks, metadata, history } = this.currentSession;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return `
Session: ${sessionId}
Goal: ${context.currentGoal}
Progress: ${completedTasks}/${totalTasks} tasks (${progressPercent}%)
Active Agents: ${context.activeAgents.join(', ') || 'None'}
Loaded Files: ${context.loadedFiles.length}
Conversation Entries: ${history.length}
Branch: ${metadata.branch}
Last Activity: ${this.currentSession.lastActivity.toLocaleString()}
    `.trim();
  }

  /**
   * Export session to JSON
   */
  exportSession(sessionId: string, outputPath: string): void {
    const sessionPath = this.getSessionPath(sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    fs.copyFileSync(sessionPath, outputPath);
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(6).toString('hex');
    return `${timestamp}-${random}`;
  }

  private getSessionPath(sessionId: string): string {
    return path.join(STATE_DIR, `${sessionId}.json`);
  }

  private async createBackup(sessionId: string): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId);
    const backupPath = path.join(BACKUP_DIR, `${sessionId}-${Date.now()}.json`);
    
    if (fs.existsSync(sessionPath)) {
      fs.copyFileSync(sessionPath, backupPath);
    }
  }

  private async collectMetadata(): Promise<SessionMetadata> {
    try {
      // Get git branch
      const { execSync } = require('child_process');
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      const lastCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      
      return {
        workspaceRoot: WORKSPACE_ROOT,
        branch,
        lastCommit,
        projectPhase: 'Phase 3', // Could be dynamic
        totalTasks: 45,
        completedTasks: 35,
      };
    } catch {
      return {
        workspaceRoot: WORKSPACE_ROOT,
        branch: 'unknown',
        lastCommit: 'unknown',
        projectPhase: 'unknown',
        totalTasks: 0,
        completedTasks: 0,
      };
    }
  }

  private initializeDirectories(): void {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  private dateReviver(key: string, value: any): any {
    const dateFields = ['createdAt', 'updatedAt', 'lastActivity', 'timestamp', 'startedAt', 'completedAt'];
    
    if (dateFields.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    
    return value;
  }
}

// =============================================================================
// Usage Example
// =============================================================================

async function example() {
  const manager = new SessionStateManager();
  
  // Create new session
  const session = await manager.createSession('baptiste', 'Complete Phase 3 of orchestration system');
  console.log('Session created:', session.sessionId);
  
  // Add tasks
  await manager.addTask({
    id: 36,
    title: 'Create smart-context-loader.ts',
    description: 'Intelligent context loading with relevance scoring',
    status: 'in-progress',
    assignedAgent: 'agent-07-documentation',
    deliverables: [],
    dependencies: [],
  });
  
  // Add conversation
  await manager.addConversation('user', 'Create the smart context loader', undefined);
  await manager.addConversation('agent', 'Creating TypeScript module...', 'agent-07-documentation');
  
  // Record decision
  await manager.recordDecision({
    description: 'Token budget strategy',
    options: ['Fixed 50K', 'Dynamic based on task', 'Progressive loading'],
    chosen: 'Dynamic based on task',
    rationale: 'Provides flexibility for different task complexity',
    impact: 'medium',
  });
  
  // Update task
  await manager.updateTask(36, {
    status: 'completed',
    progress: 100,
  });
  
  // Print summary
  console.log(manager.getSessionSummary());
  
  // Pause for later
  await manager.pauseSession();
  
  // Resume
  await manager.resumeSession(session.sessionId);
}

// Export for agent usage
export default SessionStateManager;
