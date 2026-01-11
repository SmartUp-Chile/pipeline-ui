# API Integration Guide

This guide covers how to integrate `@smartup/pipeline-ui` with your Pipeline API backend.

## API Client

The library provides a built-in API client that handles all communication with your backend.

### Creating the Client

```tsx
import { createApiClient } from '@smartup/pipeline-ui';

const api = createApiClient({
  apiBaseUrl: 'https://your-api.com',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Using with PipelineProvider

When you use `PipelineProvider`, an API client is created automatically:

```tsx
import { PipelineProvider, usePipelineConfig } from '@smartup/pipeline-ui';

function MyComponent() {
  const { api } = usePipelineConfig();

  const sessions = await api.listSessions({ status: 'completed' });
}
```

## API Methods

### `startPipeline(request)`

Start a new pipeline execution.

```tsx
const response = await api.startPipeline({
  taskId: 'cmjoi1s3w003sov0153apjqpi',
  workflowType: 'resolve-task',
  skipApproval: false,
  dryRun: false,
  autoCreatePr: true,
  autoReview: true,
  maxBudgetUsd: 10.00,
  verbosity: 'normal',
  agentOverrides: {
    'code-executor': { model: 'opus' },
    'plan-generator': { model: 'sonnet' },
  },
});

console.log(response.pipelineId); // UUID
console.log(response.wsUrl);       // WebSocket URL
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskId` | `string` | Yes* | Task ID from your task system |
| `workflowType` | `WorkflowType` | Yes | `resolve-task`, `code-review`, `spec-analysis`, `multi-repo` |
| `skipApproval` | `boolean` | No | Auto-execute without approval (YOLO mode) |
| `dryRun` | `boolean` | No | Generate plan only, no execution |
| `autoCreatePr` | `boolean` | No | Create PR automatically |
| `autoReview` | `boolean` | No | Run code review after PR |
| `maxBudgetUsd` | `number` | No | Budget limit (default: 10.00) |
| `verbosity` | `VerbosityLevel` | No | `condensed`, `normal`, `debug` |
| `agentOverrides` | `object` | No | Per-agent model overrides |
| `prompt` | `string` | No | Custom prompt override |
| `model` | `string` | No | Override default model |

### `getPipeline(pipelineId)`

Get current status and events for a pipeline.

```tsx
const status = await api.getPipeline('uuid-here');

console.log(status.status);    // 'running' | 'waiting_approval' | 'completed' | 'failed'
console.log(status.events);    // Array of events
console.log(status.result);    // Final result (if completed)
```

### `approvePipeline(pipelineId, approved, feedback?)`

Approve or reject a waiting pipeline.

```tsx
// Approve
await api.approvePipeline('uuid-here', true);

// Approve with feedback
await api.approvePipeline('uuid-here', true, 'Also update the tests');

// Reject
await api.approvePipeline('uuid-here', false, 'Approach too complex');
```

### `listSessions(params?)`

List session history with optional filters.

```tsx
const response = await api.listSessions({
  status: 'completed',
  limit: 20,
  offset: 0,
});

console.log(response.sessions);  // Array of session summaries
console.log(response.total);     // Total count for pagination
```

**Filter Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `PipelineStatus` | Filter by status |
| `limit` | `number` | Max results (default: 50) |
| `offset` | `number` | Pagination offset |

### `getSession(sessionId)`

Get full session details including all events.

```tsx
const session = await api.getSession('uuid-here');

console.log(session.request);     // Original start request
console.log(session.events);      // All events
console.log(session.result);      // Final result
console.log(session.planData);    // Generated plan content
```

### `resumeSession(sessionId, approved, feedback?)`

Resume a persisted session that's waiting for approval.

```tsx
await api.resumeSession('uuid-here', true, 'Looks good!');
```

### `deleteSession(sessionId)`

Delete a session from history.

```tsx
await api.deleteSession('uuid-here');
```

### `healthCheck()`

Check API health.

```tsx
const health = await api.healthCheck();

console.log(health.status);           // 'ok'
console.log(health.activePipelines);  // Number currently running
```

## React Hooks

### `useSessions(options?)`

Hook for listing and managing sessions.

```tsx
import { useSessions } from '@smartup/pipeline-ui';

