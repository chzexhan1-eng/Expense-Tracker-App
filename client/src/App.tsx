import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budgets } from './components/Budgets';
import { Reports } from './components/Reports';
import { AICoach } from './components/AICoach';
import { Settings } from './components/Settings';
import { Lock, Mail, User as UserIcon, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp } from 'lucide-react';

/* â”€â”€â”€ Money symbols floating in background â”€â”€â”€ */
const MONEY_SYMBOLS = ['$', 'â‚¬', 'Â£', 'Â¥', 'â‚¿', '$', '$', 'â‚¬'];
const COINS = [
  { top: '8%',  left: '6%',  size: 64,  delay: '0s',   duration: '14s' },
  { top: '15%', left: '88%', size: 48,  delay: '2s',   duration: '18s' },
  { top: '55%', left: '4%',  size: 80,  delay: '4s',   duration: '12s' },
  { top: '72%', left: '91%', size: 56,  delay: '1s',   duration: '16s' },
  { top: '35%', left: '93%', size: 40,  delay: '6s',   duration: '20s' },
  { top: '85%', left: '12%', size: 72,  delay: '3s',   duration: '15s' },
  { top: '28%', left: '2%',  size: 44,  delay: '8s',   duration: '22s' },
  { top: '65%', left: '82%', size: 60,  delay: '5s',   duration: '17s' },
];

/* â”€â”€â”€ Rising chart line (SVG sparkline in background) â”€â”€â”€ */
const ChartBg: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#10b981" stopOpacity="0" />
        <stop offset="40%"  stopColor="#10b981" stopOpacity="1" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
      </linearGradient>
    </defs>
    {/* Main rising line */}
    <polyline
      points="0,820 120,780 240,750 360,700 480,640 600,570 720,490 840,420 960,340 1080,260 1200,190 1320,120 1440,60"
      fill="none"
      stroke="url(#chartGrad)"
      strokeWidth="4"
    />
    {/* Secondary noisy line */}
    <polyline
      points="0,860 100,830 200,800 340,760 420,720 540,670 660,600 780,530 900,460 1020,370 1140,290 1280,200 1440,130"
      fill="none"
      stroke="#10b981"
      strokeWidth="2"
      strokeDasharray="12 8"
    />
    {/* Candlestick bars */}
    {[80,200,320,440,560,680,800,920,1040,1160,1280,1380].map((x, i) => {
      const h = 40 + (i * 18);
      const y = 840 - h - (i * 60);
      const bullish = i % 3 !== 1;
      return (
        <g key={x}>
          <rect x={x - 10} y={y} width={20} height={h}
            fill={bullish ? '#10b981' : '#ef4444'} opacity={0.5} rx={2} />
          <line x1={x} y1={y - 12} x2={x} y2={y} stroke={bullish ? '#10b981' : '#ef4444'} strokeWidth={2} opacity={0.5} />
          <line x1={x} y1={y + h} x2={x} y2={y + h + 12} stroke={bullish ? '#10b981' : '#ef4444'} strokeWidth={2} opacity={0.5} />
        </g>
      );
    })}
  </svg>
);

