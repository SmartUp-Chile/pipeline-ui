import { useState } from 'react';
import type { WorkflowType, VerbosityLevel, ModelType, StartPipelineRequest } from '../../types';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { usePipelineConfig } from '../../context/PipelineProvider';
import './StartPipelineModal.css';

export interface StartPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarted: (pipelineId: string) => void;
}

const WORKFLOW_OPTIONS: Array<{ value: WorkflowType; label: string; description: string }> = [
  { value: 'resolve-task', label: 'Resolve Task', description: 'Full task resolution with code changes' },
  { value: 'code-review', label: 'Code Review', description: 'Review existing code changes' },
  { value: 'spec-analysis', label: 'Spec Analysis', description: 'Analyze specifications only' },
  { value: 'multi-repo', label: 'Multi-Repo', description: 'Coordinate changes across repos' },
];

const VERBOSITY_OPTIONS: Array<{ value: VerbosityLevel; label: string; icon: string }> = [
  { value: 'condensed', label: 'Condensed', icon: '\ud83d\udccb' },
  { value: 'normal', label: 'Normal', icon: '\ud83d\udcca' },
  { value: 'debug', label: 'Debug', icon: '\ud83d\udd0d' },
];

const MODEL_OPTIONS: Array<{ value: ModelType | 'default'; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'haiku', label: 'Haiku' },
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'opus', label: 'Opus' },
];

const AGENTS = [
  { id: 'task-evaluator', label: 'Task Evaluator', defaultModel: 'haiku' },
  { id: 'repo-selector', label: 'Repo Selector', defaultModel: 'sonnet' },
  { id: 'plan-generator', label: 'Plan Generator', defaultModel: 'sonnet' },
  { id: 'code-executor', label: 'Code Executor', defaultModel: 'opus' },
  { id: 'code-reviewer', label: 'Code Reviewer', defaultModel: 'opus' },
];

type ExecutionMode = 'standard' | 'yolo' | 'dryrun';

