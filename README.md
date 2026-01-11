# @smartup/pipeline-ui

A reusable React component library for AI Pipeline monitoring and management. Drop these components into any React project to visualize pipeline sessions, events, and start new pipelines.

## Installation

```bash
npm install @smartup/pipeline-ui
# or
yarn add @smartup/pipeline-ui
# or
pnpm add @smartup/pipeline-ui
```

## Quick Start

```tsx
import { PipelineProvider, HistoryView, StartPipelineModal } from '@smartup/pipeline-ui';

// Import the default dark theme CSS
import '@smartup/pipeline-ui/styles/variables.css';

function App() {
  return (
    <PipelineProvider
      config={{
        apiBaseUrl: 'https://your-pipeline-api.com',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }}
    >
      <HistoryView
        onConnectLive={(pipelineId) => console.log('Connect to', pipelineId)}
      />
    </PipelineProvider>
  );
}
```

## Components

### PipelineProvider

Wraps your app and provides configuration context to all pipeline components.

```tsx
<PipelineProvider
  config={{
    // Required: API base URL
    apiBaseUrl: 'https://your-api.com',

    // Optional: Custom headers (e.g., auth)
    headers: {
      'Authorization': 'Bearer your-token',
    },

    // Optional: Custom fetch function
    fetch: customFetch,

    // Optional: Custom link builders for external systems
    linkBuilders: {
      taskUrl: (taskId) => `https://your-task-system.com/tasks/${taskId}`,
      prUrl: (owner, repo, number) => `https://github.com/${owner}/${repo}/pull/${number}`,
      commitUrl: (owner, repo, sha) => `https://github.com/${owner}/${repo}/commit/${sha}`,
    },

    // Optional: Feature flags
    features: {
      enableWebSocket: true,
      enablePolling: true,
      pollingInterval: 10000,
    },

    // Optional: Customize labels
    labels: {
      sessionTitle: 'Session History',
      startButton: 'Start Pipeline',
      approveButton: 'Approve',
      rejectButton: 'Reject',
    },
  }}
>
  {children}
</PipelineProvider>
```

### HistoryView

Displays session history with filtering, event details, and actions.

```tsx
<HistoryView
  // Called when user wants to watch a running pipeline live
  onConnectLive={(pipelineId, taskTitle) => {
    // Navigate to live view or open WebSocket connection
  }}

  // Pre-select a session (e.g., from URL routing)
  selectedPipelineId="abc123"

  // Callback when selection changes
  onSessionSelect={(pipelineId) => {
    // Update URL or state
  }}

  // Custom class name
  className="my-history"
/>
```

### TimelineEvent

Individual event display component with expandable details.

```tsx
import { TimelineEvent, isMinorEvent } from '@smartup/pipeline-ui';

<TimelineEvent
  event={event}
  isGrouped={isMinorEvent(event)}
/>
```

### StartPipelineModal

Full-featured modal for starting new pipelines with all configuration options.

```tsx
<StartPipelineModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onStarted={(pipelineId) => {
    // Navigate to live view
    setShowModal(false);
  }}
/>
```

### Shared Components

```tsx
import { Button, Modal, Badge } from '@smartup/pipeline-ui';

// Button with variants
<Button variant="primary" size="md" loading={isLoading}>
  Click me
</Button>

// Modal
<Modal isOpen={open} onClose={() => setOpen(false)} title="My Modal">
  Modal content
</Modal>

// Badge with status
<Badge status="running">Running</Badge>
<Badge variant="success">Completed</Badge>
```

## Hooks

### useSessions

Fetch session list with polling support.

```tsx
import { useSessions } from '@smartup/pipeline-ui';

function MyComponent() {
  const {
    sessions,
    loading,
    error,
    total,
    refetch,
  } = useSessions({
    status: 'completed',  // Filter by status
    limit: 20,
    offset: 0,
    pollingInterval: 10000,  // Auto-refresh every 10s
    enabled: true,
  });
}
```

### useSessionDetail

Fetch session details with auto-polling for active sessions.

```tsx
import { useSessionDetail } from '@smartup/pipeline-ui';

function SessionDetail({ pipelineId }) {
  const {
    session,
    loading,
    error,
    refetch,
  } = useSessionDetail({
    pipelineId,
    pollingInterval: 5000,  // Poll every 5s for running sessions
  });
}
```

### useWebSocket

Real-time event streaming for live pipelines.

```tsx
import { useWebSocket } from '@smartup/pipeline-ui';

