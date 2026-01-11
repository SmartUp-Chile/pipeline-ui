import { useState, useMemo, useCallback } from 'react';
import { marked } from 'marked';
import type { PipelineEvent } from '../../types';
import { formatTime } from '../../utils/formatters';
import { usePipelineConfig } from '../../context/PipelineProvider';
import './TimelineEvent.css';

export interface TimelineEventProps {
  event: PipelineEvent;
  isGrouped?: boolean;
}

// URL patterns for link extraction
const GITHUB_PR_PATTERN = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/gi;
const GITHUB_COMMIT_PATTERN = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]+)/gi;

// Event config: icon, color class, and how to extract title/subtitle
type EventConfig = {
  icon: string;
  colorClass: string;
  getTitle: (e: PipelineEvent) => string;
  getSubtitle?: (e: PipelineEvent) => string | undefined;
  isMinor?: boolean;
};

const EVENT_CONFIG: Record<string, EventConfig> = {
  // Lifecycle - Major events
  started: {
    icon: '▶',
    colorClass: 'success',
    getTitle: () => 'Pipeline Started',
    getSubtitle: (e) => `${e.data.workflowType || ''}`
  },
  completed: {
    icon: '✓',
    colorClass: 'success',
    getTitle: () => 'Pipeline Completed',
    getSubtitle: (e) => e.data.cost ? `$${(e.data.cost as number).toFixed(4)}` : undefined
  },
  failed: {
    icon: '✕',
    colorClass: 'error',
    getTitle: () => 'Pipeline Failed',
    getSubtitle: (e) => e.data.error as string
  },
  init: {
    icon: '⚙',
    colorClass: 'muted',
    getTitle: () => 'Session Initialized',
    getSubtitle: (e) => `${e.data.model}, ${e.data.tools} tools`
  },
  waiting_approval: {
    icon: '⏸',
    colorClass: 'warning',
    getTitle: () => 'Waiting for Approval',
  },
  approved: {
    icon: '✓',
    colorClass: 'success',
    getTitle: () => 'Plan Approved',
  },
  rejected: {
    icon: '✕',
    colorClass: 'error',
    getTitle: () => 'Plan Rejected',
  },

  // Workflow events
  prefetch_start: {
    icon: '⏳',
    colorClass: 'muted',
    getTitle: () => 'Prefetching task...',
    isMinor: true
  },
  prefetch_complete: {
    icon: '✓',
    colorClass: 'muted',
    getTitle: () => 'Task prefetched',
    isMinor: true
  },
  task_fetched: {
    icon: '📋',
    colorClass: 'primary',
    getTitle: (e) => (e.data.title as string) || 'Task Fetched',
    getSubtitle: (e) => e.data.taskId as string
  },
  plan_generated: {
    icon: '📝',
    colorClass: 'primary',
    getTitle: () => 'Plan Generated',
  },
  execution_started: {
    icon: '🚀',
    colorClass: 'primary',
    getTitle: () => 'Execution Started',
  },
  repos_selected: {
    icon: '📂',
    colorClass: 'primary',
    getTitle: (e) => {
      const repos = e.data.repos as string[] | undefined;
      return repos?.length ? `Selected: ${repos.join(', ')}` : 'Repositories Selected';
    }
  },
  evaluation_complete: {
    icon: '✓',
    colorClass: 'success',
    getTitle: (e) => {
      const requires = e.data.requiresCode;
      return requires ? 'Task requires code changes' : 'Task evaluated';
    }
  },

  // Agent events
  agent_start: {
    icon: '🤖',
    colorClass: 'purple',
    getTitle: (e) => (e.data.agentType as string) || 'Agent',
    getSubtitle: (e) => (e.data.agentDescription as string)
  },
  agent_started: {
    icon: '🤖',
    colorClass: 'purple',
    getTitle: (e) => (e.data.agentType as string) || 'Agent',
    getSubtitle: (e) => (e.data.agentDescription as string)
  },
  agent_complete: {
    icon: '🤖',
    colorClass: 'success',
    getTitle: (e) => `${(e.data.agentType as string) || 'Agent'} Complete`,
  },
  agent_completed: {
    icon: '🤖',
    colorClass: 'success',
    getTitle: (e) => `${(e.data.agentType as string) || 'Agent'} Complete`,
  },

  // Tool events
  tool_call: {
    icon: '🔧',
    colorClass: 'tool',
    getTitle: (e) => getToolTitle(e),
    getSubtitle: (e) => getToolSubtitle(e)
  },
  tool_start: {
    icon: '🔧',
    colorClass: 'tool',
    getTitle: (e) => getToolTitle(e),
    getSubtitle: (e) => getToolSubtitle(e)
  },
  tool_complete: {
    icon: '✓',
    colorClass: 'success',
    getTitle: (e) => `${(e.data.toolName as string) || 'Tool'} complete`,
    isMinor: true
  },

  // MCP events
  mcp_call: {
    icon: '🔌',
    colorClass: 'orange',
    getTitle: (e) => getMcpTitle(e),
    getSubtitle: (e) => getMcpSubtitle(e)
  },
  mcp_start: {
    icon: '🔌',
    colorClass: 'orange',
    getTitle: (e) => getMcpTitle(e),
    getSubtitle: (e) => getMcpSubtitle(e)
  },
  mcp_complete: {
    icon: '✓',
    colorClass: 'success',
    getTitle: (e) => `${(e.data.mcpTool as string) || 'MCP'} complete`,
    isMinor: true
  },

  // Messages
  assistant_message: {
    icon: '💬',
    colorClass: 'primary',
    getTitle: () => 'Claude',
    getSubtitle: (e) => truncate((e.data.preview as string) || (e.data.text as string), 100)
  },

  // Debug events - Minor
  sdk_message: {
    icon: '·',
    colorClass: 'muted',
    getTitle: (e) => getSdkMessageTitle(e),
    getSubtitle: (e) => getSdkMessageSubtitle(e),
    isMinor: true
  },
  sdk_thinking: {
    icon: '🧠',
    colorClass: 'muted',
    getTitle: () => 'Thinking',
    getSubtitle: (e) => truncate((e.data.thinking as string), 80),
    isMinor: true
  },
  timing: {
    icon: '⏱',
    colorClass: 'muted',
    getTitle: (e) => `${e.data.event || 'Event'}`,
    getSubtitle: (e) => `${e.data.durationMs}ms`,
    isMinor: true
  },
  token_usage: {
    icon: '📊',
    colorClass: 'muted',
    getTitle: () => 'Token Usage',
    getSubtitle: (e) => `${e.data.inputTokens || 0} in / ${e.data.outputTokens || 0} out`,
    isMinor: true
  },
  tool_input_full: {
    icon: '📥',
    colorClass: 'muted',
    getTitle: (e) => getToolInputFullTitle(e),
    getSubtitle: (e) => getToolInputFullSubtitle(e),
    isMinor: true
  },
  tool_output_full: {
    icon: '📤',
    colorClass: 'muted',
    getTitle: (e) => getToolOutputTitle(e),
    getSubtitle: (e) => getToolOutputSubtitle(e),
    isMinor: true
  },

  // Code Review
  code_review_result: {
    icon: '📝',
    colorClass: 'primary',
    getTitle: (e) => `Code Review: ${e.data.verdict || 'Complete'}`,
  },

  // Audit
  audit_generated: {
    icon: '📊',
    colorClass: 'success',
    getTitle: () => 'Audit Report Generated',
    getSubtitle: (e) => {
      const outcome = e.data.outcome as string | undefined;
      const taskTitle = e.data.taskTitle as string | undefined;
      return outcome ? `${outcome}${taskTitle ? ` - ${taskTitle}` : ''}` : undefined;
    }
  },

  // Error
  error: {
    icon: '⚠',
    colorClass: 'error',
    getTitle: () => 'Error',
    getSubtitle: (e) => e.data.error as string || e.data.message as string
  },
  budget_exceeded: {
    icon: '💰',
    colorClass: 'error',
    getTitle: () => 'Budget Exceeded',
  }
};

