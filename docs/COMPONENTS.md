# Component API Reference

This document covers all components exported by `@smartup/pipeline-ui`.

## Table of Contents

- [HistoryView](#historyview)
- [TimelineEvent](#timelineevent)
- [StartPipelineModal](#startpipelinemodal)
- [Button](#button)
- [Modal](#modal)
- [Badge](#badge)

---

## HistoryView

A complete session history view with filtering, pagination, and event details.

### Import

```tsx
import { HistoryView } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onConnectLive` | `(pipelineId: string, taskTitle?: string) => void` | - | Called when user wants to watch a running pipeline live |
| `selectedPipelineId` | `string` | - | Pre-select a session (useful for URL routing) |
| `onSessionSelect` | `(pipelineId: string \| null) => void` | - | Called when session selection changes |
| `className` | `string` | - | Additional CSS class |

### Usage

```tsx
function PipelineHistory() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  return (
    <HistoryView
      selectedPipelineId={sessionId}
      onSessionSelect={(id) => {
        if (id) navigate(`/sessions/${id}`);
        else navigate('/sessions');
      }}
      onConnectLive={(pipelineId, taskTitle) => {
        navigate(`/live/${pipelineId}`);
      }}
    />
  );
}
```

### Features

- **Session List Panel** - Collapsible sidebar with session cards
- **Status Filtering** - Filter by running, waiting, completed, failed
- **Event Filtering** - Filter events by category (lifecycle, workflow, agent, tool, error)
- **Pagination** - Navigate through session history
- **Session Stats** - Duration, cost, event count
- **Event Selection** - Cmd/Ctrl+click for multi-select, Shift+click for range
- **Copy Events** - Copy selected events as JSON
- **Resume Sessions** - Approve/reject waiting sessions
- **Delete Sessions** - Remove completed/failed sessions

---

## TimelineEvent

Individual event display component with expandable details.

### Import

```tsx
import { TimelineEvent, isMinorEvent, shouldHideEvent } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `event` | `PipelineEvent` | required | The event to display |
| `isGrouped` | `boolean` | `false` | Render in compact "grouped" style |

### Usage

```tsx
import { TimelineEvent, isMinorEvent, shouldHideEvent } from '@smartup/pipeline-ui';

function EventList({ events }) {
  return (
    <div>
      {events
        .filter(e => !shouldHideEvent(e))
        .map((event, i) => (
          <TimelineEvent
            key={`${event.type}-${event.timestamp}-${i}`}
            event={event}
            isGrouped={isMinorEvent(event)}
          />
        ))}
    </div>
  );
}
```

### Supported Event Types

| Category | Event Types |
|----------|-------------|
| **Lifecycle** | `started`, `completed`, `failed`, `init`, `waiting_approval`, `approved`, `rejected` |
| **Workflow** | `prefetch_start`, `prefetch_complete`, `task_fetched`, `plan_generated`, `execution_started`, `repos_selected`, `evaluation_complete` |
| **Agent** | `agent_start`, `agent_started`, `agent_complete`, `agent_completed` |
| **Tool** | `tool_call`, `tool_start`, `tool_complete` |
| **MCP** | `mcp_call`, `mcp_start`, `mcp_complete` |
| **Messages** | `assistant_message` |
| **Debug** | `sdk_message`, `sdk_thinking`, `timing`, `token_usage`, `tool_input_full`, `tool_output_full` |
| **Review** | `code_review_result`, `audit_generated` |
| **Error** | `error`, `budget_exceeded` |

### Helper Functions

```tsx
// Check if event should be rendered in compact style
isMinorEvent(event: PipelineEvent): boolean

// Check if event should be hidden from UI
shouldHideEvent(event: PipelineEvent): boolean
```

---

## StartPipelineModal

Modal for starting a new pipeline with full configuration options.

### Import

```tsx
import { StartPipelineModal } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Whether the modal is open |
| `onClose` | `() => void` | required | Called when modal should close |
| `onStarted` | `(pipelineId: string) => void` | required | Called when pipeline starts successfully |

### Usage

```tsx
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Start Pipeline
      </button>

      <StartPipelineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStarted={(pipelineId) => {
          console.log('Started:', pipelineId);
          setShowModal(false);
          // Navigate to live view or history
        }}
      />
    </>
  );
}
```

### Configuration Options

The modal allows users to configure:

- **Task ID or URL** - ShapeUp task ID or full URL
- **Workflow Type** - `resolve-task`, `code-review`, `spec-analysis`, `multi-repo`
- **Execution Mode** - Standard (wait for approval), YOLO (auto-execute), Dry Run (plan only)
- **Auto-create PR** - Toggle
- **Auto-review** - Toggle
- **Max Budget** - USD limit
- **Verbosity** - Condensed, Normal, Debug
- **Agent Overrides** - Override model per agent (haiku, sonnet, opus)

---

## Button

Versatile button component with multiple variants.

### Import

```tsx
import { Button } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable the button |
| `icon` | `ReactNode` | - | Icon to show before text |
| `onClick` | `() => void` | - | Click handler |
| `children` | `ReactNode` | - | Button content |
| `className` | `string` | - | Additional CSS class |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

### Usage

```tsx
// Primary button
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// With loading state
<Button variant="primary" loading={isSaving}>
  {isSaving ? 'Saving...' : 'Save'}
</Button>

// With icon
<Button
  variant="secondary"
  icon={<PlusIcon />}
  onClick={handleAdd}
>
  Add Item
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Small ghost button
<Button variant="ghost" size="sm">
  Cancel
</Button>
```

---

## Modal

Portal-based modal component with escape key handling.

### Import

```tsx
import { Modal } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Whether the modal is open |
| `onClose` | `() => void` | required | Called when modal should close |
| `title` | `string` | - | Modal title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal width |
| `children` | `ReactNode` | - | Modal content |
| `className` | `string` | - | Additional CSS class |

### Usage

```tsx
function ConfirmDialog({ isOpen, onClose, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Action"
      size="sm"
    >
      <p>Are you sure you want to proceed?</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
```

---

## Badge

Status badge component with optional pulsing animation.

### Import

```tsx
import { Badge } from '@smartup/pipeline-ui';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Visual style |
| `status` | `PipelineStatus` | - | Convenience prop - auto-maps status to variant |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |
| `dot` | `boolean` | `false` | Show status dot |
| `pulse` | `boolean` | `false` | Animate the dot |
| `children` | `ReactNode` | - | Badge content |
| `className` | `string` | - | Additional CSS class |

### Usage

```tsx
// Using status prop (auto-maps to variant)
<Badge status="running">Running</Badge>   // info variant + pulse
<Badge status="completed">Done</Badge>    // success variant
<Badge status="failed">Failed</Badge>     // danger variant

// Using variant directly
<Badge variant="success" dot>Active</Badge>

// With pulse animation
<Badge variant="info" pulse>Processing</Badge>

// Small size
<Badge variant="warning" size="sm">Warning</Badge>
```

### Status to Variant Mapping

| Status | Variant |
|--------|---------|
| `running` | `info` + auto-pulse |
| `waiting_approval` | `warning` |
| `completed` | `success` |
| `failed` | `danger` |

---

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [Theming Guide](./THEMING.md)
- [API Integration](./API.md)
