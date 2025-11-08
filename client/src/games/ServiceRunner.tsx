import type { GameProps } from './types';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Route {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  position: [number, number, number];
  connected: boolean;
  targetEndpoint: number;
}

interface Endpoint {
  id: number;
  name: string;
  position: [number, number, number];
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#3b82f6',
  POST: '#10b981',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
};

function RouteBox({ route, onClick, isSelected }: { route: Route; onClick: () => void; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (isSelected && !route.connected) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      if (!route.connected) {
        meshRef.current.rotation.z += 0.01;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={route.position} onClick={onClick}>
      <boxGeometry args={[1.2, 0.6, 0.6]} />
      <meshStandardMaterial
        color={route.connected ? METHOD_COLORS[route.method] : '#64748b'}
        emissive={route.connected ? METHOD_COLORS[route.method] : isSelected ? '#f59e0b' : '#000000'}
        emissiveIntensity={route.connected ? 0.5 : isSelected ? 0.4 : 0}
      />
    </mesh>
  );
}

function EndpointBox({ endpoint }: { endpoint: Endpoint }) {
  return (
    <mesh position={endpoint.position}>
      <boxGeometry args={[1.5, 1.5, 0.8]} />
      <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
    </mesh>
  );
}

function RouteLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
  const distance = startVec.distanceTo(endVec);

  return (
    <mesh position={[midPoint.x, midPoint.y, midPoint.z]}>
      <boxGeometry args={[0.15, distance, 0.15]} />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
    </mesh>
  );
}

function Scene({ routes, endpoints, onRouteClick, selectedRoute, connections }: {
  routes: Route[];
  endpoints: Endpoint[];
  onRouteClick: (id: number, endpointId: number) => void;
  selectedRoute: number | null;
  connections: Array<{ routeId: number; endpointId: number }>;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <pointLight position={[0, 3, 0]} intensity={0.7} color="#3b82f6" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {connections.map((conn, index) => {
        const route = routes.find(r => r.id === conn.routeId);
        const endpoint = endpoints.find(e => e.id === conn.endpointId);
        if (route && endpoint) {
          return <RouteLine key={index} start={route.position} end={endpoint.position} />;
        }
        return null;
      })}

      {routes.map(route => (
        <RouteBox
          key={route.id}
          route={route}
          onClick={() => onRouteClick(route.id, route.targetEndpoint)}
          isSelected={selectedRoute === route.id}
        />
      ))}

      {endpoints.map(endpoint => (
        <EndpointBox key={endpoint.id} endpoint={endpoint} />
      ))}
    </>
  );
}

export function ServiceRunner({ config, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 85);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [connections, setConnections] = useState<Array<{ routeId: number; endpointId: number }>>([]);
  const gameEnded = useRef(false);

  useEffect(() => {
    const initialEndpoints: Endpoint[] = [
      { id: 0, name: '/users', position: [6, 2, -4] },
      { id: 1, name: '/posts', position: [6, 2, 0] },
      { id: 2, name: '/comments', position: [6, 2, 4] },
    ];

    const initialRoutes: Route[] = [
      { id: 0, method: 'GET', position: [-6, 1, -4], connected: false, targetEndpoint: 0 },
      { id: 1, method: 'POST', position: [-6, 1, -2], connected: false, targetEndpoint: 1 },
      { id: 2, method: 'PUT', position: [-6, 1, 0], connected: false, targetEndpoint: 1 },
      { id: 3, method: 'DELETE', position: [-6, 1, 2], connected: false, targetEndpoint: 2 },
      { id: 4, method: 'GET', position: [-6, 1, 4], connected: false, targetEndpoint: 2 },
    ];
    
    setEndpoints(initialEndpoints);
    setRoutes(initialRoutes);
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
    const allConnected = routes.every(r => r.connected);
    if (allConnected && score >= config.passingScore) {
      handleGameEnd();
    }
  }, [routes, score]);

  const handleGameEnd = () => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    
    const success = score >= config.passingScore;
    onComplete({
      score,
      timeSpent: (config.timeLimit || 85) - timeLeft,
      success,
      xpEarned: success ? 320 : 160,
    });
  };

  const handleRouteClick = (routeId: number, targetEndpoint: number) => {
    const route = routes.find(r => r.id === routeId);
    if (!route || route.connected) return;

    if (selectedRoute === null) {
      setSelectedRoute(routeId);
    } else if (selectedRoute === routeId) {
      const isCorrect = route.targetEndpoint === targetEndpoint;
      
      setRoutes(prev =>
        prev.map(r =>
          r.id === routeId ? { ...r, connected: true } : r
        )
      );
      setConnections(prev => [...prev, { routeId, endpointId: targetEndpoint }]);
      
      if (isCorrect) {
        setScore(prev => prev + 17);
      } else {
        setScore(prev => Math.max(0, prev - 5));
      }
      
      setSelectedRoute(null);
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
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-blue-500/30">
          <p className="text-white text-center mb-2">
            <span className="font-bold text-blue-300">Connect API routes to endpoints</span> - Click a route twice to connect it. Routes on the left, endpoints on the right!
          </p>
          <div className="flex justify-center gap-3 text-sm">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: METHOD_COLORS.GET }}>GET</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: METHOD_COLORS.POST }}>POST</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: METHOD_COLORS.PUT }}>PUT</span>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: METHOD_COLORS.DELETE }}>DELETE</span>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <Scene
          routes={routes}
          endpoints={endpoints}
          onRouteClick={handleRouteClick}
          selectedRoute={selectedRoute}
          connections={connections}
        />
      </Canvas>
    </div>
  );
}
