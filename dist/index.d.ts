import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type WorkflowType = 'resolve-task' | 'code-review' | 'spec-analysis' | 'multi-repo';
type VerbosityLevel = 'condensed' | 'normal' | 'debug';
type PipelineStatus = 'running' | 'waiting_approval' | 'completed' | 'failed';
type ModelType = 'opus' | 'sonnet' | 'haiku';
interface AgentOverride {
    model?: ModelType;
}
interface StartPipelineRequest {
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
interface PipelineEvent {
    type: string;
    timestamp: string;
    sessionId: string;
    turnNumber?: number;
    turn?: number;
    data: Record<string, unknown>;
}
interface Pipeline {
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
interface Session {
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
interface SessionDetail extends Session {
    request?: StartPipelineRequest;
    events: PipelineEvent[];
    result?: PipelineResult;
    planData?: string;
}
interface PipelineResult {
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
type EventCategory = 'lifecycle' | 'workflow' | 'agent' | 'tool' | 'mcp' | 'debug' | 'error';
interface PipelineUIConfig {
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
        liveViewTitle: string;
        historyViewTitle: string;
        noSessionsFound: string;
        loadingSessions: string;
        selectSessionPrompt: string;
        statusRunning: string;
        statusWaitingApproval: string;
        statusCompleted: string;
        statusFailed: string;
        approve: string;
        reject: string;
        delete: string;
        watchLive: string;
        copyLink: string;
        noEvents: string;
        eventCount: string;
    }>;
}
interface ListSessionsResponse {
    sessions: Session[];
    total: number;
    limit: number;
    offset: number;
}
interface ApprovePipelineResponse {
    pipelineId: string;
    status: string;
    message: string;
}
interface ResumeSessionResponse {
    pipelineId: string;
    status: string;
    message: string;
    wsUrl: string;
}

interface TimelineEventProps {
    event: PipelineEvent;
    isGrouped?: boolean;
}
declare function TimelineEvent({ event, isGrouped }: TimelineEventProps): react_jsx_runtime.JSX.Element;
declare function isMinorEvent(event: PipelineEvent): boolean;
declare function shouldHideEvent(event: PipelineEvent): boolean;

interface HistoryViewProps {
    /** Callback when user wants to watch a running pipeline live */
    onConnectLive?: (pipelineId: string, taskTitle?: string) => void;
    /** Pre-selected pipeline ID (from URL routing) */
    selectedPipelineId?: string;
    /** Callback when session selection changes */
    onSessionSelect?: (pipelineId: string | null) => void;
    /** Custom class name */
    className?: string;
}
declare function HistoryView({ onConnectLive, selectedPipelineId, onSessionSelect, className, }: HistoryViewProps): react_jsx_runtime.JSX.Element;

interface StartPipelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStarted: (pipelineId: string) => void;
}
declare function StartPipelineModal({ isOpen, onClose, onStarted }: StartPipelineModalProps): react_jsx_runtime.JSX.Element;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: ReactNode;
    iconRight?: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showClose?: boolean;
}
declare function Modal({ isOpen, onClose, title, children, size, showClose, }: ModalProps): react.ReactPortal | null;

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';
interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    /** Convenience prop - maps pipeline status to appropriate variant */
    status?: PipelineStatus;
    size?: BadgeSize;
    dot?: boolean;
    pulse?: boolean;
    className?: string;
}
declare function Badge({ children, variant, status, size, dot, pulse, className, }: BadgeProps): react_jsx_runtime.JSX.Element;

declare function usePipelineConfig(): PipelineUIConfig;
declare function useLabels(): {
    liveViewTitle?: string | undefined;
    historyViewTitle?: string | undefined;
    noSessionsFound?: string | undefined;
    loadingSessions?: string | undefined;
    selectSessionPrompt?: string | undefined;
    statusRunning?: string | undefined;
    statusWaitingApproval?: string | undefined;
    statusCompleted?: string | undefined;
    statusFailed?: string | undefined;
    approve?: string | undefined;
    reject?: string | undefined;
    delete?: string | undefined;
    watchLive?: string | undefined;
    copyLink?: string | undefined;
    noEvents?: string | undefined;
    eventCount?: string | undefined;
};
declare function useFeatures(): {
    allowApproval?: boolean;
    allowDelete?: boolean;
    allowShareLinks?: boolean;
    enableLiveView?: boolean;
};
interface PipelineProviderProps {
    children: ReactNode;
    config: PipelineUIConfig;
}
/**
 * PipelineProvider - Wrap your app with this to configure the pipeline UI components
 *
 * @example
 * ```tsx
 * import { PipelineProvider } from '@smartup/pipeline-ui';
 *
 * function App() {
 *   return (
 *     <PipelineProvider config={{
 *       apiBaseUrl: 'https://api.example.com',
 *       headers: { 'Authorization': `Bearer ${token}` },
 *       linkBuilders: {
 *         taskUrl: (id) => `https://tasks.example.com/${id}`,
 *       },
 *     }}>
 *       <YourApp />
 *     </PipelineProvider>
 *   );
 * }
 * ```
 */
declare function PipelineProvider({ children, config }: PipelineProviderProps): react_jsx_runtime.JSX.Element;

