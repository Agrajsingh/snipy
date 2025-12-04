import { MessageSquare } from 'lucide-react';
import SplitTextReveal from './SplitTextReveal';

export default function Logo({ size = 'large', variant = 'light' }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 'w-12 h-12' : 'w-6 h-6';
  const textSize = isLarge ? 'text-4xl' : 'text-xl';
  const gap = isLarge ? 'gap-3' : 'gap-2';

  // Different styling for dark backgrounds
  const isDark = variant === 'dark';
  const iconColor = isDark ? 'text-cyan-400' : 'text-indigo-600';
  const textColor = isDark ? 'text-cyan-400' : 'text-indigo-600';
  const textShadow = isDark 
    ? 'drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]'
    : '';

  return (
    <div className={`flex items-center justify-center ${gap}`}>
      <MessageSquare className={`${iconSize} ${iconColor}`} />
      <h1 className={`${textSize} font-black tracking-tight ${textColor} ${textShadow}`}>
        <SplitTextReveal text="Snipy" delay={0.3} repeat={true} repeatDelay={4} />
      </h1>
    </div>
  );
}
