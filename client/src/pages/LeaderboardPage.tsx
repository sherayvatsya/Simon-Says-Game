import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Trophy, Calendar, Zap, RefreshCw, Star } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  score: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'global'>('global');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TanStack Query caching
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: async () => {
      const res = await api.get(`/leaderboard/${filter}`);
      return res.data.leaderboard as LeaderboardEntry[];
    },
    staleTime: 0, // Always fetch fresh data on mount/toggle
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-[0_0_12px_#FBBF24]">1</span>;
      case 2:
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-[0_0_12px_#E2E8F0]">2</span>;
      case 3:
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white font-black text-xs shadow-[0_0_12px_#B45309]">3</span>;
      default:
        return <span className="text-slate-500 font-bold font-mono text-sm">{rank}</span>;
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8 grid-bg">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
          <Trophy className="text-primary" size={32} /> Global Leaderboards
        </h1>
        <p className="text-slate-400 text-sm">See how your cognitive capabilities stack against the elite.</p>
      </div>

      {/* Filter Tabs & Refresh */}
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
        <div className="flex gap-2">
          {([
            { id: 'daily', label: 'Daily', icon: <Zap size={14} /> },
            { id: 'weekly', label: 'Weekly', icon: <Calendar size={14} /> },
            { id: 'global', label: 'All Time', icon: <Trophy size={14} /> }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filter === tab.id 
                  ? 'bg-primary text-darkbg font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Refresh statistics"
        >
          <RefreshCw size={16} className={isRefreshing || isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Rankings List Board */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-primary mx-auto" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Syncing Leaderboard...</span>
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Brain Athlete</th>
                  <th className="py-4 px-6 text-right">Sequence Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((entry) => (
                  <tr 
                    key={entry.userId}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 text-center flex justify-center items-center">
                      {getRankBadge(entry.rank)}
                    </td>

                    {/* User profile details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={entry.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.username}`} 
                          alt={entry.username}
                          className="h-8 w-8 rounded-full bg-slate-800 border border-white/10"
                        />
                        <span className="font-semibold text-slate-200 group-hover:text-primary transition-colors text-sm">
                          {entry.username}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 text-right font-display font-black text-slate-200 group-hover:text-primary transition-colors text-base">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <Star size={32} className="mx-auto text-slate-700" />
            <p className="text-sm">No scores submitted yet. Be the first to claim a rank!</p>
          </div>
        )}
      </div>

    </div>
  );
}
