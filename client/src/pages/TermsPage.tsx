import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Mail, ShieldAlert, Award } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 space-y-8 grid-bg relative">
      
      {/* Back button */}
      <div className="flex justify-between items-center">
        <Link 
          to="/" 
          className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Return to Home
        </Link>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron">
          SECURE SEC-SYS // TERM-002
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Scale size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
          TERMS OF SERVICE
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Last Updated: June 22, 2026. Please read these terms before entering the SimonX cognitive training loop.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Section 1 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <Award size={18} className="text-primary" /> 1. Play Integrity & Fair Play
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SimonX is designed as a self-improvement cognitive training tool. To keep the competitive Leaderboard fair for the community:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li>Users must not use auto-clickers, macro bots, memory editing scripts, or external automated tools to input button sequences.</li>
            <li>Any account found manipulating scores or submitting suspicious leaderboard score entries may be reset or suspended by site administrators.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <ShieldAlert size={18} className="text-secondary" /> 2. Account Security & Verification
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            You are responsible for keeping your credentials and security answers secure:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li>Your account password and recovery question keys must be kept private.</li>
            <li>SimonX administrators will never ask for your password. If you lose access to your account, you must answer your security question correctly to reset your password.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 3. Limitation of Database Storage
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed font-normal">
            SimonX utilizes local mock data storage structures when remote database connections are unavailable. In mock DB mode:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li>Session logs, custom score saves, and newly registered profiles are saved locally on the hosting server's disk space.</li>
            <li>We do not guarantee persistent lifetime storage of mock databases and are not liable for resets during server restarts or migrations.</li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 text-center text-xs text-slate-400 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Mail size={14} className="text-primary" /> For terms questions or support inquiries, contact us at:
          </p>
          <a href="mailto:sherayvatsya@gmail.com" className="font-semibold text-primary hover:underline">
            sherayvatsya@gmail.com
          </a>
        </div>

      </div>

    </div>
  );
}