function LiveView({ pipelineId }) {
  const {
    events,
    status,
    isConnected,
    error,
  } = useWebSocket({
    pipelineId,
    enabled: true,
    onEvent: (event) => console.log('New event:', event),
    onStatusChange: (status) => console.log('Status:', status),
  });
}
```

## Theming

All styles use CSS custom properties prefixed with `--pipeline-`. Override these to match your design system.

### Method 1: Override CSS Variables

```css
/* In your app's CSS */
:root {
  /* Colors */
  --pipeline-accent-primary: #your-brand-color;
  --pipeline-bg-void: #your-background;
  --pipeline-bg-surface: #your-surface;
  --pipeline-text-primary: #your-text-color;

  /* Typography */
  --pipeline-font-sans: 'Your Font', sans-serif;
  --pipeline-font-mono: 'Your Mono', monospace;
}
```

### Method 2: Light Theme Preset

```css
/* Import light theme */
@import '@smartup/pipeline-ui/styles/variables.css';

/* Apply light theme class */
.my-app {
  @extend .pipeline-theme-light;
}
```

### Available CSS Variables

```css
/* Background Colors */
--pipeline-bg-void          /* Darkest background */
--pipeline-bg-surface       /* Card/panel background */
--pipeline-bg-elevated      /* Elevated surfaces */
--pipeline-bg-hover         /* Hover states */

/* Text Colors */
--pipeline-text-primary     /* Main text */
--pipeline-text-secondary   /* Secondary text */
--pipeline-text-muted       /* Muted text */
--pipeline-text-dim         /* Disabled/placeholder */

/* Accent Colors */
--pipeline-accent-primary   /* Primary brand color */
--pipeline-accent-glow      /* Glow/highlight effect */

/* Status Colors */
--pipeline-status-running   /* Blue - running state */
--pipeline-status-waiting   /* Yellow - waiting approval */
--pipeline-status-success   /* Green - completed */
--pipeline-status-failed    /* Red - failed */
--pipeline-status-warning   /* Orange - warning */

/* Status Backgrounds */
--pipeline-status-running-bg
--pipeline-status-waiting-bg
--pipeline-status-success-bg
--pipeline-status-failed-bg

/* Border Colors */
--pipeline-border-subtle    /* Subtle borders */
--pipeline-border-default   /* Default borders */
--pipeline-border-strong    /* Strong borders */

/* Typography */
--pipeline-font-sans        /* Sans-serif font */
--pipeline-font-mono        /* Monospace font */
--pipeline-text-xs          /* 11px */
--pipeline-text-sm          /* 13px */
--pipeline-text-base        /* 14px */
--pipeline-text-lg          /* 16px */
--pipeline-text-xl          /* 20px */
--pipeline-text-2xl         /* 24px */

/* Spacing */
--pipeline-space-1          /* 4px */
--pipeline-space-2          /* 8px */
--pipeline-space-3          /* 12px */
--pipeline-space-4          /* 16px */
--pipeline-space-5          /* 20px */
--pipeline-space-6          /* 24px */
--pipeline-space-8          /* 32px */

/* Border Radius */
--pipeline-radius-xs        /* 2px */
--pipeline-radius-sm        /* 4px */
--pipeline-radius-md        /* 6px */
--pipeline-radius-lg        /* 8px */
--pipeline-radius-xl        /* 12px */
--pipeline-radius-full      /* 9999px */

/* Shadows */
--pipeline-shadow-sm
--pipeline-shadow-md
--pipeline-shadow-lg
--pipeline-shadow-glow

/* Animations */
--pipeline-duration-fast    /* 150ms */
--pipeline-duration-normal  /* 250ms */
--pipeline-duration-slow    /* 350ms */
--pipeline-ease-out         /* Ease out timing */
```

## API Reference

### Types

```typescript
interface PipelineEvent {
  type: string;
  timestamp: string;
  data?: Record<string, unknown>;
  turn?: number;
}

type PipelineStatus = 'running' | 'waiting_approval' | 'completed' | 'failed';

interface Session {
  pipelineId: string;
  sessionId?: string;
  status: PipelineStatus;
  taskId?: string;
  taskTitle?: string;
  workflowType: string;
  createdAt: string;
  updatedAt?: string;
  duration?: number;
  cost?: number;
  eventCount?: number;
  prUrl?: string;
  events?: PipelineEvent[];
}

type WorkflowType = 'resolve-task' | 'code-review' | 'spec-analysis' | 'multi-repo';
type VerbosityLevel = 'condensed' | 'normal' | 'debug';
type ModelType = 'haiku' | 'sonnet' | 'opus';

interface StartPipelineRequest {
  taskId: string;
  workflowType: WorkflowType;
  skipApproval?: boolean;
  dryRun?: boolean;
  autoCreatePr?: boolean;
  autoReview?: boolean;
  maxBudgetUsd?: number;
  verbosity?: VerbosityLevel;
  agentOverrides?: Record<string, { model: ModelType }>;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

MIT
