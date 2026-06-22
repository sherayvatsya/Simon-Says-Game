import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface GameBoardProps {
  activeColor: string | null;
  isPlayingSequence: boolean;
  onPress: (color: string) => void;
  gameStarted: boolean;
}

interface SparkleParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
}

export default function GameBoard({ activeColor, isPlayingSequence, onPress, gameStarted }: GameBoardProps) {
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const triggerSparkleParticles = (color: string, clickX?: number, clickY?: number) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;
    
    // If click coordinate is provided, use it. Otherwise target the center of the respective pad.
    if (clickX !== undefined && clickY !== undefined) {
      x = clickX - rect.left;
      y = clickY - rect.top;
    } else {
      const w = rect.width;
      const h = rect.height;
      if (color === 'green') { x = w * 0.3; y = h * 0.3; }
      else if (color === 'red') { x = w * 0.7; y = h * 0.3; }
      else if (color === 'yellow') { x = w * 0.3; y = h * 0.7; }
      else if (color === 'blue') { x = w * 0.7; y = h * 0.7; }
    }

    const colorMap: Record<string, string> = {
      green: '#00FFAD',
      red: '#FF2A5F',
      yellow: '#FFE000',
      blue: '#00E5FF'
    };
    const sparkleColor = colorMap[color] || '#FFFFFF';

    const count = 12;
    const newSparkles = Array.from({ length: count }).map((_, i) => {
      const angle = (i * (360 / count)) + (Math.random() * 24 - 12);
      const distance = 40 + Math.random() * 50;
      return {
        id: Math.random() + Date.now(),
        startX: x,
        startY: y,
        endX: x + Math.cos((angle * Math.PI) / 180) * distance,
        endY: y + Math.sin((angle * Math.PI) / 180) * distance,
        color: sparkleColor,
        size: 4 + Math.random() * 6,
      };
    });

    setSparkles((prev) => [...prev, ...newSparkles]);
    
    // Auto-cleanup particles after animation completes (700ms)
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s)));
    }, 700);
  };

  const handlePress = (color: string, clickX?: number, clickY?: number) => {
    triggerSparkleParticles(color, clickX, clickY);
    onPress(color);
  };

  // Keyboard short-cut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || isPlayingSequence) return;
      
      let color = '';
      if (e.key === '1' || e.key === 'ArrowUp') color = 'green';
      else if (e.key === '2' || e.key === 'ArrowRight') color = 'red';
      else if (e.key === '3' || e.key === 'ArrowLeft') color = 'yellow';
      else if (e.key === '4' || e.key === 'ArrowDown') color = 'blue';

      if (color) {
        handlePress(color);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, isPlayingSequence, onPress]);

  const buttonClass = (color: string) => {
    const isActive = activeColor === color;
    switch (color) {
      case 'green':
        return isActive 
          ? 'bg-emerald-400 shadow-[0_0_60px_#10B981] scale-[1.04]' 
          : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/30 hover:scale-[1.02] border-t-4 border-l-4 border-emerald-500/20';
      case 'red':
        return isActive 
          ? 'bg-rose-500 shadow-[0_0_60px_#F43F5E] scale-[1.04]' 
          : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/30 hover:scale-[1.02] border-t-4 border-r-4 border-rose-500/20';
      case 'yellow':
        return isActive 
          ? 'bg-amber-400 shadow-[0_0_60px_#F59E0B] scale-[1.04]' 
          : 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/30 hover:scale-[1.02] border-b-4 border-l-4 border-amber-500/20';
      case 'blue':
        return isActive 
          ? 'bg-cyan-500 shadow-[0_0_60px_#06B6D4] scale-[1.04]' 
          : 'bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/30 hover:scale-[1.02] border-b-4 border-r-4 border-cyan-500/20';
      default:
        return '';
    }
  };

  return (
    <div ref={boardRef} className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-slate-950 border-4 border-white/5 p-4 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
      
      {/* Grid of colors */}
      <div className="grid grid-cols-2 gap-4 w-full h-full rounded-full overflow-hidden">
        
        {/* GREEN Button (Top-Left) */}
        <button
          onClick={(e) => !isPlayingSequence && handlePress('green', e.clientX, e.clientY)}
          disabled={isPlayingSequence}
          className={`h-full w-full rounded-tl-full transition-all duration-150 cursor-pointer focus:outline-none flex items-center justify-center font-display font-bold text-lg ${buttonClass('green')}`}
          title="Green [1] or [Up]"
        >
          <span className="hidden sm:inline opacity-30 select-none">1</span>
        </button>

        {/* RED Button (Top-Right) */}
        <button
          onClick={(e) => !isPlayingSequence && handlePress('red', e.clientX, e.clientY)}
          disabled={isPlayingSequence}
          className={`h-full w-full rounded-tr-full transition-all duration-150 cursor-pointer focus:outline-none flex items-center justify-center font-display font-bold text-lg ${buttonClass('red')}`}
          title="Red [2] or [Right]"
        >
          <span className="hidden sm:inline opacity-30 select-none">2</span>
        </button>

        {/* YELLOW Button (Bottom-Left) */}
        <button
          onClick={(e) => !isPlayingSequence && handlePress('yellow', e.clientX, e.clientY)}
          disabled={isPlayingSequence}
          className={`h-full w-full rounded-bl-full transition-all duration-150 cursor-pointer focus:outline-none flex items-center justify-center font-display font-bold text-lg ${buttonClass('yellow')}`}
          title="Yellow [3] or [Left]"
        >
          <span className="hidden sm:inline opacity-30 select-none">3</span>
        </button>

        {/* BLUE Button (Bottom-Right) */}
        <button
          onClick={(e) => !isPlayingSequence && handlePress('blue', e.clientX, e.clientY)}
          disabled={isPlayingSequence}
          className={`h-full w-full rounded-br-full transition-all duration-150 cursor-pointer focus:outline-none flex items-center justify-center font-display font-bold text-lg ${buttonClass('blue')}`}
          title="Blue [4] or [Down]"
        >
          <span className="hidden sm:inline opacity-30 select-none">4</span>
        </button>

      </div>

      {/* Sparkles Render Overlay */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ 
            x: sparkle.startX - sparkle.size / 2, 
            y: sparkle.startY - sparkle.size / 2, 
            opacity: 1, 
            scale: 1 
          }}
          animate={{ 
            x: sparkle.endX - sparkle.size / 2, 
            y: sparkle.endY - sparkle.size / 2, 
            opacity: 0, 
            scale: 0.1 
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 6px ${sparkle.color}, 0 0 12px ${sparkle.color}`,
          }}
        />
      ))}

      {/* Decorative center ring overlay */}
      <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950 border-8 border-slate-900 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] z-10 pointer-events-none">
        <div className="flex flex-col items-center justify-center">
          <span className="font-display font-extrabold text-xs tracking-wider text-slate-500">SIMON</span>
          <span className="font-display font-black text-2xl text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]">X</span>
        </div>
      </div>

    </div>
  );
}

