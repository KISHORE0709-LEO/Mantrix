import { useLearning } from "@/lib/stores/useLearning";
import { User, Calendar, Trophy, Star, LogOut } from "lucide-react";

export default function Profile() {
  const { userProgress, courses, user, logout } = useLearning();

  const totalLevels = courses.reduce((sum, course) => sum + course.levels.length, 0);
  const completedLevels = userProgress.completedLevels.length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-game text-2xl sm:text-3xl text-center mb-12 text-indigo-300 glow-text">
          Player Profile
        </h1>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-4 border-indigo-500 glow mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center glow animate-pulse-glow">
              <User className="w-16 h-16 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-game text-2xl mb-2 text-white">
                {user?.username || 'Guest Player'}
              </h2>
              <p className="font-orbitron text-sm text-gray-400 mb-4">
                {user?.email || 'SkillQuest Adventurer'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-orbitron text-sm text-white">
                    Level {userProgress.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <span className="font-orbitron text-sm text-white">
                    {userProgress.totalXP} XP
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="font-orbitron text-sm text-white">
                    Joined Today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <p className="font-game text-3xl text-indigo-400 mb-2">{completedLevels}</p>
            <p className="font-orbitron text-sm text-gray-400">Levels Completed</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 text-center">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-game text-3xl text-purple-400 mb-2">
              {courses.filter(c => c.levels.some(l => l.completed)).length}
            </p>
            <p className="font-orbitron text-sm text-gray-400">Courses Started</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="font-game text-3xl text-pink-400 mb-2">{userProgress.badges.length}</p>
            <p className="font-orbitron text-sm text-gray-400">Badges Earned</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 mb-8">
          <h3 className="font-game text-lg mb-4 text-white">Learning Stats</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-sm text-gray-300">Overall Progress</span>
                <span className="font-game text-sm text-indigo-400">
                  {Math.round((completedLevels / totalLevels) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${(completedLevels / totalLevels) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-sm text-gray-300">XP to Next Level</span>
                <span className="font-game text-sm text-purple-400">
                  {((userProgress.level) * 500) - userProgress.totalXP} XP
                </span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${((userProgress.totalXP % 500) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700">
          <h3 className="font-game text-lg mb-4 text-white">Account Settings</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-orbitron text-sm text-white">
              🔔 Notification Preferences
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-orbitron text-sm text-white">
              🎨 Customize Avatar
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-orbitron text-sm text-white">
              📊 View Detailed Stats
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900 hover:bg-red-800 transition-colors font-orbitron text-sm text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
