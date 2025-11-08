import { useLearning } from "@/lib/stores/useLearning";
import { Sparkles, Star, Zap } from "lucide-react";

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { courses, selectCourse } = useLearning();

  const handleSelectCourse = (courseId: string) => {
    selectCourse(courseId);
    onNavigate('courses');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-12">
          <div className="inline-block mb-6 animate-float">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center glow animate-pulse-glow">
              <span className="text-6xl">🎮</span>
            </div>
          </div>
          
          <h1 className="font-game text-3xl sm:text-4xl md:text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 glow-text">
            Welcome to SkillQuest
          </h1>
          
          <p className="font-orbitron text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Embark on an epic journey of learning! Choose your path and master new skills through
            <span className="text-indigo-400 font-bold"> story-driven challenges</span> and 
            <span className="text-purple-400 font-bold"> AI-powered guidance</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-slate-800/80 px-6 py-3 rounded-full border-2 border-indigo-500">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-orbitron text-sm font-semibold text-indigo-300">AI Companion</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-6 py-3 rounded-full border-2 border-purple-500">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="font-orbitron text-sm font-semibold text-purple-300">Earn Rewards</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-6 py-3 rounded-full border-2 border-pink-500">
              <Zap className="w-5 h-5 text-pink-400" />
              <span className="font-orbitron text-sm font-semibold text-pink-300">Level Up</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-game text-2xl sm:text-3xl text-center mb-8 text-indigo-300 glow-text">
            Choose Your Quest
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => {
            const completedCount = course.levels.filter(l => l.completed).length;
            const totalLevels = course.levels.length;
            const progressPercent = (completedCount / totalLevels) * 100;

            return (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course.id)}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-4 border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                style={{
                  animation: `float 3s ease-in-out infinite ${index * 0.2}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {course.icon}
                  </div>
                  
                  <h3 className="font-game text-sm sm:text-base mb-3 text-white group-hover:text-indigo-300 transition-colors">
                    {course.name}
                  </h3>
                  
                  <p className="font-orbitron text-xs text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-orbitron text-xs text-gray-400">Progress</span>
                      <span className="font-game text-xs text-indigo-400">
                        {completedCount}/{totalLevels}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-orbitron text-xs text-yellow-400 flex items-center gap-1">
                      <span>⭐</span>
                      {totalLevels} Levels
                    </span>
                    <div className="px-3 py-1 rounded-full text-xs font-game"
                         style={{ 
                           backgroundColor: `${course.color}22`,
                           color: course.color,
                           border: `2px solid ${course.color}`
                         }}>
                      Start
                    </div>
                  </div>
                </div>

                <div 
                  className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                  style={{ backgroundColor: course.color }}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border-2 border-indigo-500/30 max-w-4xl mx-auto">
            <h3 className="font-game text-xl sm:text-2xl mb-4 text-indigo-300">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-white">Choose a Course</h4>
                <p className="font-orbitron text-xs text-gray-400">
                  Select from DSA, Web Dev, AI/ML, or Cloud & DevOps
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-white">Complete Challenges</h4>
                <p className="font-orbitron text-xs text-gray-400">
                  Solve interactive games and coding problems
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-white">Earn Rewards</h4>
                <p className="font-orbitron text-xs text-gray-400">
                  Gain XP, unlock badges, and level up!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
