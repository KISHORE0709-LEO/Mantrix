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
    <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-12">
          <div className="inline-block mb-6 animate-float">
            <img src="/logo.jpg" alt="Mantrix Logo" className="w-24 h-24 object-contain animate-pulse" style={{filter: 'drop-shadow(0 0 20px #39ff14) drop-shadow(0 0 40px #39ff1444)', backgroundColor: '#101820', borderRadius: '50%', padding: '4px'}} />
          </div>
          
          <h1 className="font-game text-3xl sm:text-4xl md:text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green glow-text">
            Welcome to Mantrix
          </h1>
          
          <p className="font-orbitron text-lg sm:text-xl text-light-text max-w-3xl mx-auto mb-8">
            Embark on an epic journey of learning! Choose your path and master new skills through
            <span className="text-neon-green font-bold"> story-driven challenges</span> and 
            <span className="text-neon-cyan font-bold"> AI-powered guidance</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-glass-dark px-6 py-3 rounded-full border-2 border-neon-green">
              <Sparkles className="w-5 h-5 text-neon-green" />
              <span className="font-orbitron text-sm font-semibold text-neon-green">AI Companion</span>
            </div>
            <div className="flex items-center gap-2 bg-glass-dark px-6 py-3 rounded-full border-2 border-neon-cyan">
              <Star className="w-5 h-5 text-neon-cyan" />
              <span className="font-orbitron text-sm font-semibold text-neon-cyan">Earn Rewards</span>
            </div>
            <div className="flex items-center gap-2 bg-glass-dark px-6 py-3 rounded-full border-2 border-neon-green">
              <Zap className="w-5 h-5 text-neon-green" />
              <span className="font-orbitron text-sm font-semibold text-neon-green">Level Up</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-game text-2xl sm:text-3xl text-center mb-8 text-neon-green glow-text">
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
                className="group relative bg-gradient-to-br from-glass-dark to-darker-bg rounded-2xl p-6 border-4 border-process-2 hover:border-neon-green transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                style={{
                  animation: `float 3s ease-in-out infinite ${index * 0.2}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {course.icon}
                  </div>
                  
                  <h3 className="font-game text-sm sm:text-base mb-3 text-light-text group-hover:text-neon-green transition-colors">
                    {course.name}
                  </h3>
                  
                  <p className="font-orbitron text-xs text-light-text mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-orbitron text-xs text-light-text">Progress</span>
                      <span className="font-game text-xs text-neon-green">
                        {completedCount}/{totalLevels}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-process-4 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-orbitron text-xs text-neon-green flex items-center gap-1">
                      <span>⭐</span>
                      {totalLevels} Levels
                    </span>
                    <div className="px-3 py-1 rounded-full text-xs font-game bg-neon-green/20 text-neon-green border-2 border-neon-green">
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
          <div className="bg-gradient-to-r from-glass-dark to-darker-bg/50 rounded-2xl p-8 border-2 border-neon-green/30 max-w-4xl mx-auto">
            <h3 className="font-game text-xl sm:text-2xl mb-4 text-neon-green">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-light-text">Choose a Course</h4>
                <p className="font-orbitron text-xs text-light-text">
                  Select from DSA, Web Dev, AI/ML, or Cloud & DevOps
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-light-text">Complete Challenges</h4>
                <p className="font-orbitron text-xs text-light-text">
                  Solve interactive games and coding problems
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-orbitron font-bold text-sm mb-2 text-light-text">Earn Rewards</h4>
                <p className="font-orbitron text-xs text-light-text">
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
