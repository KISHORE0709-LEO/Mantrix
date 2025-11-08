import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, Level, UserProgress, Badge, AICompanionState, GameResult, LevelStage } from "@shared/types";

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface LearningState {
  user: User | null;
  courses: Course[];
  userProgress: UserProgress;
  aiCompanion: AICompanionState;
  
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  syncProgress: () => Promise<void>;
  
  setCourses: (courses: Course[]) => void;
  selectCourse: (courseId: string) => void;
  selectLevel: (levelId: string) => void;
  advanceStage: (levelId: string, newStage: LevelStage) => boolean;
  startGame: (levelId: string) => boolean;
  completeGame: (levelId: string, result: GameResult) => Promise<void>;
  completeLevel: (levelId: string, xpEarned: number) => Promise<void>;
  addBadge: (badge: Badge) => Promise<void>;
  updateAIMessages: (message: { role: 'user' | 'assistant'; content: string }) => void;
  toggleAICompanion: () => void;
  setCurrentHint: (hint: string | null) => void;
}

const initialCourses: Course[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Master the fundamentals of computer science',
    icon: '🧠',
    color: '#6366f1',
    levels: [
      {
        id: 'dsa-1',
        courseId: 'dsa',
        title: 'Introduction to Programming',
        description: 'Learn the basics of loops and variables',
        story: 'Welcome, young coder! Your journey begins in the Valley of Variables, where you must master the ancient art of loops to unlock the next realm.',
        xpReward: 100,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
        currentStage: 'learn',
        gameConfig: {
          id: 'loop-arena-1',
          type: 'loop-arena',
          title: 'Loop Arena: Valley of Variables',
          description: 'Navigate through obstacles using loop patterns',
          objective: 'Collect 10 data crystals by moving in loop patterns. Use arrow keys to move.',
          controls: 'WASD or Arrow Keys to move, SPACE to jump',
          passingScore: 10,
        },
      },
      {
        id: 'dsa-2',
        courseId: 'dsa',
        title: 'Arrays & Lists',
        description: 'Understanding data collections',
        story: 'The Array Temple awaits. Master the power of indexed collections to continue your quest.',
        xpReward: 150,
        challengeType: 'coding',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'learn',
        gameConfig: {
          id: 'sorting-conveyor-1',
          type: 'sorting-conveyor',
          title: 'Sorting Conveyor: Array Temple',
          description: 'Organize items on the conveyor belt in the correct order',
          objective: 'Sort 15 items correctly within 60 seconds',
          controls: 'Click and drag items to sort them',
          timeLimit: 60,
          passingScore: 15,
        },
      },
      {
        id: 'dsa-3',
        courseId: 'dsa',
        title: 'Searching Algorithms',
        description: 'Binary search and linear search',
        story: 'In the Forest of Search, you must find the hidden treasures using the most efficient paths.',
        xpReward: 200,
        challengeType: 'coding',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'learn',
        gameConfig: {
          id: 'search-challenge-1',
          type: 'search-challenge',
          title: 'Search Challenge: Forest of Discovery',
          description: 'Find hidden treasures using efficient search strategies',
          objective: 'Locate 5 hidden treasures in the forest. Use binary search for optimal paths.',
          controls: 'Arrow keys to navigate, SPACE to search',
          timeLimit: 90,
          passingScore: 5,
        },
      }
    ]
  },
  {
    id: 'webdev',
    name: 'Web Development',
    description: 'Build modern web applications',
    icon: '🌐',
    color: '#8b5cf6',
    levels: [
      {
        id: 'web-1',
        courseId: 'webdev',
        title: 'HTML Basics',
        description: 'Structure your first webpage',
        story: 'Welcome to the HTML Kingdom! Learn to build the foundation of all web pages.',
        xpReward: 100,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
      },
      {
        id: 'web-2',
        courseId: 'webdev',
        title: 'CSS Styling',
        description: 'Make your pages beautiful',
        story: 'Enter the CSS Castle where colors and styles bring life to your creations.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
      },
      {
        id: 'web-3',
        courseId: 'webdev',
        title: 'JavaScript Fundamentals',
        description: 'Add interactivity to your sites',
        story: 'The JavaScript Jungle holds the key to dynamic and interactive web experiences.',
        xpReward: 200,
        challengeType: 'coding',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
      }
    ]
  },
  {
    id: 'aiml',
    name: 'AI & Machine Learning',
    description: 'Explore artificial intelligence',
    icon: '🤖',
    color: '#ec4899',
    levels: [
      {
        id: 'ai-1',
        courseId: 'aiml',
        title: 'Introduction to AI',
        description: 'What is artificial intelligence?',
        story: 'Welcome to the AI Realm, where machines learn and evolve!',
        xpReward: 100,
        challengeType: 'quiz',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
      },
      {
        id: 'ai-2',
        courseId: 'aiml',
        title: 'Neural Networks',
        description: 'Understanding brain-inspired computing',
        story: 'Dive into the Neural Network Nexus and unlock the secrets of machine cognition.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
      }
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    description: 'Deploy and scale applications',
    icon: '☁️',
    color: '#10b981',
    levels: [
      {
        id: 'cloud-1',
        courseId: 'cloud',
        title: 'Cloud Computing Basics',
        description: 'Introduction to cloud platforms',
        story: 'Ascend to the Cloud City and learn to deploy your applications to the sky!',
        xpReward: 100,
        challengeType: 'quiz',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
      },
      {
        id: 'cloud-2',
        courseId: 'cloud',
        title: 'Docker Containers',
        description: 'Containerize your applications',
        story: 'Master the art of containerization in the Docker Docks.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
      }
    ]
  }
];

