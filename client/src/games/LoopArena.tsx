import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
}

interface Collectible {
  id: number;
  position: [number, number, number];
  collected: boolean;
}

function Player({ onCollect }: { onCollect: (pos: THREE.Vector3) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const [, getKeys] = useKeyboardControls<Controls>();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const keys = getKeys();
    const speed = 5;
    
    velocity.current.set(0, 0, 0);
    
    if (keys.forward) velocity.current.z -= speed * delta;
    if (keys.back) velocity.current.z += speed * delta;
    if (keys.left) velocity.current.x -= speed * delta;
    if (keys.right) velocity.current.x += speed * delta;

    meshRef.current.position.add(velocity.current);

    meshRef.current.position.x = Math.max(-10, Math.min(10, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-10, Math.min(10, meshRef.current.position.z));

    onCollect(meshRef.current.position);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  );
}

function Collectibles({ items, onCollect }: { items: Collectible[], onCollect: (id: number) => void }) {
  const meshRefs = useRef<Map<number, THREE.Mesh>>(new Map());

  useFrame(() => {
    items.forEach(item => {
      const mesh = meshRefs.current.get(item.id);
      if (mesh && !item.collected) {
        mesh.rotation.y += 0.02;
      }
    });
  });

  return (
    <>
      {items.map(item => (
        !item.collected && (
          <mesh
            key={item.id}
            ref={ref => {
              if (ref) meshRefs.current.set(item.id, ref);
            }}
            position={item.position}
          >
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
        )
      ))}
    </>
  );
}

function Arena() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 1, -10]}>
        <boxGeometry args={[20, 2, 0.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 1, 10]}>
        <boxGeometry args={[20, 2, 0.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[-10, 1, 0]}>
        <boxGeometry args={[0.5, 2, 20]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[10, 1, 0]}>
        <boxGeometry args={[0.5, 2, 20]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </>
  );
}

function Game({ collectibles, onCollect }: { collectibles: Collectible[], onCollect: (id: number) => void }) {
  const handlePlayerCollect = (playerPos: THREE.Vector3) => {
    collectibles.forEach(item => {
      if (!item.collected) {
        const itemPos = new THREE.Vector3(...item.position);
        const distance = playerPos.distanceTo(itemPos);
        if (distance < 1) {
          onCollect(item.id);
        }
      }
    });
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Arena />
      <Collectibles items={collectibles} onCollect={onCollect} />
      <Player onCollect={handlePlayerCollect} />
    </>
  );
}

export function LoopArena({ config, onComplete, onExit }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 60);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const gameEnded = useRef(false);

  useEffect(() => {
    const items: Collectible[] = [];
    let id = 0;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        items.push({
          id: id++,
          position: [i * 6 - 6, 0.5, j * 6 - 6],
          collected: false,
        });
      }
    }
    
    setCollectibles(items);
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
    
    const allCollected = collectibles.length > 0 && collectibles.every(c => c.collected);
    if (allCollected && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [score, collectibles]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 60) - timeLeft,
      success,
      xpEarned: success ? 100 : 50,
    });
  };

  const handleCollect = (id: number) => {
    setCollectibles(prev =>
      prev.map(item =>
        item.id === id ? { ...item, collected: true } : item
      )
    );
    setScore(prev => prev + 10);
  };

  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  ];

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
            <div className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
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
              Use <span className="text-yellow-400 font-bold">WASD</span> or <span className="text-yellow-400 font-bold">Arrow Keys</span> to move and collect yellow cubes!
            </p>
          </div>
        </div>
      </div>

      <KeyboardControls map={keyMap}>
        <Canvas camera={{ position: [0, 12, 12], fov: 50 }}>
          <Game collectibles={collectibles} onCollect={handleCollect} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
