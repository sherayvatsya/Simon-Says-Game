import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, User, Key, CheckCircle, AlertCircle, ArrowLeft, Gamepad2, HelpCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export function Login() {
  const { login, googleLogin, error, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) navigate('/play');
  };

  const handleMockGoogleLogin = async () => {
    // A mock OAuth token payload simulating a successful Google integration
    // This allows instant local verification and testing for portfolios!
    // In production, this would open a Google OAuth popup.
    setMockGoogleCredentials();
  };

  const setMockGoogleCredentials = async () => {
    try {
      const mockCredential = 'MOCK_GOOGLE_ID_TOKEN_SECRET';
      // To bypass active fetch constraints locally, we trigger a direct mock auth save
      // or hit our server's google endpoint. Let's hit the server and simulate a quick test bypass.
      const res = await api.post('/auth/login', {
        email: 'tester@simonx.com',
        password: 'password123',
      }).catch(async () => {
        // If tester account doesn't exist, register it first
        await api.post('/auth/register', {
          name: 'Memory Legend',
          email: 'tester@simonx.com',
          password: 'password123',
        });
        return api.post('/auth/login', {
          email: 'tester@simonx.com',
          password: 'password123',
        });
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      useAuthStore.setState({ user, token, loading: false });
      navigate('/play');
    } catch (e) {
      console.error('Mock Google Sign-In fail:', e);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        
        {/* Glow header overlay */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display tracking-wide">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2">Enter credentials to resume your memory training</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail size={16} /></span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or Play Instantly</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Demo instant bypass login */}
        <button
          onClick={handleMockGoogleLogin}
          className="w-full py-3 px-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Gamepad2 size={16} className="text-primary animate-pulse" />
          Quick Play (Demo Account)
        </button>

        <p className="text-center text-xs text-slate-500 mt-8">
          New to SimonX? <Link to="/register" className="text-primary hover:underline">Create an Account</Link>
        </p>

      </div>
    </div>
  );
}

export function Register() {
  const { register, error, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('What was the name of your first pet?');
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuestion = selectedQuestion === "Write your own security question..." ? customQuestion : selectedQuestion;
    const success = await register({
      name,
      email,
      password,
      securityQuestion: finalQuestion,
      securityAnswer
    });
    if (success) setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-green-500/20 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
          <h2 className="text-2xl font-bold font-display mb-3">Registration Successful!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Your SimonX account has been created and verified. You can log in immediately.
          </p>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={16} /> Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        
        {/* Glow header overlay */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display tracking-wide">Create Account</h2>
          <p className="text-slate-400 text-sm mt-2">Join SimonX to track scores and unlock badges</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><User size={16} /></span>
              <input 
                type="text" 
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="MemoryLegend"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail size={16} /></span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="•••••••• (Min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Question</label>
            <div className="relative flex">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none"><HelpCircle size={16} /></span>
              <select
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl bg-[#161b22] border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm text-slate-300 appearance-none cursor-pointer"
              >
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                <option value="What elementary school did you attend?">What elementary school did you attend?</option>
                <option value="What city were you born in?">What city were you born in?</option>
                <option value="What was the make of your first car?">What was the make of your first car?</option>
                <option value="Write your own security question...">Write your own security question...</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
          </div>

          {selectedQuestion === "Write your own security question..." && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Custom Security Question</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><HelpCircle size={16} /></span>
                <input 
                  type="text" 
                  required
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="Enter your security question"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Answer</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Key size={16} /></span>
              <input 
                type="text" 
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="Enter your answer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          Already registered? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>

      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');

    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setQuestion(res.data.question);
      setStep(2);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to retrieve security question.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');

    try {
      const res = await api.post('/auth/forgot-password/reset', {
        email,
        securityAnswer,
        newPassword
      });
      setMsg(res.data.message || 'Password has been reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display tracking-wide">Recover Password</h2>
          <p className="text-slate-400 text-sm mt-2">
            {step === 1 ? 'Enter your email to retrieve your security question' : 'Answer your security question to reset password'}
          </p>
        </div>

        {msg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-primary text-xs flex items-center gap-2">
            <CheckCircle size={16} /> <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} /> <span>{err}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleFetchQuestion} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail size={16} /></span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
            >
              {loading ? 'Retrieving Question...' : 'Get Security Question'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Question</span>
              <span className="text-sm font-semibold text-slate-200">{question}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Answer</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Key size={16} /></span>
                <input 
                  type="text" 
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="Enter your answer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="•••••••• (Min 6 chars)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/login" className="text-primary hover:underline flex items-center gap-1.5 justify-center">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');

    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display tracking-wide">New Password</h2>
          <p className="text-slate-400 text-sm mt-2">Enter your new credential password below</p>
        </div>

        {msg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-primary text-xs flex items-center gap-2">
            <CheckCircle size={16} /> <span>{msg} (Redirecting...)</span>
          </div>
        )}

        {err && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} /> <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="•••••••• (Min 6 chars)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-darkbg font-display font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((e: any) => {
        setStatus('error');
        setMessage(e.response?.data?.message || 'Email verification failed.');
      });
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 grid-bg">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 text-center">
        {status === 'loading' && (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-primary mx-auto mb-6" />
        )}
        {status === 'success' && (
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
        )}
        {status === 'error' && (
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        )}

        <h2 className="text-2xl font-bold font-display mb-3">
          {status === 'loading' ? 'Verifying Account' : status === 'success' ? 'Verification Success' : 'Verification Failed'}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>

        {status !== 'loading' && (
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-darkbg py-2.5 px-6 rounded-full font-display uppercase tracking-wider hover:opacity-90">
            Proceed to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
