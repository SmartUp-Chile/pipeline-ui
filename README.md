# @smartup/pipeline-ui

A production-ready React component library for AI Pipeline monitoring and management. Provides beautiful, configurable components to visualize pipeline sessions, events, and control pipeline execution.

[![npm version](https://img.shields.io/npm/v/@smartup/pipeline-ui.svg)](https://www.npmjs.com/package/@smartup/pipeline-ui)
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

```bash
# npm
npm install @smartup/pipeline-ui

# yarn
yarn add @smartup/pipeline-ui

# pnpm
pnpm add @smartup/pipeline-ui
```

### Peer Dependencies

This library requires React 18 or later:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import {
  PipelineProvider,
  HistoryView,
  StartPipelineModal
} from '@smartup/pipeline-ui';

// Import the default dark theme
import '@smartup/pipeline-ui/styles/variables.css';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PipelineProvider
      config={{
        apiBaseUrl: 'https://your-pipeline-api.com',
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

## Documentation

- [Configuration Guide](./docs/CONFIGURATION.md)
- [Component API Reference](./docs/COMPONENTS.md)
- [Theming Guide](./docs/THEMING.md)
- [API Integration](./docs/API.md)

## Examples

Check out the [examples](./examples) directory for complete usage examples:

- **[basic-usage.tsx](./examples/basic-usage.tsx)** - Minimal setup with HistoryView and StartPipelineModal
- **[with-routing.tsx](./examples/with-routing.tsx)** - Integration with React Router for URL-based navigation
- **[custom-hooks.tsx](./examples/custom-hooks.tsx)** - Building custom UI using the provided hooks

## API Compatibility

This library is designed to work with the SmartUp AI Pipeline API. Required endpoints:

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

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
