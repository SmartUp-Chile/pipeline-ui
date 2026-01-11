import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PipelineUIConfig } from '../types';

// Default configuration
const defaultConfig: PipelineUIConfig = {
  apiBaseUrl: '',
  features: {
    allowApproval: true,
    allowDelete: true,
    allowShareLinks: true,
    enableLiveView: true,
  },
  labels: {
    liveViewTitle: 'Live Pipelines',
    historyViewTitle: 'Session History',
    noSessionsFound: 'No sessions found',
    loadingSessions: 'Loading sessions...',
    selectSessionPrompt: 'Select a session to view details',
    statusRunning: 'Running',
    statusWaitingApproval: 'Waiting',
    statusCompleted: 'Completed',
    statusFailed: 'Failed',
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
    watchLive: 'Watch Live',
    copyLink: 'Share',
    noEvents: 'No events',
    eventCount: 'events',
  },
};

// Context
const PipelineContext = createContext<PipelineUIConfig>(defaultConfig);

// Hook to use the config
export function usePipelineConfig(): PipelineUIConfig {
  return useContext(PipelineContext);
}

// Helper hook to get merged labels
export function useLabels() {
  const config = usePipelineConfig();
  return useMemo(() => ({
    ...defaultConfig.labels,
    ...config.labels,
  }), [config.labels]);
}

// Helper hook to get merged features
export function useFeatures() {
  const config = usePipelineConfig();
  return useMemo(() => ({
    ...defaultConfig.features,
    ...config.features,
  }), [config.features]);
}

// Provider props
interface PipelineProviderProps {
  children: ReactNode;
  config: PipelineUIConfig;
}

/**
 * PipelineProvider - Wrap your app with this to configure the pipeline UI components
 *
 * @example
 * ```tsx
 * import { PipelineProvider } from '@smartup/pipeline-ui';
 *
 * function App() {
 *   return (
 *     <PipelineProvider config={{
 *       apiBaseUrl: 'https://api.example.com',
 *       headers: { 'Authorization': `Bearer ${token}` },
 *       linkBuilders: {
 *         taskUrl: (id) => `https://tasks.example.com/${id}`,
 *       },
 *     }}>
 *       <YourApp />
 *     </PipelineProvider>
 *   );
 * }
 * ```
 */
export function PipelineProvider({ children, config }: PipelineProviderProps) {
  const mergedConfig = useMemo<PipelineUIConfig>(() => ({
    ...defaultConfig,
    ...config,
    features: {
      ...defaultConfig.features,
      ...config.features,
    },
    labels: {
      ...defaultConfig.labels,
      ...config.labels,
    },
  }), [config]);

  return (
    <PipelineContext.Provider value={mergedConfig}>
      {children}
    </PipelineContext.Provider>
  );
}

export { PipelineContext };
