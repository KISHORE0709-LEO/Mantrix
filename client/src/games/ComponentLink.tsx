import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Component {
  id: number;
  type: 'parent' | 'child';
  position: [number, number, number];
  connected: boolean;
  parentId?: number;
}

function ComponentBox({ component, onClick, isHighlighted }: { component: Component; onClick: () => void; isHighlighted: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (isHighlighted) {
        meshRef.current.position.y = component.position[1] + Math.sin(Date.now() * 0.004) * 0.2;
      }
      meshRef.current.rotation.y += component.connected ? 0 : 0.01;
    }
  });

  const color = component.type === 'parent' ? '#8b5cf6' : '#3b82f6';

  return (
    <mesh ref={meshRef} position={component.position} onClick={onClick}>
      <boxGeometry args={component.type === 'parent' ? [2, 1.5, 1.5] : [1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color={component.connected ? color : '#64748b'}
        emissive={component.connected ? color : isHighlighted ? '#f59e0b' : '#000000'}
        emissiveIntensity={component.connected ? 0.5 : isHighlighted ? 0.4 : 0}
      />
    </mesh>
  );
}

function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
  const distance = startVec.distanceTo(endVec);
  const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
  const angle = Math.atan2(direction.x, direction.z);

  return (
    <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[0.1, 0.1, distance]} />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
    </mesh>
  );
}

function Scene({ components, onComponentClick, selectedComponent, connections }: {
  components: Component[];
  onComponentClick: (id: number) => void;
  selectedComponent: number | null;
  connections: Array<{ parent: number; child: number }>;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#8b5cf6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {connections.map((conn, index) => {
        const parent = components.find(c => c.id === conn.parent);
        const child = components.find(c => c.id === conn.child);
        if (parent && child) {
          return <ConnectionLine key={index} start={parent.position} end={child.position} />;
        }
        return null;
      })}

      {components.map(component => (
        <ComponentBox
          key={component.id}
          component={component}
          onClick={() => onComponentClick(component.id)}
          isHighlighted={selectedComponent === component.id}
        />
      ))}
    </>
  );
}

export function ComponentLink({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 80);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [connections, setConnections] = useState<Array<{ parent: number; child: number }>>([]);
  const gameEnded = useRef(false);

  useEffect(() => {
    const initialComponents: Component[] = [
      { id: 0, type: 'parent', position: [-5, 2, 0], connected: false },
      { id: 1, type: 'child', position: [-5, 1, -3], connected: false, parentId: 0 },
      { id: 2, type: 'child', position: [-5, 1, 3], connected: false, parentId: 0 },
      
      { id: 3, type: 'parent', position: [0, 2, 0], connected: false },
      { id: 4, type: 'child', position: [0, 1, -3], connected: false, parentId: 3 },
      { id: 5, type: 'child', position: [0, 1, 3], connected: false, parentId: 3 },
      
      { id: 6, type: 'parent', position: [5, 2, 0], connected: false },
      { id: 7, type: 'child', position: [5, 1, -3], connected: false, parentId: 6 },
      { id: 8, type: 'child', position: [5, 1, 3], connected: false, parentId: 6 },
    ];
    
    setComponents(initialComponents);
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
    const allConnected = components.filter(c => c.type === 'child').every(c => c.connected);
    if (allConnected && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [components, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 80) - timeLeft,
      success,
      xpEarned: success ? 280 : 140,
    });
  };

  const handleComponentClick = (id: number) => {
    if (selectedComponent === null) {
      setSelectedComponent(id);
    } else {
      const first = components.find(c => c.id === selectedComponent);
      const second = components.find(c => c.id === id);
      
      if (first && second && first.id !== second.id) {
        if (first.type === 'parent' && second.type === 'child' && second.parentId === first.id) {
          setComponents(prev =>
            prev.map(c =>
              c.id === second.id ? { ...c, connected: true } : c
            )
          );
          setConnections(prev => [...prev, { parent: first.id, child: second.id }]);
          setScore(prev => prev + 15);
        } else if (second.type === 'parent' && first.type === 'child' && first.parentId === second.id) {
          setComponents(prev =>
            prev.map(c =>
              c.id === first.id ? { ...c, connected: true } : c
            )
          );
          setConnections(prev => [...prev, { parent: second.id, child: first.id }]);
          setScore(prev => prev + 15);
        } else {
          setScore(prev => Math.max(0, prev - 5));
        }
      }
      
      setSelectedComponent(null);
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
            <span className="font-bold text-purple-300">Connect parent components to their children</span> - Purple boxes are parents, blue are children. Click parent, then click its child!
          </p>
        </div>
      </div>

      <Canvas camera={{ position: [0, 10, 12], fov: 50 }}>
        <Scene
          components={components}
          onComponentClick={handleComponentClick}
          selectedComponent={selectedComponent}
          connections={connections}
        />
      </Canvas>
    </div>
  );
}
