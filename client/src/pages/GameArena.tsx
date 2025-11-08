import { useEffect, useState } from 'react';
import { useLearning } from '@/lib/stores/useLearning';
import { getGameComponent } from '@/games/registry';
import type { GameResult } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, XCircle } from 'lucide-react';

interface GameArenaProps {
  onNavigate: (page: string) => void;
}

export function GameArena({ onNavigate }: GameArenaProps) {
  const { userProgress, courses, completeGame } = useLearning();
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
    }
  };

  const handleExit = () => {
    onNavigate('challenge');
  };

  const handleReturnToCourses = () => {
    onNavigate('courses');
  };

  if (gameResult && currentLevel?.gameConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl p-8 bg-slate-800/50 border-purple-500/30">
          <div className="text-center mb-6">
            {gameResult.success ? (
              <>
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
                  Victory!
                </h1>
                <p className="text-xl text-green-300">You passed the challenge!</p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-2">
                  Try Again!
                </h1>
                <p className="text-xl text-red-300">You didn't reach the passing score</p>
              </>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Your Score:</span>
                <span className="text-white text-2xl font-bold">{gameResult.score}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Passing Score:</span>
                <span className="text-white text-xl">{currentLevel.gameConfig.passingScore}</span>
              </div>
            </div>

            {gameResult.success && (
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-green-300 font-semibold">XP Earned:</span>
                  <span className="text-yellow-400 text-2xl font-bold">+{gameResult.xpEarned}</span>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Time Spent:</span>
                <span className="text-white">{gameResult.timeSpent}s</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {gameResult.success ? (
              <Button
                onClick={handleReturnToCourses}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3"
              >
                Continue Learning
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setGameResult(null);
                    setShowBriefing(true);
                    setStartTime(Date.now());
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleReturnToCourses}
                  variant="outline"
                  className="px-6 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Exit
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentLevel || !currentLevel.gameConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800/50 border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-4">No Active Game</h1>
          <p className="text-slate-300 mb-4">Please select a level and complete the quiz first.</p>
          <Button onClick={() => onNavigate('courses')}>
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  const GameComponent = getGameComponent(currentLevel.gameConfig.type);

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800/50 border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-4">Game Not Found</h1>
          <p className="text-slate-300 mb-4">Game type: {currentLevel.gameConfig.type}</p>
          <Button onClick={() => onNavigate('courses')}>
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  if (showBriefing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl p-8 bg-slate-800/50 border-purple-500/30">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              {currentLevel.gameConfig.title}
            </h1>
            <p className="text-xl text-slate-300">{currentLevel.gameConfig.description}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <h2 className="text-lg font-semibold text-purple-300 mb-2">Objective</h2>
              <p className="text-slate-200">{currentLevel.gameConfig.objective}</p>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <h2 className="text-lg font-semibold text-purple-300 mb-2">Controls</h2>
              <p className="text-slate-200">{currentLevel.gameConfig.controls}</p>
            </div>

            {currentLevel.gameConfig.timeLimit && (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
                <h2 className="text-lg font-semibold text-purple-300 mb-2">Time Limit</h2>
                <p className="text-slate-200">{currentLevel.gameConfig.timeLimit} seconds</p>
              </div>
            )}

            <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
              <h2 className="text-lg font-semibold text-purple-300 mb-2">Victory Condition</h2>
              <p className="text-slate-200">Score {currentLevel.gameConfig.passingScore} or more to pass!</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowBriefing(false)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3"
            >
              Start Game
            </Button>
            <Button
              onClick={handleExit}
              variant="outline"
              className="px-6 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              Exit
            </Button>
          </div>

          {currentGame && currentGame.attempts > 0 && (
            <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-200">
                Attempt #{currentGame.attempts + 1} | Best Score: {currentGame.bestScore}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <GameComponent   
        config={currentLevel.gameConfig}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </div>
  );
}
