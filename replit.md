# SkillQuest - Gamified Learning Platform

## Overview

SkillQuest is a 2D gamified skill-learning platform where students embark on story-driven educational journeys. Users select courses (DSA, AI/ML, Web Development, Cloud & DevOps, etc.) and progress through interactive levels designed as game-like challenges. The platform features an AI-powered learning companion that provides personalized hints, generates adaptive challenges, offers explanations, and delivers motivational messages based on user performance.

## Recent Changes (November 2025)

### MATRIX: Cloud & DevOps Odyssey
Implemented a comprehensive 9-level Cloud & DevOps course following the "Skyforge Realm" narrative theme:
1. **The Genesis Cloud** - Cloud Computing fundamentals (IaaS, PaaS, SaaS, AWS/Azure/GCP)
2. **The Forge of Infrastructure** - Networking & Compute (VPC, EC2, S3, Load Balancers)
3. **The Chamber of Automation** - DevOps Foundations (CI/CD, Git, GitHub Actions)
4. **The Terraform Plains** - Infrastructure as Code (Terraform basics and provisioning)
5. **The Docker Depths** - Containerization (Docker, images, volumes, networking)
6. **The Kubernetes Peaks** - Container Orchestration (K8s pods, deployments, services)
7. **The CI/CD Citadel** - Pipeline Automation (Jenkins, GitHub Actions, GitLab CI)
8. **The Realm of Observability** - Monitoring & Logging (Prometheus, Grafana, ELK Stack)
9. **The DevOps Devas** - Full Integration (DevSecOps, cost optimization, production best practices)

Each level includes:
- Engaging narrative following the Skyforge Realm storyline
- 3 AI-curated YouTube video tutorials
- 3 quiz questions with detailed explanations
- External practice resources (AWS docs, Azure tutorials, hands-on labs)
- Interactive game component using existing game engines (ComponentLink, DataBridge, ScriptCircuit, PatternBuilder, DeployOrbit, SearchChallenge)

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
- Custom components:
  - **AssessmentHub**: Combined quiz and coding challenge interface with test runner and AI hints
  - **VideoRecommendations**: AI-powered video suggestions before assessments
  - **ResourcesPanel**: External practice resources (LeetCode, NeetCode, W3Schools, MDN)
  - **TeachingGame**: Interactive 3D mini-games for learning concepts
  - **GameArena**: Full game experience with briefing and results
  - **Navigation**: Responsive navbar with XP/level display
- Atomic design pattern with reusable button, card, dialog, and form components

**Game System:**
- React Three Fiber (R3F) for 3D game rendering
- KeyboardControls from @react-three/drei for player input
- Three playable mini-games integrated into learning flow:
  - **Loop Arena**: Collect items in a 3D arena using WASD/Arrow keys, teaches loops and iteration
  - **Recursion Maze**: Navigate through maze with wall collision detection, teaches recursive thinking
  - **Sorting Conveyor**: Interactive click-to-swap sorting game, teaches sorting algorithms
- **MATRIX Learning Flow**: Narrative → Teaching Game → AI Video Recommendations → Assessment (Quiz + Coding) → Practice Game → External Resources → Level Complete
- Complete integration with XP rewards and progress tracking
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
- **Contextual Hint System**: AI provides stage-aware hints based on:
  - Current learning stage (narrative, teaching, assessment, etc.)
  - Problem type (quiz questions vs coding challenges)
  - User's code and test results for coding problems
  - Number of attempts to guide difficulty
- UI integration: Hint buttons in both quiz questions and coding challenges
- Graceful degradation when API key is unavailable (fallback messages)
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
- `codingAttempts` table for tracking code submissions and test results
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

## Recent Changes

### November 08, 2025 - MATRIX: The AI/ML Quest Integration
- **Added comprehensive AI/ML course** with 9 complete levels following the MATRIX theme:
  1. **The Awakening** - Introduction to AI & ML concepts (supervised vs unsupervised learning)
  2. **The Data Forge** - Data preprocessing and cleaning (normalization, handling missing values)
  3. **The Algorithm Arena** - ML algorithms (Linear Regression, Decision Trees, Random Forests, K-Means)
  4. **The Training Grounds** - Model training, evaluation metrics, overfitting/underfitting
  5. **The Neural Sanctum** - Introduction to Neural Networks and Deep Learning (TensorFlow/PyTorch)
  6. **The Vision Tower** - Computer Vision and CNNs (image classification, object detection)
  7. **The Voice Realm** - NLP and Chatbot development (tokenization, transformers, LSTMs)
  8. **The Sage's Code** - AI Ethics, bias, fairness, and explainability (responsible AI)
  9. **The Integration Nexus** - Real-world AI projects using APIs (OpenAI, Hugging Face, deployment)

**Content Statistics:**
- 27 quiz questions (3 per level) with detailed explanations
- 81+ external resources (courses, tutorials, practice platforms, documentation)
- 9 game configurations integrated into learning flow
- Complete narrative stories and teaching content for each level

**Technical Implementation:**
- Extended `ExternalResource` type to support new resource categories: 'course', 'practice', 'tutorial', 'tool', 'platform'
- Integrated with existing learning flow: Narrative → Videos → Game → Quiz → Resources → Complete
- AI-suggested videos for each topic with YouTube thumbnails and links
- Aligned with hackathon theme: "Autonomous AI Agents" - study buddy that explains, quizzes, and schedules

**User Experience:**
- Progressive difficulty scaling from beginner to advanced
- XP rewards ranging from 150-300 per level
- Comprehensive coverage from AI basics to production deployment
- Real-world application focus with ethical considerations