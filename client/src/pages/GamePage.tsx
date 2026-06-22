import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore, GameMode, DifficultyLevel } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import GameBoard from '../components/GameBoard';
import { 
  Tv, Award, Play, RotateCcw, Volume2, 
  VolumeX, Share2, Shield, Heart, Zap, Timer, BarChart3, CheckSquare, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamePage() {
  const {
    started, isGameOver, gameSeq, userSeq, level, score, bestScore, lives, combo,
    isPlayingSequence, activeColor, mode, difficulty, accuracy, playbackSpeed,
    timeRemaining, sessionDuration, setMode, setDifficulty, startGame, inputColor, resetGame
  } = useGameStore();

  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardSectionRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Trigger confetti celebration on achieving high level
  useEffect(() => {
    if (level > 0 && level % 10 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [level]);

  // Scroll down to the Simon board on mobile when game starts
  useEffect(() => {
    if (started && window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        boardSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [started]);

  // Draw Score Image to Canvas
  const drawScoreImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background card gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 500);
    grad.addColorStop(0, '#0D1117');
    grad.addColorStop(1, '#070A0E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 500);

    // Draw border
    ctx.strokeStyle = '#7B2EFF';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 494, 494);

    // Draw neon primary accent line
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 470, 470);

    // Draw Title: SimonX
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 42px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIMON', 220, 80);
    
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('X', 320, 80);

    ctx.fillStyle = '#7B2EFF';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.fillText('ULTIMATE MEMORY CHALLENGE', 250, 115);

    // Draw divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(450, 140);
    ctx.stroke();

    // User details
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText(user ? user.name : 'GUEST PLAYER', 250, 185);

    // Score stats box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(50, 220, 400, 160);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 14px Orbitron, sans-serif';
    ctx.fillText('FINAL SCORE', 150, 255);
    ctx.fillText('ACCURACY', 350, 255);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '900 48px Orbitron, sans-serif';
    ctx.fillText(`${score}`, 150, 315);
    
    ctx.fillStyle = '#FF3B3B';
    ctx.fillText(`${accuracy}%`, 350, 315);

    // Mode and Difficulty labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillText(`MODE: ${mode.toUpperCase()}   |   DIFFICULTY: ${difficulty.toUpperCase()}`, 250, 360);

    // Footer signature
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = 'italic 12px Inter, sans-serif';
    ctx.fillText('Train Your Brain at simonx-game.com', 250, 440);
  };

  useEffect(() => {
    if (showShareModal) {
      setTimeout(drawScoreImage, 100);
    }
  }, [showShareModal]);

  const downloadScoreImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `SimonX_Score_${score}.png`;
    a.click();
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Mode Controls Sidebar (Left) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold font-display tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
            <Tv size={18} className="text-primary" /> Setup Lobbies
          </h2>

          {/* Modes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(['classic', 'time-attack', 'reverse', 'zen'] as GameMode[]).map((m) => (
                <button
                  key={m}
                  disabled={started}
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    mode === m 
                      ? 'bg-primary text-darkbg border-primary shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                      : 'border-white/10 bg-white/5 text-slate-300 hover:text-primary hover:border-primary/40'
                  } disabled:opacity-50`}
                >
                  {m.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</label>
            <div className="grid grid-cols-2 gap-2">
              {(['easy', 'medium', 'hard', 'extreme'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  disabled={started}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    difficulty === d 
                      ? 'bg-secondary text-white border-secondary' 
                      : 'border-white/10 bg-white/5 text-slate-300 hover:text-secondary hover:border-secondary/40'
                  } disabled:opacity-50`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Play / Reset buttons */}
          <div className="pt-2 space-y-3">
            {!started ? (
              <button
                onClick={startGame}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] scale-100 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <Play size={16} /> Start Challange
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="w-full py-3 px-4 rounded-xl border border-red-500/20 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Quit Game
              </button>
            )}

            <Link
              to="/instructions"
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle size={14} /> Game Instructions
            </Link>
          </div>
        </div>

        {/* Dashboard Mini Stats */}
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 size={15} /> Play Session Statistics
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Combo Multiplier:</span>
              <span className="font-bold text-slate-200">x{combo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Accuracy:</span>
              <span className="font-bold text-slate-200">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Speed:</span>
              <span className="font-bold text-slate-200">{playbackSpeed}ms</span>
            </div>
            {mode === 'time-attack' && (
              <div className="flex justify-between">
                <span className="text-slate-500">Time Left:</span>
                <span className="font-bold text-amber-400 font-orbitron">{timeRemaining}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Arena (Center Columns) */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
        
        {/* Header Board Dashboard */}
        <div className="w-full max-w-md glass-card py-4 px-6 rounded-2xl border border-white/5 flex justify-between items-center text-center">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level</span>
            <span className="font-display font-black text-2xl text-slate-200">{started ? level : '-'}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
            <span className="font-display font-black text-2xl text-primary">{started ? score : '-'}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">High Score</span>
            <span className="font-display font-black text-2xl text-secondary">{bestScore}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lives</span>
            <span className="font-display font-black text-2xl text-rose-500 flex items-center justify-center gap-1">
              <Heart size={16} fill="currentColor" /> {started ? lives : '-'}
            </span>
          </div>
        </div>

        {/* Action Status Prompts */}
        <div className="text-center h-8">
          {started && !isGameOver && (
            <span className="font-display font-bold text-sm tracking-widest text-slate-400 uppercase animate-pulse">
              {isPlayingSequence ? 'Watch the Lights...' : 'Your Turn! Repeat'}
            </span>
          )}
          {!started && (
            <span className="font-display font-bold text-xs tracking-wider text-slate-500 uppercase">
              Configure parameters and click Start to play!
            </span>
          )}
        </div>

        {/* Circular Console Board */}
        <div ref={boardSectionRef} className="w-full flex justify-center">
          <GameBoard
            activeColor={activeColor}
            isPlayingSequence={isPlayingSequence}
            onPress={inputColor}
            gameStarted={started}
          />
        </div>

      </div>

      {/* Side Stats & AI Dashboard (Right) */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* AI Control Feed */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full blur-xl" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Zap size={15} className="text-primary" /> AI Adjuster Dashboard
          </h3>
          <div className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              SimonX dynamically checks your recall pace and accuracy. Speed adjusts based on performance.
            </p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">AI Pace:</span>
                <span className={`font-bold ${playbackSpeed < 400 ? 'text-primary' : 'text-slate-300'}`}>
                  {playbackSpeed}ms {playbackSpeed < 400 ? '(Hyperspeed)' : '(Adaptive)'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${Math.max(10, 100 - (playbackSpeed / 1200) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* How to Input Info */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare size={15} /> Keyboard Shortcuts
          </h3>
          <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <li>• <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">1</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↑</kbd> : Green Button</li>
            <li>• <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">2</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">→</kbd> : Red Button</li>
            <li>• <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">3</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">←</kbd> : Yellow Button</li>
            <li>• <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">↓</kbd> : Blue Button</li>
          </ul>
        </div>

      </div>

      {/* Game Over Modal overlay */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-rose-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            <h2 className="text-3xl font-bold font-display text-rose-500 mb-2">Challange Concluded</h2>
            <p className="text-slate-400 text-sm mb-6">Your memory chain broke at level {level}!</p>

            {/* Score Grid stats */}
            <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl mb-6 border border-white/5">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</span>
                <span className="font-display font-black text-xl text-primary">{score}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accuracy</span>
                <span className="font-display font-black text-xl text-accent">{accuracy}%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Duration</span>
                <span className="font-display font-black text-xl text-slate-200">{sessionDuration}s</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={startGame}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer"
              >
                Restart Challenger
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Share Memory Score Card
              </button>

              <button
                onClick={resetGame}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Score Card Overlay Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 px-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 p-6 rounded-3xl text-center space-y-6">
            <h3 className="text-xl font-bold font-display text-white">Your SimonX Certificate</h3>
            
            {/* Target canvas hidden offscreen or drawn directly in card container */}
            <div className="flex justify-center bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
              <canvas 
                ref={canvasRef} 
                width="500" 
                height="500" 
                className="w-72 h-72 sm:w-80 sm:h-80 rounded-xl"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={downloadScoreImage}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                Download PNG Image
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="py-3 px-6 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-sm rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