// Helper functions
function truncate(text: string | undefined, max: number): string | undefined {
  if (!text) return undefined;
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

function getFilePath(path: string): string {
  const parts = path.split('/');
  if (parts.length <= 3) return path;
  return '.../' + parts.slice(-3).join('/');
}

function getToolTitle(e: PipelineEvent): string {
  const name = (e.data.toolName as string) || (e.data.name as string) || 'Tool';
  const input = e.data.toolInput as Record<string, unknown> | undefined;

  if (name === 'Bash' && input?.description) {
    return input.description as string;
  }
  if (name === 'Read' && input?.file_path) {
    return `Read ${getFileName(input.file_path as string)}`;
  }
  if (name === 'Write' && input?.file_path) {
    return `Write ${getFileName(input.file_path as string)}`;
  }
  if (name === 'Edit' && input?.file_path) {
    return `Edit ${getFileName(input.file_path as string)}`;
  }
  if (name === 'Grep' && input?.pattern) {
    return `Search: ${input.pattern}`;
  }
  if (name === 'Glob' && input?.pattern) {
    return `Find: ${input.pattern}`;
  }
  return name;
}

function getToolSubtitle(e: PipelineEvent): string | undefined {
  const name = (e.data.toolName as string) || (e.data.name as string);
  const input = e.data.toolInput as Record<string, unknown> | undefined;

  if ((name === 'Read' || name === 'Write' || name === 'Edit') && input?.file_path) {
    return getFilePath(input.file_path as string);
  }
  if ((name === 'Grep' || name === 'Glob') && input?.path) {
    return input.path as string;
  }
  if (name === 'Bash' && input?.command) {
    return truncate(input.command as string, 60);
  }
  return undefined;
}

function getMcpTitle(e: PipelineEvent): string {
  const tool = (e.data.mcpTool as string) || (e.data.toolName as string) || 'MCP';
  const input = e.data.toolInput as Record<string, unknown> | undefined;

  if (tool.includes('view_task') && input?.taskId) {
    return `View Task`;
  }
  if (tool.includes('add_comment')) {
    return `Add Comment`;
  }
  if (tool.includes('update_task')) {
    return `Update Task`;
  }
  if (tool.includes('create_pull_request')) {
    return `Create PR`;
  }

  return tool.replace('shapeup_', '').replace('admin_', '').replace(/_/g, ' ');
}

function getMcpSubtitle(e: PipelineEvent): string | undefined {
  const server = e.data.mcpServer as string;
  const input = e.data.toolInput as Record<string, unknown> | undefined;

  if (input?.taskId) {
    return `${input.taskId}`;
  }
  if (input?.repoName) {
    return input.repoName as string;
  }
  if (server) {
    return `via ${server}`;
  }
  return undefined;
}

function getToolInputFullTitle(e: PipelineEvent): string {
  const toolName = (e.data.toolName as string) || 'Tool';
  const input = e.data.input as Record<string, unknown> | undefined;

  if (input?.description) {
    return input.description as string;
  }

  if (toolName === 'Read' && input?.file_path) {
    return `Read ${getFileName(input.file_path as string)}`;
  }
  if (toolName === 'Write' && input?.file_path) {
    return `Write ${getFileName(input.file_path as string)}`;
  }
  if (toolName === 'Edit' && input?.file_path) {
    return `Edit ${getFileName(input.file_path as string)}`;
  }
  if (toolName === 'Grep' && input?.pattern) {
    return `Search: ${truncate(input.pattern as string, 40)}`;
  }
  if (toolName === 'Glob' && input?.pattern) {
    return `Find: ${truncate(input.pattern as string, 40)}`;
  }

  return `Input: ${toolName}`;
}

function getToolInputFullSubtitle(e: PipelineEvent): string | undefined {
  const toolName = (e.data.toolName as string) || '';
  const input = e.data.input as Record<string, unknown> | undefined;

  if ((toolName === 'Read' || toolName === 'Write' || toolName === 'Edit') && input?.file_path) {
    return getFilePath(input.file_path as string);
  }
  if (toolName === 'Bash' && input?.command) {
    return truncate(input.command as string, 50);
  }
  if ((toolName === 'Grep' || toolName === 'Glob') && input?.path) {
    return input.path as string;
  }
  return undefined;
}

function getToolOutputTitle(e: PipelineEvent): string {
  const toolName = typeof e.data.toolName === 'string' ? e.data.toolName : undefined;
  const output = typeof e.data.output === 'string' ? e.data.output : undefined;

  if (!toolName || toolName === 'unknown') {
    if (output) {
      if (output.includes('lines read from')) return '✓ File read';
      if (output.includes('Successfully wrote')) return '✓ File written';
      if (output.includes('Successfully edited')) return '✓ File edited';
      if (output.includes('matches found') || output.includes('No matches')) return '✓ Search complete';
      if (output.includes('files matched')) return '✓ Files found';
      if (output.includes('exit code') || output.includes('stdout:')) return '✓ Command executed';
    }
    return '✓ Tool complete';
  }

  if (toolName === 'Read') return '✓ File read';
  if (toolName === 'Write') return '✓ File written';
  if (toolName === 'Edit') return '✓ File edited';
  if (toolName === 'Bash') return '✓ Command executed';
  if (toolName === 'Grep') return '✓ Search complete';
  if (toolName === 'Glob') return '✓ Files found';
  if (toolName === 'Task') return '✓ Task complete';
  if (toolName.startsWith('mcp__')) {
    const cleanName = toolName.split('__').pop()?.replace(/_/g, ' ') || toolName;
    return `✓ ${cleanName}`;
  }

  return `✓ ${toolName} complete`;
}

function getToolOutputSubtitle(e: PipelineEvent): string | undefined {
  const output = typeof e.data.output === 'string' ? e.data.output : undefined;
  if (!output) return undefined;

  if (output.includes('lines read')) {
    const match = output.match(/(\d+) lines? read/);
    if (match) return `${match[1]} lines`;
  }
  if (output.includes('matches found')) {
    const match = output.match(/(\d+) matches? found/);
    if (match) return `${match[1]} matches`;
  }
  if (output.includes('files matched')) {
    const match = output.match(/(\d+) files? matched/);
    if (match) return `${match[1]} files`;
  }

  return truncate(output, 50);
}

function getSdkMessageTitle(e: PipelineEvent): string {
  const raw = e.data.raw as Record<string, unknown> | undefined;
  if (raw?.type === 'system') {
    return 'System Init';
  }
  if (raw?.type === 'assistant') {
    const message = raw.message as Record<string, unknown> | undefined;
    const content = message?.content as Array<Record<string, unknown>> | undefined;

    if (content && Array.isArray(content) && content.length > 0) {
      const toolUse = content.find(c => c.type === 'tool_use');
      if (toolUse?.name && typeof toolUse.name === 'string') {
        const input = toolUse.input as Record<string, unknown> | undefined;
        return getNextActionTitle(toolUse.name, input);
      }
      const textBlock = content.find(c => c.type === 'text' && c.text && typeof c.text === 'string');
      if (textBlock?.text && typeof textBlock.text === 'string') {
        return truncate(textBlock.text, 80) || 'Claude';
      }
    }
    return 'Claude';
  }
  if (raw?.type === 'user') {
    const content = raw.content as Array<Record<string, unknown>> | undefined;
    if (content && Array.isArray(content) && content.length > 0) {
      const toolResult = content.find(c => c.type === 'tool_result');
      if (toolResult) {
        const resultContent = toolResult.content;
        if (typeof resultContent === 'string' && resultContent.length > 0) {
          const preview = extractResultPreview(resultContent);
          if (preview) return preview;
        } else if (Array.isArray(resultContent) && resultContent.length > 0) {
          const textBlock = resultContent.find((c: unknown) =>
            typeof c === 'object' && c !== null && (c as Record<string, unknown>).type === 'text'
          ) as Record<string, unknown> | undefined;
          if (textBlock?.text && typeof textBlock.text === 'string') {
            const preview = extractResultPreview(textBlock.text);
            if (preview) return preview;
          }
        }
        return 'Tool Result';
      }
    }
    return 'Tool Result';
  }
  if (raw?.type === 'result') {
    return 'Tool Result';
  }
  return (typeof raw?.type === 'string' ? raw.type : undefined) || 'SDK Message';
}

function getNextActionTitle(toolName: string, input?: Record<string, unknown>): string {
  if (toolName === 'Edit' && typeof input?.file_path === 'string') {
    return `→ Edit ${getFileName(input.file_path)}`;
  }
  if (toolName === 'Write' && typeof input?.file_path === 'string') {
    return `→ Write ${getFileName(input.file_path)}`;
  }
  if (toolName === 'Read' && typeof input?.file_path === 'string') {
    return `→ Read ${getFileName(input.file_path)}`;
  }
  if (toolName === 'Bash' && typeof input?.description === 'string') {
    return `→ ${input.description}`;
  }
  if (toolName === 'Bash' && typeof input?.command === 'string') {
    return `→ Run: ${truncate(input.command, 50)}`;
  }
  if (toolName === 'Grep' && typeof input?.pattern === 'string') {
    return `→ Search: ${truncate(input.pattern, 40)}`;
  }
  if (toolName === 'Glob' && typeof input?.pattern === 'string') {
    return `→ Find: ${truncate(input.pattern, 40)}`;
  }
  if (toolName === 'Task' && typeof input?.description === 'string') {
    return `→ ${input.description}`;
  }
  if (toolName.startsWith('mcp__')) {
    const cleanName = toolName.split('__').pop()?.replace(/_/g, ' ') || toolName;
    return `→ ${cleanName}`;
  }
  return `→ ${toolName}`;
}

function extractResultPreview(content: string): string | undefined {
  if (content.length < 100) {
    return `Result: ${truncate(content, 60)}`;
  }
  if (content.includes('Successfully')) {
    const match = content.match(/Successfully[^.!]*/);
    if (match) return truncate(match[0], 60);
  }
  if (content.includes('Error:') || content.includes('error:')) {
    const match = content.match(/[Ee]rror:[^.!\n]*/);
    if (match) return truncate(match[0], 60);
  }
  return undefined;
}

function getSdkMessageSubtitle(e: PipelineEvent): string | undefined {
  const raw = e.data.raw as Record<string, unknown> | undefined;
  if (raw?.type === 'system' && raw?.model) {
    return `${raw.model}`;
  }
  return undefined;
}

// Detect links in event data
function extractLinks(
  event: PipelineEvent,
  taskUrlBuilder?: (taskId: string) => string
): Array<{ type: 'shapeup' | 'github-pr' | 'github-commit' | 'github-repo'; url: string; label: string }> {
  const links: Array<{ type: 'shapeup' | 'github-pr' | 'github-commit' | 'github-repo'; url: string; label: string }> = [];
  const dataStr = JSON.stringify(event.data);

  // GitHub PR links
  const prMatches = dataStr.matchAll(GITHUB_PR_PATTERN);
  for (const match of prMatches) {
    links.push({
      type: 'github-pr',
      url: match[0],
      label: `PR #${match[3]}`
    });
  }

  // GitHub commit links
  const commitMatches = dataStr.matchAll(GITHUB_COMMIT_PATTERN);
  for (const match of commitMatches) {
    links.push({
      type: 'github-commit',
      url: match[0],
      label: `Commit ${match[3].substring(0, 7)}`
    });
  }

  // Task IDs
  const input = event.data.toolInput as Record<string, unknown> | undefined;
  if (input?.taskId && typeof input.taskId === 'string') {
    const url = taskUrlBuilder
      ? taskUrlBuilder(input.taskId)
      : `https://shapeup.smartup.lat/v2/tasks/${input.taskId}`;
    links.push({
      type: 'shapeup',
      url,
      label: 'View Task'
    });
  }
  if (event.data.taskId && typeof event.data.taskId === 'string') {
    const url = taskUrlBuilder
      ? taskUrlBuilder(event.data.taskId)
      : `https://shapeup.smartup.lat/v2/tasks/${event.data.taskId}`;
    links.push({
      type: 'shapeup',
      url,
      label: 'View Task'
    });
  }

  // PR URL in results
  if (event.data.prUrl) {
    links.push({
      type: 'github-pr',
      url: event.data.prUrl as string,
      label: 'View PR'
    });
  }

  return links;
}

export function TimelineEvent({ event, isGrouped }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const config = usePipelineConfig();

  const eventConfig = EVENT_CONFIG[event.type] || {
    icon: '•',
    colorClass: 'muted',
    getTitle: () => event.type.replace(/_/g, ' '),
  };

  const title = useMemo(() => eventConfig.getTitle(event), [eventConfig, event]);
  const subtitle = useMemo(() => eventConfig.getSubtitle?.(event), [eventConfig, event]);
  const links = useMemo(
    () => extractLinks(event, config.linkBuilders?.taskUrl),
    [event, config.linkBuilders?.taskUrl]
  );

  const hasDetails = useMemo(() => {
    if (event.type === 'assistant_message' && event.data.text) return true;
    if (event.type === 'plan_generated' && event.data.plan) return true;
    if (event.type === 'sdk_thinking' && event.data.thinking) return true;
    if (event.type === 'code_review_result') return true;
    if (event.type === 'tool_call' && event.data.toolInput) return true;
    if (event.type === 'agent_start' && event.data.toolInput) return true;
    if (event.type === 'audit_generated' && event.data.markdownReport) return true;
    return Object.keys(event.data).length > 0;
  }, [event]);

  const handleClick = useCallback(() => {
    if (hasDetails) {
      setExpanded(prev => !prev);
    }
  }, [hasDetails]);

  return (
    <div
      className={`pipeline-event pipeline-event-${eventConfig.colorClass} ${isGrouped ? 'pipeline-event-grouped' : ''} ${expanded ? 'pipeline-event-expanded' : ''} ${hasDetails ? 'pipeline-event-clickable' : ''}`}
      onClick={handleClick}
    >
      {/* Main row */}
      <div className="pipeline-event-row">
        <span className="pipeline-event-icon">{eventConfig.icon}</span>
        <span className="pipeline-event-title">{title}</span>
        {subtitle && <span className="pipeline-event-subtitle">{subtitle}</span>}

        {/* Quick action links */}
        {links.length > 0 && (
          <div className="pipeline-event-links">
            {links.slice(0, 2).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`pipeline-event-link pipeline-event-link-${link.type}`}
                onClick={(e) => e.stopPropagation()}
              >
                {link.type === 'shapeup' && '📋'}
                {link.type === 'github-pr' && '🔀'}
                {link.type === 'github-commit' && '📌'}
                {link.label}
              </a>
            ))}
          </div>
        )}

        <span className="pipeline-event-time">{formatTime(event.timestamp)}</span>
        {(event.turnNumber ?? event.turn) !== undefined && (
          <span className="pipeline-event-turn">T{event.turnNumber ?? event.turn}</span>
        )}
        {hasDetails && (
          <span className={`pipeline-event-chevron ${expanded ? 'pipeline-event-chevron-open' : ''}`}>›</span>
        )}
      </div>

      {/* Expanded content */}
      {expanded && <ExpandedContent event={event} />}
    </div>
  );
}