const MoneyBackground: React.FC<{ mouseX: number; mouseY: number }> = ({ mouseX, mouseY }) => (
  <div
    className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
    style={{ transform: `perspective(1400px) rotateX(${mouseY * -5}deg) rotateY(${mouseX * 5}deg)` }}
  >
    {/* Base gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#020d08] via-[#030f06] to-[#070414]" />

    {/* SVG chart backdrop */}
    <ChartBg />

    {/* Green aurora top-left */}
    <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/25 to-green-600/10 blur-[120px] animate-float-blob" />
    {/* Gold aurora bottom-right */}
    <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-amber-400/20 to-yellow-500/10 blur-[130px] animate-float-blob-reverse" />
    {/* Purple premium mid accent */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-r from-violet-600/10 to-emerald-500/10 blur-[100px] animate-float-blob" />

    {/* Floating gold coins with $ symbols */}
    {COINS.map((c, i) => (
      <div
        key={i}
        className="absolute flex items-center justify-center rounded-full font-black animate-float-coin"
        style={{
          top: c.top,
          left: c.left,
          width: c.size,
          height: c.size,
          fontSize: c.size * 0.38,
          animationDelay: c.delay,
          animationDuration: c.duration,
          background: `radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 55%, #b45309)`,
          boxShadow: `0 0 ${c.size * 0.4}px rgba(245,158,11,0.35), inset -4px -4px 10px rgba(0,0,0,0.4), inset 4px 4px 10px rgba(255,255,255,0.25)`,
          color: 'rgba(120,53,15,0.85)',
          transform: `translate3d(${mouseX * (i % 2 === 0 ? 8 : -8)}px, ${mouseY * (i % 2 === 0 ? 6 : -6)}px, 0)`,
          transition: 'transform 0.4s ease-out',
          opacity: 0.65,
        }}
      >
        {MONEY_SYMBOLS[i]}
      </div>
    ))}

    {/* Money rain streaks */}
    {[10, 22, 35, 48, 60, 73, 85, 95].map((left, i) => (
      <div
        key={i}
        className="absolute top-0 w-px animate-money-rain"
        style={{
          left: `${left}%`,
          height: `${60 + i * 10}px`,
          background: 'linear-gradient(to bottom, transparent, #10b981, transparent)',
          animationDelay: `${i * 1.1}s`,
          animationDuration: `${4 + i * 0.7}s`,
          opacity: 0.18,
        }}
      />
    ))}

    {/* Shimmering gold grid lines */}
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
    />
  </div>
);

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX - innerWidth / 2) / (innerWidth / 2),
        y: (e.clientY - innerHeight / 2) / (innerHeight / 2),
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
        showToast('Welcome back! Session authorized.', 'success');
      } else {
        await register(name, email, password);
        showToast('Account created successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authorization failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const prefillDemoUser = () => {
    setEmail('user@example.com');
    setPassword('password123');
    showToast('Demo credentials filled!', 'info');
  };

  /* â”€â”€ Loading screen â”€â”€ */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020d08] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-scale-up">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce relative"
            style={{ background: 'linear-gradient(135deg,#10b981,#f59e0b)' }}>
            <TrendingUp className="h-8 w-8 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-4 border-white/20 animate-ping" />
          </div>
          <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase animate-pulse">Loading Vault...</p>
        </div>
      </div>
    );
  }

  /* â”€â”€ Login / Register â”€â”€ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-white relative overflow-hidden">
        <MoneyBackground mouseX={mousePos.x} mouseY={mousePos.y} />

        <div className="w-full max-w-md flex flex-col gap-6 animate-scale-up relative z-10">

          {/* Logo */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse-glow-gold relative"
              style={{ background: 'linear-gradient(135deg,#059669,#10b981,#f59e0b)' }}>
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-emerald-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                WealthVault
              </h1>
              <p className="text-xs text-emerald-400/80 font-semibold mt-1 tracking-widest uppercase">
                Smart Expense Tracker & AI Coach
              </p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { label: 'Savings', value: '+24%', color: '#10b981' },
              { label: 'Budgets', value: '12 Active', color: '#f59e0b' },
              { label: 'AI Insights', value: 'Live', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}40`, color: s.color }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color }} />
                {s.value} {s.label}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-2xl p-6 md:p-8 flex flex-col gap-5 animate-fade-in-up"
            style={{
              background: 'rgba(2,20,10,0.72)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(16,185,129,0.25)',
              boxShadow: '0 0 60px rgba(16,185,129,0.08), 0 25px 50px rgba(0,0,0,0.5)',
            }}>

            {/* Glowing top bar */}
            <div className="h-0.5 w-full rounded-full mb-1"
              style={{ background: 'linear-gradient(90deg,transparent,#10b981,#f59e0b,transparent)' }} />

            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-xl tracking-tight text-white">
                {authMode === 'login' ? 'ðŸ‘‹ Welcome back' : 'ðŸš€ Create account'}
              </h2>
              <p className="text-xs text-emerald-400/70">
                {authMode === 'login'
                  ? 'Sign in to manage your finances.'
                  : 'Start tracking your money smarter.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-emerald-300/80">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                    <input type="text" required placeholder="Alex Johnson" value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-white placeholder-white/25 transition-all"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-emerald-300/80">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                  <input type="email" required placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-emerald-300/80">Password</label>
                  {authMode === 'login' && (
                    <button type="button" onClick={() => showToast('Use demo credentials below.', 'info')}
                      className="text-[10px] text-amber-400 font-bold hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/60" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/60 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={authLoading}
                className="w-full font-bold py-3 rounded-xl text-sm mt-1 flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981,#f59e0b)', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
                {authLoading ? 'Authorizing...' : authMode === 'login' ? 'Sign In to Vault' : 'Create My Vault'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {authMode === 'login' && (
              <button onClick={prefillDemoUser}
                className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                <Sparkles className="h-4 w-4" /> Use Demo Account
              </button>
            )}

            <p className="text-center text-[11px] text-white/40 mt-1">
              {authMode === 'login' ? "No account? " : 'Have an account? '}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-emerald-400 font-bold hover:underline">
                {authMode === 'login' ? 'Create one free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* â”€â”€ Authenticated Dashboard â”€â”€ */
  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white font-sans relative overflow-hidden">
      <MoneyBackground mouseX={mousePos.x} mouseY={mousePos.y} />
      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-grow overflow-y-auto h-auto md:h-screen backdrop-blur-[1px]">
          {activeTab === 'dashboard'    && <Dashboard />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'budgets'      && <Budgets />}
          {activeTab === 'reports'      && <Reports />}
          {activeTab === 'ai-coach'     && <AICoach />}
          {activeTab === 'settings'     && <Settings />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
