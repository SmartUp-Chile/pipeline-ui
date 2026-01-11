# Theming Guide

This guide covers all CSS variables available for customizing `@smartup/pipeline-ui` components.

## Quick Start

Import the default dark theme, then override any variables:

```tsx
// Import default theme
import '@smartup/pipeline-ui/styles/variables.css';

// Your custom overrides (optional)
import './my-theme.css';
```

## CSS Variable Reference

All variables use the `--pipeline-` prefix to avoid conflicts with your app.

### Color Palette

```css
:root {
  /* Background colors */
  --pipeline-bg-primary: #0a0a0f;
  --pipeline-bg-secondary: #12121a;
  --pipeline-bg-tertiary: #1a1a24;
  --pipeline-bg-card: #16161e;
  --pipeline-bg-hover: #1e1e28;

  /* Text colors */
  --pipeline-text-primary: #f0f0f5;
  --pipeline-text-secondary: #a0a0b0;
  --pipeline-text-muted: #707080;
  --pipeline-text-disabled: #505060;

  /* Border colors */
  --pipeline-border-primary: #2a2a38;
  --pipeline-border-secondary: #1e1e28;
  --pipeline-border-focus: #6366f1;

  /* Status colors */
  --pipeline-status-running: #3b82f6;
  --pipeline-status-waiting: #f59e0b;
  --pipeline-status-completed: #22c55e;
  --pipeline-status-failed: #ef4444;

  /* Accent colors */
  --pipeline-accent-primary: #6366f1;
  --pipeline-accent-secondary: #8b5cf6;
  --pipeline-accent-success: #22c55e;
  --pipeline-accent-warning: #f59e0b;
  --pipeline-accent-danger: #ef4444;
  --pipeline-accent-info: #3b82f6;
}
```

### Typography

```css
:root {
  /* Font families */
  --pipeline-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --pipeline-font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Font sizes */
  --pipeline-text-xs: 0.75rem;
  --pipeline-text-sm: 0.875rem;
  --pipeline-text-base: 1rem;
  --pipeline-text-lg: 1.125rem;
  --pipeline-text-xl: 1.25rem;
  --pipeline-text-2xl: 1.5rem;

  /* Font weights */
  --pipeline-font-normal: 400;
  --pipeline-font-medium: 500;
  --pipeline-font-semibold: 600;
  --pipeline-font-bold: 700;

  /* Line heights */
  --pipeline-leading-tight: 1.25;
  --pipeline-leading-normal: 1.5;
  --pipeline-leading-relaxed: 1.75;
}
```

### Spacing

```css
:root {
  --pipeline-spacing-xs: 0.25rem;
  --pipeline-spacing-sm: 0.5rem;
  --pipeline-spacing-md: 1rem;
  --pipeline-spacing-lg: 1.5rem;
  --pipeline-spacing-xl: 2rem;
  --pipeline-spacing-2xl: 3rem;
}
```

### Border Radius

```css
:root {
  --pipeline-radius-sm: 0.25rem;
  --pipeline-radius-md: 0.5rem;
  --pipeline-radius-lg: 0.75rem;
  --pipeline-radius-xl: 1rem;
  --pipeline-radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --pipeline-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --pipeline-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --pipeline-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --pipeline-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
}
```

### Transitions

```css
:root {
  --pipeline-transition-fast: 150ms ease;
  --pipeline-transition-normal: 250ms ease;
  --pipeline-transition-slow: 350ms ease;
}
```

### Event Category Colors

```css
:root {
  /* Event type colors for timeline */
  --pipeline-event-lifecycle: #6366f1;
  --pipeline-event-workflow: #8b5cf6;
  --pipeline-event-agent: #3b82f6;
  --pipeline-event-tool: #22c55e;
  --pipeline-event-mcp: #f59e0b;
  --pipeline-event-message: #a855f7;
  --pipeline-event-debug: #6b7280;
  --pipeline-event-review: #06b6d4;
  --pipeline-event-error: #ef4444;
}
```

### Z-Index Scale

```css
:root {
  --pipeline-z-dropdown: 100;
  --pipeline-z-sticky: 200;
  --pipeline-z-modal: 300;
  --pipeline-z-popover: 400;
  --pipeline-z-tooltip: 500;
}
```

## Theme Examples

### Light Theme

