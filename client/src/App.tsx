import { useState, useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useLearning } from "./lib/stores/useLearning";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Challenge from "./pages/Challenge";
import Leaderboard from "./pages/Leaderboard";
import Auth from "./pages/Auth";
import Intro from "./pages/intro";
import { GameArena } from "./pages/GameArena";

function App() {
  const [currentPage, setCurrentPage] = useState<string>('intro');
  const [showIntro, setShowIntro] = useState(true);
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted } = useAudio();
  const { user } = useLearning();

  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio('/sounds/hit.mp3');
    setHitSound(hitAudio);

    const successAudio = new Audio('/sounds/success.mp3');
    setSuccessSound(successAudio);

    if (!isMuted) {
      bgMusic.play().catch(err => console.log('Background music autoplay prevented:', err));
    }

    return () => {
      bgMusic.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, isMuted]);

  if (showIntro) {
    return <Intro onNavigate={(page) => {
      setShowIntro(false);
      setCurrentPage(page);
    }} />;
  }

  if (!user) {
    return <Auth onNavigate={setCurrentPage} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'courses':
        return <Courses onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress />;
      case 'profile':
        return <Profile />;
      case 'challenge':
        return <Challenge onNavigate={setCurrentPage} />;
      case 'game-arena':
        return <GameArena onNavigate={setCurrentPage} />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
