/**
 * Basic Usage Example
 *
 * This example shows how to integrate @smartup/pipeline-ui
 * into a React application with minimal configuration.
 */

import { useState } from 'react';
import {
  PipelineProvider,
  HistoryView,
  StartPipelineModal,
  Button,
} from '@smartup/pipeline-ui';

// Import the default dark theme
import '@smartup/pipeline-ui/styles/variables.css';

export function App() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Configuration for the pipeline UI
  const config = {
    apiBaseUrl: import.meta.env.VITE_PIPELINE_API_URL || 'http://localhost:3001',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PIPELINE_API_KEY}`,
    },
  };

  return (
    <PipelineProvider config={config}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <header
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--pipeline-border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Pipeline Dashboard</h1>
          <Button variant="primary" onClick={() => setShowStartModal(true)}>
            Start Pipeline
          </Button>
        </header>

        {/* Main content - History View */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <HistoryView
            selectedPipelineId={selectedSession ?? undefined}
            onSessionSelect={setSelectedSession}
            onConnectLive={(pipelineId, taskTitle) => {
              console.log('Connect to live pipeline:', pipelineId, taskTitle);
              // Navigate to live view or open WebSocket connection
            }}
          />
        </main>

        {/* Start Pipeline Modal */}
        <StartPipelineModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          onStarted={(pipelineId) => {
            console.log('Pipeline started:', pipelineId);
            setShowStartModal(false);
            setSelectedSession(pipelineId);
          }}
        />
      </div>
    </PipelineProvider>
  );
}

export default App;
