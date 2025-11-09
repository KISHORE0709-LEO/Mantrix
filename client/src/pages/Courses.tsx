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
    <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-bg" style={{position: 'relative', zIndex: 10}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-game text-2xl sm:text-3xl text-center mb-6 text-neon-green glow-text">
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
                    ? 'bg-gradient-to-r from-neon-green to-neon-cyan text-dark-bg scale-105 glow'
                    : 'bg-glass-dark text-light-text hover:bg-process-2'
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

        <div className="bg-gradient-to-br from-glass-dark to-darker-bg/80 rounded-2xl p-6 sm:p-8 border-4 border-neon-green/30 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-6xl">{selectedCourse.icon}</div>
            <div className="flex-1">
              <h2 className="font-game text-xl sm:text-2xl mb-2 text-light-text">
                {selectedCourse.name}
              </h2>
              <p className="font-orbitron text-sm text-light-text mb-4">
                {selectedCourse.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-process-2 px-4 py-2 rounded-lg">
                  <span className="text-neon-green">⭐</span>
                  <span className="font-orbitron text-sm text-light-text">
                    {selectedCourse.levels.length} Levels
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-process-2 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-neon-cyan" />
                  <span className="font-orbitron text-sm text-light-text">
                    {selectedCourse.levels.filter(l => l.completed).length} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-green via-neon-cyan to-neon-green hidden sm:block" />
          
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
                  <div className="absolute left-8 -translate-x-1/2 w-12 h-12 rounded-full bg-dark-bg border-4 z-10 flex items-center justify-center hidden sm:flex"
                       style={{
                         borderColor: isCompleted ? '#39ff14' : isUnlocked ? '#39ff14' : '#475569'
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
                          ? 'from-glass-dark to-darker-bg border-process-2 hover:border-neon-green hover:scale-102 cursor-pointer hover:shadow-2xl' 
                          : 'from-darker-bg to-dark-bg border-process-4 opacity-60 cursor-not-allowed'
                        }
                        ${isCurrent ? 'border-neon-green glow' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-process-2 text-light-text">
                              Level {index + 1}
                            </span>
                            <span className={`font-orbitron text-xs px-3 py-1 rounded-full ${
                              level.difficulty === 'beginner' ? 'bg-neon-green/20 text-neon-green' :
                              level.difficulty === 'intermediate' ? 'bg-neon-cyan/20 text-neon-cyan' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {level.difficulty}
                            </span>
                            {isCurrent && (
                              <span className="font-orbitron text-xs px-3 py-1 rounded-full bg-neon-green text-dark-bg animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-game text-base sm:text-lg mb-2 text-light-text flex items-center gap-2">
                            {level.title}
                            {isUnlocked && !isCompleted && (
                              <ArrowRight className="w-5 h-5 text-neon-green animate-pulse" />
                            )}
                          </h3>
                          
                          <p className="font-orbitron text-sm text-light-text mb-3">
                            {level.description}
                          </p>

                          {isUnlocked && (
                            <div className="bg-process-3 rounded-lg p-3 mb-3">
                              <p className="font-orbitron text-xs text-neon-cyan italic">
                                📖 {level.story}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-neon-green">💎</span>
                            <span className="font-game text-sm text-neon-green">
                              +{level.xpReward} XP
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {level.challengeType === 'coding' ? '💻' : 
                               level.challengeType === 'quiz' ? '📝' : '⚡'}
                            </span>
                            <span className="font-orbitron text-xs text-light-text capitalize">
                              {level.challengeType}
                            </span>
                          </div>
                        </div>

                        {isUnlocked && !isCompleted && (
                          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-green to-neon-cyan font-game text-xs text-dark-bg">
                            Start Quest
                          </div>
                        )}
                        
                        {isCompleted && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/20 border-2 border-neon-green">
                            <CheckCircle className="w-4 h-4 text-neon-green" />
                            <span className="font-game text-xs text-neon-green">Completed</span>
                          </div>
                        )}

                        {!isUnlocked && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-process-4">
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
