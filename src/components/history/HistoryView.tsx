import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Session, SessionDetail, PipelineStatus, PipelineEvent } from '../../types';
import { TimelineEvent, isMinorEvent, shouldHideEvent } from '../timeline';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { useApi } from '../../hooks/useApi';
import { formatDate, formatDuration, formatCost } from '../../utils/formatters';
import './HistoryView.css';

type EventCategory = 'lifecycle' | 'workflow' | 'agent' | 'tool' | 'mcp' | 'debug' | 'error';

export interface HistoryViewProps {
  /** Callback when user wants to watch a running pipeline live */
  onConnectLive?: (pipelineId: string, taskTitle?: string) => void;
  /** Pre-selected pipeline ID (from URL routing) */
  selectedPipelineId?: string;
  /** Callback when session selection changes */
  onSessionSelect?: (pipelineId: string | null) => void;
  /** Custom class name */
  className?: string;
}

const STATUS_FILTERS: Array<{ value: PipelineStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'waiting_approval', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const CATEGORY_FILTERS: Array<{ value: EventCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'lifecycle', label: 'Lifecycle' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'agent', label: 'Agent' },
  { value: 'tool', label: 'Tool' },
  { value: 'error', label: 'Error' },
];

const EVENT_CATEGORIES: Record<string, EventCategory> = {
  started: 'lifecycle',
  completed: 'lifecycle',
  failed: 'lifecycle',
  waiting_approval: 'lifecycle',
  approved: 'lifecycle',
  rejected: 'lifecycle',
  workflow_started: 'workflow',
  workflow_step: 'workflow',
  plan_generated: 'workflow',
  task_fetched: 'workflow',
  prefetch_complete: 'workflow',
  repo_selected: 'workflow',
  code_review_result: 'workflow',
  audit_generated: 'workflow',
  agent_started: 'agent',
  agent_completed: 'agent',
  subagent_start: 'agent',
  subagent_stop: 'agent',
  tool_start: 'tool',
  tool_complete: 'tool',
  tool_error: 'tool',
  mcp_start: 'mcp',
  mcp_complete: 'mcp',
  mcp_error: 'mcp',
  error: 'error',
  budget_exceeded: 'error',
};

const PAGE_SIZE = 20;

