// Pipeline UI Types

export type WorkflowType = 'resolve-task' | 'code-review' | 'spec-analysis' | 'multi-repo';
export type VerbosityLevel = 'condensed' | 'normal' | 'debug';
export type PipelineStatus = 'running' | 'waiting_approval' | 'completed' | 'failed';
export type ModelType = 'opus' | 'sonnet' | 'haiku';

export interface AgentOverride {
  model?: ModelType;
}

export interface StartPipelineRequest {
  taskId?: string;
  prompt?: string;
  workflowType: WorkflowType;
  skipApproval?: boolean;
  dryRun?: boolean;
  autoCreatePr?: boolean;
  autoReview?: boolean;
  model?: string;
  maxBudgetUsd?: number;
  verbosity?: VerbosityLevel;
  agentOverrides?: Record<string, AgentOverride>;
}

export interface PipelineEvent {
  type: string;
  timestamp: string;
  sessionId: string;
  turnNumber?: number;
  turn?: number; // Alternative field name
  data: Record<string, unknown>;
}

export interface Pipeline {
  pipelineId: string;
  status: PipelineStatus;
  sessionId?: string;
  taskId?: string;
  taskTitle?: string;
  verbosity?: VerbosityLevel;
  events: PipelineEvent[];
  createdAt?: string;
  updatedAt?: string;
  cost?: number;
  duration?: number;
}

export interface Session {
  pipelineId: string;
  sessionId?: string;
  status: PipelineStatus;
  taskId?: string;
  taskTitle?: string;
  workflowType?: WorkflowType;
  eventCount?: number;
  createdAt?: string;
  updatedAt?: string;
  cost?: number;
  duration?: number;
  prUrl?: string;
}

export interface SessionDetail extends Session {
  request?: StartPipelineRequest;
  events: PipelineEvent[];
  result?: PipelineResult;
  planData?: string;
}

export interface PipelineResult {
  success: boolean;
  sessionId?: string;
  status?: string;
  taskId?: string;
  taskTitle?: string;
  plan?: {
    summary?: string;
    files?: string[];
    estimatedChanges?: number;
  };
  execution?: {
    filesModified?: string[];
    prUrl?: string;
    branch?: string;
  };
  metrics?: {
    totalCostUsd?: number;
    durationMs?: number;
    numTurns?: number;
  };
  errors?: string[];
}

// WebSocket Connection
export interface WebSocketConnection {
  id: string;
  pipelineId: string;
  taskTitle?: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  events: PipelineEvent[];
  lastUpdate?: string;
}

// Event Categories for filtering
export type EventCategory = 'lifecycle' | 'workflow' | 'agent' | 'tool' | 'mcp' | 'debug' | 'error';

// Configuration for the PipelineProvider
export interface PipelineUIConfig {
  /**
   * Base URL for the pipeline API (e.g., 'https://api.example.com')
   * Omit trailing slash
   */
  apiBaseUrl: string;

  /**
   * Optional: Custom fetch function for API calls
   * Use this to add authentication headers, etc.
   */
  fetchFn?: typeof fetch;

  /**
   * Optional: Custom headers to add to all API requests
   */
  headers?: Record<string, string>;

  /**
   * Optional: WebSocket URL builder
   * @param pipelineId - The pipeline ID
   * @returns Full WebSocket URL
   */
  getWebSocketUrl?: (pipelineId: string) => string;

  /**
   * Optional: Custom link builder for external resources
   */
  linkBuilders?: {
    /** Build a link to a task in your task management system */
    taskUrl?: (taskId: string) => string;
    /** Build a link to a PR in your VCS */
    prUrl?: (prUrl: string) => string;
    /** Build a link to a session detail page */
    sessionUrl?: (pipelineId: string) => string;
  };

  /**
   * Optional: Enable/disable features
   */
  features?: {
    /** Show resume/approve buttons for waiting_approval sessions */
    allowApproval?: boolean;
    /** Show delete button for sessions */
    allowDelete?: boolean;
    /** Show copy link button */
    allowShareLinks?: boolean;
    /** Enable live view with WebSocket */
    enableLiveView?: boolean;
  };

  /**
   * Optional: Custom text/labels for i18n
   */
  labels?: Partial<{
    // View titles
    liveViewTitle: string;
    historyViewTitle: string;

    // Session list
    noSessionsFound: string;
    loadingSessions: string;
    selectSessionPrompt: string;

    // Status labels
    statusRunning: string;
    statusWaitingApproval: string;
    statusCompleted: string;
    statusFailed: string;

    // Actions
    approve: string;
    reject: string;
    delete: string;
    watchLive: string;
    copyLink: string;

    // Events
    noEvents: string;
    eventCount: string;
  }>;
}

// API Response types for the client
export interface ListSessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
}

export interface SessionDetailResponse extends SessionDetail {}

export interface ApprovePipelineResponse {
  pipelineId: string;
  status: string;
  message: string;
}

export interface ResumeSessionResponse {
  pipelineId: string;
  status: string;
  message: string;
  wsUrl: string;
}
