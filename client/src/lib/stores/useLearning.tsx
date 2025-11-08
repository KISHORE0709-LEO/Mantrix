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
      { id: 'dsa-1', courseId: 'dsa', title: 'Introduction to Programming', description: 'Learn loops, variables, and conditionals', story: 'Welcome to the Valley of Variables! Master loops and conditionals to begin your journey.', xpReward: 100, challengeType: 'interactive', difficulty: 'beginner', unlocked: true, completed: false, currentStage: 'teaching-game', gameConfig: { id: 'loop-arena-1', type: 'loop-arena', title: 'Loop Arena: Valley of Variables', description: 'Learn loops by collecting items', objective: 'Collect all items using loop patterns', controls: 'WASD or Arrow Keys', passingScore: 90 } },
      { id: 'dsa-2', courseId: 'dsa', title: 'Arrays & Lists', description: 'Understanding indexed collections', story: 'Enter the Array Temple where data is stored in ordered sequences.', xpReward: 120, challengeType: 'interactive', difficulty: 'beginner', unlocked: false, completed: false, currentStage: 'learn', gameConfig: { id: 'sorting-conveyor-2', type: 'sorting-conveyor', title: 'Array Organizer', description: 'Learn arrays by organizing items', objective: 'Sort items by value', controls: 'Click to swap items', passingScore: 100 } },
      { id: 'dsa-3', courseId: 'dsa', title: 'Searching Algorithms', description: 'Linear and binary search', story: 'In the Forest of Search, find treasures using efficient search strategies.', xpReward: 130, challengeType: 'interactive', difficulty: 'beginner', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-4', courseId: 'dsa', title: 'Linked Lists', description: 'Understanding node-based data structures', story: 'Navigate the Chain Bridge where each node points to the next.', xpReward: 140, challengeType: 'interactive', difficulty: 'beginner', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-5', courseId: 'dsa', title: 'Stacks', description: 'Last-In-First-Out (LIFO) operations', story: 'Climb the Tower of Stacks where the last item added is first removed.', xpReward: 150, challengeType: 'interactive', difficulty: 'beginner', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-6', courseId: 'dsa', title: 'Queues', description: 'First-In-First-Out (FIFO) operations', story: 'Join the Queue Kingdom where fairness rules - first come, first served!', xpReward: 150, challengeType: 'interactive', difficulty: 'beginner', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-7', courseId: 'dsa', title: 'Hash Tables', description: 'Key-value pairs and hashing', story: 'Unlock the Hash Vault where keys open instant access to treasures.', xpReward: 160, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-8', courseId: 'dsa', title: 'Binary Trees', description: 'Hierarchical tree structures', story: 'Explore the Binary Forest where each node has at most two children.', xpReward: 170, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-9', courseId: 'dsa', title: 'Binary Search Trees', description: 'Ordered binary trees for fast lookup', story: 'Master the BST Cathedral where left is less, right is more.', xpReward: 180, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-10', courseId: 'dsa', title: 'Tree Traversals', description: 'Inorder, preorder, postorder, and level-order', story: 'Navigate the Traversal Maze using different paths through the trees.', xpReward: 190, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn', gameConfig: { id: 'recursion-maze-10', type: 'recursion-maze', title: 'Traversal Maze', description: 'Navigate using tree traversal patterns', objective: 'Reach all checkpoints in order', controls: 'Arrow Keys', passingScore: 90 } },
      { id: 'dsa-11', courseId: 'dsa', title: 'Heaps & Priority Queues', description: 'Min-heap and max-heap structures', story: 'Scale the Heap Mountain where priority determines position.', xpReward: 200, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-12', courseId: 'dsa', title: 'Graphs - Basics', description: 'Vertices, edges, and representations', story: 'Map the Graph Galaxy where everything connects to everything.', xpReward: 210, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-13', courseId: 'dsa', title: 'Graph Traversals (DFS/BFS)', description: 'Depth-first and breadth-first search', story: 'Explore the Network Nexus using systematic traversal strategies.', xpReward: 220, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-14', courseId: 'dsa', title: 'Sorting - Bubble & Selection', description: 'Simple comparison-based sorting', story: 'Start at the Sorting Academy with fundamental techniques.', xpReward: 230, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-15', courseId: 'dsa', title: 'Sorting - Merge & Quick', description: 'Divide-and-conquer sorting algorithms', story: 'Master advanced sorting in the Algorithm Arena.', xpReward: 240, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-16', courseId: 'dsa', title: 'Recursion', description: 'Functions calling themselves', story: 'Descend into the Recursive Abyss where functions call themselves infinitely.', xpReward: 250, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-17', courseId: 'dsa', title: 'Backtracking', description: 'Exploring all possibilities', story: 'Navigate the Backtracking Labyrinth by trying all paths.', xpReward: 260, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-18', courseId: 'dsa', title: 'Dynamic Programming - Basics', description: 'Optimization using memoization', story: 'Unlock the DP Dimension where remembering saves time.', xpReward: 270, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-19', courseId: 'dsa', title: 'Greedy Algorithms', description: 'Making locally optimal choices', story: 'Join the Greedy Guild where best now means best overall.', xpReward: 280, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'learn' },
      { id: 'dsa-20', courseId: 'dsa', title: 'Advanced Topics', description: 'Tries, segment trees, and beyond', story: 'Reach the Masters Summit with the most complex structures.', xpReward: 300, challengeType: 'interactive', difficulty: 'expert', unlocked: false, completed: false, currentStage: 'learn' },
    ]
  },
  {
    id: 'webdev',
    name: 'Web Development',
    description: 'Build the Matrix - Your AI Gamified Full Stack Journey',
    icon: '🌐',
    color: '#8b5cf6',
    levels: [
      {
        id: 'web-1',
        courseId: 'webdev',
        title: 'Enter the Matrix (HTML Basics)',
        description: 'Build the world using HTML blocks',
        story: 'You awaken in the Matrix — the world is blank; you must build it.',
        narrative: 'The Matrix world needs structure. Every website begins with HTML - the skeleton that holds everything together. You will learn to create headings, paragraphs, links, images, lists, tables, and semantic tags that give meaning to your content.',
        teachingContent: 'HTML (HyperText Markup Language) is the foundation of all web pages. Think of it as the blueprint of a building - it defines what goes where. Tags like <h1>, <p>, <img>, and <a> are your building blocks.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 70,
        gameConfig: {
          id: 'markup-forge-1',
          type: 'markup-forge',
          title: 'The Builder\'s Origin',
          description: 'Construct the digital city using HTML blocks',
          objective: 'Build structures by placing correct HTML elements',
          controls: 'Click to place elements, WASD to move',
          passingScore: 80,
          importanceWhy: 'This game teaches you how HTML elements work together to create structure. Just like building blocks, each HTML tag has a specific purpose. Understanding this foundation is crucial because every website you\'ll ever build starts with HTML structure.'
        }
      },
      {
        id: 'web-2',
        courseId: 'webdev',
        title: 'The Stylist\'s Realm (CSS)',
        description: 'Color the Matrix with CSS styling',
        story: 'You\'ve built the structure, now bring color and beauty to the Matrix.',
        narrative: 'The Matrix city exists but it\'s gray and lifeless. CSS (Cascading Style Sheets) is your tool to paint this world - colors, layouts, animations, and responsive designs that adapt to any screen.',
        teachingContent: 'CSS controls how HTML elements look. Selectors target elements, properties define styles. The box model (margin, padding, border) controls spacing. Flexbox and Grid create layouts. Animations bring life to static pages.',
        xpReward: 180,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 75,
        gameConfig: {
          id: 'style-spectrum-2',
          type: 'style-spectrum',
          title: 'Design the City',
          description: 'Transform the grayscale city with CSS styling',
          objective: 'Apply correct styles to restore color and layout',
          controls: 'Select elements and apply CSS properties',
          passingScore: 85,
          importanceWhy: 'Styling is what separates amateur websites from professional ones. This game shows you how CSS properties work together - colors, layouts, spacing, and responsive design. Mastering CSS means you can bring any design vision to life.'
        }
      },
      {
        id: 'web-3',
        courseId: 'webdev',
        title: 'The Logic Chamber (JavaScript)',
        description: 'Give life to the Matrix with JavaScript logic',
        story: 'The city is beautiful but static. JavaScript brings intelligence and interactivity.',
        narrative: 'Now the Matrix needs a brain. JavaScript makes websites interactive - responding to clicks, processing data, updating content dynamically. You\'ll learn variables, functions, loops, events, and how to manipulate the DOM.',
        teachingContent: 'JavaScript is the programming language of the web. Variables store data, functions perform actions, loops repeat tasks, and events respond to user interactions. The DOM (Document Object Model) lets you change HTML and CSS on the fly.',
        xpReward: 220,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 75,
        gameConfig: {
          id: 'script-circuit-3',
          type: 'script-circuit',
          title: 'The Code Core',
          description: 'Fix broken bots using JavaScript commands',
          objective: 'Write JavaScript logic to activate circuit nodes',
          controls: 'Type code, click to execute',
          passingScore: 80,
          importanceWhy: 'JavaScript is where web development becomes powerful. This game demonstrates core programming concepts - variables, functions, loops - in a visual way. Every interactive feature you\'ve ever used on a website uses JavaScript.'
        }
      },
      {
        id: 'web-4',
        courseId: 'webdev',
        title: 'The Portal of Components (React.js)',
        description: 'Master component-based architecture',
        story: 'You can now manipulate the Matrix using reusable components.',
        narrative: 'Building complex interfaces one element at a time is inefficient. React teaches you to think in components - reusable, composable pieces that manage their own state and can be combined to build sophisticated applications.',
        teachingContent: 'React is a JavaScript library for building user interfaces. Components are like custom HTML tags you create. Props pass data down, State manages data within. Hooks like useState and useEffect add functionality. React makes complex UIs manageable.',
        xpReward: 280,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        gameConfig: {
          id: 'component-link-4',
          type: 'component-link',
          title: 'Build the Resistance Network',
          description: 'Create a dashboard by connecting React components',
          objective: 'Link components with correct props and state',
          controls: 'Drag to connect, click to configure',
          passingScore: 85,
          importanceWhy: 'React revolutionized web development by introducing component thinking. This game shows how components communicate through props, manage internal state, and compose into complex interfaces. Understanding this pattern is essential for modern web development.'
        }
      },
      {
        id: 'web-5',
        courseId: 'webdev',
        title: 'The Underworld of Servers (Node.js + Express)',
        description: 'Build the backend infrastructure',
        story: 'The Matrix backend is corrupted — rebuild it with server logic.',
        narrative: 'Every website needs a server - something that stores data, processes requests, and sends responses. Node.js lets you write server code in JavaScript. Express makes it easy to create APIs that your frontend can talk to.',
        teachingContent: 'Node.js runs JavaScript outside the browser. Express is a framework for building web servers. REST APIs use HTTP methods (GET, POST, PUT, DELETE) to perform operations. Routing directs requests, middleware processes them, and responses send data back.',
        xpReward: 320,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        gameConfig: {
          id: 'service-runner-5',
          type: 'service-runner',
          title: 'Server Reboot Protocol',
          description: 'Repair server nodes through API routing puzzles',
          objective: 'Connect routes to correct handlers and middleware',
          controls: 'Click to route requests, configure endpoints',
          passingScore: 85,
          importanceWhy: 'Backend development is where data lives. This game visualizes how HTTP requests flow through routes and middleware to endpoints. Understanding the server-side is crucial - without it, your frontend has nowhere to save or fetch data.'
        }
      },
      {
        id: 'web-6',
        courseId: 'webdev',
        title: 'The Memory Grid (Database)',
        description: 'Restore the world\'s data and memory',
        story: 'Data fragments are lost — restore the Matrix\'s memory with database operations.',
        narrative: 'Your application needs to remember things - user accounts, posts, settings. Databases store this information permanently. You\'ll learn about SQL vs NoSQL, creating schemas, relationships between data, and performing CRUD operations.',
        teachingContent: 'Databases persist data beyond page refreshes. SQL databases (PostgreSQL, MySQL) use structured tables with relationships. NoSQL databases (MongoDB) use flexible documents. Schemas define data structure. CRUD means Create, Read, Update, Delete - the four basic operations.',
        xpReward: 350,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        gameConfig: {
          id: 'data-bridge-6',
          type: 'data-bridge',
          title: 'Data Reconstruction',
          description: 'Collect and connect data shards into meaningful relationships',
          objective: 'Build database schema and establish relationships',
          controls: 'Drag tables, connect relationships',
          passingScore: 85,
          importanceWhy: 'Databases are the foundation of data-driven applications. This game shows how data relates - users have posts, posts have comments. Understanding relationships and schema design determines how well your application scales and performs.'
        }
      },
      {
        id: 'web-7',
        courseId: 'webdev',
        title: 'The Final Layer (Deployment & Integration)',
        description: 'Release your creation to the real world',
        story: 'It\'s time to release the Matrix to the world beyond.',
        narrative: 'You\'ve built a complete application - frontend, backend, and database. Now you need to deploy it so anyone can access it. Learn about environment variables, version control with Git, CI/CD pipelines, and deployment platforms.',
        teachingContent: 'Deployment means making your app accessible on the internet. Git tracks code changes. Environment variables store secrets securely. CI/CD automates testing and deployment. Platforms like Render, Vercel, and Replit host your application. HTTPS encrypts connections.',
        xpReward: 400,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 85,
        gameConfig: {
          id: 'deploy-orbit-7',
          type: 'deploy-orbit',
          title: 'The Great Launch',
          description: 'Deploy your project and launch it to production',
          objective: 'Configure deployment pipeline and fix environment issues',
          controls: 'Click to configure, solve deployment puzzles',
          passingScore: 90,
          importanceWhy: 'Building something amazing means nothing if no one can use it. This game simulates real deployment challenges - environment variables, build errors, DNS configuration. Mastering deployment means you can ship your ideas to real users.'
        }
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
        const stageOrder: LevelStage[] = ['narrative', 'teaching-game', 'learn', 'quiz', 'ai-videos', 'practice-game', 'complete'];
        
        const state = get();
        const level = state.courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);
        
        if (!level) {
          console.error(`Level ${levelId} not found`);
          return false;
        }
        
        const currentStage = level.currentStage || 'teaching-game';
        
        if (currentStage === newStage) {
          console.warn(`Level already on stage ${newStage}`);
          return false;
        }
        
        const currentIndex = stageOrder.indexOf(currentStage);
        const newIndex = stageOrder.indexOf(newStage);
        
        const hasGame = !!level.gameConfig;
        
        const isValidTransition = 
          newIndex > currentIndex ||
          (newIndex === stageOrder.indexOf('complete') && !hasGame && currentStage === 'quiz') ||
          (newIndex === 0 && currentStage !== 'teaching-game');
        
        if (!isValidTransition) {
          console.error(`Invalid stage transition from ${currentStage} to ${newStage}`);
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
        if (currentStage !== 'practice-game') {
          console.error(`Cannot start game from stage ${currentStage}. Must be in practice-game stage.`);
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
        
        return true;
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
