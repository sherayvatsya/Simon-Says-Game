import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { 
  Gamepad2, Trophy, User, LogOut, Shield, 
  Volume2, VolumeX, Menu, X, Play, HelpCircle
} from 'lucide-react';
import { getAudioMode, setAudioMode } from '../utils/sounds';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { isMuted, volume, setMuted, setVolume } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioMode, setAudioModeState] = useState<'synth' | 'retro'>(getAudioMode());
  const navigate = useNavigate();

  const handleAudioModeChange = (mode: 'synth' | 'retro') => {
    setAudioMode(mode);
    setAudioModeState(mode);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0D1117]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white font-display font-black text-lg shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                X
              </span>
              <span className="font-display text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-primary bg-clip-text text-transparent">
                SIMON<span className="text-primary font-black">X</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/play" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5">
              <Play size={15} /> Play
            </Link>

            <Link to="/leaderboard" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5">
              <Trophy size={15} /> Leaderboard
            </Link>
            <Link to="/instructions" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5">
              <HelpCircle size={15} /> Instructions
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <Shield size={15} /> Admin
              </Link>
            )}
          </div>

          {/* Controls & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Audio volume slider */}
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <button 
                onClick={() => setMuted(!isMuted)} 
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setMuted(false);
                }}
                className="w-16 h-1 rounded-lg bg-slate-700 appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Audio Mode Select */}
            <div className="flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase tracking-wider">Audio:</span>
              <select 
                value={audioMode}
                onChange={(e) => handleAudioModeChange(e.target.value as 'synth' | 'retro')}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="synth" className="bg-[#0D1117] text-slate-300">🎹 Synth</option>
                <option value="retro" className="bg-[#0D1117] text-slate-300">📻 Retro</option>
              </select>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-white/5 py-1.5 px-3 rounded-full border border-white/5 hover:border-white/10"
                >
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} 
                    alt={user.name} 
                    className="h-6 w-6 rounded-full bg-slate-800"
                  />
                  <span>{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-white/5"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-bold bg-primary hover:bg-primary/90 text-darkbg py-1.5 px-4 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]"
                >
                  Join SimonX
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0D1117] px-4 py-4 space-y-3">
          <Link 
            to="/play" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-primary py-2"
          >
            Play Game
          </Link>

          <Link 
            to="/leaderboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-primary py-2"
          >
            Leaderboard
          </Link>
          <Link 
            to="/instructions" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-primary py-2"
          >
            Instructions
          </Link>
          
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-amber-400 hover:text-amber-300 py-2"
            >
              Admin Dashboard
            </Link>
          )}

          <hr className="border-white/5" />

          {/* Audio volume indicator */}
          <div className="flex items-center space-x-3 py-2">
            <span className="text-slate-400 text-sm">Volume:</span>
            <button 
              onClick={() => setMuted(!isMuted)} 
              className="text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setMuted(false);
              }}
              className="flex-1 h-1.5 rounded-lg bg-slate-700 appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Audio Mode Select Mobile */}
          <div className="flex items-center justify-between py-2 text-sm text-slate-300">
            <span>Audio Mode:</span>
            <select 
              value={audioMode}
              onChange={(e) => handleAudioModeChange(e.target.value as 'synth' | 'retro')}
              className="bg-slate-900 border border-white/5 rounded-xl px-2 py-1 focus:outline-none text-xs"
            >
              <option value="synth">🎹 Synth</option>
              <option value="retro">📻 Retro</option>
            </select>
          </div>

          <hr className="border-white/5" />

          {user ? (
            <div className="space-y-2 pt-2">
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-base font-medium text-slate-300 py-2"
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full bg-slate-800"
                />
                <span>Profile Dashboard</span>
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center space-x-2 text-red-400 py-2 font-medium"
              >
                <LogOut size={18} /> <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-medium text-slate-300 hover:text-white py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-bold bg-primary text-darkbg py-2 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