function ExpandedContent({ event }: { event: PipelineEvent }) {
  const content = useMemo(() => {
    // Assistant messages - render markdown
    if (event.type === 'assistant_message' && event.data.text) {
      return (
        <div
          className="pipeline-event-markdown"
          dangerouslySetInnerHTML={{ __html: marked.parse(event.data.text as string) as string }}
        />
      );
    }

    // Plan - render markdown
    if (event.type === 'plan_generated' && event.data.plan) {
      return (
        <div
          className="pipeline-event-markdown"
          dangerouslySetInnerHTML={{ __html: marked.parse(event.data.plan as string) as string }}
        />
      );
    }

    // Thinking
    if (event.type === 'sdk_thinking' && event.data.thinking) {
      return (
        <div className="pipeline-event-thinking">
          {event.data.thinking as string}
        </div>
      );
    }

    // Tool calls - show input nicely
    if ((event.type === 'tool_call' || event.type === 'tool_start') && event.data.toolInput) {
      const input = event.data.toolInput as Record<string, unknown>;
      const toolName = (event.data.toolName as string) || '';

      // Special rendering for Edit
      if (toolName === 'Edit') {
        const oldStr = input.old_string as string | undefined;
        const newStr = input.new_string as string | undefined;
        return (
          <div className="pipeline-event-diff">
            <div className="pipeline-event-filepath">{input.file_path as string}</div>
            {oldStr && (
              <div className="pipeline-event-diff-removed">- {truncateCode(oldStr, 200)}</div>
            )}
            {newStr && (
              <div className="pipeline-event-diff-added">+ {truncateCode(newStr, 200)}</div>
            )}
          </div>
        );
      }

      // Special rendering for Bash
      if (toolName === 'Bash' && input.command) {
        return (
          <div className="pipeline-event-code">
            <span className="pipeline-event-code-prompt">$</span> {input.command as string}
          </div>
        );
      }

      // Default: show as JSON
      return (
        <pre className="pipeline-event-json">{JSON.stringify(input, null, 2)}</pre>
      );
    }

    // Agent start - show prompt preview
    if (event.type === 'agent_start' || event.type === 'agent_started') {
      const input = event.data.toolInput as Record<string, unknown> | undefined;
      if (input?.prompt) {
        return (
          <div className="pipeline-event-prompt">
            {truncateCode(input.prompt as string, 500)}
          </div>
        );
      }
    }

    // Code review
    if (event.type === 'code_review_result') {
      const verdict = event.data.verdict as string | undefined;
      const body = event.data.body as string | undefined;
      return (
        <div className="pipeline-event-review">
          {verdict && (
            <div className={`pipeline-event-verdict pipeline-event-verdict-${verdict.toLowerCase()}`}>
              {verdict === 'APPROVE' && '✓ Approved'}
              {verdict === 'CHANGES_REQUESTED' && '⚠ Changes Requested'}
              {verdict === 'COMMENT' && '💬 Commented'}
            </div>
          )}
          {body && (
            <div
              className="pipeline-event-markdown"
              dangerouslySetInnerHTML={{ __html: marked.parse(body) as string }}
            />
          )}
        </div>
      );
    }

    // Audit report - show markdown
    if (event.type === 'audit_generated') {
      const markdownReport = event.data.markdownReport as string | undefined;
      const outcome = event.data.outcome as string | undefined;
      if (markdownReport) {
        return (
          <div className="pipeline-event-audit">
            <div className={`pipeline-event-audit-outcome pipeline-event-audit-outcome-${outcome || 'partial'}`}>
              Outcome: {outcome || 'Unknown'}
            </div>
            <div
              className="pipeline-event-markdown"
              dangerouslySetInnerHTML={{ __html: marked.parse(markdownReport) as string }}
            />
          </div>
        );
      }
    }

    // Default: JSON dump
    return (
      <pre className="pipeline-event-json">{JSON.stringify(event.data, null, 2)}</pre>
    );
  }, [event]);

  return <div className="pipeline-event-details">{content}</div>;
}

function truncateCode(code: string, max: number): string {
  if (code.length <= max) return code;
  return code.substring(0, max) + '\n... (truncated)';
}

// Export for grouping logic
export function isMinorEvent(event: PipelineEvent): boolean {
  const eventConfig = EVENT_CONFIG[event.type];
  return eventConfig?.isMinor === true;
}

// Events that should be hidden from UI (only used for internal calculations)
export function shouldHideEvent(event: PipelineEvent): boolean {
  if (event.type === 'timing') {
    const eventName = event.data.event as string;
    if (eventName === 'turn_complete') {
      return true;
    }
  }
  return false;
}
