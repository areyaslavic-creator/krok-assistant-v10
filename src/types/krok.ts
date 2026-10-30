/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentLineId =
  | 'line1_web'
  | 'line2_prompts'
  | 'line3_scraping'
  | 'line4_factcheck'
  | 'line5_productivity'
  | 'line6_automation'
  | 'line7_recipes';

export interface AgentLineMeta {
  id: AgentLineId;
  lineNumber: number;
  titleUa: string;
  titleEn: string;
  subtitleUa: string;
  subtitleEn: string;
  icon: string;
  accentColor: string;
  badge: string;
  descriptionUa: string;
  descriptionEn: string;
  coreCapabilities: string[];
}

export interface WebTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  archetype: 'SEO' | 'Legal' | 'QA' | 'FactChecker' | 'Ethnography';
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  platform: 'n8n' | 'Make' | 'SendPulse' | 'Telegram';
  description: string;
  jsonBlueprint: any;
}

export interface RecipeTemplate {
  id: string;
  title: string;
  category: string;
  proportions: Array<{ ingredient: string; amount: string; percentage: number }>;
  instructions: string[];
  safetyCheck: string;
  shelfLife: string;
}

export interface DagNode {
  id: string;
  agentLine: AgentLineId;
  label: string;
  inputDescription: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output?: string;
  critiqueScore?: number;
  dependencies: string[];
}

export interface DagPreset {
  id: string;
  titleUa: string;
  titleEn: string;
  descriptionUa: string;
  descriptionEn: string;
  nodes: DagNode[];
}

export interface CritiqueResult {
  score: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  flaws: string[];
  improvedContent: string;
  iteration?: number;
}

export interface CredibilityCheckResult {
  statement: string;
  source: string;
  credibilityScore: number;
  threshold: number;
  status: 'verified' | 'filtered' | 'folklore_preserved';
  isFolklore: boolean;
  reason: string;
  recommendation: string;
}

export interface RagDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  chunks: string[];
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  hits: number;
}

export interface FeedbackItem {
  id: string;
  taskId: string;
  agentLine: string;
  rating: number;
  comment?: string;
  reinforced: boolean;
  timestamp: string;
  promptPattern?: string;
}

export interface VaultFinding {
  type: string;
  match: string;
  masked: string;
}

export interface VaultScanResult {
  clean: boolean;
  leakScore: number;
  findingsCount: number;
  findings: VaultFinding[];
  maskedText: string;
  vaultEncryptedToken?: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  line: string;
  status: 'active' | 'paused' | 'running';
  lastRun: string;
  nextRun: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  category: string;
  lineCount: number;
  tokenEstimate: number;
  sha256: string;
  content: string;
  chunks: string[];
  uploadedAt: string;
  targetLine?: AgentLineId | 'rag_knowledge' | 'all';
  thumbnailUrl?: string;
  dimensions?: string;
}

export type AgentWorkStatus = 'idle' | 'thinking' | 'executing' | 'critiquing' | 'verifying' | 'completed' | 'paused';

export interface SwarmAgentState {
  id: string;
  name: string;
  codeName: string;
  line: AgentLineId | 'orchestrator' | 'critique' | 'security' | 'audit';
  roleUa: string;
  roleEn: string;
  status: AgentWorkStatus;
  currentTask: string;
  progress: number;
  toolCalls: number;
  tokensProcessed: number;
  latencyMs: number;
  avatarColor: string;
}

export interface SwarmLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  level: 'info' | 'tool' | 'security' | 'critique' | 'success' | 'warn';
  message: string;
  details?: string;
}

export interface SwarmHistoryItem {
  id: string;
  missionTitle: string;
  timestamp: string;
  formattedTime: string;
  prompt: string;
  agentLine: string;
  attachedFileName?: string;
  outputType: 'html' | 'json' | 'markdown' | 'text';
  outputContent: string;
  tokensProcessed: number;
  durationMs: number;
  critiqueScore?: number;
  securityAuditPassed: boolean;
  stepsCount: number;
  agentSummary?: string;
}

