// Utility formatters

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 0) return 'just now';
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString();
}

export function formatTimestamp(dateStr?: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// Alias for formatTimestamp
export const formatTime = formatTimestamp;

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCost(cost?: number): string {
  if (cost === undefined || cost === null) return '-';
  return `$${cost.toFixed(4)}`;
}

export function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return '-';

  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString();
}

export function formatPercentage(value?: number): string {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(1)}%`;
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '-';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'var(--pipeline-status-running)';
    case 'waiting_approval':
      return 'var(--pipeline-status-waiting)';
    case 'completed':
      return 'var(--pipeline-status-success)';
    case 'failed':
      return 'var(--pipeline-status-failed)';
    default:
      return 'var(--pipeline-text-muted)';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'running':
      return 'Running';
    case 'waiting_approval':
      return 'Waiting Approval';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}
