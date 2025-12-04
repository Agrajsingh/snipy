import { useEffect, useRef } from 'react';

export default function TextScramble({ text, className = '' }) {
  const textRef = useRef(null);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    if (!textRef.current) return;

    const el = textRef.current;
    let frame = 0;
    const queue = [];
    const frameRate = 50;

    const update = () => {
      let output = '';
      let complete = 0;

      for (let i = 0, n = queue.length; i < n; i++) {
        let { from, to, start, end, char } = queue[i];
        
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = chars[Math.floor(Math.random() * chars.length)];
            queue[i].char = char;
          }
          output += `<span class="opacity-70">${char}</span>`;
        } else {
          output += from;
        }
      }

      el.innerHTML = output;

      if (complete === queue.length) {
        return;
      }

      frame++;
      setTimeout(update, frameRate);
    };

    const setText = (newText) => {
      const oldText = el.innerText;
      const length = Math.max(oldText.length, newText.length);
      queue.length = 0;

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        queue.push({ from, to, start, end });
      }

      frame = 0;
      update();
    };

    // Start scramble effect after a short delay
    const timeout = setTimeout(() => {
      setText(text);
    }, 300);

    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <span ref={textRef} className={className}>
      {text}
    </span>
  );
}
