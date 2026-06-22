import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Brain, Zap, Clock, ShieldAlert, ArrowLeft, 
  HelpCircle, Keyboard, Play, Heart, Award, Layers
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function InstructionsPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8 grid-bg relative">
      
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Link 
          to="/play" 
          className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Return to Game Arena
        </Link>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron">
          SECURE SEC-SYS // DOCX-909
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <BookOpen size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
          SIMON<span className="text-primary font-black">X</span> TRAINING MANUAL
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Read this operational document to master the cognitive sequencing patterns and beat your limits.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Core Rules Section */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold font-display text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <Brain size={20} className="text-primary" /> The Sequencing Loop
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The core challenge of SimonX is memorization. At the start of a round, the circular game board will play a sequence of flashing neon lights accompanied by distinct synthesizer musical notes. 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white/3 rounded-xl border border-white/5">
              <span className="block font-bold text-slate-300 font-display mb-1">1. Observe</span>
              <span className="text-slate-500 leading-normal">
                Watch the sequence play out on the board. Do not press buttons while the light chain is active.
              </span>
            </div>
            <div className="p-4 bg-white/3 rounded-xl border border-white/5">
              <span className="block font-bold text-slate-300 font-display mb-1">2. Duplicate</span>
              <span className="text-slate-500 leading-normal">
                Press the flashing quadrants in the exact order. An indicator will prompt "Your Turn!".
              </span>
            </div>
            <div className="p-4 bg-white/3 rounded-xl border border-white/5">
              <span className="block font-bold text-slate-300 font-display mb-1">3. Progress</span>
              <span className="text-slate-500 leading-normal">
                Completing a sequence correctly increments the level, adds a new color to the chain, and earns score points.
              </span>
            </div>
          </div>
        </motion.div>

        {/* Input Controls */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold font-display text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <Keyboard size={20} className="text-secondary" /> Dual Input Mappings
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            You can interact with the SimonX circular quadrants using either mouse clicks / taps or your keyboard shortcuts:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { color: 'border-l-emerald-500 text-emerald-400', key: '1 / ↑', label: 'Green Quadrant' },
              { color: 'border-l-rose-500 text-rose-400', key: '2 / →', label: 'Red Quadrant' },
              { color: 'border-l-amber-500 text-amber-400', key: '3 / ←', label: 'Yellow Quadrant' },
              { color: 'border-l-cyan-500 text-cyan-400', key: '4 / ↓', label: 'Blue Quadrant' }
            ].map((kbd, idx) => (
              <div key={idx} className={`p-4 bg-white/3 border-l-4 ${kbd.color} rounded-xl text-xs flex flex-col justify-center items-center`}>
                <span className="block font-bold font-display opacity-80 mb-1">{kbd.label}</span>
                <kbd className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 font-mono text-slate-300 shadow">
                  {kbd.key}
                </kbd>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Advanced Game Modes */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold font-display text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <Layers size={20} className="text-rose-500" /> Mode Configurations
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Classic Mode', icon: <Brain size={18} />, desc: 'The pure, unmodified memory game. The sequence expands infinitely. If you run out of lives, the round concludes.' },
              { title: 'Time Attack', icon: <Clock size={18} />, desc: 'A fast-paced blitz! A global 60-second timer counts down. Correctly duplicate chains to earn points before the clock expires.' },
              { title: 'Reverse Mode', icon: <Zap size={18} />, desc: 'The spatial inversion challenge! The board flashes a standard sequence, but you must enter the inputs completely backwards.' },
              { title: 'Zen Practice', icon: <Heart size={18} className="text-green-400" />, desc: 'A stress-free training environment. Play with 999 lives. Making mistake restarts the current sequence without terminating the round.' }
            ].map((m, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-white/2 rounded-2xl border border-white/5 items-start">
                <div className="p-2 bg-slate-950/60 rounded-xl text-slate-300 mt-1">{m.icon}</div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Pace Dashboard */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" /> AI Pacing Adjustments
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SimonX features an **AI Pace Governor**. If you successfully input sequences with high precision (above 90% accuracy) and quick response speeds (under 600ms average per button), the AI will speed up sequence playback, decreasing the flash intervals. If you start making mistakes or hesitate, the AI immediately slows down playback to give you extra time.
          </p>
        </motion.div>

        {/* Play trigger button */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <Link
            to="/play"
            className="inline-flex items-center gap-2 py-4 px-8 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer"
          >
            Start Memory Training <Play size={16} fill="currentColor" />
          </Link>
        </motion.div>

      </motion.div>

    </div>
  );
}
