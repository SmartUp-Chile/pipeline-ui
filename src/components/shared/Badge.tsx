import type { ReactNode } from 'react';
import type { PipelineStatus } from '../../types';
import './Badge.css';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  /** Convenience prop - maps pipeline status to appropriate variant */
  status?: PipelineStatus;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

function statusToVariant(status: PipelineStatus): BadgeVariant {
  switch (status) {
    case 'running':
      return 'info';
    case 'waiting_approval':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}

export function Badge({
  children,
  variant = 'default',
  status,
  size = 'md',
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  // If status is provided, use it to determine variant
  const effectiveVariant = status ? statusToVariant(status) : variant;
  // Running status should pulse
  const shouldPulse = pulse || status === 'running';

  return (
    <span
      className={[
        'pipeline-badge',
        `pipeline-badge-${effectiveVariant}`,
        `pipeline-badge-${size}`,
        dot && 'pipeline-badge-with-dot',
        shouldPulse && 'pipeline-badge-pulse',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(dot || shouldPulse) && <span className="pipeline-badge-dot" />}
      {children}
    </span>
  );
}