```css
/* my-light-theme.css */
:root {
  --pipeline-bg-primary: #ffffff;
  --pipeline-bg-secondary: #f8fafc;
  --pipeline-bg-tertiary: #f1f5f9;
  --pipeline-bg-card: #ffffff;
  --pipeline-bg-hover: #e2e8f0;

  --pipeline-text-primary: #0f172a;
  --pipeline-text-secondary: #475569;
  --pipeline-text-muted: #94a3b8;
  --pipeline-text-disabled: #cbd5e1;

  --pipeline-border-primary: #e2e8f0;
  --pipeline-border-secondary: #f1f5f9;

  --pipeline-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --pipeline-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --pipeline-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Purple Accent Theme

```css
/* my-purple-theme.css */
:root {
  --pipeline-accent-primary: #a855f7;
  --pipeline-accent-secondary: #c084fc;
  --pipeline-border-focus: #a855f7;
  --pipeline-status-running: #a855f7;
}
```

### Corporate Blue Theme

```css
/* my-corporate-theme.css */
:root {
  --pipeline-bg-primary: #0f172a;
  --pipeline-bg-secondary: #1e293b;
  --pipeline-bg-tertiary: #334155;
  --pipeline-bg-card: #1e293b;

  --pipeline-accent-primary: #0ea5e9;
  --pipeline-accent-secondary: #38bdf8;
  --pipeline-border-focus: #0ea5e9;

  --pipeline-font-sans: 'IBM Plex Sans', -apple-system, sans-serif;
}
```

### High Contrast Theme

```css
/* my-high-contrast-theme.css */
:root {
  --pipeline-bg-primary: #000000;
  --pipeline-bg-secondary: #0a0a0a;
  --pipeline-bg-tertiary: #141414;
  --pipeline-bg-card: #0a0a0a;

  --pipeline-text-primary: #ffffff;
  --pipeline-text-secondary: #e5e5e5;
  --pipeline-text-muted: #a3a3a3;

  --pipeline-border-primary: #404040;
  --pipeline-border-secondary: #262626;

  --pipeline-accent-primary: #fbbf24;
  --pipeline-status-running: #22d3ee;
  --pipeline-status-completed: #4ade80;
  --pipeline-status-failed: #f87171;
}
```

## Component-Specific Styling

### Timeline Events

```css
/* Customize timeline event cards */
.pipeline-timeline-event {
  /* Override specific event card styles */
}

.pipeline-timeline-event--expanded {
  /* Styles when event is expanded */
}
```

### History View

```css
/* Customize history layout */
.pipeline-history-container {
  /* Main container */
}

.pipeline-history-sidebar {
  /* Session list sidebar */
}

.pipeline-history-main {
  /* Event timeline area */
}

.pipeline-session-card {
  /* Individual session cards */
}
```

### Modal

```css
/* Customize modals */
.pipeline-modal-overlay {
  /* Backdrop */
}

.pipeline-modal-content {
  /* Modal box */
}

.pipeline-modal-header {
  /* Modal header */
}
```

### Buttons

```css
/* Customize button variants */
.pipeline-button--primary {
  /* Primary button */
}

.pipeline-button--secondary {
  /* Secondary button */
}

.pipeline-button--danger {
  /* Danger button */
}
```

## Dark Mode Toggle

If your app supports dark/light mode toggling:

```tsx
function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'}>
      <PipelineProvider config={config}>
        <HistoryView />
      </PipelineProvider>
    </div>
  );
}
```

```css
/* Define themes with class-based selectors */
.light-theme {
  --pipeline-bg-primary: #ffffff;
  --pipeline-bg-secondary: #f8fafc;
  --pipeline-text-primary: #0f172a;
  /* ... other light overrides */
}

.dark-theme {
  --pipeline-bg-primary: #0a0a0f;
  --pipeline-bg-secondary: #12121a;
  --pipeline-text-primary: #f0f0f5;
  /* ... uses defaults */
}
```

## Using with Tailwind CSS

If your app uses Tailwind, you can map variables:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pipeline: {
          primary: 'var(--pipeline-accent-primary)',
          secondary: 'var(--pipeline-accent-secondary)',
          success: 'var(--pipeline-accent-success)',
          warning: 'var(--pipeline-accent-warning)',
          danger: 'var(--pipeline-accent-danger)',
        },
      },
    },
  },
};
```

## Best Practices

1. **Import order matters**: Import the default theme first, then your overrides
2. **Use CSS variables**: Override at the `:root` level for global changes
3. **Scope overrides**: Use class selectors for component-specific changes
4. **Test status colors**: Ensure good contrast for all status badge colors
5. **Check accessibility**: Maintain sufficient contrast ratios (WCAG 2.1 AA)

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [Component API Reference](./COMPONENTS.md)
- [API Integration](./API.md)