export function HistoryView({
  onConnectLive,
  selectedPipelineId,
  onSessionSelect,
  className,
}: HistoryViewProps) {
  const api = useApi();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<EventCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Multi-selection state
  const [selectedEventIndices, setSelectedEventIndices] = useState<Set<number>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch sessions list
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listSessions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: 'merged',
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      const sortedSessions = [...result.sessions].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setSessions(sortedSessions);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter, page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch session detail
  const fetchSessionDetail = useCallback(async (pipelineId: string) => {
    setLoadingDetail(true);
    try {
      const session = await api.getSession(pipelineId);
      setSelectedSession(session);
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setLoadingDetail(false);
    }
  }, [api]);

  // Load session from URL when selectedPipelineId is provided
  useEffect(() => {
    if (selectedPipelineId && selectedPipelineId !== selectedSession?.pipelineId) {
      fetchSessionDetail(selectedPipelineId);
    }
  }, [selectedPipelineId, fetchSessionDetail, selectedSession?.pipelineId]);

  const handleSelectSession = useCallback((session: Session) => {
    onSessionSelect?.(session.pipelineId);
    // Always fetch full detail to get events
    fetchSessionDetail(session.pipelineId);
  }, [fetchSessionDetail, onSessionSelect]);

  const handleCopyLink = useCallback(() => {
    if (!selectedSession) return;
    const url = `${window.location.origin}/session/${selectedSession.pipelineId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [selectedSession]);

  const handleResume = useCallback(async (approved: boolean) => {
    if (!selectedSession) return;
    setResuming(true);
    try {
      await api.resumeSession(selectedSession.pipelineId, approved);
      onConnectLive?.(selectedSession.pipelineId, selectedSession.taskTitle);
      fetchSessions();
    } catch (err) {
      console.error('Failed to resume session:', err);
    } finally {
      setResuming(false);
    }
  }, [api, selectedSession, onConnectLive, fetchSessions]);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.deleteSession(deleteConfirm);
      if (selectedSession?.pipelineId === deleteConfirm) {
        setSelectedSession(null);
      }
      setDeleteConfirm(null);
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeleting(false);
    }
  }, [api, deleteConfirm, selectedSession, fetchSessions]);

  const filteredEvents = useMemo((): PipelineEvent[] => {
    if (!selectedSession?.events) return [];

    const visibleEvents = selectedSession.events.filter((e: PipelineEvent) => !shouldHideEvent(e));

    if (eventFilter === 'all') {
      return visibleEvents.filter(
        (e: PipelineEvent) => EVENT_CATEGORIES[e.type] !== 'debug'
      );
    }
    return visibleEvents.filter(
      (e: PipelineEvent) => EVENT_CATEGORIES[e.type] === eventFilter
    );
  }, [selectedSession, eventFilter]);

  // Clear selection when session changes
  useEffect(() => {
    setSelectedEventIndices(new Set());
    setLastClickedIndex(null);
  }, [selectedSession?.pipelineId]);

  // Handle event selection with Cmd/Ctrl+click and Shift+click
  const handleEventSelect = useCallback((index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    if (event.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const newSelection = new Set(selectedEventIndices);
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedEventIndices(newSelection);
    } else if (event.metaKey || event.ctrlKey) {
      const newSelection = new Set(selectedEventIndices);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedEventIndices(newSelection);
      setLastClickedIndex(index);
    } else {
      if (selectedEventIndices.has(index) && selectedEventIndices.size === 1) {
        setSelectedEventIndices(new Set());
        setLastClickedIndex(null);
      } else {
        setSelectedEventIndices(new Set([index]));
        setLastClickedIndex(index);
      }
    }
  }, [selectedEventIndices, lastClickedIndex]);

  const handleSelectAll = useCallback(() => {
    const allIndices = new Set<number>(filteredEvents.map((_: PipelineEvent, i: number) => i));
    setSelectedEventIndices(allIndices);
  }, [filteredEvents]);

  const handleClearSelection = useCallback(() => {
    setSelectedEventIndices(new Set());
    setLastClickedIndex(null);
  }, []);

  const handleCopySelected = useCallback(async () => {
    const selectedEvents = Array.from(selectedEventIndices)
      .sort((a, b) => a - b)
      .map(i => filteredEvents[i])
      .filter(Boolean);

    if (selectedEvents.length === 0) return;

    const text = JSON.stringify(selectedEvents, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [selectedEventIndices, filteredEvents]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={`pipeline-history ${className || ''}`}>
      {/* Sessions List Panel */}
      <div className={`pipeline-history-list ${panelCollapsed ? 'pipeline-history-list-collapsed' : ''}`}>
        <button
          className="pipeline-history-collapse-toggle"
          onClick={() => setPanelCollapsed(!panelCollapsed)}
          title={panelCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {panelCollapsed ? '\u2192' : '\u2190'}
        </button>

        <div className="pipeline-history-collapsed-indicator" onClick={() => setPanelCollapsed(false)}>
          <span className="pipeline-history-collapsed-icon">&#128203;</span>
          <span className="pipeline-history-collapsed-count">{total} sessions</span>
        </div>

        <div className="pipeline-history-list-header">
          <h2 className="pipeline-history-list-title">Session History</h2>
          <div className="pipeline-history-status-filters">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`pipeline-history-status-filter ${statusFilter === filter.value ? 'active' : ''} ${filter.value !== 'all' ? filter.value : ''}`}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(0);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pipeline-history-sessions-list">
          {loading ? (
            <div className="pipeline-history-loading">
              <div className="pipeline-history-loading-spinner" />
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="pipeline-history-empty">
              No sessions found
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.pipelineId}
                className={`pipeline-history-session-item ${selectedSession?.pipelineId === session.pipelineId ? 'selected' : ''}`}
                onClick={() => handleSelectSession(session)}
              >
                <div className="pipeline-history-session-top">
                  <h4 className="pipeline-history-session-title">
                    {session.taskTitle || session.taskId || session.pipelineId}
                  </h4>
                  <span className={`pipeline-history-session-status ${session.status}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="pipeline-history-session-meta">
                  <span className="pipeline-history-session-workflow">{session.workflowType}</span>
                  <span className="pipeline-history-session-date">{formatDate(session.createdAt)}</span>
                  {session.cost !== undefined && (
                    <span className="pipeline-history-session-cost">{formatCost(session.cost)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pipeline-history-pagination">
            <span className="pipeline-history-page-info">
              {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="pipeline-history-page-buttons">
              <button
                className="pipeline-history-page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                &#8592;
              </button>
              <button
                className="pipeline-history-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                &#8594;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <div className="pipeline-history-detail">
        {!selectedSession ? (
          <div className="pipeline-history-detail-empty">
            <div className="pipeline-history-detail-empty-icon">&#128203;</div>
            <p className="pipeline-history-detail-empty-text">
              Select a session to view details
            </p>
          </div>
        ) : loadingDetail ? (
          <div className="pipeline-history-loading">
            <div className="pipeline-history-loading-spinner" />
            Loading session details...
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="pipeline-history-detail-header">
              <div className="pipeline-history-detail-info">
                <h2 className="pipeline-history-detail-title">
                  {selectedSession.taskTitle || selectedSession.taskId}
                </h2>
                <div className="pipeline-history-detail-meta">
                  <div className="pipeline-history-detail-meta-item">
                    <span className="pipeline-history-detail-meta-label">Status:</span>
                    <Badge status={selectedSession.status}>
                      {selectedSession.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="pipeline-history-detail-meta-item">
                    <span className="pipeline-history-detail-meta-label">Workflow:</span>
                    <span className="pipeline-history-detail-meta-value">{selectedSession.workflowType}</span>
                  </div>
                  <div className="pipeline-history-detail-meta-item">
                    <span className="pipeline-history-detail-meta-label">Started:</span>
                    <span className="pipeline-history-detail-meta-value">{formatDate(selectedSession.createdAt)}</span>
                  </div>
                  {selectedSession.duration && (
                    <div className="pipeline-history-detail-meta-item">
                      <span className="pipeline-history-detail-meta-label">Duration:</span>
                      <span className="pipeline-history-detail-meta-value">{formatDuration(selectedSession.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pipeline-history-detail-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  title="Copy shareable link"
                >
                  {linkCopied ? '\u2713 Copied' : '\ud83d\udd17 Share'}
                </Button>
                {selectedSession.status === 'running' && onConnectLive && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onConnectLive(selectedSession.pipelineId, selectedSession.taskTitle)}
                  >
                    Watch Live
                  </Button>
                )}
                {selectedSession.status === 'waiting_approval' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResume(false)}
                      loading={resuming}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResume(true)}
                      loading={resuming}
                    >
                      Approve
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteConfirm(selectedSession.pipelineId)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="pipeline-history-detail-content">
              {/* Stats */}
              <div className="pipeline-history-session-stats">
                {selectedSession.duration && (
                  <div className="pipeline-history-stat-card">
                    <div className="pipeline-history-stat-value">{formatDuration(selectedSession.duration)}</div>
                    <div className="pipeline-history-stat-label">Duration</div>
                  </div>
                )}
                {selectedSession.cost !== undefined && (
                  <div className="pipeline-history-stat-card">
                    <div className="pipeline-history-stat-value">{formatCost(selectedSession.cost)}</div>
                    <div className="pipeline-history-stat-label">Cost</div>
                  </div>
                )}
                {selectedSession.eventCount !== undefined && (
                  <div className="pipeline-history-stat-card">
                    <div className="pipeline-history-stat-value">{selectedSession.eventCount}</div>
                    <div className="pipeline-history-stat-label">Events</div>
                  </div>
                )}
              </div>

              {/* PR Link */}
              {selectedSession.prUrl && (
                <a
                  href={selectedSession.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pipeline-history-pr-link"
                >
                  View Pull Request &#8594;
                </a>
              )}

              {/* Events */}
              <div className="pipeline-history-events-header">
                <h3 className="pipeline-history-events-title">Events</h3>
                <div className="pipeline-history-events-filters">
                  {CATEGORY_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      className={`pipeline-history-status-filter ${eventFilter === filter.value ? 'active' : ''}`}
                      onClick={() => setEventFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection toolbar */}
              {filteredEvents.length > 0 && (
                <div className="pipeline-history-selection-toolbar">
                  <div className="pipeline-history-selection-info">
                    {selectedEventIndices.size > 0 ? (
                      <span>{selectedEventIndices.size} selected</span>
                    ) : (
                      <span className="pipeline-history-selection-hint">
                        Click to select &bull; Cmd/Ctrl+click for multiple &bull; Shift+click for range
                      </span>
                    )}
                  </div>
                  <div className="pipeline-history-selection-actions">
                    {selectedEventIndices.size > 0 && (
                      <>
                        <button
                          className="pipeline-history-selection-btn"
                          onClick={handleClearSelection}
                        >
                          Clear
                        </button>
                        <button
                          className="pipeline-history-selection-btn primary"
                          onClick={handleCopySelected}
                        >
                          {copySuccess ? '\u2713 Copied!' : `Copy ${selectedEventIndices.size} event${selectedEventIndices.size > 1 ? 's' : ''}`}
                        </button>
                      </>
                    )}
                    {selectedEventIndices.size === 0 && (
                      <button
                        className="pipeline-history-selection-btn"
                        onClick={handleSelectAll}
                      >
                        Select All
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="pipeline-history-events-list">
                {filteredEvents.length === 0 ? (
                  <div className="pipeline-history-empty">No events</div>
                ) : (
                  filteredEvents.map((event: PipelineEvent, i: number) => (
                    <div
                      key={`${event.type}-${event.timestamp}-${i}`}
                      className={`pipeline-history-event-wrapper ${selectedEventIndices.has(i) ? 'selected' : ''}`}
                      onClick={(e) => handleEventSelect(i, e)}
                    >
                      <TimelineEvent
                        event={event}
                        isGrouped={isMinorEvent(event)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="pipeline-history-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="pipeline-history-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="pipeline-history-confirm-title">Delete Session?</h3>
            <p className="pipeline-history-confirm-text">
              This will permanently delete this session and all its events. This action cannot be undone.
            </p>
            <div className="pipeline-history-confirm-actions">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
