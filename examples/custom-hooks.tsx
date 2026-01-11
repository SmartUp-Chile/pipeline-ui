/**
 * Custom Hooks Example
 *
 * This example shows how to use the hooks directly
 * for building custom UI components.
 */

import { useState } from 'react';
import {
  PipelineProvider,
  useSessions,
  useSessionDetail,
  useWebSocket,
  useApi,
  TimelineEvent,
  Badge,
  Button,
  isMinorEvent,
  shouldHideEvent,
  formatDuration,
  formatCost,
} from '@smartup/pipeline-ui';

import '@smartup/pipeline-ui/styles/variables.css';

/**
 * Custom session list using the useSessions hook
 */
function CustomSessionList({ onSelect }: { onSelect: (id: string) => void }) {
  const { sessions, loading, error, refresh, deleteSession } = useSessions({
    limit: 10,
    pollInterval: 30000, // Refresh every 30s
  });

  if (loading && sessions.length === 0) {
    return <div>Loading sessions...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>Sessions ({sessions.length})</h3>
        <Button variant="ghost" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {sessions.map((session) => (
        <div
          key={session.pipelineId}
          style={{
            padding: '1rem',
            marginBottom: '0.5rem',
            background: 'var(--pipeline-bg-card)',
            borderRadius: 'var(--pipeline-radius-md)',
            cursor: 'pointer',
          }}
          onClick={() => onSelect(session.pipelineId)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{session.taskTitle || session.taskId}</span>
            <Badge status={session.status}>{session.status}</Badge>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--pipeline-text-secondary)' }}>
            {formatDuration(session.duration)} | {formatCost(session.cost)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Custom session detail using the useSessionDetail hook
 */
function CustomSessionDetail({ sessionId }: { sessionId: string }) {
  const [filter, setFilter] = useState<string>('all');
  const { session, loading, approve, reject } = useSessionDetail(sessionId, {
    pollInterval: 5000,
  });

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  // Filter events
  const filteredEvents = session.events.filter((e) => {
    if (shouldHideEvent(e)) return false;
    if (filter === 'all') return true;
    return e.type.includes(filter);
  });

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2>{session.taskTitle || 'Pipeline Session'}</h2>
        <Badge status={session.status}>{session.status}</Badge>
      </div>

      {/* Approval buttons for waiting sessions */}
      {session.status === 'waiting_approval' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button variant="success" onClick={() => approve()}>
            Approve
          </Button>
          <Button variant="danger" onClick={() => reject('Rejected by user')}>
            Reject
          </Button>
        </div>
      )}

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'tool', 'agent', 'error'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Events */}
      <div>
        {filteredEvents.map((event, i) => (
          <TimelineEvent
            key={`${event.type}-${event.timestamp}-${i}`}
            event={event}
            isGrouped={isMinorEvent(event)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Live pipeline view using the useWebSocket hook
 */
function LivePipelineView({ pipelineId, wsUrl }: { pipelineId: string; wsUrl: string }) {
  const { events, status, connected } = useWebSocket({
    pipelineId,
    wsUrl,
    onComplete: (result) => {
      console.log('Pipeline completed:', result);
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Badge variant={connected ? 'success' : 'danger'}>
          {connected ? 'Connected' : 'Disconnected'}
        </Badge>
        {status && <Badge status={status}>{status}</Badge>}
      </div>

      <div>
        {events
          .filter((e) => !shouldHideEvent(e))
          .map((event, i) => (
            <TimelineEvent key={i} event={event} isGrouped={isMinorEvent(event)} />
          ))}
      </div>
    </div>
  );
}

/**
 * Start pipeline form using the useApi hook
 */
function QuickStartForm() {
  const api = useApi();
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ pipelineId: string; wsUrl: string } | null>(null);

  const handleStart = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const response = await api.startPipeline({
        taskId,
        workflowType: 'resolve-task',
        verbosity: 'normal',
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to start:', error);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <LivePipelineView pipelineId={result.pipelineId} wsUrl={result.wsUrl} />;
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="text"
        value={taskId}
        onChange={(e) => setTaskId(e.target.value)}
        placeholder="Task ID"
        style={{
          flex: 1,
          padding: '0.5rem',
          background: 'var(--pipeline-bg-secondary)',
          border: '1px solid var(--pipeline-border-primary)',
          borderRadius: 'var(--pipeline-radius-md)',
          color: 'var(--pipeline-text-primary)',
        }}
      />
      <Button variant="primary" onClick={handleStart} loading={loading}>
        Start
      </Button>
    </div>
  );
}

/**
 * Main App with custom components
 */
function App() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const config = {
    apiBaseUrl: import.meta.env.VITE_PIPELINE_API_URL || 'http://localhost:3001',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PIPELINE_API_KEY}`,
    },
  };

  return (
    <PipelineProvider config={config}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          height: '100vh',
        }}
      >
        {/* Sidebar - Session List */}
        <aside
          style={{
            padding: '1rem',
            borderRight: '1px solid var(--pipeline-border-primary)',
            overflow: 'auto',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <QuickStartForm />
          </div>
          <CustomSessionList onSelect={setSelectedSession} />
        </aside>

        {/* Main - Session Detail */}
        <main style={{ padding: '1rem', overflow: 'auto' }}>
          {selectedSession ? (
            <CustomSessionDetail sessionId={selectedSession} />
          ) : (
            <div style={{ color: 'var(--pipeline-text-muted)' }}>
              Select a session to view details
            </div>
          )}
        </main>
      </div>
    </PipelineProvider>
  );
}

export default App;
