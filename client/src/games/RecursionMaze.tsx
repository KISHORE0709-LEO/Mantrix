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

interface MazeCell {
  x: number;
  z: number;
  walls: { north: boolean; south: boolean; east: boolean; west: boolean };
}

function Player({ onPositionChange, walls }: { onPositionChange: (pos: THREE.Vector3) => void; walls: MazeCell[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const [, getKeys] = useKeyboardControls<Controls>();

  const checkWallCollision = (pos: THREE.Vector3): boolean => {
    const cellSize = 3;
    const cellX = Math.round(pos.x / cellSize) * cellSize;
    const cellZ = Math.round(pos.z / cellSize) * cellSize;
    
    const cell = walls.find(w => w.x === cellX && w.z === cellZ);
    if (!cell) return true;

    const localX = pos.x - cellX;
    const localZ = pos.z - cellZ;
    const threshold = 1.2;

    if (cell.walls.north && localZ < -threshold) return true;
    if (cell.walls.south && localZ > threshold) return true;
    if (cell.walls.east && localX > threshold) return true;
    if (cell.walls.west && localX < -threshold) return true;

    return false;
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const keys = getKeys();
    const speed = 4;
    
    velocity.current.set(0, 0, 0);
    
    if (keys.forward) velocity.current.z -= speed * delta;
    if (keys.back) velocity.current.z += speed * delta;
    if (keys.left) velocity.current.x -= speed * delta;
    if (keys.right) velocity.current.x += speed * delta;

    const newPos = meshRef.current.position.clone().add(velocity.current);
    
    if (!checkWallCollision(newPos)) {
      meshRef.current.position.copy(newPos);
    }

    meshRef.current.position.x = Math.max(-15, Math.min(15, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-15, Math.min(15, meshRef.current.position.z));

    onPositionChange(meshRef.current.position);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  );
}

function MazeWalls() {
  const walls: MazeCell[] = [
    { x: 0, z: 0, walls: { north: true, south: false, east: false, west: true } },
    { x: 3, z: 0, walls: { north: true, south: false, east: false, west: false } },
    { x: 6, z: 0, walls: { north: true, south: false, east: true, west: false } },
    { x: 0, z: -3, walls: { north: false, south: false, east: false, west: true } },
    { x: 3, z: -3, walls: { north: false, south: false, east: false, west: false } },
    { x: 6, z: -3, walls: { north: false, south: false, east: true, west: false } },
    { x: 0, z: -6, walls: { north: false, south: false, east: false, west: true } },
    { x: 3, z: -6, walls: { north: false, south: false, east: false, west: false } },
    { x: 6, z: -6, walls: { north: false, south: true, east: true, west: false } },
    { x: 0, z: -9, walls: { north: false, south: true, east: false, west: true } },
    { x: 3, z: -9, walls: { north: false, south: true, east: false, west: false } },
    { x: 6, z: -9, walls: { north: true, south: true, east: true, west: false } },
  ];

  return (
    <>
      {walls.map((cell, idx) => (
        <group key={idx} position={[cell.x, 0, cell.z]}>
          {cell.walls.north && (
            <mesh position={[0, 1, -1.5]}>
              <boxGeometry args={[3, 2, 0.2]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          )}
          {cell.walls.south && (
            <mesh position={[0, 1, 1.5]}>
              <boxGeometry args={[3, 2, 0.2]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          )}
          {cell.walls.east && (
            <mesh position={[1.5, 1, 0]}>
              <boxGeometry args={[0.2, 2, 3]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          )}
          {cell.walls.west && (
            <mesh position={[-1.5, 1, 0]}>
              <boxGeometry args={[0.2, 2, 3]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

function Checkpoints({ positions, reached }: { positions: [number, number, number][], reached: boolean[] }) {
  return (
    <>
      {positions.map((pos, idx) => (
        !reached[idx] && (
          <mesh key={idx} position={pos}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial
              color={idx === 0 ? "#22c55e" : "#fbbf24"}
              emissive={idx === 0 ? "#22c55e" : "#fbbf24"}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      ))}
    </>
  );
}

function Game({
  checkpoints,
  onCheckpointReach,
  walls,
}: {
  checkpoints: [number, number, number][];
  onCheckpointReach: (idx: number) => void;
  walls: MazeCell[];
}) {
  const reachedRef = useRef<boolean[]>(checkpoints.map(() => false));

  const handlePlayerMove = (playerPos: THREE.Vector3) => {
    checkpoints.forEach((checkpoint, idx) => {
      if (!reachedRef.current[idx]) {
        const cpPos = new THREE.Vector3(...checkpoint);
        const distance = playerPos.distanceTo(cpPos);
        if (distance < 1.2) {
          reachedRef.current[idx] = true;
          onCheckpointReach(idx);
        }
      }
    });
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0, -4.5]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <MazeWalls />
      <Checkpoints positions={checkpoints} reached={reachedRef.current} />
      <Player onPositionChange={handlePlayerMove} walls={walls} />
    </>
  );
}

export function RecursionMaze({ config, onComplete, onExit }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 90);
  const [checkpointsReached, setCheckpointsReached] = useState(0);
  const gameEnded = useRef(false);

  const walls: MazeCell[] = [
    { x: 0, z: 0, walls: { north: true, south: false, east: false, west: true } },
    { x: 3, z: 0, walls: { north: true, south: false, east: false, west: false } },
    { x: 6, z: 0, walls: { north: true, south: false, east: true, west: false } },
    { x: 0, z: -3, walls: { north: false, south: false, east: false, west: true } },
    { x: 3, z: -3, walls: { north: false, south: false, east: false, west: false } },
    { x: 6, z: -3, walls: { north: false, south: false, east: true, west: false } },
    { x: 0, z: -6, walls: { north: false, south: false, east: false, west: true } },
    { x: 3, z: -6, walls: { north: false, south: false, east: false, west: false } },
    { x: 6, z: -6, walls: { north: false, south: true, east: true, west: false } },
    { x: 0, z: -9, walls: { north: false, south: true, east: false, west: true } },
    { x: 3, z: -9, walls: { north: false, south: true, east: false, west: false } },
    { x: 6, z: -9, walls: { north: true, south: true, east: true, west: false } },
  ];

  const checkpoints: [number, number, number][] = [
    [6, 0.5, -9],
    [3, 0.5, -6],
    [0, 0.5, -3],
  ];

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
    
    if (checkpointsReached === checkpoints.length && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [score, checkpointsReached]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 90) - timeLeft,
      success,
      xpEarned: success ? 120 : 60,
    });
  };

  const handleCheckpointReach = (idx: number) => {
    setCheckpointsReached(prev => prev + 1);
    setScore(prev => prev + 30);
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
            <div className="text-sm text-purple-300 mb-1">Checkpoints</div>
            <div className="text-3xl font-bold text-yellow-400">{checkpointsReached}/{checkpoints.length}</div>
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
              Navigate the maze and reach the <span className="text-green-400 font-bold">GREEN</span> exit! Collect <span className="text-yellow-400 font-bold">checkpoints</span> along the way.
            </p>
          </div>
        </div>
      </div>

      <KeyboardControls map={keyMap}>
        <Canvas camera={{ position: [3, 18, 8], fov: 50, rotation: [-Math.PI / 4, 0, 0] }}>
          <Game checkpoints={checkpoints} onCheckpointReach={handleCheckpointReach} walls={walls} />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
