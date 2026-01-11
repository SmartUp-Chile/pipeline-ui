// Configurable API Client for Pipeline UI
import type {
  StartPipelineRequest,
  Session,
  SessionDetail,
  PipelineEvent,
  ListSessionsResponse,
  ApprovePipelineResponse,
  ResumeSessionResponse,
  PipelineUIConfig,
} from '../types';

/**
 * Creates an API client configured with the provided settings
 */
export function createApiClient(config: PipelineUIConfig) {
  const { apiBaseUrl, fetchFn = fetch, headers: customHeaders = {} } = config;

  async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetchFn(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  return {
    // ============================================
    // PIPELINE ENDPOINTS
    // ============================================

    async startPipeline(request: StartPipelineRequest): Promise<{
      pipelineId: string;
      status: string;
      message: string;
      wsUrl: string;
    }> {
      return fetchJson(`${apiBaseUrl}/api/pipeline/start`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    async getPipeline(pipelineId: string): Promise<{
      pipelineId: string;
      status: string;
      sessionId?: string;
      events: PipelineEvent[];
      result?: unknown;
    }> {
      return fetchJson(`${apiBaseUrl}/api/pipeline/${pipelineId}`);
    },

    async approvePipeline(
      pipelineId: string,
      approved: boolean,
      feedback?: string
    ): Promise<ApprovePipelineResponse> {
      return fetchJson(`${apiBaseUrl}/api/pipeline/${pipelineId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved, feedback }),
      });
    },

    async listActivePipelines(): Promise<{
      pipelines: Array<{
        pipelineId: string;
        status: string;
        sessionId?: string;
        eventCount: number;
        taskId?: string;
        taskTitle?: string;
      }>;
    }> {
      return fetchJson(`${apiBaseUrl}/api/pipelines`);
    },

    // ============================================
    // SESSION ENDPOINTS
    // ============================================

    async listSessions(params: {
      status?: string;
      source?: 'local' | 'merged';
      limit?: number;
      offset?: number;
    } = {}): Promise<ListSessionsResponse> {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.source) searchParams.set('source', params.source);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      return fetchJson(`${apiBaseUrl}/api/sessions?${searchParams}`);
    },

    async getSession(pipelineId: string, includeEvents = true): Promise<SessionDetail> {
      return fetchJson(
        `${apiBaseUrl}/api/sessions/${pipelineId}?includeEvents=${includeEvents}`
      );
    },

    async getResumableSessions(): Promise<{
      sessions: Session[];
      count: number;
    }> {
      return fetchJson(`${apiBaseUrl}/api/sessions/resumable`);
    },

    async resumeSession(
      pipelineId: string,
      approved: boolean,
      feedback?: string
    ): Promise<ResumeSessionResponse> {
      return fetchJson(`${apiBaseUrl}/api/sessions/${pipelineId}/resume`, {
        method: 'POST',
        body: JSON.stringify({ approved, feedback }),
      });
    },

    async deleteSession(pipelineId: string): Promise<{ message: string; pipelineId: string }> {
      return fetchJson(`${apiBaseUrl}/api/sessions/${pipelineId}`, {
        method: 'DELETE',
      });
    },

    // ============================================
    // HEALTH CHECK
    // ============================================

    async healthCheck(): Promise<{
      status: string;
      version: string;
      activePipelines: number;
      modelProvider?: string;
    }> {
      return fetchJson(`${apiBaseUrl}/health`);
    },

    // ============================================
    // WEBSOCKET URL
    // ============================================

    getWebSocketUrl(pipelineId: string): string {
      if (config.getWebSocketUrl) {
        return config.getWebSocketUrl(pipelineId);
      }

      // Default: derive from apiBaseUrl
      const url = new URL(apiBaseUrl || window.location.origin);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}/ws/${pipelineId}`;
    },
  };
}

// Type for the API client
export type PipelineApiClient = ReturnType<typeof createApiClient>;

/**
 * Extract task ID from a URL or return as-is if already an ID
 */
export function extractTaskId(input: string): string {
  if (!input.includes('/')) {
    return input.trim();
  }
  const parts = input.split('/');
  return parts[parts.length - 1].trim();
}