export function StartPipelineModal({ isOpen, onClose, onStarted }: StartPipelineModalProps) {
  const { api } = usePipelineConfig();

  const [taskInput, setTaskInput] = useState('');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('resolve-task');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('standard');
  const [autoCreatePr, setAutoCreatePr] = useState(true);
  const [autoReview, setAutoReview] = useState(true);
  const [maxBudget, setMaxBudget] = useState('10.00');
  const [verbosity, setVerbosity] = useState<VerbosityLevel>('debug');
  const [agentOverrides, setAgentOverrides] = useState<Record<string, ModelType | 'default'>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const taskId = api.extractTaskId(taskInput.trim());
    if (!taskId) {
      setError('Please enter a task ID or URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config: StartPipelineRequest = {
        taskId,
        workflowType,
        skipApproval: executionMode === 'yolo',
        dryRun: executionMode === 'dryrun',
        autoCreatePr,
        autoReview,
        maxBudgetUsd: parseFloat(maxBudget) || 10,
        verbosity,
      };

      // Add agent overrides (only non-default)
      const overrides: Record<string, { model: ModelType }> = {};
      Object.entries(agentOverrides).forEach(([agent, model]) => {
        if (model !== 'default') {
          overrides[agent] = { model };
        }
      });
      if (Object.keys(overrides).length > 0) {
        config.agentOverrides = overrides;
      }

      const result = await api.startPipeline(config);
      onStarted(result.pipelineId);

      // Reset form
      setTaskInput('');
      setExecutionMode('standard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentOverride = (agentId: string, model: ModelType | 'default') => {
    setAgentOverrides((prev) => ({
      ...prev,
      [agentId]: model,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Pipeline" size="lg">
      <div className="pipeline-start-form">
        {/* Task Input */}
        <div className="pipeline-start-section">
          <label className="pipeline-start-label">Task ID or URL</label>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter task ID or paste ShapeUp task URL..."
            className="pipeline-start-input"
            autoFocus
          />
          <p className="pipeline-start-hint">
            e.g., cmjoi1s3w003sov0153apjqpi or https://shapeup.smartup.lat/v2/tasks/...
          </p>
        </div>

        {/* Workflow Type */}
        <div className="pipeline-start-section">
          <label className="pipeline-start-label">Workflow Type</label>
          <div className="pipeline-start-workflow-grid">
            {WORKFLOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`pipeline-start-workflow-card ${workflowType === opt.value ? 'selected' : ''}`}
                onClick={() => setWorkflowType(opt.value)}
              >
                <span className="pipeline-start-workflow-label">{opt.label}</span>
                <span className="pipeline-start-workflow-desc">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Execution Mode */}
        <div className="pipeline-start-section">
          <label className="pipeline-start-label">Execution Mode</label>
          <div className="pipeline-start-mode-grid">
            <button
              type="button"
              className={`pipeline-start-mode-card ${executionMode === 'standard' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('standard')}
            >
              <span className="pipeline-start-mode-icon">&#9995;</span>
              <span className="pipeline-start-mode-name">Standard</span>
              <span className="pipeline-start-mode-desc">Wait for approval</span>
            </button>
            <button
              type="button"
              className={`pipeline-start-mode-card yolo ${executionMode === 'yolo' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('yolo')}
            >
              <span className="pipeline-start-mode-icon">&#9889;</span>
              <span className="pipeline-start-mode-name">YOLO</span>
              <span className="pipeline-start-mode-desc">Auto-execute</span>
            </button>
            <button
              type="button"
              className={`pipeline-start-mode-card ${executionMode === 'dryrun' ? 'selected' : ''}`}
              onClick={() => setExecutionMode('dryrun')}
            >
              <span className="pipeline-start-mode-icon">&#128221;</span>
              <span className="pipeline-start-mode-name">Dry Run</span>
              <span className="pipeline-start-mode-desc">Plan only</span>
            </button>
          </div>
        </div>

        {/* Options Row */}
        <div className="pipeline-start-options-row">
          <div className="pipeline-start-toggle-group">
            <label className="pipeline-start-toggle">
              <input
                type="checkbox"
                checked={autoCreatePr}
                onChange={(e) => setAutoCreatePr(e.target.checked)}
              />
              <span className="pipeline-start-toggle-slider" />
              <span className="pipeline-start-toggle-label">Auto-create PR</span>
            </label>
            <label className="pipeline-start-toggle">
              <input
                type="checkbox"
                checked={autoReview}
                onChange={(e) => setAutoReview(e.target.checked)}
              />
              <span className="pipeline-start-toggle-slider" />
              <span className="pipeline-start-toggle-label">Auto-review</span>
            </label>
          </div>

          <div className="pipeline-start-input-group">
            <label className="pipeline-start-small-label">Max Budget</label>
            <div className="pipeline-start-budget-input">
              <span className="pipeline-start-budget-prefix">$</span>
              <input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                min="0.01"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="pipeline-start-input-group">
            <label className="pipeline-start-small-label">Verbosity</label>
            <div className="pipeline-start-verbosity-buttons">
              {VERBOSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pipeline-start-verbosity-btn ${verbosity === opt.value ? 'selected' : ''}`}
                  onClick={() => setVerbosity(opt.value)}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="pipeline-start-advanced-section">
          <button
            type="button"
            className="pipeline-start-advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? '\u25bc' : '\u25b6'}</span>
            <span>Agent Model Overrides</span>
          </button>

          {showAdvanced && (
            <div className="pipeline-start-agent-overrides">
              {AGENTS.map((agent) => (
                <div key={agent.id} className="pipeline-start-agent-row">
                  <span className="pipeline-start-agent-name">{agent.label}</span>
                  <span className="pipeline-start-agent-default">({agent.defaultModel})</span>
                  <select
                    value={agentOverrides[agent.id] || 'default'}
                    onChange={(e) => handleAgentOverride(agent.id, e.target.value as ModelType | 'default')}
                    className="pipeline-start-agent-select"
                  >
                    {MODEL_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="pipeline-start-error">{error}</p>}

        {/* Actions */}
        <div className="pipeline-start-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path
                  d="M5 12h14m-7-7l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            Start Pipeline
          </Button>
        </div>
      </div>
    </Modal>
  );
}
