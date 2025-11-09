import { useEffect, useState } from 'react';
import { useLearning } from '../lib/stores/useLearning';
import { Trophy, XCircle, Lightbulb } from 'lucide-react';

// Simplified GameArena without complex imports
type GameResult = {
  success: boolean;
  score: number;
  timeSpent: number;
  xpEarned?: number;
};

interface GameArenaProps {
  onNavigate: (page: string) => void;
}

export function GameArena({ onNavigate }: GameArenaProps) {
  const { userProgress, courses, completeGame, updateAIMessages, toggleAICompanion } = useLearning();
  const [startTime, setStartTime] = useState<number>(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [cachedLevel, setCachedLevel] = useState<any>(null);

  const currentGame = userProgress.currentGame;
  const freshLevel = courses
    .flatMap(c => c.levels)
    .find(l => l.id === currentGame?.levelId);
  const currentLevel = freshLevel || cachedLevel;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (currentGame?.levelId && freshLevel && !cachedLevel) {
      setCachedLevel(freshLevel);
    }
  }, [currentGame?.levelId, freshLevel, cachedLevel]);

  const handleComplete = async (result: GameResult) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const finalResult = {
      ...result,
      timeSpent,
    };
    
    setGameResult(finalResult);
    if (currentGame) {
      await completeGame(currentGame.levelId, finalResult);
      if (finalResult.success) {
        setTimeout(() => {
          onNavigate('challenge');
        }, 3000);
      }
    }
  };

  const handleExit = () => {
    onNavigate('challenge');
  };

  const handleAIHelpInGame = () => {
    const hint = getAIHint(currentLevel.id);
    updateAIMessages({ role: 'assistant', content: hint });
    toggleAICompanion();
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
    };
    return hints[levelId] || 'Keep thinking! You can do this!';
  };

  const handleReturnToCourses = () => {
    if (gameResult?.success) {
      onNavigate('challenge');
    } else {
      onNavigate('courses');
    }
  };

  if (!currentLevel || !currentLevel.gameConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 flex items-center justify-center p-4">
        <div className="p-8 bg-slate-800/50 border border-purple-500/30 rounded-lg">
          <h1 className="text-2xl font-bold text-white mb-4">No Active Game</h1>
          <p className="text-slate-300 mb-4">Please select a level and complete the quiz first.</p>
          <button 
            onClick={() => onNavigate('courses')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 flex items-center justify-center p-4">
      <div className="max-w-2xl p-8 bg-slate-800/50 border border-purple-500/30 rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Game Coming Soon
          </h1>
          <p className="text-xl text-slate-300">Interactive games will be available in the next update!</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">Game: {currentLevel.gameConfig.title}</h2>
            <p className="text-slate-200">{currentLevel.gameConfig.description}</p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">Objective</h2>
            <p className="text-slate-200">{currentLevel.gameConfig.objective}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('challenge')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded"
          >
            Continue to Assessment
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className="px-6 border border-purple-500/50 text-purple-300 hover:bg-purple-500/20 rounded"
          >
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
