import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CursorFollower({ variant = 'circle' }) {
  const cursorDotRef = useRef(null);
  const cursorBlobRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animate cursor dot to follow mouse immediately
    gsap.to({}, {
      duration: 0.016, // 60fps
      repeat: -1,
      onRepeat: () => {
        if (cursorDotRef.current) {
          gsap.set(cursorDotRef.current, {
            x: mousePos.current.x,
            y: mousePos.current.y,
          });
        }
      }
    });

    // Animate cursor blob/circle with delay
    gsap.to(cursorBlobRef.current, {
      duration: 0.3,
      x: () => mousePos.current.x,
      y: () => mousePos.current.y,
      ease: 'power2.out',
      repeat: -1,
    });

    // Add blob morphing effect if variant is 'blob'
    if (variant === 'blob' && cursorBlobRef.current) {
      // Create organic blob morphing effect
      const morphTimeline = gsap.timeline({ repeat: -1 });
      
      morphTimeline
        .to(cursorBlobRef.current, {
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          duration: 1.5,
          ease: 'sine.inOut',
        })
        .to(cursorBlobRef.current, {
          borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          duration: 1.5,
          ease: 'sine.inOut',
        })
        .to(cursorBlobRef.current, {
          borderRadius: '70% 30% 50% 50% / 30% 30% 70% 70%',
          duration: 1.5,
          ease: 'sine.inOut',
        })
        .to(cursorBlobRef.current, {
          borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
          duration: 1.5,
          ease: 'sine.inOut',
        });
    }

    // Handle hover effects
    const handleMouseEnter = () => {
      if (cursorBlobRef.current) {
        gsap.to(cursorBlobRef.current, {
          scale: 1.8,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      if (cursorBlobRef.current) {
        gsap.to(cursorBlobRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [variant]);

  return (
    <>
      {/* Small dot cursor */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[10000]"
        style={{
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
        }}
      />
      
      {/* Large blob/circle cursor */}
      <div
        ref={cursorBlobRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          transform: 'translate(-50%, -50%)',
          width: variant === 'blob' ? '80px' : '48px',
          height: variant === 'blob' ? '80px' : '48px',
          borderRadius: variant === 'blob' ? '40% 60% 60% 40% / 60% 40% 60% 40%' : '50%',
          background: variant === 'blob' 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))' 
            : 'transparent',
          border: variant === 'blob' ? 'none' : '2px solid rgba(99, 102, 241, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />
    </>
  );
}
