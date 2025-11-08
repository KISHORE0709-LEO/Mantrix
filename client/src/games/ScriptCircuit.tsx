import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CircuitNode {
  id: number;
  position: [number, number, number];
  activated: boolean;
  requiredSequence: number;
}

function Node({ node, onClick, isNext }: { node: CircuitNode; onClick: () => void; isNext: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (isNext && !node.activated) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      if (!node.activated) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={node.position} onClick={onClick}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color={node.activated ? '#10b981' : isNext ? '#f59e0b' : '#64748b'}
        emissive={node.activated ? '#10b981' : isNext ? '#f59e0b' : '#000000'}
        emissiveIntensity={node.activated ? 0.6 : isNext ? 0.4 : 0}
      />
    </mesh>
  );
}

function ConnectionLines({ nodes }: { nodes: CircuitNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (index === nodes.length - 1) return null;
        const nextNode = nodes[index + 1];
        
        const start = new THREE.Vector3(...node.position);
        const end = new THREE.Vector3(...nextNode.position);
        const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
        const distance = start.distanceTo(end);
        
        return (
          <mesh key={`line-${index}`} position={[midPoint.x, midPoint.y, midPoint.z]}>
            <boxGeometry args={[distance, 0.1, 0.1]} />
            <meshStandardMaterial
              color={node.activated ? '#10b981' : '#475569'}
              emissive={node.activated ? '#10b981' : '#000000'}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
    </>
  );
}

function Scene({ nodes, onNodeClick, nextSequence }: {
  nodes: CircuitNode[];
  onNodeClick: (id: number) => void;
  nextSequence: number;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 2, 0]} intensity={0.8} color="#3b82f6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <ConnectionLines nodes={nodes} />

      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node.id)}
          isNext={node.requiredSequence === nextSequence}
        />
      ))}
    </>
  );
}

export function ScriptCircuit({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 75);
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [nextSequence, setNextSequence] = useState(0);
  const gameEnded = useRef(false);

  useEffect(() => {
    const positions: [number, number, number][] = [
      [-6, 1, -4],
      [-3, 1, 0],
      [0, 1, -4],
      [3, 1, 0],
      [6, 1, -4],
      [3, 1, 4],
      [0, 1, 0],
      [-3, 1, 4],
    ];

    const initialNodes: CircuitNode[] = positions.map((pos, index) => ({
      id: index,
      position: pos,
      activated: false,
      requiredSequence: index,
    }));
    
    setNodes(initialNodes);
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
    const allActivated = nodes.every(n => n.activated);
    if (allActivated && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [nodes, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 75) - timeLeft,
      success,
      xpEarned: success ? 220 : 110,
    });
  };

  const handleNodeClick = (id: number) => {
    const node = nodes.find(n => n.id === id);
    if (!node || node.activated) return;

    const isCorrect = node.requiredSequence === nextSequence;
    
    if (isCorrect) {
      setNodes(prev =>
        prev.map(n =>
          n.id === id ? { ...n, activated: true } : n
        )
      );
      setScore(prev => prev + 10);
      setNextSequence(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
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

          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-yellow-500/30">
            <div className="text-sm text-yellow-300 mb-1">Next Node</div>
            <div className="text-3xl font-bold text-white">{nextSequence + 1}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-blue-500/30">
          <p className="text-white text-center">
            <span className="font-bold text-blue-300">Activate circuit nodes in sequence</span> - like JavaScript execution order. Click the glowing node to activate it!
          </p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
        <Scene nodes={nodes} onNodeClick={handleNodeClick} nextSequence={nextSequence} />
      </Canvas>
    </div>
  );
}
