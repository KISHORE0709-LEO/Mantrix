import { useLearning } from "../lib/stores/useLearning";
import { useState, useEffect } from "react";
import { ArrowLeft, Lightbulb, Send, CheckCircle } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";
import VideoRecommendations from "../components/VideoRecommendations";
import TeachingGame from "../components/TeachingGame";
import { AssessmentHub } from "../components/AssessmentHub";
import { ResourcesPanel } from "../components/ResourcesPanel";
import { MarkupForge } from "../games/MarkupForge";

interface ChallengeProps {
  onNavigate: (page: string) => void;
}

export default function Challenge({ onNavigate }: ChallengeProps) {
  const { courses, userProgress, advanceStage, goBackStage, startGame, updateAIMessages, aiCompanion, toggleAICompanion, completeLevel } = useLearning();
  const { playSuccess } = useAudio();
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const currentLevel = courses
    .flatMap(c => c.levels)
    .find(l => l.id === userProgress.currentLevel);

  const currentCourse = courses.find(c => c.id === currentLevel?.courseId);

  useEffect(() => {
    if (!currentLevel) {
      onNavigate('courses');
    }
  }, [currentLevel, onNavigate]);

  if (!currentLevel || !currentCourse) {
    return null;
  }

  const currentStage = currentLevel.currentStage || 'narrative';
  const hasGame = !!currentLevel.gameConfig;

  const handleNarrativeComplete = () => {
    advanceStage(currentLevel.id, 'ai-videos');
  };

  const handleTeachingGameComplete = (gameResult?: any) => {
    // Show game completion screen first
    setTimeout(() => {
      advanceStage(currentLevel.id, 'assessment');
    }, 2000); // 2 second delay to show completion
  };

  const handleGoBack = () => {
    goBackStage(currentLevel.id);
  };

  const handleSubmit = () => {
    const correctAnswer = getCorrectAnswer(currentLevel.id);
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      
      if (currentStage === 'assessment' && !hasGame) {
        setTimeout(() => {
          if (currentLevel.externalResources && currentLevel.externalResources.length > 0) {
            advanceStage(currentLevel.id, 'resources');
          } else {
            advanceStage(currentLevel.id, 'complete');
          }
        }, 1500);
      }
    }
  };

  const handleVideosComplete = () => {
    console.log('Videos completed for level:', currentLevel.id);
    console.log('Has game:', hasGame);
    console.log('Game config:', currentLevel.gameConfig);
    
    if (hasGame) {
      // For DSA levels, go to practice-game stage to show the game launch screen
      if (currentLevel.id.startsWith('dsa-')) {
        console.log('Advancing DSA level to practice-game stage');
        advanceStage(currentLevel.id, 'practice-game');
      }
      // For DevOps levels, go directly to practice-game stage
      else if (currentLevel.id.startsWith('cloud-')) {
        console.log('Advancing DevOps level to practice-game stage');
        advanceStage(currentLevel.id, 'practice-game');
      } 
      // For other levels with games, go to teaching-game first
      else {
        console.log('Advancing to teaching-game stage');
        advanceStage(currentLevel.id, 'teaching-game');
      }
    } else {
      console.log('No game, advancing to assessment');
      advanceStage(currentLevel.id, 'assessment');
    }
  };

  const handleAssessmentComplete = async () => {
    // Complete the level and award XP when assessment is finished
    await completeLevel(currentLevel.id, currentLevel.xpReward);
    
    if (currentLevel.externalResources && currentLevel.externalResources.length > 0) {
      advanceStage(currentLevel.id, 'resources');
    } else {
      advanceStage(currentLevel.id, 'complete');
      onNavigate('courses');
    }
  };

  const handleStartGame = () => {
    const success = startGame(currentLevel.id);
    if (success) {
      onNavigate('game-arena');
    } else {
      console.error('Failed to start game for level:', currentLevel.id);
      console.error('Game config:', currentLevel.gameConfig);
    }
  };

  const handleResourcesComplete = () => {
    advanceStage(currentLevel.id, 'complete');
    onNavigate('courses');
  };

  const handleAIHelp = (context?: { type: 'quiz' | 'coding'; title?: string; description?: string; userCode?: string; testResults?: string; attempts?: number; }) => {
    // If context is provided with description, use that directly (from AssessmentHub)
    if (context?.description) {
      alert(context.description);
      return;
    }

    const quizAnswers = getQuizAnswers(currentLevel.id);
    const codingAnswers = getCodingAnswers(currentLevel.id);

    let content = `Here's the complete solution for "${currentLevel.title}":\n\n`;

    if (quizAnswers.length > 0) {
      content += `📝 QUIZ ANSWERS:\n`;
      quizAnswers.forEach((answer: string) => {
        content += `${answer}\n`;
      });
      content += `\n`;
    }

    if (codingAnswers.length > 0) {
      content += `💻 CODING SOLUTIONS:\n`;
      codingAnswers.forEach((solution: string, idx: number) => {
        content += `Problem ${idx + 1}:\n${solution}\n\n`;
      });
    }

    content += `Study these solutions carefully and try to understand each part before using them.`;

    // Add practice resources
    if (currentLevel.externalResources && currentLevel.externalResources.length > 0) {
      content += `\n\n🧩 PRACTICE RESOURCES:\n`;
      currentLevel.externalResources.forEach((resource, idx) => {
        content += `${idx + 1}. ${resource.title}\n   ${resource.url}\n   ${resource.description}\n\n`;
      });
    }

    alert(content);
  };

  const handleAIChat = () => {
    if (!chatInput.trim()) return;

    updateAIMessages({ role: 'user', content: chatInput });

    setTimeout(() => {
      const aiResponse = getAIHint(currentLevel.id);
      updateAIMessages({ role: 'assistant', content: aiResponse });
    }, 500);

    setChatInput('');
  };

  const handleAIHelpInGame = () => {
    // Provide complete answers for both quiz and coding
    const quizAnswers = getQuizAnswers(currentLevel.id);
    const codingAnswers = getCodingAnswers(currentLevel.id);

    let content = `Here's the complete solution for "${currentLevel.title}":\n\n`;

    if (quizAnswers.length > 0) {
      content += `📝 QUIZ ANSWERS:\n`;
      quizAnswers.forEach((answer: string, idx: number) => {
        content += `${idx + 1}. ${answer}\n`;
      });
      content += `\n`;
    }

    if (codingAnswers.length > 0) {
      content += `💻 CODING SOLUTIONS:\n`;
      codingAnswers.forEach((solution: string, idx: number) => {
        content += `Problem ${idx + 1}:\n${solution}\n\n`;
      });
    }

    content += `Study these solutions carefully and try to understand each part before using them.`;

    updateAIMessages({ role: 'assistant', content });
    toggleAICompanion();
  };

  const getCorrectAnswer = (levelId: string): string => {
    const answers: Record<string, string> = {
      'dsa-1': '10',
      'dsa-2': '[1, 2, 3, 4, 5]',
      'dsa-3': '3',
      'web-1': '<h1>',
      'web-2': 'color: blue;',
      'web-3': 'function',
      'ai-1': 'machine learning',
      'ai-2': 'neural network',
      'cloud-1': 'scalability',
      'cloud-2': 'container',
    };
    return answers[levelId] || 'answer';
  };

  const getAIHint = (levelId: string): string => {
    const hints: Record<string, string> = {
      'dsa-1': 'Think about how many times the loop runs. Count from 1 to 10!',
      'dsa-2': 'Arrays are created using square brackets [ ] and items are separated by commas.',
      'dsa-3': 'Binary search divides the array in half each time. How many steps for 8 elements?',
      'web-1': 'The game shows you need to place blocks in the correct order: div (blue), h1 (purple), p (pink), img (yellow), button (green). Click on a colored block first, then click on the grid slot where it belongs. The purple block (h1) goes in the middle slot of the first row.',
      'web-2': 'CSS uses the property name, then a colon, then the value, and ends with a semicolon.',
      'web-3': 'Functions in JavaScript are declared with the "function" keyword.',
      'ai-1': 'AI systems improve through experience. This is called machine learning!',
      'ai-2': 'This type of AI is inspired by the human brain with interconnected nodes.',
      'cloud-1': 'One key benefit is the ability to handle more users by adding resources.',
      'cloud-2': 'Docker packages applications in isolated environments called...',
      'cloud-7': 'CI/CD automates testing and deployment. Build your pipeline step by step: checkout code, install dependencies, run tests, then deploy. Each stage must pass before the next one runs.',
    };
    return hints[levelId] || 'Keep thinking! You can do this!';
  };

  const getQuizAnswers = (levelId: string): string[] => {
    const quizAnswers: Record<string, string[]> = {
      'web-1': [
        '1. What does HTML stand for? - Hyper Text Markup Language',
        '2. Which tag is used to create a hyperlink? - <a>',
        '3. What is the purpose of semantic HTML? - To give meaning to the structure'
      ],
      'web-2': [
        'The CSS code to make text blue is: color: blue;'
      ],
      'web-3': [
        'Functions in JavaScript are declared with the "function" keyword'
      ],
      'dsa-1': [
        '1. What will this code print? for (let i = 1; i <= 5; i++) { console.log(i); } - 1 2 3 4 5',
        '2. What keyword do you use to declare a variable that can be reassigned? - Both let and var'
      ],
      'dsa-2': [
        '1. How do you access the first element of an array named arr? - arr[0]'
      ],
      'dsa-3': [
        '1. What is the time complexity of binary search? - O(log n)',
        '2. What condition must be met to use binary search? - Array must be sorted'
      ],
      'ai-1': [
        'Machine learning is how AI systems improve through experience'
      ],
      'ai-2': [
        'Neural network is the type of AI inspired by the human brain'
      ],
      'cloud-1': [
        '1. Which cloud service model provides the most control over infrastructure? - IaaS',
        '2. What does "on-demand" mean in cloud computing? - Resources can be provisioned instantly when needed',
        '3. Which deployment model combines on-premises and public cloud? - Hybrid Cloud'
      ],
      'cloud-2': [
        'Container is what Docker packages applications in'
      ],
      'cloud-7': [
        '1. What is the main goal of Continuous Deployment? - To automatically deploy every code change that passes tests',
        '2. In a CI/CD pipeline, what should happen first? - Source/Pull Code', 
        '3. What is a "build artifact"? - The output of the build process (compiled code, packages)'
      ]
    };
    return quizAnswers[levelId] || [];
  };

  const getCodingAnswers = (levelId: string): string[] => {
    const codingAnswers: Record<string, string[]> = {
      'web-1': [
        `function createProfile(name, bio, imageUrl) {
  return \`<div class="profile">
    <img src="\${imageUrl}" alt="\${name}">
    <h2>\${name}</h2>
    <p>\${bio}</p>
  </div>\`;
}`,
        `<div class="container">
  <h1>Welcome</h1>
  <p>This is a paragraph</p>
  <img src="image.jpg" alt="description">
  <button>Click me</button>
</div>`
      ],
      'web-2': [
        `.text { color: blue; }`,
        `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  margin: 0;
  padding: 20px;
}`
      ],
      'web-3': [
        `function greet(name) {
  return "Hello, " + name + "!";
}`,
        `function calculateSum(a, b) {
  return a + b;
}`
      ],
      'dsa-1': [
        `function sumNumbers(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}`
      ],
      'dsa-2': [
        `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}`
      ],
      'dsa-3': [
        `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`
      ],
      'ai-1': [
        `const machineLearning = {
  definition: "AI systems that improve through experience",
  examples: ["recommendation systems", "image recognition"]
};`
      ],
      'ai-2': [
        `class NeuralNetwork {
  constructor(layers) {
    this.layers = layers;
    this.weights = this.initializeWeights();
  }
  
  initializeWeights() {
    return this.layers.map(() => Math.random());
  }
}`
      ],
      'cloud-1': [
        `function classifyService(serviceName) {
  const iaas = ["EC2", "Virtual Machines", "Compute Engine"];
  const paas = ["Heroku", "App Engine", "Azure App Service"];
  const saas = ["Gmail", "Office 365", "Salesforce"];
  
  if (iaas.includes(serviceName)) return "IaaS";
  if (paas.includes(serviceName)) return "PaaS";
  if (saas.includes(serviceName)) return "SaaS";
  return "Unknown";
}`
      ],
      'cloud-2': [
        `// Dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`
      ],
      'cloud-7': [
        `name: CI/CD Pipeline
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - run: npm run build`
      ]
    };
    return codingAnswers[levelId] || [];
  };

  if (currentStage === 'narrative') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            {currentStage !== 'narrative' && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border-4 border-indigo-500/30 mb-8">
            <h1 className="font-game text-3xl text-indigo-300 glow-text mb-6">{currentLevel.title}</h1>
            
            <div className="space-y-6">
              <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-indigo-400/30">
                <h2 className="font-orbitron text-xl text-white mb-4">📖 The Story</h2>
                <p className="text-gray-300 leading-relaxed">{currentLevel.story}</p>
              </div>

              {currentLevel.narrative && (
                <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-purple-400/30">
                  <h2 className="font-orbitron text-xl text-white mb-4">🎯 What You'll Learn</h2>
                  <p className="text-gray-300 leading-relaxed">{currentLevel.narrative}</p>
                </div>
              )}

              {currentLevel.teachingContent && (
                <div className="bg-slate-700/50 rounded-xl p-6 border-2 border-blue-400/30">
                  <h2 className="font-orbitron text-xl text-white mb-4">💡 Key Concepts</h2>
                  <p className="text-gray-300 leading-relaxed">{currentLevel.teachingContent}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleNarrativeComplete}
              className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl font-orbitron text-lg transition-all glow"
            >
              Begin Learning →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStage === 'teaching-game') {
    // Check if this is the HTML level that should use MarkupForge
    if (currentLevel.id === 'web-1' || currentLevel.title.toLowerCase().includes('html') || currentLevel.title.toLowerCase().includes('markup')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => onNavigate('courses')}
                className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Courses
              </button>
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
            <div className="relative">
              <MarkupForge
                config={{
                  id: 'markup-forge',
                  type: 'markup-forge',
                  title: 'HTML Structure Builder',
                  description: 'Build proper HTML structure by placing elements in the correct order',
                  objective: 'Place 5 HTML blocks in the correct hierarchical order',
                  controls: 'Click blocks then grid slots',
                  timeLimit: 90,
                  passingScore: 80,
                  importanceWhy: 'Understanding HTML structure is fundamental to web development'
                }}
                onComplete={handleTeachingGameComplete}
                onExit={() => onNavigate('courses')}
              />
              <button
                onClick={handleAIHelpInGame}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2 z-10"
              >
                <Lightbulb className="w-4 h-4" />
                AI Help
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => onNavigate('courses')}
                className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Courses
              </button>
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
            <div className="relative">
              <TeachingGame
                topic={currentLevel.title}
                concept={currentLevel.description}
                interactive={{
                  title: `Understanding ${currentLevel.title}`,
                  description: currentLevel.story,
                  demoCode: currentLevel.title.includes('Loop') ? 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}' : undefined,
                  visualDemo: `This concept helps you ${currentLevel.description.toLowerCase()}`,
                }}
                onComplete={handleTeachingGameComplete}
              />
              <button
                onClick={handleAIHelpInGame}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2 z-10"
              >
                <Lightbulb className="w-4 h-4" />
                AI Help
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (currentStage === 'ai-videos') {
    return (
      <VideoRecommendations
        topic={currentLevel.videoTopic || currentLevel.title}
        difficulty={currentLevel.difficulty}
        aiSuggestedVideos={currentLevel.aiSuggestedVideos}
        hasGame={hasGame}
        onComplete={handleVideosComplete}
      />
    );
  }

  if (currentStage === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
              <AssessmentHub
                level={currentLevel}
                onComplete={handleAssessmentComplete}
                onAIHelp={handleAIHelp}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStage === 'practice-game') {
    if (!hasGame) {
      console.log('No game config found, advancing to assessment');
      setTimeout(() => advanceStage(currentLevel.id, 'assessment'), 100);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="relative">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-purple-500 p-12 text-center max-w-2xl mx-auto">
              <h1 className="font-game text-4xl text-purple-300 mb-6">Ready to Deploy?</h1>
              <p className="font-orbitron text-gray-300 mb-8">
                {currentLevel.id.startsWith('cloud-') 
                  ? 'Time to deploy! Put your DevOps skills to the test in the deployment game.' 
                  : currentLevel.id.startsWith('dsa-')
                  ? 'You\'ve learned the theory! Now practice your DSA skills in an interactive game.'
                  : 'You\'ve completed the videos! Now put your skills to the test in the practice game.'}
              </p>
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Game: {currentLevel.gameConfig?.title}</p>
                <p className="text-sm text-gray-400">{currentLevel.gameConfig?.description}</p>
              </div>
              <button
                onClick={handleStartGame}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-game text-xl text-white transition-all glow"
              >
⚡ Launch Game
              </button>
            </div>
            <button
              onClick={handleAIHelpInGame}
              className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2 z-10"
            >
              <Lightbulb className="w-4 h-4" />
              AI Help
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStage === 'resources') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Courses
            </button>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="relative">
            <ResourcesPanel
              resources={currentLevel.externalResources || []}
              onComplete={handleResourcesComplete}
            />
            <button
              onClick={handleAIHelpInGame}
              className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2 z-10"
            >
              <Lightbulb className="w-4 h-4" />
              AI Help
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Old quiz rendering - kept for backward compatibility with levels that don't have new assessment data
  const renderChallenge = () => {
    switch (currentLevel.id) {
      case 'dsa-1':
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-6 border-2 border-indigo-500 font-mono text-sm">
              <div className="text-green-400 mb-2">{'// JavaScript Code'}</div>
              <div className="text-gray-300">
                <span className="text-purple-400">for</span> 
                <span className="text-gray-300"> (</span>
                <span className="text-blue-400">let</span> 
                <span className="text-gray-300"> i = </span>
                <span className="text-yellow-400">1</span>
                <span className="text-gray-300">; i &lt;= </span>
                <span className="text-yellow-400">10</span>
                <span className="text-gray-300">; i++) {'{'}</span>
              </div>
              <div className="text-gray-300 ml-4">
                <span className="text-blue-400">console</span>
                <span className="text-gray-300">.log(i);</span>
              </div>
              <div className="text-gray-300">{'}'}</div>
            </div>
            <p className="font-orbitron text-white">
              How many numbers will this loop print?
            </p>
          </div>
        );

      case 'dsa-2':
        return (
          <div className="space-y-4">
            <p className="font-orbitron text-white">
              Create an array containing the numbers 1 through 5 in JavaScript.
            </p>
            <p className="font-orbitron text-sm text-gray-400">
              Hint: Use square brackets and separate numbers with commas.
            </p>
          </div>
        );

      case 'web-1':
        return (
          <div className="space-y-4">
            <p className="font-orbitron text-white">
              What HTML tag is used for the largest heading?
            </p>
            <div className="bg-slate-900 rounded-xl p-4 border-2 border-purple-500">
              <p className="font-mono text-sm text-gray-400">
                Example: &lt;?&gt;My Big Title&lt;/?&gt;
              </p>
            </div>
          </div>
        );

      case 'web-2':
        return (
          <div className="space-y-4">
            <p className="font-orbitron text-white">
              Write the CSS code to make text blue.
            </p>
            <p className="font-orbitron text-sm text-gray-400">
              Format: property: value;
            </p>
          </div>
        );

      default:
        return (
          <p className="font-orbitron text-white">
            Complete this challenge to earn {currentLevel.xpReward} XP!
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('courses')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-orbitron text-sm text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-700 transition-colors font-orbitron text-sm text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-4 border-indigo-500 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl">{currentCourse.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-indigo-600 text-white">
                      {currentLevel.difficulty}
                    </span>
                    <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-purple-600 text-white capitalize">
                      {currentLevel.challengeType}
                    </span>
                  </div>
                  <h1 className="font-game text-xl sm:text-2xl mb-2 text-white">
                    {currentLevel.title}
                  </h1>
                  <p className="font-orbitron text-sm text-gray-400">
                    {currentLevel.description}
                  </p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <p className="font-orbitron text-sm text-purple-300 italic">
                  📖 {currentLevel.story}
                </p>
              </div>

              {renderChallenge()}

              <div className="mt-6">
                <label className="font-orbitron text-sm text-gray-300 mb-2 block">
                  Your Answer:
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 outline-none font-mono text-white"
                  placeholder="Type your answer here..."
                  disabled={showResult && isCorrect}
                />
              </div>

              {showResult && (
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  isCorrect 
                    ? 'bg-green-900/50 border-green-500' 
                    : 'bg-red-900/50 border-red-500'
                }`}>
                  <div className="flex items-center gap-2 font-orbitron text-sm mb-3">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">
                          Correct! {hasGame ? 'Now play the game to earn XP!' : `You earned ${currentLevel.xpReward} XP! 🎉`}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-300">
                        Not quite right. Try again or ask the AI for a hint!
                      </span>
                    )}
                  </div>
                  
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim() || (showResult && isCorrect)}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-game text-sm text-white transition-all duration-300 glow"
                >
                  Submit Answer
                </button>
                <button
                  onClick={toggleAICompanion}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  AI Help
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-4 border-purple-500 sticky top-24">
              <h2 className="font-game text-lg mb-4 text-purple-300 flex items-center gap-2">
                <span>🤖</span>
                AI Companion
              </h2>

              <div className="bg-slate-900 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                {aiCompanion.messages.length === 0 ? (
                  <p className="font-orbitron text-sm text-gray-400 text-center mt-8">
                    Hi! I'm your AI study buddy. Ask me for hints or explanations!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {aiCompanion.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-indigo-900/50 ml-4'
                            : 'bg-purple-900/50 mr-4'
                        }`}
                      >
                        <p className="font-orbitron text-xs text-gray-300">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border-2 border-slate-700 focus:border-purple-500 outline-none font-orbitron text-sm text-white"
                  placeholder="Ask for help..."
                />
                <button
                  onClick={handleAIChat}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="mt-4 p-4 bg-indigo-900/30 rounded-lg border-2 border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💎</span>
                  <span className="font-game text-sm text-yellow-400">
                    Reward: {currentLevel.xpReward} XP
                  </span>
                </div>
                <p className="font-orbitron text-xs text-gray-400">
                  Complete this challenge to unlock the next level!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
