# @smartup/pipeline-ui

A production-ready React component library for AI Pipeline monitoring and management. Provides beautiful, configurable components to visualize pipeline sessions, events, and control pipeline execution.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **HistoryView** - Browse and manage pipeline sessions with filtering, pagination, and detailed event timelines
- **TimelineEvent** - Rich event visualization with 30+ event types, expandable details, and quick action links
- **StartPipelineModal** - Complete pipeline configuration with workflow types, execution modes, and agent overrides
- **Fully Configurable** - Custom API endpoints, authentication headers, and link builders
- **Themeable** - CSS variables with `--pipeline-` prefix for easy customization
- **TypeScript First** - Full type definitions included
- **Lightweight** - Only `marked` as a runtime dependency (for markdown rendering)

## Installation

### From GitHub (recommended)

```bash
npm install github:SmartUp-Chile/pipeline-ui
```

With specific version/tag:

```bash
npm install github:SmartUp-Chile/pipeline-ui#v1.0.0
npm install github:SmartUp-Chile/pipeline-ui#main
```

### From local path (monorepo)

```bash
npm install ../pipeline-ui
# or in package.json:
"@smartup/pipeline-ui": "file:../pipeline-ui"
```

### Peer Dependencies

This library requires React 18 or later:

```bash
npm install react react-dom
```

## Quick Start

### 1. Import styles

```tsx
// Option A: Import all styles (recommended)
import '@smartup/pipeline-ui/styles';

// Option B: Import only variables (for custom theming)
import '@smartup/pipeline-ui/styles/variables.css';
```

### 2. Wrap your app with PipelineProvider

```tsx
import {
  PipelineProvider,
  HistoryView,
  StartPipelineModal
} from '@smartup/pipeline-ui';
import '@smartup/pipeline-ui/styles';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PipelineProvider
      config={{
        apiBaseUrl: 'https://ai-pipeline.smartup.lat',
        headers: {
          'Authorization': `Bearer ${yourApiKey}`,
        },
      }}
    >
      <div style={{ height: '100vh' }}>
        <button onClick={() => setShowModal(true)}>
          Start Pipeline
        </button>

        <HistoryView
          onConnectLive={(pipelineId, taskTitle) => {
            console.log('Connect to live:', pipelineId);
          }}
        />

        <StartPipelineModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStarted={(pipelineId) => {
            console.log('Started:', pipelineId);
            setShowModal(false);
          }}
        />
      </div>
    </PipelineProvider>
  );
}
```

## Configuration

### PipelineProvider Config

```tsx
<PipelineProvider
  config={{
    // Required: API base URL
    apiBaseUrl: 'https://ai-pipeline.smartup.lat',

    // Required: Authentication
    headers: {
      'Authorization': `Bearer ${process.env.PIPELINE_API_KEY}`,
    },

    // Optional: Custom link builders
    linkBuilders: {
      taskUrl: (taskId) => `https://shapeup.smartup.lat/tasks/${taskId}`,
    },

    // Optional: Feature flags
    features: {
      allowApproval: true,
      allowDelete: true,
      enableLiveView: true,
    },
  }}
>
```

### Environment Variables

Create a `.env` file:

```env
VITE_PIPELINE_API_URL=https://ai-pipeline.smartup.lat
VITE_PIPELINE_API_KEY=your-api-key-here
```

Then use in your app:

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: import.meta.env.VITE_PIPELINE_API_URL,
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PIPELINE_API_KEY}`,
    },
  }}
>
```

## Theming

### Override CSS variables to match your design system:

```css
/* your-app/styles/pipeline-theme.css */
:root {
  /* Map to your existing design tokens */
  --pipeline-bg-primary: var(--your-bg-color);
  --pipeline-text-primary: var(--your-text-color);
  --pipeline-accent-primary: var(--your-primary-color);
  --pipeline-font-sans: var(--your-font-family);

  /* Or use direct values */
  --pipeline-bg-primary: #0a0a0f;
  --pipeline-accent-primary: #6366f1;
}
```

See [Theming Guide](./docs/THEMING.md) for all available variables.

## Troubleshooting

### CORS Errors

If you see CORS errors, your domain needs to be added to the API's allowed origins. Contact the API administrator or add your domain to the `ALLOWED_ORIGINS` environment variable.

For local development, these origins are typically allowed:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`

### Import Errors

Make sure you're importing styles correctly:

```tsx
// Correct
import '@smartup/pipeline-ui/styles';

// Also correct
import '@smartup/pipeline-ui/styles/index.css';
import '@smartup/pipeline-ui/styles/variables.css';
```

### TypeScript Errors

Ensure you have the required peer dependencies:

```bash
npm install react@^18 react-dom@^18 @types/react @types/react-dom
```

## Documentation

- [Configuration Guide](./docs/CONFIGURATION.md) - All config options
- [Component API Reference](./docs/COMPONENTS.md) - Props and usage
- [Theming Guide](./docs/THEMING.md) - CSS variables reference
- [API Integration](./docs/API.md) - Hooks and API client

## Examples

Check out the [examples](./examples) directory:

- **[basic-usage.tsx](./examples/basic-usage.tsx)** - Minimal setup
- **[with-routing.tsx](./examples/with-routing.tsx)** - React Router integration
- **[custom-hooks.tsx](./examples/custom-hooks.tsx)** - Custom UI with hooks

## API Endpoints Required

Your backend must implement these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pipeline/start` | POST | Start a new pipeline |
| `/api/pipeline/:id` | GET | Get pipeline status |
| `/api/pipeline/:id/approve` | POST | Approve/reject a plan |
| `/api/sessions` | GET | List sessions (with filtering) |
| `/api/sessions/:id` | GET | Get session details |
| `/api/sessions/:id/resume` | POST | Resume a waiting session |
| `/api/sessions/:id` | DELETE | Delete a session |
| `/health` | GET | Health check |

WebSocket: `wss://{apiBaseUrl}/ws/:pipelineId`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
