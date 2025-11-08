export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  levels: Level[];
}

export type LevelStage = 'narrative' | 'teaching-game' | 'ai-videos' | 'assessment' | 'practice-game' | 'resources' | 'complete';

export interface GameConfig {
  id: string;
  type: 'loop-arena' | 'recursion-maze' | 'sorting-conveyor' | 'pattern-builder' | 'search-challenge' | 'backtracking-puzzle' | 'markup-forge' | 'style-spectrum' | 'script-circuit' | 'component-link' | 'service-runner' | 'data-bridge' | 'deploy-orbit';
  title: string;
  description: string;
  objective: string;
  controls: string;
  timeLimit?: number;
  passingScore: number;
  importanceWhy?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  solution: string;
  testCases: CodingTestCase[];
  hints: string[];
  timeLimit?: number;
  tags: string[];
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: 'leetcode' | 'neetcode' | 'hackerrank' | 'codeforces' | 'youtube' | 'article' | 'documentation';
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'short-answer' | 'code-snippet';
}

export interface Level {
  id: string;
  courseId: string;
  title: string;
  description: string;
  story: string;
  narrative?: string;
  xpReward: number;
  challengeType: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  unlocked: boolean;
  completed: boolean;
  currentStage?: LevelStage;
  gameConfig?: GameConfig;
  quizPassScore?: number;
  teachingContent?: string;
  quizQuestions?: QuizQuestion[];
  codingProblems?: CodingProblem[];
  externalResources?: ExternalResource[];
  videoTopic?: string;
}

export interface GameProgress {
  levelId: string;
  gameId: string;
  attempts: number;
  bestScore: number;
  timeSpent: number;
  completed: boolean;
}

export interface GameResult {
  score: number;
  timeSpent: number;
  success: boolean;
  xpEarned: number;
}

export interface UserProgress {
  userId: string;
  totalXP: number;
  level: number;
  badges: Badge[];
  completedLevels: string[];
  currentCourse: string | null;
  currentLevel: string | null;
  currentGame?: GameProgress | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

export interface Challenge {
  id: string;
  levelId: string;
  type: 'coding' | 'quiz' | 'interactive';
  question: string;
  hints: string[];
  solution?: string;
  testCases?: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AICompanionState {
  isActive: boolean;
  messages: AIMessage[];
  currentHint: string | null;
  adaptiveDifficulty: number;
}
