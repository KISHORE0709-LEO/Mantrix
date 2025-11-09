import { Home, BookOpen, Trophy, User, Award } from "lucide-react";
import { useLearning } from "../lib/stores/useLearning";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { userProgress } = useLearning();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b-4 border-neon-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="Mantrix Logo" className="w-12 h-12 object-contain" style={{filter: 'drop-shadow(0 0 10px #39ff14)', backgroundColor: '#101820', borderRadius: '50%', padding: '2px'}} />
            <h1 className="font-game text-lg sm:text-xl text-neon-green glow-text">
              Mantrix
            </h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg
                    transition-all duration-300 font-orbitron text-xs sm:text-sm font-semibold
                    ${isActive 
                      ? 'bg-neon-green text-dark-bg glow scale-105' 
                      : 'text-light-text hover:bg-glass-dark hover:text-neon-green'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-glass-dark px-4 py-2 rounded-lg border-2 border-neon-cyan">
              <span className="font-retro text-2xl text-neon-green">⭐</span>
              <div className="flex flex-col">
                <span className="font-orbitron text-xs text-light-text">Level</span>
                <span className="font-game text-sm text-neon-cyan">{userProgress.level}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-glass-dark px-3 sm:px-4 py-2 rounded-lg border-2 border-neon-green">
              <span className="font-retro text-xl sm:text-2xl">💎</span>
              <div className="flex flex-col">
                <span className="font-orbitron text-xs text-light-text hidden sm:block">XP</span>
                <span className="font-game text-xs sm:text-sm text-neon-green">{userProgress.totalXP}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
