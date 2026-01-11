import { createContext, forwardRef, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import './TimelineEvent-XXXZQ7UC.css';
import './Button-DTU2LUSN.css';
import './Badge-AOW47TOJ.css';
import './HistoryView-EZYWI5YK.css';
import { createPortal } from 'react-dom';
import './Modal-4TIYWC3N.css';
import './StartPipelineModal-KGGGWQG2.css';
import './variables-GIXV7RED.css';

// src/components/timeline/TimelineEvent.tsx

// src/utils/formatters.ts
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return "just now";
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  if (diff < 6048e5) return `${Math.floor(diff / 864e5)}d ago`;
  return date.toLocaleDateString();
}
function formatTimestamp(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}
var formatTime = formatTimestamp;
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatCost(cost) {
  if (cost === void 0 || cost === null) return "-";
  return `$${cost.toFixed(4)}`;
}
function formatDuration(ms) {
  if (ms === void 0 || ms === null) return "-";
  if (ms < 1e3) return `${ms}ms`;
  if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
  if (ms < 36e5) return `${Math.floor(ms / 6e4)}m ${Math.floor(ms % 6e4 / 1e3)}s`;
  const hours = Math.floor(ms / 36e5);
  const minutes = Math.floor(ms % 36e5 / 6e4);
  return `${hours}h ${minutes}m`;
}
function formatNumber(num) {
  if (num === void 0 || num === null) return "-";
  return num.toLocaleString();
}
function formatPercentage(value) {
  if (value === void 0 || value === null) return "-";
  return `${value.toFixed(1)}%`;
}
function formatBytes(bytes) {
  if (bytes === void 0 || bytes === null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}
function getStatusColor(status) {
  switch (status) {
    case "running":
      return "var(--pipeline-status-running)";
    case "waiting_approval":
      return "var(--pipeline-status-waiting)";
    case "completed":
      return "var(--pipeline-status-success)";
    case "failed":
      return "var(--pipeline-status-failed)";
    default:
      return "var(--pipeline-text-muted)";
  }
}
function getStatusLabel(status) {
  switch (status) {
    case "running":
      return "Running";
    case "waiting_approval":
      return "Waiting Approval";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}
var defaultConfig = {
  apiBaseUrl: "",
  features: {
    allowApproval: true,
    allowDelete: true,
    allowShareLinks: true,
    enableLiveView: true
  },
  labels: {
    liveViewTitle: "Live Pipelines",
    historyViewTitle: "Session History",
    noSessionsFound: "No sessions found",
    loadingSessions: "Loading sessions...",
    selectSessionPrompt: "Select a session to view details",
    statusRunning: "Running",
    statusWaitingApproval: "Waiting",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    watchLive: "Watch Live",
    copyLink: "Share",
    noEvents: "No events",
    eventCount: "events"
  }
};
var PipelineContext = createContext(defaultConfig);
function usePipelineConfig() {
  return useContext(PipelineContext);
}
function useLabels() {
  const config = usePipelineConfig();
  return useMemo(() => ({
    ...defaultConfig.labels,
    ...config.labels
  }), [config.labels]);
}
function useFeatures() {
  const config = usePipelineConfig();
  return useMemo(() => ({
    ...defaultConfig.features,
    ...config.features
  }), [config.features]);
}
function PipelineProvider({ children, config }) {
  const mergedConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
    features: {
      ...defaultConfig.features,
      ...config.features
    },
    labels: {
      ...defaultConfig.labels,
      ...config.labels
    }
  }), [config]);
  return /* @__PURE__ */ jsx(PipelineContext.Provider, { value: mergedConfig, children });
}
var GITHUB_PR_PATTERN = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/gi;
var GITHUB_COMMIT_PATTERN = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]+)/gi;
var EVENT_CONFIG = {
  // Lifecycle - Major events
  started: {
    icon: "\u25B6",
    colorClass: "success",
    getTitle: () => "Pipeline Started",
    getSubtitle: (e) => `${e.data.workflowType || ""}`
  },
  completed: {
    icon: "\u2713",
    colorClass: "success",
    getTitle: () => "Pipeline Completed",
    getSubtitle: (e) => e.data.cost ? `$${e.data.cost.toFixed(4)}` : void 0
  },
  failed: {
    icon: "\u2715",
    colorClass: "error",
    getTitle: () => "Pipeline Failed",
    getSubtitle: (e) => e.data.error
  },
  init: {
    icon: "\u2699",
    colorClass: "muted",
    getTitle: () => "Session Initialized",
    getSubtitle: (e) => `${e.data.model}, ${e.data.tools} tools`
  },
  waiting_approval: {
    icon: "\u23F8",
    colorClass: "warning",
    getTitle: () => "Waiting for Approval"
  },
  approved: {
    icon: "\u2713",
    colorClass: "success",
    getTitle: () => "Plan Approved"
  },
  rejected: {
    icon: "\u2715",
    colorClass: "error",
    getTitle: () => "Plan Rejected"
  },
  // Workflow events
  prefetch_start: {
    icon: "\u23F3",
    colorClass: "muted",
    getTitle: () => "Prefetching task...",
    isMinor: true
  },
  prefetch_complete: {
    icon: "\u2713",
    colorClass: "muted",
    getTitle: () => "Task prefetched",
    isMinor: true
  },
  task_fetched: {
    icon: "\u{1F4CB}",
    colorClass: "primary",
    getTitle: (e) => e.data.title || "Task Fetched",
    getSubtitle: (e) => e.data.taskId
  },
  plan_generated: {
    icon: "\u{1F4DD}",
    colorClass: "primary",
    getTitle: () => "Plan Generated"
  },
  execution_started: {
    icon: "\u{1F680}",
    colorClass: "primary",
    getTitle: () => "Execution Started"
  },
  repos_selected: {
    icon: "\u{1F4C2}",
    colorClass: "primary",
    getTitle: (e) => {
      const repos = e.data.repos;
      return repos?.length ? `Selected: ${repos.join(", ")}` : "Repositories Selected";
    }
  },
  evaluation_complete: {
    icon: "\u2713",
    colorClass: "success",
    getTitle: (e) => {
      const requires = e.data.requiresCode;
      return requires ? "Task requires code changes" : "Task evaluated";
    }
  },
  // Agent events
  agent_start: {
    icon: "\u{1F916}",
    colorClass: "purple",
    getTitle: (e) => e.data.agentType || "Agent",
    getSubtitle: (e) => e.data.agentDescription
  },
  agent_started: {
    icon: "\u{1F916}",
    colorClass: "purple",
    getTitle: (e) => e.data.agentType || "Agent",
    getSubtitle: (e) => e.data.agentDescription
  },
  agent_complete: {
    icon: "\u{1F916}",
    colorClass: "success",
    getTitle: (e) => `${e.data.agentType || "Agent"} Complete`
  },
  agent_completed: {
    icon: "\u{1F916}",
    colorClass: "success",
    getTitle: (e) => `${e.data.agentType || "Agent"} Complete`
  },
  // Tool events
  tool_call: {
    icon: "\u{1F527}",
    colorClass: "tool",
    getTitle: (e) => getToolTitle(e),
    getSubtitle: (e) => getToolSubtitle(e)
  },
  tool_start: {
    icon: "\u{1F527}",
    colorClass: "tool",
    getTitle: (e) => getToolTitle(e),
    getSubtitle: (e) => getToolSubtitle(e)
  },
  tool_complete: {
    icon: "\u2713",
    colorClass: "success",
    getTitle: (e) => `${e.data.toolName || "Tool"} complete`,
    isMinor: true
  },
  // MCP events
  mcp_call: {
    icon: "\u{1F50C}",
    colorClass: "orange",
    getTitle: (e) => getMcpTitle(e),
    getSubtitle: (e) => getMcpSubtitle(e)
  },
  mcp_start: {
    icon: "\u{1F50C}",
    colorClass: "orange",
    getTitle: (e) => getMcpTitle(e),
    getSubtitle: (e) => getMcpSubtitle(e)
  },
  mcp_complete: {
    icon: "\u2713",
    colorClass: "success",
    getTitle: (e) => `${e.data.mcpTool || "MCP"} complete`,
    isMinor: true
  },
  // Messages
  assistant_message: {
    icon: "\u{1F4AC}",
    colorClass: "primary",
    getTitle: () => "Claude",
    getSubtitle: (e) => truncate2(e.data.preview || e.data.text, 100)
  },
  // Debug events - Minor
  sdk_message: {
    icon: "\xB7",
    colorClass: "muted",
    getTitle: (e) => getSdkMessageTitle(e),
    getSubtitle: (e) => getSdkMessageSubtitle(e),
    isMinor: true
  },
  sdk_thinking: {
    icon: "\u{1F9E0}",
    colorClass: "muted",
    getTitle: () => "Thinking",
    getSubtitle: (e) => truncate2(e.data.thinking, 80),
    isMinor: true
  },
  timing: {
    icon: "\u23F1",
    colorClass: "muted",
    getTitle: (e) => `${e.data.event || "Event"}`,
    getSubtitle: (e) => `${e.data.durationMs}ms`,
    isMinor: true
  },
  token_usage: {
    icon: "\u{1F4CA}",
    colorClass: "muted",
    getTitle: () => "Token Usage",
    getSubtitle: (e) => `${e.data.inputTokens || 0} in / ${e.data.outputTokens || 0} out`,
    isMinor: true
  },
  tool_input_full: {
    icon: "\u{1F4E5}",
    colorClass: "muted",
    getTitle: (e) => getToolInputFullTitle(e),
    getSubtitle: (e) => getToolInputFullSubtitle(e),
    isMinor: true
  },
  tool_output_full: {
    icon: "\u{1F4E4}",
    colorClass: "muted",
    getTitle: (e) => getToolOutputTitle(e),
    getSubtitle: (e) => getToolOutputSubtitle(e),
    isMinor: true
  },
  // Code Review
  code_review_result: {
    icon: "\u{1F4DD}",
    colorClass: "primary",
    getTitle: (e) => `Code Review: ${e.data.verdict || "Complete"}`
  },
  // Audit
  audit_generated: {
    icon: "\u{1F4CA}",
    colorClass: "success",
    getTitle: () => "Audit Report Generated",
    getSubtitle: (e) => {
      const outcome = e.data.outcome;
      const taskTitle = e.data.taskTitle;
      return outcome ? `${outcome}${taskTitle ? ` - ${taskTitle}` : ""}` : void 0;
    }
  },
  // Error
  error: {
    icon: "\u26A0",
    colorClass: "error",
    getTitle: () => "Error",
    getSubtitle: (e) => e.data.error || e.data.message
  },
  budget_exceeded: {
    icon: "\u{1F4B0}",
    colorClass: "error",
    getTitle: () => "Budget Exceeded"
  }
};
function truncate2(text, max) {
  if (!text) return void 0;
  return text.length > max ? text.substring(0, max) + "..." : text;
}
function getFileName(path) {
  return path.split("/").pop() || path;
}
function getFilePath(path) {
  const parts = path.split("/");
  if (parts.length <= 3) return path;
  return ".../" + parts.slice(-3).join("/");
}
function getToolTitle(e) {
  const name = e.data.toolName || e.data.name || "Tool";
  const input = e.data.toolInput;
  if (name === "Bash" && input?.description) {
    return input.description;
  }
  if (name === "Read" && input?.file_path) {
    return `Read ${getFileName(input.file_path)}`;
  }
  if (name === "Write" && input?.file_path) {
    return `Write ${getFileName(input.file_path)}`;
  }
  if (name === "Edit" && input?.file_path) {
    return `Edit ${getFileName(input.file_path)}`;
  }
  if (name === "Grep" && input?.pattern) {
    return `Search: ${input.pattern}`;
  }
  if (name === "Glob" && input?.pattern) {
    return `Find: ${input.pattern}`;
  }
  return name;
}
function getToolSubtitle(e) {
  const name = e.data.toolName || e.data.name;
  const input = e.data.toolInput;
  if ((name === "Read" || name === "Write" || name === "Edit") && input?.file_path) {
    return getFilePath(input.file_path);
  }
  if ((name === "Grep" || name === "Glob") && input?.path) {
    return input.path;
  }
  if (name === "Bash" && input?.command) {
    return truncate2(input.command, 60);
  }
  return void 0;
}
function getMcpTitle(e) {
  const tool = e.data.mcpTool || e.data.toolName || "MCP";
  const input = e.data.toolInput;
  if (tool.includes("view_task") && input?.taskId) {
    return `View Task`;
  }
  if (tool.includes("add_comment")) {
    return `Add Comment`;
  }
  if (tool.includes("update_task")) {
    return `Update Task`;
  }
  if (tool.includes("create_pull_request")) {
    return `Create PR`;
  }
  return tool.replace("shapeup_", "").replace("admin_", "").replace(/_/g, " ");
}
function getMcpSubtitle(e) {
  const server = e.data.mcpServer;
  const input = e.data.toolInput;
  if (input?.taskId) {
    return `${input.taskId}`;
  }
  if (input?.repoName) {
    return input.repoName;
  }
  if (server) {
    return `via ${server}`;
  }
  return void 0;
}
function getToolInputFullTitle(e) {
  const toolName = e.data.toolName || "Tool";
  const input = e.data.input;
  if (input?.description) {
    return input.description;
  }
  if (toolName === "Read" && input?.file_path) {
    return `Read ${getFileName(input.file_path)}`;
  }
  if (toolName === "Write" && input?.file_path) {
    return `Write ${getFileName(input.file_path)}`;
  }
  if (toolName === "Edit" && input?.file_path) {
    return `Edit ${getFileName(input.file_path)}`;
  }
  if (toolName === "Grep" && input?.pattern) {
    return `Search: ${truncate2(input.pattern, 40)}`;
  }
  if (toolName === "Glob" && input?.pattern) {
    return `Find: ${truncate2(input.pattern, 40)}`;
  }
  return `Input: ${toolName}`;
}
function getToolInputFullSubtitle(e) {
  const toolName = e.data.toolName || "";
  const input = e.data.input;
  if ((toolName === "Read" || toolName === "Write" || toolName === "Edit") && input?.file_path) {
    return getFilePath(input.file_path);
  }
  if (toolName === "Bash" && input?.command) {
    return truncate2(input.command, 50);
  }
  if ((toolName === "Grep" || toolName === "Glob") && input?.path) {
    return input.path;
  }
  return void 0;
}
function getToolOutputTitle(e) {
  const toolName = typeof e.data.toolName === "string" ? e.data.toolName : void 0;
  const output = typeof e.data.output === "string" ? e.data.output : void 0;
  if (!toolName || toolName === "unknown") {
    if (output) {
      if (output.includes("lines read from")) return "\u2713 File read";
      if (output.includes("Successfully wrote")) return "\u2713 File written";
      if (output.includes("Successfully edited")) return "\u2713 File edited";
      if (output.includes("matches found") || output.includes("No matches")) return "\u2713 Search complete";
      if (output.includes("files matched")) return "\u2713 Files found";
      if (output.includes("exit code") || output.includes("stdout:")) return "\u2713 Command executed";
    }
    return "\u2713 Tool complete";
  }
  if (toolName === "Read") return "\u2713 File read";
  if (toolName === "Write") return "\u2713 File written";
  if (toolName === "Edit") return "\u2713 File edited";
  if (toolName === "Bash") return "\u2713 Command executed";
  if (toolName === "Grep") return "\u2713 Search complete";
  if (toolName === "Glob") return "\u2713 Files found";
  if (toolName === "Task") return "\u2713 Task complete";
  if (toolName.startsWith("mcp__")) {
    const cleanName = toolName.split("__").pop()?.replace(/_/g, " ") || toolName;
    return `\u2713 ${cleanName}`;
  }
  return `\u2713 ${toolName} complete`;
}
function getToolOutputSubtitle(e) {
  const output = typeof e.data.output === "string" ? e.data.output : void 0;
  if (!output) return void 0;
  if (output.includes("lines read")) {
    const match = output.match(/(\d+) lines? read/);
    if (match) return `${match[1]} lines`;
  }
  if (output.includes("matches found")) {
    const match = output.match(/(\d+) matches? found/);
    if (match) return `${match[1]} matches`;
  }
  if (output.includes("files matched")) {
    const match = output.match(/(\d+) files? matched/);
    if (match) return `${match[1]} files`;
  }
  return truncate2(output, 50);
}
function getSdkMessageTitle(e) {
  const raw = e.data.raw;
  if (raw?.type === "system") {
    return "System Init";
  }
  if (raw?.type === "assistant") {
    const message = raw.message;
    const content = message?.content;
    if (content && Array.isArray(content) && content.length > 0) {
      const toolUse = content.find((c) => c.type === "tool_use");
      if (toolUse?.name && typeof toolUse.name === "string") {
        const input = toolUse.input;
        return getNextActionTitle(toolUse.name, input);
      }
      const textBlock = content.find((c) => c.type === "text" && c.text && typeof c.text === "string");
      if (textBlock?.text && typeof textBlock.text === "string") {
        return truncate2(textBlock.text, 80) || "Claude";
      }
    }
    return "Claude";
  }
  if (raw?.type === "user") {
    const content = raw.content;
    if (content && Array.isArray(content) && content.length > 0) {
      const toolResult = content.find((c) => c.type === "tool_result");
      if (toolResult) {
        const resultContent = toolResult.content;
        if (typeof resultContent === "string" && resultContent.length > 0) {
          const preview = extractResultPreview(resultContent);
          if (preview) return preview;
        } else if (Array.isArray(resultContent) && resultContent.length > 0) {
          const textBlock = resultContent.find(
            (c) => typeof c === "object" && c !== null && c.type === "text"
          );
          if (textBlock?.text && typeof textBlock.text === "string") {
            const preview = extractResultPreview(textBlock.text);
            if (preview) return preview;
          }
        }
        return "Tool Result";
      }
    }
    return "Tool Result";
  }
  if (raw?.type === "result") {
    return "Tool Result";
  }
  return (typeof raw?.type === "string" ? raw.type : void 0) || "SDK Message";
}
function getNextActionTitle(toolName, input) {
  if (toolName === "Edit" && typeof input?.file_path === "string") {
    return `\u2192 Edit ${getFileName(input.file_path)}`;
  }
  if (toolName === "Write" && typeof input?.file_path === "string") {
    return `\u2192 Write ${getFileName(input.file_path)}`;
  }
  if (toolName === "Read" && typeof input?.file_path === "string") {
    return `\u2192 Read ${getFileName(input.file_path)}`;
  }
  if (toolName === "Bash" && typeof input?.description === "string") {
    return `\u2192 ${input.description}`;
  }
  if (toolName === "Bash" && typeof input?.command === "string") {
    return `\u2192 Run: ${truncate2(input.command, 50)}`;
  }
  if (toolName === "Grep" && typeof input?.pattern === "string") {
    return `\u2192 Search: ${truncate2(input.pattern, 40)}`;
  }
  if (toolName === "Glob" && typeof input?.pattern === "string") {
    return `\u2192 Find: ${truncate2(input.pattern, 40)}`;
  }
  if (toolName === "Task" && typeof input?.description === "string") {
    return `\u2192 ${input.description}`;
  }
  if (toolName.startsWith("mcp__")) {
    const cleanName = toolName.split("__").pop()?.replace(/_/g, " ") || toolName;
    return `\u2192 ${cleanName}`;
  }
  return `\u2192 ${toolName}`;
}
function extractResultPreview(content) {
  if (content.length < 100) {
    return `Result: ${truncate2(content, 60)}`;
  }
  if (content.includes("Successfully")) {
    const match = content.match(/Successfully[^.!]*/);
    if (match) return truncate2(match[0], 60);
  }
  if (content.includes("Error:") || content.includes("error:")) {
    const match = content.match(/[Ee]rror:[^.!\n]*/);
    if (match) return truncate2(match[0], 60);
  }
  return void 0;
}
function getSdkMessageSubtitle(e) {
  const raw = e.data.raw;
  if (raw?.type === "system" && raw?.model) {
    return `${raw.model}`;
  }
  return void 0;
}
function extractLinks(event, taskUrlBuilder) {
  const links = [];
  const dataStr = JSON.stringify(event.data);
  const prMatches = dataStr.matchAll(GITHUB_PR_PATTERN);
  for (const match of prMatches) {
    links.push({
      type: "github-pr",
      url: match[0],
      label: `PR #${match[3]}`
    });
  }
  const commitMatches = dataStr.matchAll(GITHUB_COMMIT_PATTERN);
  for (const match of commitMatches) {
    links.push({
      type: "github-commit",
      url: match[0],
      label: `Commit ${match[3].substring(0, 7)}`
    });
  }
  const input = event.data.toolInput;
  if (input?.taskId && typeof input.taskId === "string") {
    const url = taskUrlBuilder ? taskUrlBuilder(input.taskId) : `https://shapeup.smartup.lat/v2/tasks/${input.taskId}`;
    links.push({
      type: "shapeup",
      url,
      label: "View Task"
    });
  }
  if (event.data.taskId && typeof event.data.taskId === "string") {
    const url = taskUrlBuilder ? taskUrlBuilder(event.data.taskId) : `https://shapeup.smartup.lat/v2/tasks/${event.data.taskId}`;
    links.push({
      type: "shapeup",
      url,
      label: "View Task"
    });
  }
  if (event.data.prUrl) {
    links.push({
      type: "github-pr",
      url: event.data.prUrl,
      label: "View PR"
    });
  }
  return links;
}
function TimelineEvent({ event, isGrouped }) {
  const [expanded, setExpanded] = useState(false);
  const config = usePipelineConfig();
  const eventConfig = EVENT_CONFIG[event.type] || {
    icon: "\u2022",
    colorClass: "muted",
    getTitle: () => event.type.replace(/_/g, " ")
  };
  const title = useMemo(() => eventConfig.getTitle(event), [eventConfig, event]);
  const subtitle = useMemo(() => eventConfig.getSubtitle?.(event), [eventConfig, event]);
  const links = useMemo(
    () => extractLinks(event, config.linkBuilders?.taskUrl),
    [event, config.linkBuilders?.taskUrl]
  );
  const hasDetails = useMemo(() => {
    if (event.type === "assistant_message" && event.data.text) return true;
    if (event.type === "plan_generated" && event.data.plan) return true;
    if (event.type === "sdk_thinking" && event.data.thinking) return true;
    if (event.type === "code_review_result") return true;
    if (event.type === "tool_call" && event.data.toolInput) return true;
    if (event.type === "agent_start" && event.data.toolInput) return true;
    if (event.type === "audit_generated" && event.data.markdownReport) return true;
    return Object.keys(event.data).length > 0;
  }, [event]);
  const handleClick = useCallback(() => {
    if (hasDetails) {
      setExpanded((prev) => !prev);
    }
  }, [hasDetails]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `pipeline-event pipeline-event-${eventConfig.colorClass} ${isGrouped ? "pipeline-event-grouped" : ""} ${expanded ? "pipeline-event-expanded" : ""} ${hasDetails ? "pipeline-event-clickable" : ""}`,
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "pipeline-event-row", children: [
          /* @__PURE__ */ jsx("span", { className: "pipeline-event-icon", children: eventConfig.icon }),
          /* @__PURE__ */ jsx("span", { className: "pipeline-event-title", children: title }),
          subtitle && /* @__PURE__ */ jsx("span", { className: "pipeline-event-subtitle", children: subtitle }),
          links.length > 0 && /* @__PURE__ */ jsx("div", { className: "pipeline-event-links", children: links.slice(0, 2).map((link, i) => /* @__PURE__ */ jsxs(
            "a",
            {
              href: link.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: `pipeline-event-link pipeline-event-link-${link.type}`,
              onClick: (e) => e.stopPropagation(),
              children: [
                link.type === "shapeup" && "\u{1F4CB}",
                link.type === "github-pr" && "\u{1F500}",
                link.type === "github-commit" && "\u{1F4CC}",
                link.label
              ]
            },
            i
          )) }),
          /* @__PURE__ */ jsx("span", { className: "pipeline-event-time", children: formatTime(event.timestamp) }),
          (event.turnNumber ?? event.turn) !== void 0 && /* @__PURE__ */ jsxs("span", { className: "pipeline-event-turn", children: [
            "T",
            event.turnNumber ?? event.turn
          ] }),
          hasDetails && /* @__PURE__ */ jsx("span", { className: `pipeline-event-chevron ${expanded ? "pipeline-event-chevron-open" : ""}`, children: "\u203A" })
        ] }),
        expanded && /* @__PURE__ */ jsx(ExpandedContent, { event })
      ]
    }
  );
}
function ExpandedContent({ event }) {
  const content = useMemo(() => {
    if (event.type === "assistant_message" && event.data.text) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "pipeline-event-markdown",
          dangerouslySetInnerHTML: { __html: marked.parse(event.data.text) }
        }
      );
    }
    if (event.type === "plan_generated" && event.data.plan) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "pipeline-event-markdown",
          dangerouslySetInnerHTML: { __html: marked.parse(event.data.plan) }
        }
      );
    }
    if (event.type === "sdk_thinking" && event.data.thinking) {
      return /* @__PURE__ */ jsx("div", { className: "pipeline-event-thinking", children: event.data.thinking });
    }
    if ((event.type === "tool_call" || event.type === "tool_start") && event.data.toolInput) {
      const input = event.data.toolInput;
      const toolName = event.data.toolName || "";
      if (toolName === "Edit") {
        const oldStr = input.old_string;
        const newStr = input.new_string;
        return /* @__PURE__ */ jsxs("div", { className: "pipeline-event-diff", children: [
          /* @__PURE__ */ jsx("div", { className: "pipeline-event-filepath", children: input.file_path }),
          oldStr && /* @__PURE__ */ jsxs("div", { className: "pipeline-event-diff-removed", children: [
            "- ",
            truncateCode(oldStr, 200)
          ] }),
          newStr && /* @__PURE__ */ jsxs("div", { className: "pipeline-event-diff-added", children: [
            "+ ",
            truncateCode(newStr, 200)
          ] })
        ] });
      }
      if (toolName === "Bash" && input.command) {
        return /* @__PURE__ */ jsxs("div", { className: "pipeline-event-code", children: [
          /* @__PURE__ */ jsx("span", { className: "pipeline-event-code-prompt", children: "$" }),
          " ",
          input.command
        ] });
      }
      return /* @__PURE__ */ jsx("pre", { className: "pipeline-event-json", children: JSON.stringify(input, null, 2) });
    }
    if (event.type === "agent_start" || event.type === "agent_started") {
      const input = event.data.toolInput;
      if (input?.prompt) {
        return /* @__PURE__ */ jsx("div", { className: "pipeline-event-prompt", children: truncateCode(input.prompt, 500) });
      }
    }
    if (event.type === "code_review_result") {
      const verdict = event.data.verdict;
      const body = event.data.body;
      return /* @__PURE__ */ jsxs("div", { className: "pipeline-event-review", children: [
        verdict && /* @__PURE__ */ jsxs("div", { className: `pipeline-event-verdict pipeline-event-verdict-${verdict.toLowerCase()}`, children: [
          verdict === "APPROVE" && "\u2713 Approved",
          verdict === "CHANGES_REQUESTED" && "\u26A0 Changes Requested",
          verdict === "COMMENT" && "\u{1F4AC} Commented"
        ] }),
        body && /* @__PURE__ */ jsx(
          "div",
          {
            className: "pipeline-event-markdown",
            dangerouslySetInnerHTML: { __html: marked.parse(body) }
          }
        )
      ] });
    }
    if (event.type === "audit_generated") {
      const markdownReport = event.data.markdownReport;
      const outcome = event.data.outcome;
      if (markdownReport) {
        return /* @__PURE__ */ jsxs("div", { className: "pipeline-event-audit", children: [
          /* @__PURE__ */ jsxs("div", { className: `pipeline-event-audit-outcome pipeline-event-audit-outcome-${outcome || "partial"}`, children: [
            "Outcome: ",
            outcome || "Unknown"
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "pipeline-event-markdown",
              dangerouslySetInnerHTML: { __html: marked.parse(markdownReport) }
            }
          )
        ] });
      }
    }
    return /* @__PURE__ */ jsx("pre", { className: "pipeline-event-json", children: JSON.stringify(event.data, null, 2) });
  }, [event]);
  return /* @__PURE__ */ jsx("div", { className: "pipeline-event-details", children: content });
}
function truncateCode(code, max) {
  if (code.length <= max) return code;
  return code.substring(0, max) + "\n... (truncated)";
}
function isMinorEvent(event) {
  const eventConfig = EVENT_CONFIG[event.type];
  return eventConfig?.isMinor === true;
}
function shouldHideEvent(event) {
  if (event.type === "timing") {
    const eventName = event.data.event;
    if (eventName === "turn_complete") {
      return true;
    }
  }
  return false;
}
var Button = forwardRef(
  ({
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    loading,
    fullWidth,
    className,
    disabled,
    children,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref,
        className: [
          "pipeline-btn",
          `pipeline-btn-${variant}`,
          `pipeline-btn-${size}`,
          fullWidth && "pipeline-btn-full-width",
          loading && "pipeline-btn-loading",
          className
        ].filter(Boolean).join(" "),
        disabled: disabled || loading,
        ...props,
        children: [
          loading && /* @__PURE__ */ jsx("span", { className: "pipeline-btn-spinner" }),
          icon && !loading && /* @__PURE__ */ jsx("span", { className: "pipeline-btn-icon", children: icon }),
          children && /* @__PURE__ */ jsx("span", { className: "pipeline-btn-label", children }),
          iconRight && /* @__PURE__ */ jsx("span", { className: "pipeline-btn-icon-right", children: iconRight })
        ]
      }
    );
  }
);
Button.displayName = "Button";
function statusToVariant(status) {
  switch (status) {
    case "running":
      return "info";
    case "waiting_approval":
      return "warning";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "default";
  }
}
function Badge({
  children,
  variant = "default",
  status,
  size = "md",
  dot = false,
  pulse = false,
  className
}) {
  const effectiveVariant = status ? statusToVariant(status) : variant;
  const shouldPulse = pulse || status === "running";
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: [
        "pipeline-badge",
        `pipeline-badge-${effectiveVariant}`,
        `pipeline-badge-${size}`,
        dot && "pipeline-badge-with-dot",
        shouldPulse && "pipeline-badge-pulse",
        className
      ].filter(Boolean).join(" "),
      children: [
        (dot || shouldPulse) && /* @__PURE__ */ jsx("span", { className: "pipeline-badge-dot" }),
        children
      ]
    }
  );
}

