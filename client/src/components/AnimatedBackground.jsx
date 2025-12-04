import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AnimatedBackground({ isDarkMode }) {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create floating particles
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full';
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.backgroundColor = isDarkMode 
        ? `rgba(147, 197, 253, ${Math.random() * 0.3 + 0.1})` 
        : `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`;
      
      containerRef.current.appendChild(particle);
      particles.push(particle);

      // Animate each particle
      gsap.to(particle, {
        y: `${Math.random() * 100 - 50}px`,
        x: `${Math.random() * 100 - 50}px`,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });

      gsap.to(particle, {
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    particlesRef.current = particles;

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  useEffect(() => {
    // Update particle colors when theme changes
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        backgroundColor: isDarkMode 
          ? `rgba(147, 197, 253, ${Math.random() * 0.3 + 0.1})` 
          : `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`,
        duration: 0.5,
      });
    });
  }, [isDarkMode]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
