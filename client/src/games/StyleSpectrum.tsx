import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityBuilding {
  id: number;
  position: [number, number, number];
  styled: boolean;
  targetColor: string;
  currentColor: string;
}

const TARGET_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function Building({ building, onClick }: { building: CityBuilding; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && !building.styled) {
      meshRef.current.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={building.position} onClick={onClick}>
      <boxGeometry args={[1.5, 2, 1.5]} />
      <meshStandardMaterial
        color={building.currentColor}
        emissive={building.styled ? building.targetColor : '#000000'}
        emissiveIntensity={building.styled ? 0.4 : 0}
      />
    </mesh>
  );
}

function ColorPalette({ onColorSelect, selectedColor }: { onColorSelect: (color: string) => void; selectedColor: string | null }) {
  return (
    <>
      {TARGET_COLORS.map((color, index) => (
        <mesh
          key={color}
          position={[index * 2 - 5, 0.5, 8]}
          onClick={() => onColorSelect(color)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selectedColor === color ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </>
  );
}

function Scene({ buildings, onBuildingClick, onColorSelect, selectedColor }: {
  buildings: CityBuilding[];
  onBuildingClick: (id: number) => void;
  onColorSelect: (color: string) => void;
  selectedColor: string | null;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#8b5cf6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {buildings.map(building => (
        <Building key={building.id} building={building} onClick={() => onBuildingClick(building.id)} />
      ))}

      <ColorPalette onColorSelect={onColorSelect} selectedColor={selectedColor} />
    </>
  );
}

export function StyleSpectrum({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 90);
  const [buildings, setBuildings] = useState<CityBuilding[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const gameEnded = useRef(false);

  useEffect(() => {
    const initialBuildings: CityBuilding[] = [];
    let id = 0;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        initialBuildings.push({
          id: id,
          position: [i * 4 - 4, 1, j * 4 - 2],
          styled: false,
          targetColor: TARGET_COLORS[id % TARGET_COLORS.length],
          currentColor: '#64748b',
        });
        id++;
      }
    }
    
    setBuildings(initialBuildings);
  }, []);

  useEffect(() => {
    if (gameEnded.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameEnded.current) return;
    const allStyled = buildings.every(b => b.styled);
    if (allStyled && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [buildings, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 90) - timeLeft,
      success,
      xpEarned: success ? 180 : 90,
    });
  };

  const handleBuildingClick = (id: number) => {
    if (!selectedColor) return;

    const building = buildings.find(b => b.id === id);
    if (!building || building.styled) return;

    const isCorrect = building.targetColor === selectedColor;
    
    setBuildings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, styled: true, currentColor: selectedColor }
          : b
      )
    );

    if (isCorrect) {
      setScore(prev => prev + 15);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Score</div>
            <div className="text-3xl font-bold text-white">{score}</div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Time</div>
            <div className="text-3xl font-bold text-white">{timeLeft}s</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30">
          <p className="text-white text-center">
            <span className="font-bold text-purple-300">Select a color from the palette</span>, then click buildings to style them. Match each building's target color!
          </p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <Scene
          buildings={buildings}
          onBuildingClick={handleBuildingClick}
          onColorSelect={setSelectedColor}
          selectedColor={selectedColor}
        />
      </Canvas>
    </div>
  );
}
