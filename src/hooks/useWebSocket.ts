// WebSocket Hook - Single connection management
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PipelineEvent } from '../types';
import { useApi } from './useApi';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseWebSocketOptions {
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
export function useWebSocket(
  pipelineId: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onEvent,
    onStatusChange,
    autoReconnect = false,
    reconnectInterval = 5000,
  } = options;

  const api = useApi();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const updateStatus = useCallback(
    (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  const connect = useCallback(() => {
    if (!pipelineId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateStatus('connecting');

    const wsUrl = api.getWebSocketUrl(pipelineId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      updateStatus('connected');
    };

    ws.onclose = () => {
      updateStatus('disconnected');
      wsRef.current = null;

      // Auto reconnect if enabled
      if (autoReconnect && pipelineId) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = () => {
      updateStatus('error');
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Handle event message
        if (data.event) {
          const event = data.event as PipelineEvent;
          setEvents((prev) => [...prev, event]);
          onEvent?.(event);
        }

        // Handle initial connection with historical events
        if (data.type === 'connected' && data.events) {
          setEvents(data.events);
        }

        // Handle status updates
        if (data.status) {
          onStatusChange?.(data.status);
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    wsRef.current = ws;
  }, [pipelineId, autoReconnect, reconnectInterval, updateStatus, onEvent, onStatusChange, api]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateStatus('disconnected');
  }, [updateStatus]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-connect when pipelineId changes
  useEffect(() => {
    if (pipelineId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [pipelineId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    events,
    connect,
    disconnect,
    clearEvents,
  };
}
