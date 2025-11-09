import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function CursorTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    let animationId: number;
    let particleId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Create new particles with more visible colors and larger size
      const colors = ['#10b981', '#14f195', '#00ff88', '#22d3ee'];
      for (let i = 0; i < 2; i++) {
        const newParticle: Particle = {
          id: particleId++,
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 60,
          maxLife: 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 6,
        };
        
        setParticles(prev => [...prev.slice(-50), newParticle]); // Limit particles
      }
    };

    const animate = () => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vx: particle.vx * 0.95,
            vy: particle.vy * 0.95,
          }))
          .filter(particle => particle.life > 0)
      );
      
      animationId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: Math.max(0.3, particle.life / particle.maxLife),
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            transform: `scale(${particle.life / particle.maxLife})`,
          }}
        />
      ))}
    </div>
  );
}
