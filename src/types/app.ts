export type ScreenTab = 'map' | 'trainer' | 'lab' | 'business';

export type NodeStatus = 'completed' | 'current' | 'available' | 'locked';

export type InteractiveWidgetType =
  | 'tokenizer'
  | 'temperature'
  | 'prompt-anatomy'
  | 'react-loop'
  | 'mvp-stack'
  | 'unit-economics'
  | 'rag-pipeline'
  | 'mcp-router'
  | 'strategy-matrix'
  | 'evals-judge'
  | 'guardrails-redteam';

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  aiQueryHint?: string;
}

export interface SkillNode {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  subtitle: string;
  durationMin: number;
  xpReward: number;
  crystalReward: number;
  conceptTitle: string;
  conceptSummary: string;
  widgetType: InteractiveWidgetType;
  quiz: QuizQuestion[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  accent: 'cyan' | 'violet' | 'emerald' | 'amber';
  nodes: SkillNode[];
}

export interface PromptQuest {
  id: string;
  title: string;
  category: string;
  difficulty: 'Базовый' | 'Средний' | 'Продвинутый';
  xpReward: number;
  crystalReward: number;
  scenario: string;
  goal: string;
  criteria: string[];
  starterPrompt: string;
  blocks: {
    label: string;
    snippet: string;
  }[];
  hint: string;
}

export interface PromptEvalResult {
  scores: {
    clarity: number;
    context: number;
    roleFormat: number;
    total: number;
  };
  feedback: string;
  improvementTip: string;
  simulatedOutput: string;
  passed: boolean;
}

export interface AgentRunResult {
  thought: string;
  toolUsed: string;
  toolResult: string;
  finalAnswer: string;
  safetyStatus?: string;
}

export interface BusinessCase {
  id: string;
  modelName: string;
  title: string;
  avgCheckRub: number;
  timeToLaunch: string;
  marginPercent: number;
  summary: string;
  stack: string[];
  decisionScenario: {
    situation: string;
    options: {
      text: string;
      isOptimal: boolean;
      outcome: string;
    }[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpBonus: number;
  conditionLabel: string;
}

export type WeeklyMetricKey = 'lessons' | 'quests' | 'agents' | 'mvps' | 'cases' | 'mentor';

export interface WeeklyBadge {
  id: string;
  title: string;
  subtitle: string;
  accent: 'cyan' | 'violet' | 'amber' | 'emerald';
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  metric: WeeklyMetricKey;
  target: number;
  crystalReward: number;
  xpReward: number;
  badge?: WeeklyBadge;
}

export interface WeeklyState {
  weekKey: string;
  counts: Record<WeeklyMetricKey, number>;
  claimedMissionIds: string[];
}

export interface NodeScoreRecord {
  scorePct: number;
  mistakes: number;
  totalQuestions: number;
  completedAt: string;
}

export interface StudentRegistration {
  fullName: string;
  email: string;
  location: string;
  specialty: string;
  registeredAt: string;
}

export interface StageCertificateMeta {
  id: string;
  chapterId: string | 'all';
  title: string;
  qualification: string;
  bonusXp: number;
  bonusCrystals: number;
  accent: 'cyan' | 'violet' | 'emerald' | 'amber';
}

export interface PlayerProgress {
  xp: number;
  streakDays: number;
  crystals: number;
  energy: number;
  maxEnergy: number;
  completedNodeIds: string[];
  nodeScores: Record<string, NodeScoreRecord>;
  claimedStageIds: string[];
  completedQuestIds: string[];
  completedCaseIds: string[];
  agentsRunCount: number;
  mvpsBuiltCount: number;
  unlockedAchievementIds: string[];
  weekly: WeeklyState;
  earnedWeeklyBadges: WeeklyBadge[];
  registration: StudentRegistration | null;
}
