import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataTable {
  id: number;
  name: string;
  position: [number, number, number];
  type: 'users' | 'posts' | 'comments';
}

interface DataShard {
  id: number;
  tableType: 'users' | 'posts' | 'comments';
  position: [number, number, number];
  collected: boolean;
}

const TABLE_COLORS: Record<string, string> = {
  users: '#8b5cf6',
  posts: '#3b82f6',
  comments: '#10b981',
};

function Table({ table }: { table: DataTable }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={table.position}>
      <boxGeometry args={[2, 0.5, 1.5]} />
      <meshStandardMaterial
        color={TABLE_COLORS[table.type]}
        emissive={TABLE_COLORS[table.type]}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function Shard({ shard, onClick }: { shard: DataShard; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && !shard.collected) {
      meshRef.current.rotation.y += 0.03;
      meshRef.current.position.y = shard.position[1] + Math.sin(Date.now() * 0.003) * 0.2;
    }
  });

  if (shard.collected) return null;

  return (
    <mesh ref={meshRef} position={shard.position} onClick={onClick}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color={TABLE_COLORS[shard.tableType]}
        emissive={TABLE_COLORS[shard.tableType]}
        emissiveIntensity={0.7}
      />
    </mesh>
  );
}

function Scene({ tables, shards, onShardClick }: {
  tables: DataTable[];
  shards: DataShard[];
  onShardClick: (id: number) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#8b5cf6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {tables.map(table => (
        <Table key={table.id} table={table} />
      ))}

      {shards.map(shard => (
        <Shard key={shard.id} shard={shard} onClick={() => onShardClick(shard.id)} />
      ))}
    </>
  );
}

export function DataBridge({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 90);
  const [tables, setTables] = useState<DataTable[]>([]);
  const [shards, setShards] = useState<DataShard[]>([]);
  const [selectedTable, setSelectedTable] = useState<'users' | 'posts' | 'comments' | null>(null);
  const gameEnded = useRef(false);

  useEffect(() => {
    const initialTables: DataTable[] = [
      { id: 0, name: 'Users', position: [-6, 1, 0], type: 'users' },
      { id: 1, name: 'Posts', position: [0, 1, 0], type: 'posts' },
      { id: 2, name: 'Comments', position: [6, 1, 0], type: 'comments' },
    ];

    const shardPositions: [number, number, number][] = [
      [-4, 2, -4], [-2, 2, -4], [0, 2, -4], [2, 2, -4], [4, 2, -4],
      [-4, 2, 4], [-2, 2, 4], [0, 2, 4], [2, 2, 4], [4, 2, 4],
    ];

    const tableTypes: Array<'users' | 'posts' | 'comments'> = ['users', 'posts', 'comments'];
    const initialShards: DataShard[] = shardPositions.map((pos, index) => ({
      id: index,
      tableType: tableTypes[index % 3],
      position: pos,
      collected: false,
    }));
    
    setTables(initialTables);
    setShards(initialShards);
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
    const allCollected = shards.every(s => s.collected);
    if (allCollected && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [shards, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 90) - timeLeft,
      success,
      xpEarned: success ? 350 : 175,
    });
  };

  const handleShardClick = (id: number) => {
    const shard = shards.find(s => s.id === id);
    if (!shard || shard.collected) return;

    if (selectedTable === null) {
      setSelectedTable(shard.tableType);
    }

    if (selectedTable === shard.tableType) {
      setShards(prev =>
        prev.map(s =>
          s.id === id ? { ...s, collected: true } : s
        )
      );
      setScore(prev => prev + 10);
    } else if (selectedTable !== null) {
      setScore(prev => Math.max(0, prev - 3));
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

          {selectedTable && (
            <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-yellow-500/30">
              <div className="text-sm text-yellow-300 mb-1">Collecting</div>
              <div className="text-2xl font-bold" style={{ color: TABLE_COLORS[selectedTable] }}>{selectedTable}</div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30">
          <p className="text-white text-center mb-2">
            <span className="font-bold text-purple-300">Collect data shards and organize them</span> - Click matching shards of the same color consecutively. Each color represents a database table!
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded" style={{ backgroundColor: TABLE_COLORS.users }}>Users</span>
            <span className="px-3 py-1 rounded" style={{ backgroundColor: TABLE_COLORS.posts }}>Posts</span>
            <span className="px-3 py-1 rounded" style={{ backgroundColor: TABLE_COLORS.comments }}>Comments</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 10, 12], fov: 50 }}>
        <Scene tables={tables} shards={shards} onShardClick={handleShardClick} />
      </Canvas>
    </div>
  );
}
