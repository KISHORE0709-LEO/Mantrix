import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import CursorTrail from '../components/CursorTrail';

interface IntroProps {
  onNavigate: (page: string) => void;
}

export default function Intro({ onNavigate }: IntroProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBeginQuest = () => {
    onNavigate('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
      <CursorTrail />
      {/* Animated Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 animate-breathe"
        style={{ backgroundImage: 'url(/intro-world.png.png)' }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className={`relative z-10 text-center text-white transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent animate-glow">
          Mantrix
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto px-4 text-gray-200">
          Embark on an epic learning journey through interactive worlds of knowledge
        </p>
        <Button 
          onClick={handleBeginQuest}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 animate-pulse-button"
        >
          🚀 Begin Your Quest
        </Button>
      </div>
      

    </div>
  );
}
