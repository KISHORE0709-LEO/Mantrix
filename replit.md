# SkillQuest - Gamified Learning Platform

## Overview

SkillQuest is a 2D gamified skill-learning platform where students embark on story-driven educational journeys. Users select courses (DSA, AI/ML, Web Development, etc.) and progress through interactive levels designed as game-like challenges. The platform features an AI-powered learning companion that provides personalized hints, generates adaptive challenges, offers explanations, and delivers motivational messages based on user performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with custom configuration for client-side routing
- TailwindCSS for utility-first styling with custom game-themed color palette and animations
- Radix UI component library for accessible, unstyled UI primitives

**State Management:**
- Custom Zustand stores for client-side state:
  - `useLearning` - manages courses, levels, user progress, XP, badges, and AI companion interactions
  - `useAudio` - controls background music, sound effects (hit, success), and mute state
  - `useGame` - handles game-specific state and phase management
- React Query for server state management and API communication

**Routing & Navigation:**
- Client-side page routing via state management (no router library)
- Pages: Home, Courses, Progress, Profile, Challenge
- Navigation component with responsive design and XP/level display

**UI/UX Design Decisions:**
- Gaming-first aesthetic with glowing effects, animations, and retro fonts (Press Start 2P, VT323, Orbitron)
- Responsive design supporting mobile and desktop viewports
- Custom 3D rendering support via React Three Fiber and Drei for future enhancement
- GLSL shader support for advanced visual effects

**Component Architecture:**
- Presentational components separated from container components
- Shared UI component library under `client/src/components/ui/`
- Custom components: CodeEditor, Navigation, GameArena
- Atomic design pattern with reusable button, card, dialog, and form components

**Game System:**
- React Three Fiber (R3F) for 3D game rendering
- KeyboardControls from @react-three/drei for player input
- Three playable mini-games integrated into learning flow:
  - **Loop Arena**: Collect items in a 3D arena using WASD/Arrow keys, teaches loops and iteration
  - **Recursion Maze**: Navigate through maze with wall collision detection, teaches recursive thinking
  - **Sorting Conveyor**: Interactive click-to-swap sorting game, teaches sorting algorithms
- Game progression: Learn → Quiz → Play Game → Earn XP
- GameArena component manages briefing, gameplay, and results screens
- Game registry system for easy addition of new games

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the REST API
- Custom middleware for request/response logging and error handling
- Separate route registration system for modularity

**API Design:**
- RESTful endpoints under `/api/` prefix
- AI-powered routes:
  - `POST /api/ai/hint` - generates contextual hints for challenges
  - `POST /api/ai/challenge` - creates adaptive challenges based on topic and difficulty
  - `POST /api/ai/explanation` - provides explanations for user answers
  - `POST /api/ai/motivation` - delivers personalized motivational messages

**AI Integration:**
- OpenAI GPT-5 integration for AI learning companion features
- Graceful degradation when API key is unavailable
- AI functions designed to be encouraging, educational, and non-spoiling

**Development vs Production:**
- Development: Vite middleware for HMR and fast refresh
- Production: Static file serving from built assets
- Environment-based configuration with clear separation of concerns

### Data Storage Solutions

**Database:**
- PostgreSQL as the primary database (Neon serverless for scalability)
- Drizzle ORM for type-safe database interactions and migrations
- Schema-first approach with Zod validation

**Current Schema:**
- `users` table with username/password authentication
- `userProgress` table tracking XP, level, current course/level
- `completedLevels` table recording level completion and XP earned
- `badges` table storing earned achievements
- `certificates` table for course completion certificates
- `gameSessions` table tracking individual game plays with score, time, and XP
- Insert schemas with Zod validation for type safety

**In-Memory Storage:**
- `MemStorage` class provides in-memory implementation of IStorage interface
- Used for development and testing without database dependency
- Supports user CRUD operations with auto-incrementing IDs

### External Dependencies

**Third-Party Services:**
- **OpenAI API** - GPT-5 model for AI learning companion functionality
  - Hint generation
  - Dynamic challenge creation
  - Concept explanations
  - Motivational messaging
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit Infrastructure** - Development environment and deployment platform

**Key Libraries:**
- **Drizzle Kit** - Database schema management and migrations
- **React Query** - Server state synchronization and caching
- **Radix UI** - Accessible component primitives (30+ components)
- **Three.js Ecosystem** - 3D rendering capabilities (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **Class Variance Authority** - Type-safe variant styling
- **date-fns** - Date manipulation utilities
- **Nanoid** - Unique ID generation

**Development Tools:**
- **TSX** - TypeScript execution for development server
- **ESBuild** - Production bundling for server code
- **Vite Plugin Runtime Error Modal** - Enhanced error reporting during development
- **vite-plugin-glsl** - GLSL shader support for advanced graphics

**Asset Management:**
- Support for 3D model formats (GLTF, GLB)
- Audio file support (MP3, OGG, WAV)
- Custom font loading (Google Fonts: Press Start 2P, VT323, Orbitron)
- Font Awesome integration via Fontsource