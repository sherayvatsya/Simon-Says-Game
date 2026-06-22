import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, Trophy, Gamepad2, Timer, Zap, HelpCircle, 
  ChevronDown, MessageSquare, Star, ArrowRight, ShieldCheck, Heart
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative w-full overflow-hidden grid-bg">
      
      {/* Background Neon Glowing Blobs */}
      <div className="absolute top-20 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] glow-cyan" />
      <div className="absolute top-80 right-1/4 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Introducing SimonX Challenge
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl"
        >
          SIMON<span className="text-primary drop-shadow-[0_0_35px_rgba(0,229,255,0.6)]">X</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-400 font-medium"
        >
          Train Your Brain. Beat Your Limits. Repeat the neon sequence and battle players worldwide in the ultimate cognitive arena.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/play"
            className="w-full sm:w-auto text-center font-display font-extrabold text-darkbg bg-primary hover:bg-primary/90 py-4 px-8 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.6)] text-lg uppercase tracking-wider scale-100 hover:scale-[1.03] active:scale-[0.98]"
          >
            Play Now
          </Link>
          <Link
            to="/leaderboard"
            className="w-full sm:w-auto text-center font-display font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-4 px-8 rounded-xl transition-all duration-300 text-lg uppercase tracking-wider flex items-center justify-center gap-2"
          >
            View Leaderboard <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Features Cards Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Train With <span className="text-primary">SimonX</span>?
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Engineered to sharpen visual memory, response speeds, and focus through custom-tailored mechanics.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl hover:border-primary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Cognitive Training</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enhance working memory retention capacity and cognitive endurance by scaling up sequencing bounds.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl hover:border-secondary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Adaptive Speed</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our core difficulty adjust engine monitors your inputs to optimize sequence flash speeds in real time.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl hover:border-accent/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Synthesizer Tones</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Play with responsive synthesizer sound waves or retro audio tones to match your preferred theme style.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Game Modes Cards */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Challenge Mode
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            SimonX offers five unique play styles to match your memory targets and comfort level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Classic Mode', desc: 'Repeat the infinite color chain, level up, and set the all-time high score.', color: 'border-l-primary', icon: <Brain /> },
            { title: 'Time Attack', desc: 'Beat the clock! Match as many colors as possible before the 60s timer hits zero.', color: 'border-l-accent', icon: <Timer /> },
            { title: 'Reverse Mode', desc: 'Test spatial recall by repeating the flashing sequence completely backwards.', color: 'border-l-secondary', icon: <Zap /> },
            { title: 'Zen Mode', desc: 'A casual practice environment. Make mistakes without ever trigger game over.', color: 'border-l-green-400', icon: <Heart className="text-green-400" /> }
          ].map((mode, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`glass-card p-6 rounded-2xl border-l-4 ${mode.color} transition-all duration-300 flex flex-col justify-between h-56`}
            >
              <div>
                <div className="text-slate-300 mb-4">{mode.icon}</div>
                <h3 className="text-lg font-bold mb-2 font-display">{mode.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{mode.desc}</p>
              </div>
              <Link to="/play" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline mt-4">
                Play now <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3-Step Interactive Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How to Master SimonX
          </h2>
        </div>

        <div className="relative border-l-2 border-white/5 ml-4 md:ml-0 md:border-l-0 md:grid md:grid-cols-3 md:gap-8">
          {[
            { step: '01', title: 'Watch the Lights', desc: 'Pay close attention as the circular quadrant segments flash colors and play distinct synthesizer notes.' },
            { step: '02', title: 'Repeat the Sequence', desc: 'Tap the glowing sections in the exact order shown. In reverse mode, repeat them backwards.' },
            { step: '03', title: 'Score and Level Up', desc: 'Correct inputs unlock score combo multipliers, accelerate play speed, and unlock premium badge rewards.' }
          ].map((item, idx) => (
            <div key={idx} className="relative mb-12 md:mb-0 pl-8 md:pl-0 text-left md:text-center">
              {/* Timeline bubble */}
              <div className="absolute -left-11 top-1 md:relative md:left-0 md:top-0 mx-auto h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-black text-xs text-darkbg shadow-[0_0_15px_rgba(0,229,255,0.4)] mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-2 font-display">{item.title}</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials (Glassmorphism Cards) */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Approved by Mind Athletes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'Alex Rivera', role: 'Speedcuber & Student', quote: 'SimonX Reverse Mode is the ultimate workout. Playing it daily improved my spatial memorization significantly.' },
            { name: 'Sarah Chen', role: 'Casual Gamer', quote: 'The Dark Gaming theme, visual glow, and high-pressure Multiplayer make SimonX feel like an arcade esport!' },
            { name: 'Marcus Brody', role: 'Memory Coach', quote: 'The AI difficulty scaling is a game changer. It automatically accelerates when I am in the flow, preventing boredom.' }
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-6">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${t.name}`} 
                  alt={t.name}
                  className="h-10 w-10 rounded-full bg-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold font-display">{t.name}</h4>
                  <span className="text-xs text-slate-500">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ (Accordion) */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            { q: 'How does the AI Difficulty Adjustment work?', a: 'Our engine tracks your correct input percentage and the duration of your taps. If you enter patterns quickly and with 100% accuracy, the speed accelerates. If you slow down or miss steps, the pattern display rate increases, adding visual queues to assist.' },
            { q: 'Is there support for offline gameplay?', a: 'Yes! SimonX is built as a Progressive Web App (PWA). If you install it, you can run single-player Classic, Zen, and Reverse modes offline. Custom sounds will play using a local Web Audio API Synthesizer fallback.' },
            { q: 'Can I play with my keyboard?', a: 'Absolutely. Use keyboard keys 1 (Green), 2 (Red), 3 (Yellow), and 4 (Blue) or arrow keys as standard input shortcuts during sequencing.' }
          ].map((faq, idx) => (
            <div key={idx} className="glass border border-white/5 rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-primary' : 'text-slate-500'}`} size={18} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#070a0e] py-8 border-t border-white/5 text-center text-xs text-slate-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display font-bold tracking-wider text-slate-500">
            SIMONX &copy; {new Date().getFullYear()} – ALL RIGHTS RESERVED
          </span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href="mailto:sherayvatsya@gmail.com" className="hover:text-primary transition-colors">Contact: sherayvatsya@gmail.com</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
