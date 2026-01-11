/**
 * With React Router Example
 *
 * This example shows how to integrate @smartup/pipeline-ui
 * with React Router for URL-based navigation.
 */

import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  PipelineProvider,
  HistoryView,
  StartPipelineModal,
  Button,
} from '@smartup/pipeline-ui';

import '@smartup/pipeline-ui/styles/variables.css';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      style={{
        padding: '1rem',
        borderBottom: '1px solid var(--pipeline-border-primary)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Pipeline Dashboard</h1>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        New Pipeline
      </Button>

      <StartPipelineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStarted={(pipelineId) => {
          setShowModal(false);
          navigate(`/sessions/${pipelineId}`);
        }}
      />
    </header>
  );
}

function SessionsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  return (
    <HistoryView
      selectedPipelineId={sessionId}
      onSessionSelect={(id) => {
        if (id) {
          navigate(`/sessions/${id}`);
        } else {
          navigate('/sessions');
        }
      }}
      onConnectLive={(pipelineId) => {
        navigate(`/live/${pipelineId}`);
      }}
    />
  );
}

function LivePage() {
  const { pipelineId } = useParams();
  const navigate = useNavigate();

  // For live view, you would use the useWebSocket hook here
  // This is just a placeholder

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Live Pipeline: {pipelineId}</h2>
      <p>WebSocket connection would be active here...</p>
      <Button variant="secondary" onClick={() => navigate('/sessions')}>
        Back to History
      </Button>
    </div>
  );
}

function App() {
  const config = {
    apiBaseUrl: import.meta.env.VITE_PIPELINE_API_URL || 'http://localhost:3001',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PIPELINE_API_KEY}`,
    },
    // Custom link builders for your task system
    linkBuilders: {
      taskUrl: (taskId: string) =>
        `https://your-task-system.com/tasks/${taskId}`,
    },
  };

  return (
    <BrowserRouter>
      <PipelineProvider config={config}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header />
          <main style={{ flex: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<SessionsPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:sessionId" element={<SessionsPage />} />
              <Route path="/live/:pipelineId" element={<LivePage />} />
            </Routes>
          </main>
        </div>
      </PipelineProvider>
    </BrowserRouter>
  );
}

export default App;