// src/services/api.ts
function createApiClient(config) {
  const { apiBaseUrl, fetchFn = fetch, headers: customHeaders = {} } = config;
  async function fetchJson(url, options) {
    const res = await fetchFn(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
        ...options?.headers
      }
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  return {
    // ============================================
    // PIPELINE ENDPOINTS
    // ============================================
    async startPipeline(request) {
      return fetchJson(`${apiBaseUrl}/api/pipeline/start`, {
        method: "POST",
        body: JSON.stringify(request)
      });
    },
    async getPipeline(pipelineId) {
      return fetchJson(`${apiBaseUrl}/api/pipeline/${pipelineId}`);
    },
    async approvePipeline(pipelineId, approved, feedback) {
      return fetchJson(`${apiBaseUrl}/api/pipeline/${pipelineId}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved, feedback })
      });
    },
    async listActivePipelines() {
      return fetchJson(`${apiBaseUrl}/api/pipelines`);
    },
    // ============================================
    // SESSION ENDPOINTS
    // ============================================
    async listSessions(params = {}) {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set("status", params.status);
      if (params.source) searchParams.set("source", params.source);
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.offset) searchParams.set("offset", params.offset.toString());
      return fetchJson(`${apiBaseUrl}/api/sessions?${searchParams}`);
    },
    async getSession(pipelineId, includeEvents = true) {
      return fetchJson(
        `${apiBaseUrl}/api/sessions/${pipelineId}?includeEvents=${includeEvents}`
      );
    },
    async getResumableSessions() {
      return fetchJson(`${apiBaseUrl}/api/sessions/resumable`);
    },
    async resumeSession(pipelineId, approved, feedback) {
      return fetchJson(`${apiBaseUrl}/api/sessions/${pipelineId}/resume`, {
        method: "POST",
        body: JSON.stringify({ approved, feedback })
      });
    },
    async deleteSession(pipelineId) {
      return fetchJson(`${apiBaseUrl}/api/sessions/${pipelineId}`, {
        method: "DELETE"
      });
    },
    // ============================================
    // HEALTH CHECK
    // ============================================
    async healthCheck() {
      return fetchJson(`${apiBaseUrl}/health`);
    },
    // ============================================
    // WEBSOCKET URL
    // ============================================
    getWebSocketUrl(pipelineId) {
      if (config.getWebSocketUrl) {
        return config.getWebSocketUrl(pipelineId);
      }
      const url = new URL(apiBaseUrl || window.location.origin);
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${url.host}/ws/${pipelineId}`;
    }
  };
}
function extractTaskId(input) {
  if (!input.includes("/")) {
    return input.trim();
  }
  const parts = input.split("/");
  return parts[parts.length - 1].trim();
}

// src/hooks/useApi.ts
function useApi() {
  const config = usePipelineConfig();
  return useMemo(() => createApiClient(config), [config]);
}
var STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "waiting_approval", label: "Waiting" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" }
];
var CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "lifecycle", label: "Lifecycle" },
  { value: "workflow", label: "Workflow" },
  { value: "agent", label: "Agent" },
  { value: "tool", label: "Tool" },
  { value: "error", label: "Error" }
];
var EVENT_CATEGORIES = {
  started: "lifecycle",
  completed: "lifecycle",
  failed: "lifecycle",
  waiting_approval: "lifecycle",
  approved: "lifecycle",
  rejected: "lifecycle",
  workflow_started: "workflow",
  workflow_step: "workflow",
  plan_generated: "workflow",
  task_fetched: "workflow",
  prefetch_complete: "workflow",
  repo_selected: "workflow",
  code_review_result: "workflow",
  audit_generated: "workflow",
  agent_started: "agent",
  agent_completed: "agent",
  subagent_start: "agent",
  subagent_stop: "agent",
  tool_start: "tool",
  tool_complete: "tool",
  tool_error: "tool",
  mcp_start: "mcp",
  mcp_complete: "mcp",
  mcp_error: "mcp",
  error: "error",
  budget_exceeded: "error"
};
var PAGE_SIZE = 20;
function HistoryView({
  onConnectLive,
  selectedPipelineId,
  onSessionSelect,
  className
}) {
  const api = useApi();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resuming, setResuming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [selectedEventIndices, setSelectedEventIndices] = useState(/* @__PURE__ */ new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listSessions({
        status: statusFilter !== "all" ? statusFilter : void 0,
        source: "merged",
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE
      });
      const sortedSessions = [...result.sessions].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setSessions(sortedSessions);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter, page]);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const fetchSessionDetail = useCallback(async (pipelineId) => {
    setLoadingDetail(true);
    try {
      const session = await api.getSession(pipelineId);
      setSelectedSession(session);
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setLoadingDetail(false);
    }
  }, [api]);
  useEffect(() => {
    if (selectedPipelineId && selectedPipelineId !== selectedSession?.pipelineId) {
      fetchSessionDetail(selectedPipelineId);
    }
  }, [selectedPipelineId, fetchSessionDetail, selectedSession?.pipelineId]);
  const handleSelectSession = useCallback((session) => {
    onSessionSelect?.(session.pipelineId);
    fetchSessionDetail(session.pipelineId);
  }, [fetchSessionDetail, onSessionSelect]);
  const handleCopyLink = useCallback(() => {
    if (!selectedSession) return;
    const url = `${window.location.origin}/session/${selectedSession.pipelineId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2e3);
    });
  }, [selectedSession]);
  const handleResume = useCallback(async (approved) => {
    if (!selectedSession) return;
    setResuming(true);
    try {
      await api.resumeSession(selectedSession.pipelineId, approved);
      onConnectLive?.(selectedSession.pipelineId, selectedSession.taskTitle);
      fetchSessions();
    } catch (err) {
      console.error("Failed to resume session:", err);
    } finally {
      setResuming(false);
    }
  }, [api, selectedSession, onConnectLive, fetchSessions]);
  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.deleteSession(deleteConfirm);
      if (selectedSession?.pipelineId === deleteConfirm) {
        setSelectedSession(null);
      }
      setDeleteConfirm(null);
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setDeleting(false);
    }
  }, [api, deleteConfirm, selectedSession, fetchSessions]);
  const filteredEvents = useMemo(() => {
    if (!selectedSession?.events) return [];
    const visibleEvents = selectedSession.events.filter((e) => !shouldHideEvent(e));
    if (eventFilter === "all") {
      return visibleEvents.filter(
        (e) => EVENT_CATEGORIES[e.type] !== "debug"
      );
    }
    return visibleEvents.filter(
      (e) => EVENT_CATEGORIES[e.type] === eventFilter
    );
  }, [selectedSession, eventFilter]);
  useEffect(() => {
    setSelectedEventIndices(/* @__PURE__ */ new Set());
    setLastClickedIndex(null);
  }, [selectedSession?.pipelineId]);
  const handleEventSelect = useCallback((index, event) => {
    event.stopPropagation();
    if (event.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const newSelection = new Set(selectedEventIndices);
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedEventIndices(newSelection);
    } else if (event.metaKey || event.ctrlKey) {
      const newSelection = new Set(selectedEventIndices);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedEventIndices(newSelection);
      setLastClickedIndex(index);
    } else {
      if (selectedEventIndices.has(index) && selectedEventIndices.size === 1) {
        setSelectedEventIndices(/* @__PURE__ */ new Set());
        setLastClickedIndex(null);
      } else {
        setSelectedEventIndices(/* @__PURE__ */ new Set([index]));
        setLastClickedIndex(index);
      }
    }
  }, [selectedEventIndices, lastClickedIndex]);
  const handleSelectAll = useCallback(() => {
    const allIndices = new Set(filteredEvents.map((_, i) => i));
    setSelectedEventIndices(allIndices);
  }, [filteredEvents]);
  const handleClearSelection = useCallback(() => {
    setSelectedEventIndices(/* @__PURE__ */ new Set());
    setLastClickedIndex(null);
  }, []);
  const handleCopySelected = useCallback(async () => {
    const selectedEvents = Array.from(selectedEventIndices).sort((a, b) => a - b).map((i) => filteredEvents[i]).filter(Boolean);
    if (selectedEvents.length === 0) return;
    const text = JSON.stringify(selectedEvents, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2e3);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [selectedEventIndices, filteredEvents]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return /* @__PURE__ */ jsxs("div", { className: `pipeline-history ${className || ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: `pipeline-history-list ${panelCollapsed ? "pipeline-history-list-collapsed" : ""}`, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "pipeline-history-collapse-toggle",
          onClick: () => setPanelCollapsed(!panelCollapsed),
          title: panelCollapsed ? "Expand panel" : "Collapse panel",
          children: panelCollapsed ? "\u2192" : "\u2190"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-history-collapsed-indicator", onClick: () => setPanelCollapsed(false), children: [
        /* @__PURE__ */ jsx("span", { className: "pipeline-history-collapsed-icon", children: "\u{1F4CB}" }),
        /* @__PURE__ */ jsxs("span", { className: "pipeline-history-collapsed-count", children: [
          total,
          " sessions"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-history-list-header", children: [
        /* @__PURE__ */ jsx("h2", { className: "pipeline-history-list-title", children: "Session History" }),
        /* @__PURE__ */ jsx("div", { className: "pipeline-history-status-filters", children: STATUS_FILTERS.map((filter) => /* @__PURE__ */ jsx(
          "button",
          {
            className: `pipeline-history-status-filter ${statusFilter === filter.value ? "active" : ""} ${filter.value !== "all" ? filter.value : ""}`,
            onClick: () => {
              setStatusFilter(filter.value);
              setPage(0);
            },
            children: filter.label
          },
          filter.value
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pipeline-history-sessions-list", children: loading ? /* @__PURE__ */ jsxs("div", { className: "pipeline-history-loading", children: [
        /* @__PURE__ */ jsx("div", { className: "pipeline-history-loading-spinner" }),
        "Loading sessions..."
      ] }) : sessions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "pipeline-history-empty", children: "No sessions found" }) : sessions.map((session) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `pipeline-history-session-item ${selectedSession?.pipelineId === session.pipelineId ? "selected" : ""}`,
          onClick: () => handleSelectSession(session),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "pipeline-history-session-top", children: [
              /* @__PURE__ */ jsx("h4", { className: "pipeline-history-session-title", children: session.taskTitle || session.taskId || session.pipelineId }),
              /* @__PURE__ */ jsx("span", { className: `pipeline-history-session-status ${session.status}`, children: session.status.replace("_", " ") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pipeline-history-session-meta", children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-session-workflow", children: session.workflowType }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-session-date", children: formatDate(session.createdAt) }),
              session.cost !== void 0 && /* @__PURE__ */ jsx("span", { className: "pipeline-history-session-cost", children: formatCost(session.cost) })
            ] })
          ]
        },
        session.pipelineId
      )) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-pagination", children: [
        /* @__PURE__ */ jsxs("span", { className: "pipeline-history-page-info", children: [
          page * PAGE_SIZE + 1,
          "-",
          Math.min((page + 1) * PAGE_SIZE, total),
          " of ",
          total
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pipeline-history-page-buttons", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "pipeline-history-page-btn",
              onClick: () => setPage((p) => p - 1),
              disabled: page === 0,
              children: "\u2190"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "pipeline-history-page-btn",
              onClick: () => setPage((p) => p + 1),
              disabled: page >= totalPages - 1,
              children: "\u2192"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pipeline-history-detail", children: !selectedSession ? /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-empty", children: [
      /* @__PURE__ */ jsx("div", { className: "pipeline-history-detail-empty-icon", children: "\u{1F4CB}" }),
      /* @__PURE__ */ jsx("p", { className: "pipeline-history-detail-empty-text", children: "Select a session to view details" })
    ] }) : loadingDetail ? /* @__PURE__ */ jsxs("div", { className: "pipeline-history-loading", children: [
      /* @__PURE__ */ jsx("div", { className: "pipeline-history-loading-spinner" }),
      "Loading session details..."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-header", children: [
        /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-info", children: [
          /* @__PURE__ */ jsx("h2", { className: "pipeline-history-detail-title", children: selectedSession.taskTitle || selectedSession.taskId }),
          /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-meta", children: [
            /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-meta-item", children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-label", children: "Status:" }),
              /* @__PURE__ */ jsx(Badge, { status: selectedSession.status, children: selectedSession.status.replace("_", " ") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-meta-item", children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-label", children: "Workflow:" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-value", children: selectedSession.workflowType })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-meta-item", children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-label", children: "Started:" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-value", children: formatDate(selectedSession.createdAt) })
            ] }),
            selectedSession.duration && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-meta-item", children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-label", children: "Duration:" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-history-detail-meta-value", children: formatDuration(selectedSession.duration) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-actions", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: handleCopyLink,
              title: "Copy shareable link",
              children: linkCopied ? "\u2713 Copied" : "\u{1F517} Share"
            }
          ),
          selectedSession.status === "running" && onConnectLive && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              size: "sm",
              onClick: () => onConnectLive(selectedSession.pipelineId, selectedSession.taskTitle),
              children: "Watch Live"
            }
          ),
          selectedSession.status === "waiting_approval" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                size: "sm",
                onClick: () => handleResume(false),
                loading: resuming,
                children: "Reject"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "primary",
                size: "sm",
                onClick: () => handleResume(true),
                loading: resuming,
                children: "Approve"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: () => setDeleteConfirm(selectedSession.pipelineId),
              children: "Delete"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-history-detail-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "pipeline-history-session-stats", children: [
          selectedSession.duration && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-value", children: formatDuration(selectedSession.duration) }),
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-label", children: "Duration" })
          ] }),
          selectedSession.cost !== void 0 && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-value", children: formatCost(selectedSession.cost) }),
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-label", children: "Cost" })
          ] }),
          selectedSession.eventCount !== void 0 && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-value", children: selectedSession.eventCount }),
            /* @__PURE__ */ jsx("div", { className: "pipeline-history-stat-label", children: "Events" })
          ] })
        ] }),
        selectedSession.prUrl && /* @__PURE__ */ jsx(
          "a",
          {
            href: selectedSession.prUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "pipeline-history-pr-link",
            children: "View Pull Request \u2192"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "pipeline-history-events-header", children: [
          /* @__PURE__ */ jsx("h3", { className: "pipeline-history-events-title", children: "Events" }),
          /* @__PURE__ */ jsx("div", { className: "pipeline-history-events-filters", children: CATEGORY_FILTERS.map((filter) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `pipeline-history-status-filter ${eventFilter === filter.value ? "active" : ""}`,
              onClick: () => setEventFilter(filter.value),
              children: filter.label
            },
            filter.value
          )) })
        ] }),
        filteredEvents.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pipeline-history-selection-toolbar", children: [
          /* @__PURE__ */ jsx("div", { className: "pipeline-history-selection-info", children: selectedEventIndices.size > 0 ? /* @__PURE__ */ jsxs("span", { children: [
            selectedEventIndices.size,
            " selected"
          ] }) : /* @__PURE__ */ jsx("span", { className: "pipeline-history-selection-hint", children: "Click to select \u2022 Cmd/Ctrl+click for multiple \u2022 Shift+click for range" }) }),
          /* @__PURE__ */ jsxs("div", { className: "pipeline-history-selection-actions", children: [
            selectedEventIndices.size > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "pipeline-history-selection-btn",
                  onClick: handleClearSelection,
                  children: "Clear"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "pipeline-history-selection-btn primary",
                  onClick: handleCopySelected,
                  children: copySuccess ? "\u2713 Copied!" : `Copy ${selectedEventIndices.size} event${selectedEventIndices.size > 1 ? "s" : ""}`
                }
              )
            ] }),
            selectedEventIndices.size === 0 && /* @__PURE__ */ jsx(
              "button",
              {
                className: "pipeline-history-selection-btn",
                onClick: handleSelectAll,
                children: "Select All"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pipeline-history-events-list", children: filteredEvents.length === 0 ? /* @__PURE__ */ jsx("div", { className: "pipeline-history-empty", children: "No events" }) : filteredEvents.map((event, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `pipeline-history-event-wrapper ${selectedEventIndices.has(i) ? "selected" : ""}`,
            onClick: (e) => handleEventSelect(i, e),
            children: /* @__PURE__ */ jsx(
              TimelineEvent,
              {
                event,
                isGrouped: isMinorEvent(event)
              }
            )
          },
          `${event.type}-${event.timestamp}-${i}`
        )) })
      ] })
    ] }) }),
    deleteConfirm && /* @__PURE__ */ jsx("div", { className: "pipeline-history-confirm-overlay", onClick: () => setDeleteConfirm(null), children: /* @__PURE__ */ jsxs("div", { className: "pipeline-history-confirm-dialog", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "pipeline-history-confirm-title", children: "Delete Session?" }),
      /* @__PURE__ */ jsx("p", { className: "pipeline-history-confirm-text", children: "This will permanently delete this session and all its events. This action cannot be undone." }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-history-confirm-actions", children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setDeleteConfirm(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { variant: "danger", onClick: handleDelete, loading: deleting, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true
}) {
  const overlayRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: overlayRef,
        className: "pipeline-modal-overlay",
        onClick: handleOverlayClick,
        children: /* @__PURE__ */ jsxs("div", { className: `pipeline-modal pipeline-modal-${size}`, children: [
          (title || showClose) && /* @__PURE__ */ jsxs("div", { className: "pipeline-modal-header", children: [
            title && /* @__PURE__ */ jsx("h2", { className: "pipeline-modal-title", children: title }),
            showClose && /* @__PURE__ */ jsx(
              "button",
              {
                className: "pipeline-modal-close",
                onClick: onClose,
                "aria-label": "Close modal",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", width: "20", height: "20", children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: "M18 6L6 18M6 6L18 18",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round"
                  }
                ) })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pipeline-modal-content", children })
        ] })
      }
    ),
    document.body
  );
}
var WORKFLOW_OPTIONS = [
  { value: "resolve-task", label: "Resolve Task", description: "Full task resolution with code changes" },
  { value: "code-review", label: "Code Review", description: "Review existing code changes" },
  { value: "spec-analysis", label: "Spec Analysis", description: "Analyze specifications only" },
  { value: "multi-repo", label: "Multi-Repo", description: "Coordinate changes across repos" }
];
var VERBOSITY_OPTIONS = [
  { value: "condensed", label: "Condensed", icon: "\u{1F4CB}" },
  { value: "normal", label: "Normal", icon: "\u{1F4CA}" },
  { value: "debug", label: "Debug", icon: "\u{1F50D}" }
];
var MODEL_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "haiku", label: "Haiku" },
  { value: "sonnet", label: "Sonnet" },
  { value: "opus", label: "Opus" }
];
var AGENTS = [
  { id: "task-evaluator", label: "Task Evaluator", defaultModel: "haiku" },
  { id: "repo-selector", label: "Repo Selector", defaultModel: "sonnet" },
  { id: "plan-generator", label: "Plan Generator", defaultModel: "sonnet" },
  { id: "code-executor", label: "Code Executor", defaultModel: "opus" },
  { id: "code-reviewer", label: "Code Reviewer", defaultModel: "opus" }
];
function StartPipelineModal({ isOpen, onClose, onStarted }) {
  const api = useApi();
  const [taskInput, setTaskInput] = useState("");
  const [workflowType, setWorkflowType] = useState("resolve-task");
  const [executionMode, setExecutionMode] = useState("standard");
  const [autoCreatePr, setAutoCreatePr] = useState(true);
  const [autoReview, setAutoReview] = useState(true);
  const [maxBudget, setMaxBudget] = useState("10.00");
  const [verbosity, setVerbosity] = useState("debug");
  const [agentOverrides, setAgentOverrides] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    const taskId = extractTaskId(taskInput.trim());
    if (!taskId) {
      setError("Please enter a task ID or URL");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const config = {
        taskId,
        workflowType,
        skipApproval: executionMode === "yolo",
        dryRun: executionMode === "dryrun",
        autoCreatePr,
        autoReview,
        maxBudgetUsd: parseFloat(maxBudget) || 10,
        verbosity
      };
      const overrides = {};
      Object.entries(agentOverrides).forEach(([agent, model]) => {
        if (model !== "default") {
          overrides[agent] = { model };
        }
      });
      if (Object.keys(overrides).length > 0) {
        config.agentOverrides = overrides;
      }
      const result = await api.startPipeline(config);
      onStarted(result.pipelineId);
      setTaskInput("");
      setExecutionMode("standard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start pipeline");
    } finally {
      setLoading(false);
    }
  };
  const handleAgentOverride = (agentId, model) => {
    setAgentOverrides((prev) => ({
      ...prev,
      [agentId]: model
    }));
  };
  return /* @__PURE__ */ jsx(Modal, { isOpen, onClose, title: "Start New Pipeline", size: "lg", children: /* @__PURE__ */ jsxs("div", { className: "pipeline-start-form", children: [
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-section", children: [
      /* @__PURE__ */ jsx("label", { className: "pipeline-start-label", children: "Task ID or URL" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: taskInput,
          onChange: (e) => setTaskInput(e.target.value),
          placeholder: "Enter task ID or paste ShapeUp task URL...",
          className: "pipeline-start-input",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "pipeline-start-hint", children: "e.g., cmjoi1s3w003sov0153apjqpi or https://shapeup.smartup.lat/v2/tasks/..." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-section", children: [
      /* @__PURE__ */ jsx("label", { className: "pipeline-start-label", children: "Workflow Type" }),
      /* @__PURE__ */ jsx("div", { className: "pipeline-start-workflow-grid", children: WORKFLOW_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `pipeline-start-workflow-card ${workflowType === opt.value ? "selected" : ""}`,
          onClick: () => setWorkflowType(opt.value),
          children: [
            /* @__PURE__ */ jsx("span", { className: "pipeline-start-workflow-label", children: opt.label }),
            /* @__PURE__ */ jsx("span", { className: "pipeline-start-workflow-desc", children: opt.description })
          ]
        },
        opt.value
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-section", children: [
      /* @__PURE__ */ jsx("label", { className: "pipeline-start-label", children: "Execution Mode" }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-start-mode-grid", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `pipeline-start-mode-card ${executionMode === "standard" ? "selected" : ""}`,
            onClick: () => setExecutionMode("standard"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-icon", children: "\u270B" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-name", children: "Standard" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-desc", children: "Wait for approval" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `pipeline-start-mode-card yolo ${executionMode === "yolo" ? "selected" : ""}`,
            onClick: () => setExecutionMode("yolo"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-icon", children: "\u26A1" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-name", children: "YOLO" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-desc", children: "Auto-execute" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: `pipeline-start-mode-card ${executionMode === "dryrun" ? "selected" : ""}`,
            onClick: () => setExecutionMode("dryrun"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-icon", children: "\u{1F4DD}" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-name", children: "Dry Run" }),
              /* @__PURE__ */ jsx("span", { className: "pipeline-start-mode-desc", children: "Plan only" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-options-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "pipeline-start-toggle-group", children: [
        /* @__PURE__ */ jsxs("label", { className: "pipeline-start-toggle", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: autoCreatePr,
              onChange: (e) => setAutoCreatePr(e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "pipeline-start-toggle-slider" }),
          /* @__PURE__ */ jsx("span", { className: "pipeline-start-toggle-label", children: "Auto-create PR" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "pipeline-start-toggle", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: autoReview,
              onChange: (e) => setAutoReview(e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "pipeline-start-toggle-slider" }),
          /* @__PURE__ */ jsx("span", { className: "pipeline-start-toggle-label", children: "Auto-review" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-start-input-group", children: [
        /* @__PURE__ */ jsx("label", { className: "pipeline-start-small-label", children: "Max Budget" }),
        /* @__PURE__ */ jsxs("div", { className: "pipeline-start-budget-input", children: [
          /* @__PURE__ */ jsx("span", { className: "pipeline-start-budget-prefix", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: maxBudget,
              onChange: (e) => setMaxBudget(e.target.value),
              min: "0.01",
              max: "100",
              step: "0.01"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pipeline-start-input-group", children: [
        /* @__PURE__ */ jsx("label", { className: "pipeline-start-small-label", children: "Verbosity" }),
        /* @__PURE__ */ jsx("div", { className: "pipeline-start-verbosity-buttons", children: VERBOSITY_OPTIONS.map((opt) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `pipeline-start-verbosity-btn ${verbosity === opt.value ? "selected" : ""}`,
            onClick: () => setVerbosity(opt.value),
            title: opt.label,
            children: opt.icon
          },
          opt.value
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-advanced-section", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "pipeline-start-advanced-toggle",
          onClick: () => setShowAdvanced(!showAdvanced),
          children: [
            /* @__PURE__ */ jsx("span", { children: showAdvanced ? "\u25BC" : "\u25B6" }),
            /* @__PURE__ */ jsx("span", { children: "Agent Model Overrides" })
          ]
        }
      ),
      showAdvanced && /* @__PURE__ */ jsx("div", { className: "pipeline-start-agent-overrides", children: AGENTS.map((agent) => /* @__PURE__ */ jsxs("div", { className: "pipeline-start-agent-row", children: [
        /* @__PURE__ */ jsx("span", { className: "pipeline-start-agent-name", children: agent.label }),
        /* @__PURE__ */ jsxs("span", { className: "pipeline-start-agent-default", children: [
          "(",
          agent.defaultModel,
          ")"
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: agentOverrides[agent.id] || "default",
            onChange: (e) => handleAgentOverride(agent.id, e.target.value),
            className: "pipeline-start-agent-select",
            children: MODEL_OPTIONS.map((m) => /* @__PURE__ */ jsx("option", { value: m.value, children: m.label }, m.value))
          }
        )
      ] }, agent.id)) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "pipeline-start-error", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "pipeline-start-actions", children: [
      /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: handleSubmit,
          loading,
          icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", width: "16", height: "16", children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M5 12h14m-7-7l7 7-7 7",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          ) }),
          children: "Start Pipeline"
        }
      )
    ] })
  ] }) });
}
function useSessions(options = {}) {
  const {
    status: initialStatus = "all",
    pollInterval = 1e4,
    pageSize = 20,
    initialPage = 0
  } = options;
  const api = useApi();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [status, setStatus] = useState(initialStatus);
  const pollRef = useRef(null);
  const fetchSessions = useCallback(async () => {
    try {
      const result = await api.listSessions({
        status: status !== "all" ? status : void 0,
        source: "merged",
        limit: pageSize,
        offset: page * pageSize
      });
      const sortedSessions = [...result.sessions].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setSessions(sortedSessions);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch sessions"));
    } finally {
      setLoading(false);
    }
  }, [api, status, page, pageSize]);
  useEffect(() => {
    setLoading(true);
    fetchSessions();
    if (pollInterval > 0) {
      pollRef.current = setInterval(fetchSessions, pollInterval);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchSessions, pollInterval]);
  useEffect(() => {
    setPage(0);
  }, [status]);
  const totalPages = Math.ceil(total / pageSize);
  return {
    sessions,
    total,
    loading,
    error,
    page,
    totalPages,
    setPage,
    setStatus,
    refresh: fetchSessions
  };
}
function useSessionDetail(options) {
  const { pipelineId, pollInterval = 5e3 } = options;
  const api = useApi();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const fetchSession = useCallback(async () => {
    if (!pipelineId) {
      setSession(null);
      setLoading(false);
      return;
    }
    try {
      const result = await api.getSession(pipelineId);
      setSession(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch session"));
    } finally {
      setLoading(false);
    }
  }, [api, pipelineId]);
  useEffect(() => {
    setLoading(true);
    fetchSession();
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [pipelineId, fetchSession]);
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const isActive = session?.status === "running" || session?.status === "waiting_approval";
    if (isActive && pollInterval > 0) {
      pollRef.current = setInterval(fetchSession, pollInterval);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [session?.status, pollInterval, fetchSession]);
  return {
    session,
    loading,
    error,
    refresh: fetchSession
  };
}
function useWebSocket(pipelineId, options = {}) {
  const {
    onEvent,
    onStatusChange,
    autoReconnect = false,
    reconnectInterval = 5e3
  } = options;
  const api = useApi();
  const [status, setStatus] = useState("disconnected");
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const updateStatus = useCallback(
    (newStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );
  const connect = useCallback(() => {
    if (!pipelineId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    updateStatus("connecting");
    const wsUrl = api.getWebSocketUrl(pipelineId);
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      updateStatus("connected");
    };
    ws.onclose = () => {
      updateStatus("disconnected");
      wsRef.current = null;
      if (autoReconnect && pipelineId) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };
    ws.onerror = () => {
      updateStatus("error");
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event) {
          const event = data.event;
          setEvents((prev) => [...prev, event]);
          onEvent?.(event);
        }
        if (data.type === "connected" && data.events) {
          setEvents(data.events);
        }
        if (data.status) {
          onStatusChange?.(data.status);
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };
    wsRef.current = ws;
  }, [pipelineId, autoReconnect, reconnectInterval, updateStatus, onEvent, onStatusChange, api]);
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateStatus("disconnected");
  }, [updateStatus]);
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);
  useEffect(() => {
    if (pipelineId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [pipelineId]);
  return {
    status,
    events,
    connect,
    disconnect,
    clearEvents
  };
}

export { Badge, Button, HistoryView, Modal, PipelineProvider, StartPipelineModal, TimelineEvent, createApiClient, extractTaskId, formatBytes, formatCost, formatDate, formatDateTime, formatDuration, formatNumber, formatPercentage, formatRelativeTime, formatTime, formatTimestamp, getStatusColor, getStatusLabel, isMinorEvent, shouldHideEvent, truncate, useApi, useFeatures, useLabels, usePipelineConfig, useSessionDetail, useSessions, useWebSocket };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map