export const useLearning = create<LearningState>()(
  persist(
    (set, get) => ({
      user: null,
      courses: initialCourses,
      userProgress: {
        userId: 'guest',
        totalXP: 0,
        level: 1,
        badges: [],
        completedLevels: [],
        currentCourse: null,
        currentLevel: null,
      },
      aiCompanion: {
        isActive: false,
        messages: [],
        currentHint: null,
        adaptiveDifficulty: 1,
      },
      
      login: async (username: string, password: string) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        set({ user: data.user });
        
        await get().syncProgress();
      },
      
      signup: async (username: string, password: string, email?: string) => {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, email }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Signup failed');
        }
        
        const data = await response.json();
        set({ user: data.user });
        
        await get().syncProgress();
      },
      
      logout: () => {
        set({
          user: null,
          userProgress: {
            userId: 'guest',
            totalXP: 0,
            level: 1,
            badges: [],
            completedLevels: [],
            currentCourse: null,
            currentLevel: null,
          }
        });
      },
      
      syncProgress: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const response = await fetch(`/api/progress`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.progress) {
              set((state) => ({
                userProgress: {
                  userId: user.id.toString(),
                  totalXP: data.progress.totalXP || 0,
                  level: data.progress.level || 1,
                  badges: data.badges || [],
                  completedLevels: data.completedLevels?.map((cl: any) => cl.levelId) || [],
                  currentCourse: data.progress.currentCourse,
                  currentLevel: data.progress.currentLevel,
                },
                courses: state.courses.map(course => ({
                  ...course,
                  levels: course.levels.map((level, index) => {
                    const isCompleted = data.completedLevels?.some((cl: any) => cl.levelId === level.id);
                    const prevCompleted = index === 0 || data.completedLevels?.some((cl: any) => cl.levelId === course.levels[index - 1].id);
                    return {
                      ...level,
                      completed: isCompleted,
                      unlocked: index === 0 || prevCompleted,
                    };
                  })
                }))
              }));
            }
          }
        } catch (error) {
          console.error('Failed to sync progress:', error);
        }
      },
      
      setCourses: (courses) => set({ courses }),
      
      selectCourse: (courseId) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          currentCourse: courseId,
          currentLevel: null,
        }
      })),
      
      selectLevel: (levelId) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          currentLevel: levelId,
        }
      })),
      
      advanceStage: (levelId, newStage) => {
        const stageOrder: LevelStage[] = ['learn', 'quiz', 'game', 'complete'];
        
        const state = get();
        const level = state.courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);
        
        if (!level) {
          console.error(`Level ${levelId} not found`);
          return false;
        }
        
        const currentStage = level.currentStage || 'learn';
        
        if (currentStage === newStage) {
          console.warn(`Level already on stage ${newStage}`);
          return false;
        }
        
        const currentIndex = stageOrder.indexOf(currentStage);
        const newIndex = stageOrder.indexOf(newStage);
        
        const isValidTransition = 
          newIndex === currentIndex + 1 ||
          (newIndex === 0 && currentStage !== 'learn');
        
        if (!isValidTransition) {
          const expected = stageOrder[currentIndex + 1];
          console.error(`Invalid stage transition from ${currentStage} to ${newStage}. Expected ${expected || 'complete'}`);
          return false;
        }
        
        set((state) => ({
          courses: state.courses.map(course => ({
            ...course,
            levels: course.levels.map(level =>
              level.id === levelId
                ? { ...level, currentStage: newStage }
                : level
            )
          }))
        }));
        
        return true;
      },
      
      startGame: (levelId) => {
        const { courses, userProgress } = get();
        const level = courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);
        
        if (!level?.gameConfig) {
          console.error('No game config found for level:', levelId);
          return false;
        }
        
        const currentStage = level.currentStage || 'learn';
        if (currentStage !== 'quiz') {
          console.error(`Cannot start game from stage ${currentStage}. Must complete quiz first.`);
          return false;
        }
        
        const existingGame = userProgress.currentGame;
        const isResuming = existingGame?.levelId === levelId;
        
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            currentGame: {
              levelId,
              gameId: level.gameConfig!.id,
              attempts: isResuming && existingGame ? existingGame.attempts : 0,
              bestScore: isResuming && existingGame ? existingGame.bestScore : 0,
              timeSpent: isResuming && existingGame ? existingGame.timeSpent : 0,
              completed: false,
            }
          }
        }));
        
        const advanced = get().advanceStage(levelId, 'game');
        return advanced;
      },
      
      completeGame: async (levelId, result) => {
        const { userProgress } = get();
        
        const currentGame = userProgress.currentGame;
        if (!currentGame) {
          console.error('No active game session to complete');
          return;
        }
        
        const newBestScore = Math.max(currentGame.bestScore, result.score);
        const newAttempts = currentGame.attempts + 1;
        const newTimeSpent = currentGame.timeSpent + result.timeSpent;
        
        if (result.success) {
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: {
                ...currentGame,
                attempts: newAttempts,
                bestScore: newBestScore,
                timeSpent: newTimeSpent,
                completed: true,
              }
            }
          }));
          
          await get().completeLevel(levelId, result.xpEarned);
          
          get().advanceStage(levelId, 'complete');
          
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: null,
            }
          }));
        } else {
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: {
                ...currentGame,
                attempts: newAttempts,
                bestScore: newBestScore,
                timeSpent: newTimeSpent,
              }
            }
          }));
        }
      },
      
      completeLevel: async (levelId, xpEarned) => {
        const { user, userProgress, courses } = get();
        const newTotalXP = userProgress.totalXP + xpEarned;
        const newLevel = Math.floor(newTotalXP / 500) + 1;
        
        const courseId = courses.find(c => c.levels.some(l => l.id === levelId))?.id || '';
        
        const updatedCourses = courses.map(course => ({
          ...course,
          levels: course.levels.map((level, index) => {
            if (level.id === levelId) {
              return { ...level, completed: true };
            }
            if (course.levels[index - 1]?.id === levelId) {
              return { ...level, unlocked: true };
            }
            return level;
          })
        }));
        
        set({
          courses: updatedCourses,
          userProgress: {
            ...userProgress,
            totalXP: newTotalXP,
            level: newLevel,
            completedLevels: [...userProgress.completedLevels, levelId],
          }
        });
        
        if (user) {
          try {
            await fetch('/api/progress/complete-level', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ levelId, courseId, xpEarned }),
            });
            
            await fetch('/api/progress/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                totalXP: newTotalXP,
                level: newLevel,
                currentCourse: courseId,
                currentLevel: levelId,
              }),
            });
          } catch (error) {
            console.error('Failed to save progress to database:', error);
          }
        }
      },
      
      addBadge: async (badge) => {
        const { user } = get();
        
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            badges: [...state.userProgress.badges, badge],
          }
        }));
        
        if (user) {
          try {
            await fetch('/api/badges/earn', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                badgeId: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                rarity: badge.rarity || 'common',
              }),
            });
          } catch (error) {
            console.error('Failed to save badge to database:', error);
          }
        }
      },
      
      updateAIMessages: (message) => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          messages: [
            ...state.aiCompanion.messages,
            { ...message, timestamp: new Date() }
          ]
        }
      })),
      
      toggleAICompanion: () => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          isActive: !state.aiCompanion.isActive,
        }
      })),
      
      setCurrentHint: (hint) => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          currentHint: hint,
        }
      })),
    }),
    {
      name: 'skillquest-learning',
    }
  )
);
