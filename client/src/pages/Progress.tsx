import { useLearning } from "../lib/stores/useLearning";
import { Trophy, Star, Award, TrendingUp } from "lucide-react";

export default function Progress() {
  const { userProgress, courses } = useLearning();

  const totalLevels = courses.reduce((sum, course) => sum + course.levels.length, 0);
  const completedLevels = userProgress.completedLevels.length;
  const progressPercent = (completedLevels / totalLevels) * 100;
  const xpToNextLevel = ((userProgress.level) * 500) - userProgress.totalXP;

  const allAchievements = [
    { id: 'first-step', name: 'First Steps', description: 'Complete your first level', icon: '🎯', earned: completedLevels >= 1 },
    { id: 'getting-started', name: 'Getting Started', description: 'Complete 3 levels', icon: '🚀', earned: completedLevels >= 3 },
    { id: 'dedicated', name: 'Dedicated Learner', description: 'Complete 5 levels', icon: '📚', earned: completedLevels >= 5 },
    { id: 'expert', name: 'Rising Expert', description: 'Reach level 5', icon: '⭐', earned: userProgress.level >= 5 },
    { id: 'xp-hunter', name: 'XP Hunter', description: 'Earn 1000 XP', icon: '💎', earned: userProgress.totalXP >= 1000 },
    { id: 'multi-course', name: 'Multi-Talented', description: 'Complete levels in 2 different courses', icon: '🎨', earned: courses.filter(c => c.levels.some(l => l.completed)).length >= 2 },
  ];

  const earnedAchievements = allAchievements.filter(a => a.earned);
  const lockedAchievements = allAchievements.filter(a => !a.earned);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-game text-2xl sm:text-3xl text-center mb-12 text-green-300 glow-text">
          Your Progress
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-2xl p-6 border-4 border-green-500 glow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="font-orbitron text-xs text-green-200">Current Level</p>
                  <p className="font-game text-2xl text-white">{userProgress.level}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-xs text-green-200">Next Level</span>
                <span className="font-game text-xs text-green-400">{xpToNextLevel} XP</span>
              </div>
              <div className="w-full h-3 bg-green-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${((userProgress.totalXP % 500) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 rounded-2xl p-6 border-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="font-orbitron text-xs text-emerald-200">Total XP</p>
                  <p className="font-game text-2xl text-white">{userProgress.totalXP}</p>
                </div>
              </div>
            </div>
            <p className="font-orbitron text-xs text-emerald-300 mt-4">
              Keep grinding to level up!
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/50 to-teal-800/50 rounded-2xl p-6 border-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-orbitron text-xs text-teal-200">Completion</p>
                  <p className="font-game text-2xl text-white">{Math.round(progressPercent)}%</p>
                </div>
              </div>
            </div>
            <p className="font-orbitron text-xs text-teal-300 mt-4">
              {completedLevels} of {totalLevels} levels complete
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-game text-xl mb-6 text-green-300 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Achievements Unlocked
            </h2>
            
            <div className="space-y-4">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border-4 border-green-500 glow"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-orbitron font-bold text-sm text-white mb-1">
                        {achievement.name}
                      </h3>
                      <p className="font-orbitron text-xs text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-900 border-2 border-green-500">
                      <span className="font-game text-xs text-green-400">Earned</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {earnedAchievements.length === 0 && (
                <div className="text-center py-12 bg-slate-800/50 rounded-xl border-2 border-slate-700">
                  <p className="font-orbitron text-gray-400">
                    Complete challenges to earn achievements!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-game text-xl mb-6 text-gray-400 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Locked Achievements
            </h2>
            
            <div className="space-y-4">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border-4 border-slate-800 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-orbitron font-bold text-sm text-gray-500 mb-1">
                        {achievement.name}
                      </h3>
                      <p className="font-orbitron text-xs text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-800 border-2 border-slate-700">
                      <span className="font-game text-xs text-gray-600">Locked</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-game text-xl mb-6 text-green-300">
            Course Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const completedCount = course.levels.filter(l => l.completed).length;
              const totalLevels = course.levels.length;
              const courseProgress = (completedCount / totalLevels) * 100;

              return (
                <div
                  key={course.id}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-4 border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{course.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-game text-sm text-white mb-1">
                        {course.name}
                      </h3>
                      <p className="font-orbitron text-xs text-gray-400">
                        {completedCount} / {totalLevels} levels
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ 
                        width: `${courseProgress}%`,
                        backgroundColor: course.color
                      }}
                    />
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-orbitron text-xs text-gray-400">
                      {Math.round(courseProgress)}% Complete
                    </span>
                    {completedCount === totalLevels && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-900 border-2 border-green-500">
                        <Trophy className="w-3 h-3 text-green-400" />
                        <span className="font-game text-xs text-green-400">Mastered</span>
                      </div>
                    )}
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