function SessionList() {
  const {
    sessions,
    total,
    loading,
    error,
    refresh,
    deleteSession,
  } = useSessions({
    status: 'completed',
    limit: 20,
    pollInterval: 10000, // Refresh every 10s
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {sessions.map(session => (
        <li key={session.pipelineId}>
          {session.taskTitle}
          <button onClick={() => deleteSession(session.pipelineId)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `status` | `PipelineStatus` | Filter by status |
| `limit` | `number` | Max results |
| `offset` | `number` | Pagination offset |
| `pollInterval` | `number` | Auto-refresh interval (ms) |
| `enabled` | `boolean` | Enable/disable fetching |

### `useSessionDetail(sessionId, options?)`

Hook for loading a single session with events.

```tsx
import { useSessionDetail } from '@smartup/pipeline-ui';

function SessionDetail({ sessionId }) {
  const {
    session,
    loading,
    error,
    refresh,
    approve,
    reject,
  } = useSessionDetail(sessionId, {
    pollInterval: 5000,
  });

  if (loading) return <div>Loading...</div>;
  if (!session) return <div>Not found</div>;

  return (
    <div>
      <h2>{session.taskTitle}</h2>
      <Badge status={session.status}>{session.status}</Badge>

      {session.status === 'waiting_approval' && (
        <div>
          <Button onClick={() => approve()}>Approve</Button>
          <Button onClick={() => reject('Not ready')}>Reject</Button>
        </div>
      )}

      {session.events.map((event, i) => (
        <TimelineEvent key={i} event={event} />
      ))}
    </div>
  );
}
```

### `useWebSocket(options)`

Hook for real-time event streaming via WebSocket.

```tsx
import { useWebSocket } from '@smartup/pipeline-ui';

function LiveView({ pipelineId }) {
  const {
    events,
    status,
    connected,
    error,
    disconnect,
  } = useWebSocket({
    pipelineId,
    wsUrl: `wss://your-api.com/ws/${pipelineId}`,
    onEvent: (event) => {
      console.log('New event:', event);
    },
    onStatusChange: (status) => {
      console.log('Status changed:', status);
    },
    onComplete: (result) => {
      console.log('Pipeline completed:', result);
    },
  });

  return (
    <div>
      <div>Connected: {connected ? 'Yes' : 'No'}</div>
      <div>Status: {status}</div>
      {events.map((event, i) => (
        <TimelineEvent key={i} event={event} />
      ))}
    </div>
  );
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `pipelineId` | `string` | Required pipeline ID |
| `wsUrl` | `string` | WebSocket URL |
| `onEvent` | `(event) => void` | Called for each event |
| `onStatusChange` | `(status) => void` | Called when status changes |
| `onComplete` | `(result) => void` | Called when pipeline completes |
| `onError` | `(error) => void` | Called on WebSocket error |
| `reconnect` | `boolean` | Auto-reconnect on disconnect |
| `reconnectInterval` | `number` | Reconnect delay (ms) |

### `useApi()`

Get the API client directly.

```tsx
import { useApi } from '@smartup/pipeline-ui';

function StartButton() {
  const api = useApi();

  const handleStart = async () => {
    const { pipelineId } = await api.startPipeline({
      taskId: 'my-task-id',
      workflowType: 'resolve-task',
    });
    console.log('Started:', pipelineId);
  };

  return <button onClick={handleStart}>Start</button>;
}
```

## API Endpoint Reference

Your backend should implement these endpoints:

### Pipeline Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pipeline/start` | Start a new pipeline |
| `GET` | `/api/pipeline/:id` | Get pipeline status |
| `POST` | `/api/pipeline/:id/approve` | Approve/reject plan |
| `GET` | `/api/pipelines` | List active pipelines |

### Session History

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List sessions (with filters) |
| `GET` | `/api/sessions/:id` | Get session details |
| `POST` | `/api/sessions/:id/resume` | Resume waiting session |
| `DELETE` | `/api/sessions/:id` | Delete session |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

### WebSocket

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `WS` | `/ws/:pipelineId` | Real-time event stream |

## Request/Response Examples

### Start Pipeline

**Request:**
```json
POST /api/pipeline/start
Content-Type: application/json

{
  "taskId": "cmjoi1s3w003sov0153apjqpi",
  "workflowType": "resolve-task",
  "skipApproval": false,
  "dryRun": false,
  "autoCreatePr": true,
  "maxBudgetUsd": 10.00,
  "verbosity": "normal"
}
```

**Response:**
```json
{
  "pipelineId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "wsUrl": "wss://api.example.com/ws/550e8400-e29b-41d4-a716-446655440000"
}
```

### List Sessions

**Request:**
```
GET /api/sessions?status=completed&limit=20&offset=0
```

**Response:**
```json
{
  "sessions": [
    {
      "pipelineId": "550e8400-...",
      "sessionId": "abc123",
      "status": "completed",
      "taskId": "cmjoi1s3w...",
      "taskTitle": "Add user authentication",
      "workflowType": "resolve-task",
      "eventCount": 42,
      "cost": 0.85,
      "duration": 180000,
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-10T10:03:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Get Session Detail

**Response:**
```json
{
  "pipelineId": "550e8400-...",
  "status": "completed",
  "request": { ... },
  "events": [
    {
      "type": "started",
      "timestamp": "2025-01-10T10:00:00Z",
      "data": { "taskId": "...", "workflowType": "resolve-task" }
    },
    {
      "type": "agent_started",
      "timestamp": "2025-01-10T10:00:01Z",
      "data": { "agentName": "repo-selector", "model": "sonnet" }
    }
  ],
  "result": {
    "success": true,
    "prUrl": "https://github.com/org/repo/pull/123",
    "cost": 0.85,
    "duration": 180000
  },
  "planData": "## Implementation Plan\n\n1. Create auth middleware..."
}
```

### WebSocket Events

Events are sent as JSON messages:

```json
{
  "type": "tool_call",
  "timestamp": "2025-01-10T10:00:05Z",
  "turn": 3,
  "data": {
    "toolName": "Read",
    "toolInput": { "file_path": "/src/index.ts" }
  }
}
```

## Error Handling

API errors are thrown as `ApiError` instances:

```tsx
import { createApiClient } from '@smartup/pipeline-ui';

try {
  await api.startPipeline({ ... });
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized
    redirectToLogin();
  } else if (error.status === 400) {
    // Validation error
    console.error('Invalid request:', error.message);
  } else {
    // Server error
    console.error('Server error:', error);
  }
}
```

## Custom Fetch Function

For advanced use cases (logging, retries, error handling):

```tsx
const customFetch = async (url, options) => {
  console.log(`[API] ${options?.method || 'GET'} ${url}`);

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired - refresh and retry
    await refreshToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${getNewToken()}`,
      },
    });
  }

  return response;
};

<PipelineProvider
  config={{
    apiBaseUrl: 'https://api.example.com',
    fetchFn: customFetch,
  }}
>
  {children}
</PipelineProvider>
```

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [Component API Reference](./COMPONENTS.md)
- [Theming Guide](./THEMING.md)
