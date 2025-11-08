import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SortItem {
  id: number;
  value: number;
  position: [number, number, number];
  targetPosition: [number, number, number];
  sorted: boolean;
}

function SortingItem({ item, onClick }: { item: SortItem; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const target = new THREE.Vector3(...item.targetPosition);
    meshRef.current.position.lerp(target, 0.1);
    
    meshRef.current.rotation.y += 0.01;
  });

  const color = item.sorted ? "#22c55e" : "#8b5cf6";
  const height = item.value * 0.5;

  return (
    <mesh
      ref={meshRef}
      position={item.position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={[1.2, height, 1.2]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      <mesh position={[0, height / 2 + 0.3, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </mesh>
  );
}

function Conveyor() {
  return (
    <>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[15, 0.3, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, -0.5, 2.5]}>
        <boxGeometry args={[15, 0.2, 0.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, -0.5, -2.5]}>
        <boxGeometry args={[15, 0.2, 0.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </>
  );
}

function Game({ items, onItemClick }: { items: SortItem[]; onItemClick: (id: number) => void }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Conveyor />
      {items.map(item => (
        <SortingItem key={item.id} item={item} onClick={() => onItemClick(item.id)} />
      ))}
    </>
  );
}

export function SortingConveyor({ config, onComplete, onExit }: GameProps) {
  const [items, setItems] = useState<SortItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 90);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const gameEnded = useRef(false);

  useEffect(() => {
    const values = [5, 3, 8, 1, 6];
    const initialItems: SortItem[] = values.map((value, idx) => ({
      id: idx,
      value,
      position: [(idx - 2) * 3, 0, 0] as [number, number, number],
      targetPosition: [(idx - 2) * 3, 0, 0] as [number, number, number],
      sorted: false,
    }));
    setItems(initialItems);
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
    if (gameEnded.current || items.length === 0) return;
    
    const isSorted = items.every((item, idx) => {
      if (idx === 0) return true;
      return items[idx - 1].value <= item.value;
    });

    if (isSorted && !items.some(i => i.sorted)) {
      setItems(prev => prev.map(item => ({ ...item, sorted: true })));
      setScore(100);
      setTimeout(() => {
        if (gameEnded.current) return;
        gameEnded.current = true;
        const success = 100 >= config.passingScore;
        onComplete({
          score: 100,
          timeSpent: (config.timeLimit || 90) - timeLeft,
          success,
          xpEarned: success ? 150 : 75,
        });
      }, 1500);
    }
  }, [items]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 90) - timeLeft,
      success,
      xpEarned: success ? 150 : 75,
    });
  };

  const handleItemClick = (id: number) => {
    if (selectedItem === null) {
      setSelectedItem(id);
    } else {
      const item1Idx = items.findIndex(i => i.id === selectedItem);
      const item2Idx = items.findIndex(i => i.id === id);

      if (item1Idx !== -1 && item2Idx !== -1 && item1Idx !== item2Idx) {
        setItems(prev => {
          const newItems = [...prev];
          const temp = { ...newItems[item1Idx] };
          
          const targetPos1 = newItems[item1Idx].targetPosition;
          const targetPos2 = newItems[item2Idx].targetPosition;
          
          newItems[item1Idx] = {
            ...newItems[item2Idx],
            targetPosition: targetPos1,
          };
          newItems[item2Idx] = {
            ...temp,
            targetPosition: targetPos2,
          };
          
          return newItems;
        });
      }
      setSelectedItem(null);
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
            <div className="text-sm text-purple-300 mb-1">Target</div>
            <div className="text-3xl font-bold text-yellow-400">{config.passingScore}</div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Time</div>
            <div className={`text-3xl font-bold ${timeLeft < 15 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </div>
          </div>

          <button
            onClick={onExit}
            className="px-6 py-3 bg-red-600/80 hover:bg-red-700 backdrop-blur-sm text-white rounded-lg font-semibold border border-red-500/50"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <p className="text-purple-200 text-center">
              Click on two items to <span className="text-yellow-400 font-bold">SWAP</span> them. Sort from <span className="text-green-400 font-bold">smallest to largest</span>!
              {selectedItem !== null && <span className="ml-4 text-yellow-400">✓ 1 selected</span>}
            </p>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <Game items={items} onItemClick={handleItemClick} />
      </Canvas>
    </div>
  );
}
