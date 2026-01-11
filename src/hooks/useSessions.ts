import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session, SessionDetail, PipelineStatus } from '../types';
import { useApi } from './useApi';

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
export function useSessions(options: UseSessionsOptions = {}): UseSessionsReturn {
  const {
    status: initialStatus = 'all',
    pollInterval = 10000,
    pageSize = 20,
    initialPage = 0,
  } = options;

  const api = useApi();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState<PipelineStatus | 'all'>(initialStatus);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const result = await api.listSessions({
        status: status !== 'all' ? status : undefined,
        source: 'merged',
        limit: pageSize,
        offset: page * pageSize,
      });

      // Sort by createdAt descending (newest first)
      const sortedSessions = [...result.sessions].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setSessions(sortedSessions);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setLoading(false);
    }
  }, [api, status, page, pageSize]);

  // Initial fetch and polling
  useEffect(() => {
    setLoading(true);
    fetchSessions();

    if (pollInterval > 0) {
      pollRef.current = setInterval(fetchSessions, pollInterval);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchSessions, pollInterval]);

  // Reset page when status changes
  useEffect(() => {
    setPage(0);
  }, [status]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    sessions,
    total,
    loading,
    error,
    page,
    totalPages,
    setPage,
    setStatus,
    refresh: fetchSessions,
  };
}

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
export function useSessionDetail(options: UseSessionDetailOptions): UseSessionDetailReturn {
  const { pipelineId, pollInterval = 5000 } = options;

  const api = useApi();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSession = useCallback(async () => {
    if (!pipelineId) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const result = await api.getSession(pipelineId);
      setSession(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch session'));
    } finally {
      setLoading(false);
    }
  }, [api, pipelineId]);

  useEffect(() => {
    setLoading(true);
    fetchSession();

    // Clear previous poll
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [pipelineId, fetchSession]);

  // Set up polling for active sessions
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const isActive = session?.status === 'running' || session?.status === 'waiting_approval';

    if (isActive && pollInterval > 0) {
      pollRef.current = setInterval(fetchSession, pollInterval);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [session?.status, pollInterval, fetchSession]);

  return {
    session,
    loading,
    error,
    refresh: fetchSession,
  };
}