interface UseSessionsOptions {
    /** Status filter for sessions */
    status?: PipelineStatus | 'all';
    /** Poll interval in ms (default: 10000, set to 0 to disable) */
    pollInterval?: number;
    /** Number of sessions per page */
    pageSize?: number;
    /** Initial page (0-indexed) */
    initialPage?: number;
}
interface UseSessionsReturn {
    sessions: Session[];
    total: number;
    loading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
    setStatus: (status: PipelineStatus | 'all') => void;
    refresh: () => Promise<void>;
}
/**
 * Hook to fetch and manage session list with polling
 *
 * @example
 * ```tsx
 * function SessionList() {
 *   const { sessions, loading, page, setPage, totalPages } = useSessions({
 *     status: 'completed',
 *     pollInterval: 30000, // Poll every 30s
 *   });
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {sessions.map(s => (
 *         <li key={s.pipelineId}>{s.taskTitle}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
declare function useSessions(options?: UseSessionsOptions): UseSessionsReturn;
interface UseSessionDetailOptions {
    /** Pipeline ID to fetch */
    pipelineId: string | null;
    /** Poll interval in ms for running/waiting sessions (default: 5000, set to 0 to disable) */
    pollInterval?: number;
}
interface UseSessionDetailReturn {
    session: SessionDetail | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
/**
 * Hook to fetch session details with optional polling for active sessions
 *
 * @example
 * ```tsx
 * function SessionDetail({ pipelineId }: { pipelineId: string }) {
 *   const { session, loading } = useSessionDetail({ pipelineId });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Not found</div>;
 *
 *   return (
 *     <div>
 *       <h2>{session.taskTitle}</h2>
 *       <p>Events: {session.events.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
declare function useSessionDetail(options: UseSessionDetailOptions): UseSessionDetailReturn;

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
interface UseWebSocketOptions {
    onEvent?: (event: PipelineEvent) => void;
    onStatusChange?: (status: string) => void;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}
interface UseWebSocketReturn {
    status: ConnectionStatus;
    events: PipelineEvent[];
    connect: () => void;
    disconnect: () => void;
    clearEvents: () => void;
}
/**
 * Hook to manage a WebSocket connection to a pipeline
 *
 * @example
 * ```tsx
 * function LivePipeline({ pipelineId }: { pipelineId: string }) {
 *   const { status, events } = useWebSocket(pipelineId, {
 *     onEvent: (event) => console.log('New event:', event),
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {status}</p>
 *       <p>Events: {events.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
declare function useWebSocket(pipelineId: string | null, options?: UseWebSocketOptions): UseWebSocketReturn;

/**
 * Creates an API client configured with the provided settings
 */
declare function createApiClient(config: PipelineUIConfig): {
    startPipeline(request: StartPipelineRequest): Promise<{
        pipelineId: string;
        status: string;
        message: string;
        wsUrl: string;
    }>;
    getPipeline(pipelineId: string): Promise<{
        pipelineId: string;
        status: string;
        sessionId?: string;
        events: PipelineEvent[];
        result?: unknown;
    }>;
    approvePipeline(pipelineId: string, approved: boolean, feedback?: string): Promise<ApprovePipelineResponse>;
    listActivePipelines(): Promise<{
        pipelines: Array<{
            pipelineId: string;
            status: string;
            sessionId?: string;
            eventCount: number;
            taskId?: string;
            taskTitle?: string;
        }>;
    }>;
    listSessions(params?: {
        status?: string;
        source?: "local" | "merged";
        limit?: number;
        offset?: number;
    }): Promise<ListSessionsResponse>;
    getSession(pipelineId: string, includeEvents?: boolean): Promise<SessionDetail>;
    getResumableSessions(): Promise<{
        sessions: Session[];
        count: number;
    }>;
    resumeSession(pipelineId: string, approved: boolean, feedback?: string): Promise<ResumeSessionResponse>;
    deleteSession(pipelineId: string): Promise<{
        message: string;
        pipelineId: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        version: string;
        activePipelines: number;
        modelProvider?: string;
    }>;
    getWebSocketUrl(pipelineId: string): string;
};
type PipelineApiClient = ReturnType<typeof createApiClient>;
/**
 * Extract task ID from a URL or return as-is if already an ID
 */
declare function extractTaskId(input: string): string;

/**
 * Hook to get the configured API client
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const api = useApi();
 *
 *   const handleClick = async () => {
 *     const sessions = await api.listSessions();
 *     console.log(sessions);
 *   };
 *
 *   return <button onClick={handleClick}>Load Sessions</button>;
 * }
 * ```
 */
declare function useApi(): PipelineApiClient;

declare function formatRelativeTime(dateStr?: string): string;
declare function formatTimestamp(dateStr?: string): string;
declare const formatTime: typeof formatTimestamp;
declare function formatDate(dateStr?: string): string;
declare function formatDateTime(dateStr?: string): string;
declare function formatCost(cost?: number): string;
declare function formatDuration(ms?: number): string;
declare function formatNumber(num?: number): string;
declare function formatPercentage(value?: number): string;
declare function formatBytes(bytes?: number): string;
declare function truncate(str: string, length: number): string;
declare function getStatusColor(status: string): string;
declare function getStatusLabel(status: string): string;

export { type ApprovePipelineResponse, Badge, type BadgeProps, Button, type ButtonProps, type EventCategory, HistoryView, type HistoryViewProps, type ListSessionsResponse, Modal, type ModalProps, type ModelType, type Pipeline, type PipelineApiClient, type PipelineEvent, PipelineProvider, type PipelineResult, type PipelineStatus, type PipelineUIConfig, type ResumeSessionResponse, type Session, type SessionDetail, StartPipelineModal, type StartPipelineModalProps, type StartPipelineRequest, TimelineEvent, type TimelineEventProps, type UseSessionDetailOptions, type UseSessionsOptions, type UseWebSocketOptions, type VerbosityLevel, type WorkflowType, createApiClient, extractTaskId, formatBytes, formatCost, formatDate, formatDateTime, formatDuration, formatNumber, formatPercentage, formatRelativeTime, formatTime, formatTimestamp, getStatusColor, getStatusLabel, isMinorEvent, shouldHideEvent, truncate, useApi, useFeatures, useLabels, usePipelineConfig, useSessionDetail, useSessions, useWebSocket };
