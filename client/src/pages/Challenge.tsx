import { useLearning } from "@/lib/stores/useLearning";
import { useState, useEffect } from "react";
import { ArrowLeft, Lightbulb, Send, CheckCircle } from "lucide-react";
import { useAudio } from "@/lib/stores/useAudio";
import VideoRecommendations from "@/components/VideoRecommendations";
import TeachingGame from "@/components/TeachingGame";

interface ChallengeProps {
  onNavigate: (page: string) => void;
}

export default function Challenge({ onNavigate }: ChallengeProps) {
  const { courses, userProgress, advanceStage, startGame, updateAIMessages, aiCompanion, toggleAICompanion } = useLearning();
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

  const currentStage = currentLevel.currentStage || 'teaching-game';
  const hasGame = !!currentLevel.gameConfig;

  const handleTeachingGameComplete = () => {
    advanceStage(currentLevel.id, 'learn');
  };

  const handleSubmit = () => {
    const correctAnswer = getCorrectAnswer(currentLevel.id);
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      
      if (currentStage === 'learn') {
        setTimeout(() => {
          advanceStage(currentLevel.id, 'videos');
        }, 1000);
      } else if (currentStage === 'quiz') {
        if (hasGame) {
          setTimeout(() => {
            advanceStage(currentLevel.id, 'complete');
            onNavigate('courses');
          }, 2000);
        } else {
          setTimeout(() => {
            advanceStage(currentLevel.id, 'complete');
            onNavigate('courses');
          }, 2000);
        }
      }
    }
  };

  const handleVideosComplete = () => {
    advanceStage(currentLevel.id, 'quiz');
  };

  const handleStartGame = () => {
    const success = startGame(currentLevel.id);
    if (success) {
      onNavigate('game-arena');
    } else {
      console.error('Failed to start game');
    }
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
      'web-1': 'HTML headings start with an h followed by a number. The biggest heading is h1!',
      'web-2': 'CSS uses the property name, then a colon, then the value, and ends with a semicolon.',
      'web-3': 'Functions in JavaScript are declared with the "function" keyword.',
      'ai-1': 'AI systems improve through experience. This is called machine learning!',
      'ai-2': 'This type of AI is inspired by the human brain with interconnected nodes.',
      'cloud-1': 'One key benefit is the ability to handle more users by adding resources.',
      'cloud-2': 'Docker packages applications in isolated environments called...',
    };
    return hints[levelId] || 'Keep thinking! You can do this!';
  };

  if (currentStage === 'teaching-game') {
    return (
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
    );
  }

  if (currentStage === 'videos') {
    return (
      <VideoRecommendations
        topic={currentLevel.title}
        difficulty={currentLevel.difficulty}
        onComplete={handleVideosComplete}
      />
    );
  }

  const isQuizStage = currentStage === 'quiz' || currentStage === 'learn';

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
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onNavigate('courses')}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-orbitron text-sm text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

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
                  
                  {isCorrect && hasGame && currentStage === 'quiz' && (
                    <button
                      onClick={handleStartGame}
                      className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-game text-sm text-white transition-all duration-300 glow"
                    >
                      🎮 Start Mini-Game
                    </button>
                  )}
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
