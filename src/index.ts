// Components
export { TimelineEvent, isMinorEvent, shouldHideEvent } from './components/timeline';
export type { TimelineEventProps } from './components/timeline';

export { HistoryView } from './components/history';
export type { HistoryViewProps } from './components/history';

export { StartPipelineModal } from './components/pipeline';
export type { StartPipelineModalProps } from './components/pipeline';

export { Button, Modal, Badge } from './components/shared';
export type { ButtonProps, ModalProps, BadgeProps } from './components/shared';

// Context & Hooks
export { PipelineProvider, usePipelineConfig, useLabels, useFeatures } from './context/PipelineProvider';

export { useSessions, useSessionDetail } from './hooks/useSessions';
export type { UseSessionsOptions, UseSessionDetailOptions } from './hooks/useSessions';

export { useWebSocket } from './hooks/useWebSocket';
export type { UseWebSocketOptions } from './hooks/useWebSocket';

export { useApi } from './hooks/useApi';

// Services
export { createApiClient } from './services/api';
export type { ApiClient } from './services/api';

// Utils
export * from './utils/formatters';

// Types
export type {
  PipelineEvent,
  PipelineStatus,
  Session,
  WorkflowType,
  VerbosityLevel,
  ModelType,
  StartPipelineRequest,
  StartPipelineResponse,
  ListSessionsParams,
  ListSessionsResponse,
  PipelineUIConfig,
  PipelineUILabels,
  PipelineUIFeatures,
} from './types';

// Styles - import this in your app
import './styles/variables.css';
