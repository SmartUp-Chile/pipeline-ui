# Configuration Guide

This guide covers all configuration options for `@smartup/pipeline-ui`.

## PipelineProvider

The `PipelineProvider` component wraps your application and provides configuration context to all pipeline components.

```tsx
import { PipelineProvider } from '@smartup/pipeline-ui';

function App() {
  return (
    <PipelineProvider config={config}>
      {/* Your app */}
    </PipelineProvider>
  );
}
```

### Configuration Options

```typescript
interface PipelineUIConfig {
  // Required: Base URL for the Pipeline API
  apiBaseUrl: string;

  // Optional: Custom headers for API requests (e.g., authentication)
  headers?: Record<string, string>;

  // Optional: Custom fetch function (useful for interceptors, testing)
  fetchFn?: typeof fetch;

  // Optional: Custom WebSocket URL builder
  getWebSocketUrl?: (pipelineId: string) => string;

  // Optional: Custom link builders for external systems
  linkBuilders?: {
    taskUrl?: (taskId: string) => string;
    prUrl?: (owner: string, repo: string, number: number) => string;
    commitUrl?: (owner: string, repo: string, sha: string) => string;
  };

  // Optional: Feature flags
  features?: {
    enableWebSocket?: boolean;
    enablePolling?: boolean;
    pollingInterval?: number;
  };

  // Optional: Customize UI labels
  labels?: {
    sessionTitle?: string;
    startButton?: string;
    approveButton?: string;
    rejectButton?: string;
  };
}
```

## Configuration Examples

### Basic Configuration

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
  }}
>
  {children}
</PipelineProvider>
```

### With Authentication

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Team-ID': teamId,
    },
  }}
>
  {children}
</PipelineProvider>
```

### With Custom Fetch (for interceptors)

```tsx
const customFetch = async (url: string, options?: RequestInit) => {
  // Add logging, error handling, etc.
  console.log('Fetching:', url);

  const response = await fetch(url, options);

  // Handle 401 errors globally
  if (response.status === 401) {
    redirectToLogin();
    throw new Error('Unauthorized');
  }

  return response;
};

<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
    fetchFn: customFetch,
  }}
>
  {children}
</PipelineProvider>
```

### With Custom Link Builders

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
    linkBuilders: {
      // Custom task management system
      taskUrl: (taskId) => `https://your-task-system.com/tasks/${taskId}`,

      // GitHub Enterprise
      prUrl: (owner, repo, number) =>
        `https://github.mycompany.com/${owner}/${repo}/pull/${number}`,

      commitUrl: (owner, repo, sha) =>
        `https://github.mycompany.com/${owner}/${repo}/commit/${sha}`,
    },
  }}
>
  {children}
</PipelineProvider>
```

### With Feature Flags

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
    features: {
      enableWebSocket: true,    // Enable WebSocket for live updates
      enablePolling: true,      // Enable polling as fallback
      pollingInterval: 5000,    // Poll every 5 seconds
    },
  }}
>
  {children}
</PipelineProvider>
```

### With Custom Labels

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: 'https://pipeline-api.example.com',
    labels: {
      sessionTitle: 'Pipeline History',
      startButton: 'New Pipeline',
      approveButton: 'Approve Plan',
      rejectButton: 'Reject Plan',
    },
  }}
>
  {children}
</PipelineProvider>
```

## Environment Variables

For production deployments, store sensitive configuration in environment variables:

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: process.env.REACT_APP_PIPELINE_API_URL!,
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_PIPELINE_API_KEY}`,
    },
  }}
>
  {children}
</PipelineProvider>
```

### Vite

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: import.meta.env.VITE_PIPELINE_API_URL,
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PIPELINE_API_KEY}`,
    },
  }}
>
  {children}
</PipelineProvider>
```

### Next.js

```tsx
<PipelineProvider
  config={{
    apiBaseUrl: process.env.NEXT_PUBLIC_PIPELINE_API_URL!,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PIPELINE_API_KEY}`,
    },
  }}
>
  {children}
</PipelineProvider>
```

## Using the Context

You can access the configuration from any component using the provided hooks:

```tsx
import { usePipelineConfig, useLabels, useFeatures } from '@smartup/pipeline-ui';

function MyComponent() {
  const config = usePipelineConfig();
  const labels = useLabels();
  const features = useFeatures();

  // Access API client
  const sessions = await config.api.listSessions();

  // Access custom labels
  console.log(labels.startButton); // "Start Pipeline" or custom

  // Check feature flags
  if (features.enableWebSocket) {
    // Use WebSocket
  }
}
```

## Next Steps

- [Component API Reference](./COMPONENTS.md)
- [Theming Guide](./THEMING.md)
- [API Integration](./API.md)
