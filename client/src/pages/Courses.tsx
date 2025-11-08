import { useLearning } from "@/lib/stores/useLearning";
import { Lock, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useState } from "react";

interface CoursesProps {
  onNavigate: (page: string) => void;
}

export default function Courses({ onNavigate }: CoursesProps) {
  const { courses, userProgress, selectLevel } = useLearning();
  const [selectedCourseId, setSelectedCourseId] = useState(userProgress.currentCourse || courses[0]?.id);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleLevelClick = (levelId: string, unlocked: boolean) => {
    if (!unlocked) return;
    selectLevel(levelId);
    onNavigate('challenge');
  };

  if (!selectedCourse) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-game text-2xl sm:text-3xl text-center mb-6 text-indigo-300 glow-text">
            Course Roadmap
          </h1>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`
                  px-6 py-3 rounded-xl font-orbitron font-semibold text-sm
                  transition-all duration-300 flex items-center gap-2
                  ${selectedCourseId === course.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105 glow'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }
                `}
                style={{
                  borderWidth: '2px',
                  borderColor: selectedCourseId === course.id ? course.color : 'transparent'
                }}
              >
                <span className="text-2xl">{course.icon}</span>
                <span className="hidden sm:inline">{course.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 sm:p-8 border-4 border-indigo-500/30 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-6xl">{selectedCourse.icon}</div>
            <div className="flex-1">
              <h2 className="font-game text-xl sm:text-2xl mb-2 text-white">
                {selectedCourse.name}
              </h2>
              <p className="font-orbitron text-sm text-gray-300 mb-4">
                {selectedCourse.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-orbitron text-sm text-gray-300">
                    {selectedCourse.levels.length} Levels
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-orbitron text-sm text-gray-300">
                    {selectedCourse.levels.filter(l => l.completed).length} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden sm:block" />
          
          <div className="space-y-6">
            {selectedCourse.levels.map((level, index) => {
              const isCompleted = level.completed;
              const isUnlocked = level.unlocked;
              const isCurrent = userProgress.currentLevel === level.id;

              return (
                <div
                  key={level.id}
                  className="relative"
                  style={{
                    animation: `float 3s ease-in-out infinite ${index * 0.3}s`
                  }}
                >
                  <div className="absolute left-8 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-800 border-4 z-10 flex items-center justify-center hidden sm:flex"
                       style={{
                         borderColor: isCompleted ? '#10b981' : isUnlocked ? selectedCourse.color : '#475569'
                       }}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : isUnlocked ? (
                      <Circle className="w-6 h-6" style={{ color: selectedCourse.color }} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <div className="sm:ml-20">
                    <button
                      onClick={() => handleLevelClick(level.id, isUnlocked)}
                      disabled={!isUnlocked}
                      className={`
                        w-full text-left bg-gradient-to-br rounded-2xl p-6 border-4 transition-all duration-300
                        ${isUnlocked 
                          ? 'from-slate-800 to-slate-900 border-slate-700 hover:border-indigo-500 hover:scale-102 cursor-pointer hover:shadow-2xl' 
                          : 'from-slate-900 to-slate-950 border-slate-800 opacity-60 cursor-not-allowed'
                        }
                        ${isCurrent ? 'border-indigo-500 glow' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-slate-700 text-gray-300">
                              Level {index + 1}
                            </span>
                            <span className={`font-orbitron text-xs px-3 py-1 rounded-full ${
                              level.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                              level.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {level.difficulty}
                            </span>
                            {isCurrent && (
                              <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-indigo-600 text-white animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-game text-base sm:text-lg mb-2 text-white flex items-center gap-2">
                            {level.title}
                            {isUnlocked && !isCompleted && (
                              <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                            )}
                          </h3>
                          
                          <p className="font-orbitron text-sm text-gray-400 mb-3">
                            {level.description}
                          </p>

                          {isUnlocked && (
                            <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
                              <p className="font-orbitron text-xs text-purple-300 italic">
                                📖 {level.story}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">💎</span>
                            <span className="font-game text-sm text-yellow-400">
                              +{level.xpReward} XP
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {level.challengeType === 'coding' ? '💻' : 
                               level.challengeType === 'quiz' ? '📝' : '🎮'}
                            </span>
                            <span className="font-orbitron text-xs text-gray-400 capitalize">
                              {level.challengeType}
                            </span>
                          </div>
                        </div>

                        {isUnlocked && !isCompleted && (
                          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-game text-xs text-white">
                            Start Quest
                          </div>
                        )}
                        
                        {isCompleted && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/50 border-2 border-green-500">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="font-game text-xs text-green-400">Completed</span>
                          </div>
                        )}

                        {!isUnlocked && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="font-orbitron text-xs text-gray-500">Locked</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
