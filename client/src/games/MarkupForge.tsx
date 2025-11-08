import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HTMLBlock {
  id: number;
  type: 'div' | 'h1' | 'p' | 'img' | 'button';
  position: [number, number, number];
  placed: boolean;
  targetSlot: number;
}

const BLOCK_COLORS: Record<string, string> = {
  div: '#3b82f6',
  h1: '#8b5cf6',
  p: '#ec4899',
  img: '#f59e0b',
  button: '#10b981',
};

function Block({ block, onClick }: { block: HTMLBlock; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && !block.placed) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={block.position}
      onClick={onClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={BLOCK_COLORS[block.type]}
        emissive={BLOCK_COLORS[block.type]}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function BuildingGrid({ slots, onSlotClick }: { slots: number; onSlotClick: (index: number) => void }) {
  const gridItems = [];
  
  for (let i = 0; i < slots; i++) {
    const x = (i % 3) * 2 - 2;
    const z = Math.floor(i / 3) * 2 - 2;
    
    gridItems.push(
      <mesh key={i} position={[x, 0.1, z]} onClick={() => onSlotClick(i)}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#334155" opacity={0.5} transparent />
      </mesh>
    );
  }

  return <>{gridItems}</>;
}

function Scene({ blocks, onBlockClick, slots, onSlotClick }: {
  blocks: HTMLBlock[];
  onBlockClick: (id: number) => void;
  slots: number;
  onSlotClick: (index: number) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <BuildingGrid slots={slots} onSlotClick={onSlotClick} />

      {blocks.map(block => (
        <Block key={block.id} block={block} onClick={() => onBlockClick(block.id)} />
      ))}
    </>
  );
}

export function MarkupForge({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 90);
  const [blocks, setBlocks] = useState<HTMLBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const gameEnded = useRef(false);

  const correctOrder: Array<'div' | 'h1' | 'p' | 'img' | 'button'> = ['div', 'h1', 'p', 'img', 'button'];

  useEffect(() => {
    const initialBlocks: HTMLBlock[] = [
      { id: 0, type: 'button', position: [-6, 1, -4], placed: false, targetSlot: 4 },
      { id: 1, type: 'div', position: [-2, 1, -4], placed: false, targetSlot: 0 },
      { id: 2, type: 'img', position: [2, 1, -4], placed: false, targetSlot: 3 },
      { id: 3, type: 'p', position: [6, 1, -4], placed: false, targetSlot: 2 },
      { id: 4, type: 'h1', position: [0, 1, -6], placed: false, targetSlot: 1 },
    ];
    setBlocks(initialBlocks);
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
    const allPlaced = blocks.every(b => b.placed);
    if (allPlaced && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [blocks, score]);

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

  const handleBlockClick = (id: number) => {
    setSelectedBlock(id);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (selectedBlock === null) return;

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block || block.placed) return;

    const isCorrect = block.targetSlot === slotIndex;
    
    setBlocks(prev =>
      prev.map(b =>
        b.id === selectedBlock
          ? { ...b, placed: true, position: [(slotIndex % 3) * 2 - 2, 1, Math.floor(slotIndex / 3) * 2 - 2, ] as [number, number, number] }
          : b
      )
    );

    if (isCorrect) {
      setScore(prev => prev + 20);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }

    setSelectedBlock(null);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Score</div>
            <div className="text-3xl font-bold text-white">{score}</div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-500/30">
            <div className="text-sm text-blue-300 mb-1">Time</div>
            <div className="text-3xl font-bold text-white">{timeLeft}s</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-blue-500/30">
          <p className="text-white text-center">
            <span className="font-bold text-blue-300">Click an HTML block</span>, then click a grid slot to place it. Build the correct structure!
          </p>
          <div className="mt-2 flex justify-center gap-2 flex-wrap">
            {correctOrder.map((type, i) => (
              <span key={i} className="px-3 py-1 bg-slate-700 rounded text-sm" style={{ color: BLOCK_COLORS[type] }}>
                &lt;{type}&gt;
              </span>
            ))}
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
        <Scene blocks={blocks} onBlockClick={handleBlockClick} slots={6} onSlotClick={handleSlotClick} />
      </Canvas>
    </div>
  );
}
