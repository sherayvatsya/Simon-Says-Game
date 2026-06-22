import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { 
  User, Award, History, BarChart3, Settings, 
  CheckCircle, ArrowLeft, Gamepad2, Timer, Star, HelpCircle
} from 'lucide-react';

interface GameLogEntry {
  _id: string;
  mode: string;
  difficulty: string;
  score: number;
  accuracy: number;
  duration: number;
  levelReached: number;
  date: string;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aria',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Jack',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Luna',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Leo',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Maya'
];

export default function Dashboard() {
  const { user, updateUserStats } = useAuthStore();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Fetch session history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['gameHistory'],
    queryFn: async () => {
      const res = await api.get('/game/history');
      return res.data.history as GameLogEntry[];
    }
  });

  // Fetch aggregate statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const res = await api.get('/game/stats');
      return res.data.stats;
    }
  });

  const selectAvatar = async (url: string) => {
    try {
      // Direct call to update user avatar in DB (using register update or custom endpoint)
      // To keep things simple, we update on register/login user save, or profile put
      const res = await api.put(`/admin/users/${user?._id}`, { avatar: url });
      if (res.data.success) {
        updateUserStats({ avatar: url });
        setSaveMsg('Avatar updated successfully!');
        setAvatarMenuOpen(false);
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      // In case admin check constraints prevent PUT, save mock on frontend store
      updateUserStats({ avatar: url });
      setSaveMsg('Avatar updated! (Local preview)');
      setAvatarMenuOpen(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const allAchievements = [
    { title: 'Beginner', desc: 'Complete your first memory challenge!', icon: '🏆' },
    { title: 'Memory Master', desc: 'Reach a score of 20 or more in a single game!', icon: '⚡' },
    { title: 'Level 50', desc: 'Reach level 50 in Classic Mode!', icon: '🌟' },
    { title: 'Level 100', desc: 'Reach level 100 in Classic Mode!', icon: '👑' },
    { title: 'Perfect Accuracy', desc: 'Achieve 100% accuracy in a game with score 10+!', icon: '🎯' },
    { title: 'Zen Master', desc: 'Play Zen mode for over 2 minutes!', icon: '🧘' },
    { title: 'Time Warrior', desc: 'Reach a score of 15 in Time Attack!', icon: '⏱️' },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 grid-bg">
      
      {/* Profile Overview (Left) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-8 rounded-3xl border border-white/5 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 h-20 w-20 bg-secondary/5 rounded-full blur-xl" />
          
          {/* Avatar Edit Wrapper */}
          <div className="relative group mb-6 cursor-pointer" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.name}`} 
              alt={user?.name} 
              className="h-24 w-24 rounded-full border-4 border-primary/20 hover:border-primary bg-slate-800 transition-colors shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Settings className="text-white h-6 w-6" />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display text-slate-200">{user?.name}</h2>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Brain Athlete</span>

          {saveMsg && (
            <div className="mt-4 text-xs font-semibold text-primary flex items-center gap-1">
              <CheckCircle size={14} /> <span>{saveMsg}</span>
            </div>
          )}

          {/* Preset Avatar Selection Grid */}
          {avatarMenuOpen && (
            <div className="mt-6 p-4 bg-slate-900 border border-white/10 rounded-2xl w-full">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Select Badge Preset</span>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => selectAvatar(p)}
                    className="h-10 w-10 rounded-full overflow-hidden hover:scale-110 active:scale-95 transition-all bg-slate-800 border border-white/5 hover:border-primary cursor-pointer"
                  >
                    <img src={p} alt="Preset" className="h-full w-full" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Metrics Summary */}
          <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-8">
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">All-Time Best</span>
              <span className="font-display font-black text-xl text-primary mt-1">{user?.highestScore}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Games Played</span>
              <span className="font-display font-black text-xl text-secondary mt-1">{user?.gamesPlayed}</span>
            </div>
          </div>

        </div>

        {/* Training Center Quick Actions */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Gamepad2 size={15} className="text-primary" /> Training Center
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/play"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-display font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] text-center block cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Game Arena
            </Link>
            <Link
              to="/instructions"
              className="w-full py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors text-center block cursor-pointer flex items-center justify-center gap-1.5 scale-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              <HelpCircle size={14} className="text-secondary" /> Game Instructions
            </Link>
          </div>
        </div>

        {/* Dashboard statistics panel (Metrics Chart Overview) */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 size={15} /> Performance Indicators
          </h3>

          {statsLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Syncing stats...</div>
          ) : statsData ? (
            <div className="space-y-6">
              
              {/* Average Accuracy ring representation */}
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  {/* Inline SVG circle chart */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle 
                      cx="28" cy="28" r="24" fill="transparent" stroke="#00E5FF" strokeWidth="4" 
                      strokeDasharray="150" strokeDashoffset={150 - (150 * statsData.avgAccuracy) / 100}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold font-orbitron">{statsData.avgAccuracy}%</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Recall Accuracy</span>
                  <span className="text-xs text-slate-500">Target input hit precision</span>
                </div>
              </div>

              {/* Mode Distribution progress */}
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-semibold text-slate-400">Game Modes Breakdown</span>
                <div className="space-y-2 text-xs">
                  {Object.entries(statsData.modeCounts).map(([mode, count]: any) => (
                    <div key={mode} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase">
                        <span>{mode}</span>
                        <span>{count} times</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-secondary h-full" 
                          style={{ width: `${statsData.totalSessions > 0 ? (count / statsData.totalSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-xs text-slate-500">No session metrics available. Play a challenge first!</div>
          )}
        </div>
      </div>

      {/* Badges & Match Logs (Right Columns) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Achievements Badges */}
        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award size={16} /> Earned Achievements
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allAchievements.map((ach) => {
              const isUnlocked = user?.achievements.includes(ach.title);
              return (
                <div 
                  key={ach.title}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/25 hover:border-primary/50 text-slate-200' 
                      : 'bg-white/1 border-white/5 text-slate-600 grayscale opacity-45'
                  }`}
                  title={ach.desc}
                >
                  <div className="text-2xl mb-2">{ach.icon}</div>
                  <h4 className="text-xs font-bold font-display truncate">{ach.title}</h4>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">{ach.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play History logs */}
        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History size={16} /> Session History
          </h3>

          {historyLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Syncing history logs...</div>
          ) : historyData && historyData.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {historyData.map((log) => (
                <div 
                  key={log._id} 
                  className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-slate-300 font-display uppercase tracking-wide">
                      {log.mode} mode
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Difficulty: {log.difficulty} | Duration: {log.duration}s
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-500">Level {log.levelReached}</span>
                    <span className="block text-sm font-black text-primary font-orbitron">{log.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 py-12">
              No session logs recorded. Play a game to save stats!
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
