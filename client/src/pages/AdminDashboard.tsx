import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { 
  Users, ShieldAlert, BarChart3, Trophy, Trash2, Shield, 
  CheckCircle, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  highestScore: number;
  gamesPlayed: number;
}

export default function AdminDashboard() {
  const [subTab, setSubTab] = useState<'analytics' | 'users' | 'achievements'>('analytics');
  const queryClient = useQueryClient();

  // Fetch admin analytics
  const { data: analytics, isLoading: analLoading, refetch: refetchAnal } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await api.get('/admin/analytics');
      return res.data;
    }
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users as UserItem[];
    }
  });

  // Mutators: update user role/status
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserItem> }) => {
      return api.put(`/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  // Mutators: delete user
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
    }
  });

  const toggleUserRole = (user: UserItem) => {
    updateMutation.mutate({
      id: user._id,
      data: { role: user.role === 'admin' ? 'user' : 'admin' }
    });
  };

  const toggleUserVerification = (user: UserItem) => {
    updateMutation.mutate({
      id: user._id,
      data: { isVerified: !user.isVerified }
    });
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user and all their historical score logs?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8 grid-bg">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black font-display tracking-wider flex items-center gap-2">
            <Shield className="text-amber-500" /> Admin Command Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">Audit user logs, review global statistics feed, and toggle configuration attributes.</p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
          {[
            { id: 'analytics', label: 'Analytics Feed', icon: <BarChart3 size={14} /> },
            { id: 'users', label: 'User Directory', icon: <Users size={14} /> },
            { id: 'achievements', label: 'Achievements', icon: <Layers size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                subTab === tab.id 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      {subTab === 'analytics' && (
        <div className="space-y-8">
          {analLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="animate-spin text-amber-500 mx-auto mb-4" />
              <span className="text-xs text-slate-500 font-semibold uppercase">Aggregating Statistics...</span>
            </div>
          ) : analytics ? (
            <>
              {/* Metric stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Registered Players</span>
                  <span className="font-display font-black text-3xl text-amber-400 mt-2 block">
                    {analytics.metrics.totalUsers}
                  </span>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Game Sessions Logged</span>
                  <span className="font-display font-black text-3xl text-primary mt-2 block">
                    {analytics.metrics.totalGames}
                  </span>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Average Memory score</span>
                  <span className="font-display font-black text-3xl text-rose-500 mt-2 block">
                    {analytics.metrics.averageScore}
                  </span>
                </div>
              </div>

              {/* Raw SVG Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Active registrations line graph */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">User Registrations (Last 30 Days)</h3>
                  <div className="h-64 w-full bg-slate-950/40 p-4 rounded-xl border border-white/5 relative">
                    {analytics.charts.registrations.length > 0 ? (
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        {/* Line path */}
                        <polyline
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="3"
                          points={analytics.charts.registrations.map((r: any, idx: number) => {
                            const x = 20 + (idx / Math.max(1, analytics.charts.registrations.length - 1)) * 360;
                            const maxVal = Math.max(5, ...analytics.charts.registrations.map((item: any) => item.count));
                            const y = 180 - (r.count / maxVal) * 150;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        {/* Dots */}
                        {analytics.charts.registrations.map((r: any, idx: number) => {
                          const x = 20 + (idx / Math.max(1, analytics.charts.registrations.length - 1)) * 360;
                          const maxVal = Math.max(5, ...analytics.charts.registrations.map((item: any) => item.count));
                          const y = 180 - (r.count / maxVal) * 150;
                          return (
                            <circle key={idx} cx={x} cy={y} r="4" fill="#0D1117" stroke="#FBBF24" strokeWidth="2">
                              <title>{r.date}: {r.count} users</title>
                            </circle>
                          );
                        })}
                      </svg>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">No date logs yet.</div>
                    )}
                  </div>
                </div>

                {/* Session breakdown bar chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Game Modes Breakdown</h3>
                  <div className="space-y-4 pt-2">
                    {analytics.charts.modes.length > 0 ? (
                      analytics.charts.modes.map((m: any) => {
                        const maxCount = Math.max(1, ...analytics.charts.modes.map((item: any) => item.count));
                        const pct = (m.count / maxCount) * 100;
                        return (
                          <div key={m.mode} className="space-y-1.5 text-xs">
                            <div className="flex justify-between font-semibold uppercase text-[10px] text-slate-500">
                              <span>{m.mode} mode</span>
                              <span>{m.count} duels</span>
                            </div>
                            <div className="w-full bg-slate-900 h-3 rounded-lg overflow-hidden border border-white/5">
                              <div 
                                className="bg-primary h-full rounded-lg" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-600">No multiplayer logs found.</div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Users directory tab */}
      {subTab === 'users' && (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          {usersLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="animate-spin text-amber-500 mx-auto" />
            </div>
          ) : usersData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    <th className="py-4 px-6">Username / Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Verified</th>
                    <th className="py-4 px-6 text-center">Best Score</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {usersData.map((usr) => (
                    <tr key={usr._id} className="hover:bg-white/1 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{usr.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{usr.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleUserRole(usr)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            usr.role === 'admin' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {usr.role}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleUserVerification(usr)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                            usr.isVerified 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/25'
                          }`}
                        >
                          {usr.isVerified ? 'verified' : 'unverified'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center font-bold font-mono">
                        {usr.highestScore}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => deleteUser(usr._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                          title="Delete user profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* Achievements static catalog tab */}
      {subTab === 'achievements' && (
        <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold font-display tracking-wide border-b border-white/5 pb-3">Seeded Game Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Beginner', desc: 'Complete your first memory challenge!', pts: 100 },
              { title: 'Memory Master', desc: 'Reach a score of 20 or more in a single game!', pts: 500 },
              { title: 'Level 50', desc: 'Reach level 50 in Classic Mode!', pts: 1000 },
              { title: 'Level 100', desc: 'Reach level 100 in Classic Mode!', pts: 2500 },
              { title: 'Perfect Accuracy', desc: 'Achieve 100% accuracy in a game with score 10+!', pts: 500 },
              { title: 'Zen Master', desc: 'Play Zen mode for over 2 minutes!', pts: 300 },
              { title: 'Time Warrior', desc: 'Reach a score of 15 in Time Attack!', pts: 400 },
            ].map((ach) => (
              <div key={ach.title} className="p-4 bg-white/3 rounded-xl border border-white/5">
                <h3 className="font-display font-bold text-sm text-amber-400">{ach.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">{ach.desc}</p>
                <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-3">{ach.pts} XP XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
