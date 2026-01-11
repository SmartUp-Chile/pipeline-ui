import { useMemo } from 'react';
import { usePipelineConfig } from '../context/PipelineProvider';
import { createApiClient, type PipelineApiClient } from '../services/api';

/**
 * Hook to get the configured API client
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const api = useApi();
 *
 *   const handleClick = async () => {
 *     const sessions = await api.listSessions();
 *     console.log(sessions);
 *   };
 *
 *   return <button onClick={handleClick}>Load Sessions</button>;
 * }
 * ```
 */
export function useApi(): PipelineApiClient {
  const config = usePipelineConfig();

  return useMemo(() => createApiClient(config), [config]);
}
