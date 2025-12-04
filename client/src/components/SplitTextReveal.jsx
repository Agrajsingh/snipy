import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SplitTextReveal({ text, className = '', delay = 0, repeat = false, repeatDelay = 3 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const letters = containerRef.current.querySelectorAll('.letter');
    
    const animateLetters = () => {
      gsap.fromTo(
        letters,
        {
          y: 50,
          opacity: 0,
          rotationX: -90,
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.05,
          delay: delay,
          onComplete: () => {
            if (repeat) {
              // Wait before repeating
              setTimeout(() => {
                animateLetters();
              }, repeatDelay * 1000);
            }
          }
        }
      );
    };

    animateLetters();
  }, [text, delay, repeat, repeatDelay]);

  const letters = text.split('').map((char, index) => (
    <span
      key={index}
      className="letter inline-block"
      style={{ transformOrigin: '50% 100%' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <span ref={containerRef} className={className}>
      {letters}
    </span>
  );
}
