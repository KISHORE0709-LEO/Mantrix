export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  levels: Level[];
}

export type LevelStage = 'learn' | 'quiz' | 'game' | 'complete';

export interface GameConfig {
  id: string;
  type: 'loop-arena' | 'recursion-maze' | 'sorting-conveyor' | 'pattern-builder' | 'search-challenge' | 'backtracking-puzzle';
  title: string;
  description: string;
  objective: string;
  controls: string;
  timeLimit?: number;
  passingScore: number;
}

export interface Level {
  id: string;
  courseId: string;
  title: string;
  description: string;
  story: string;
  xpReward: number;
  challengeType: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  unlocked: boolean;
  completed: boolean;
  currentStage?: LevelStage;
  gameConfig?: GameConfig;
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
