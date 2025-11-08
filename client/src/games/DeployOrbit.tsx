import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConfigNode {
  id: number;
  name: string;
  position: [number, number, number];
  configured: boolean;
  type: 'env' | 'build' | 'dns' | 'security';
}

const NODE_COLORS: Record<string, string> = {
  env: '#3b82f6',
  build: '#10b981',
  dns: '#f59e0b',
  security: '#ef4444',
};

function ConfigSphere({ node, onClick, isPriority }: { node: ConfigNode; onClick: () => void; isPriority: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (!node.configured) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.rotation.x += 0.01;
      }
      if (isPriority) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={node.position} onClick={onClick}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshStandardMaterial
        color={node.configured ? NODE_COLORS[node.type] : '#64748b'}
        emissive={node.configured ? NODE_COLORS[node.type] : isPriority ? '#f59e0b' : '#000000'}
        emissiveIntensity={node.configured ? 0.7 : isPriority ? 0.5 : 0}
      />
    </mesh>
  );
}

function Satellite() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
    </mesh>
  );
}

function OrbitRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[6, 0.05, 16, 100]} />
      <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.2} />
    </mesh>
  );
}

function Scene({ nodes, onNodeClick, nextPriority }: {
  nodes: ConfigNode[];
  onNodeClick: (id: number) => void;
  nextPriority: number;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#8b5cf6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <Satellite />
      <OrbitRing />

      {nodes.map(node => (
        <ConfigSphere
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node.id)}
          isPriority={node.id === nextPriority && !node.configured}
        />
      ))}
    </>
  );
}

export function DeployOrbit({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 95);
  const [nodes, setNodes] = useState<ConfigNode[]>([]);
  const [nextPriority, setNextPriority] = useState(0);
  const gameEnded = useRef(false);

  useEffect(() => {
    const angleStep = (Math.PI * 2) / 8;
    const radius = 6;

    const configTypes: Array<'env' | 'build' | 'dns' | 'security'> = [
      'env', 'build', 'env', 'dns', 'build', 'security', 'dns', 'security'
    ];

    const initialNodes: ConfigNode[] = configTypes.map((type, index) => {
      const angle = angleStep * index;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      return {
        id: index,
        name: type.toUpperCase(),
        position: [x, 1, z],
        configured: false,
        type,
      };
    });
    
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
    const allConfigured = nodes.every(n => n.configured);
    if (allConfigured && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [nodes, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 95) - timeLeft,
      success,
      xpEarned: success ? 400 : 200,
    });
  };

  const handleNodeClick = (id: number) => {
    const node = nodes.find(n => n.id === id);
    if (!node || node.configured) return;

    const isCorrectOrder = node.id === nextPriority;
    
    if (isCorrectOrder) {
      setNodes(prev =>
        prev.map(n =>
          n.id === id ? { ...n, configured: true } : n
        )
      );
      setScore(prev => prev + 12);
      setNextPriority(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 8));
    }
  };

  const configuredCount = nodes.filter(n => n.configured).length;

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Score</div>
            <div className="text-3xl font-bold text-white">{score}</div>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Time</div>
            <div className="text-3xl font-bold text-white">{timeLeft}s</div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-green-500/30">
            <div className="text-sm text-green-300 mb-1">Configured</div>
            <div className="text-3xl font-bold text-white">{configuredCount}/{nodes.length}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30">
          <p className="text-white text-center mb-2">
            <span className="font-bold text-purple-300">Configure deployment nodes in sequence</span> - Click the glowing node to configure it. Deploy your app to orbit!
          </p>
          <div className="flex justify-center gap-3 text-sm">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: NODE_COLORS.env }}>ENV</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: NODE_COLORS.build }}>BUILD</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: NODE_COLORS.dns }}>DNS</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: NODE_COLORS.security }}>SECURITY</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 12, 12], fov: 50 }}>
        <Scene nodes={nodes} onNodeClick={handleNodeClick} nextPriority={nextPriority} />
      </Canvas>
    </div>
  );
}
