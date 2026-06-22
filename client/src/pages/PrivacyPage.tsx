import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Mail, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
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
          SECURE SEC-SYS // PRIV-001
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
          PRIVACY POLICY
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Last Updated: June 22, 2026. Review how SimonX safeguards your cognitive statistics and profile metadata.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Section 1 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <User size={18} className="text-primary" /> 1. Data Collection
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SimonX only collects data necessary to support your game account registration, leaderboard rankings, and stats metrics tracking:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li><strong>Account Profiles:</strong> Username, email address, password hashes, and selected security questions/answers.</li>
            <li><strong>Performance Stats:</strong> High scores, game modes played, total attempts, level benchmarks, and accuracy scores.</li>
            <li><strong>Session Telemetry:</strong> Tap latency response speeds (used solely for our adaptive AI difficulty speed pacing).</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <Lock size={18} className="text-secondary" /> 2. Security & Token Verification
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We prioritize secure authentication to protect user stats records:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li>Passwords and security answers are encrypted using cryptographically secure hashing functions before database storage.</li>
            <li>We utilize JSON Web Tokens (JWT) for secure, stateless request authentication. JWT tokens are stored locally on your device's storage and can be cleared instantly upon logging out.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
            <Eye size={18} className="text-rose-500" /> 3. Cookies & Cache PWA Storage
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            SimonX does not use tracking cookies for promotional advertising. We use basic localStorage caches and Progressive Web App (PWA) cache blocks to support:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
            <li>Pre-loading retro tone assets and game stylesheets.</li>
            <li>Facilitating instant offline gameplay mode redirects.</li>
            <li>Keeping authentication state active during page reloads.</li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 text-center text-xs text-slate-400 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Mail size={14} className="text-primary" /> Questions about data protection? Contact us at:
          </p>
          <a href="mailto:sherayvatsya@gmail.com" className="font-semibold text-primary hover:underline">
            sherayvatsya@gmail.com
          </a>
        </div>

      </div>

    </div>
  );
}

// Inline User icon helper to keep imports clean
function User({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
