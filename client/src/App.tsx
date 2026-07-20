import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budgets } from './components/Budgets';
import { Reports } from './components/Reports';
import { AICoach } from './components/AICoach';
import { Settings } from './components/Settings';
import { Lock, Mail, User as UserIcon, ArrowRight, Eye, EyeOff, Sparkles, CreditCard } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const { showToast } = useToast();
  
  // Tab Routing state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth Screen state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // 3D Parallax Mouse Tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2); // range -1 to 1
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2); // range -1 to 1
      setMousePos({ x, y });
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

  // Helper to prefill demo user credentials for ease of use
  const prefillDemoUser = () => {
    setEmail('user@example.com');
    setPassword('password123');
    showToast('Prefilled demo credentials', 'info');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-indigo-50/10 dark:from-[#0d0d0d] dark:via-[#141414] dark:to-[#171325] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-scale-up">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-stripe-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-xl animate-bounce relative">
            <CreditCard className="h-8 w-8 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-4 border-white/20 animate-ping" />
          </div>
          <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark font-bold tracking-widest uppercase animate-pulse">Initializing Antigravity...</p>
        </div>
      </div>
    );
  }

  // Non-authenticated view (Login / Register)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#030208] text-white transition-all duration-300 relative overflow-hidden">
        
        {/* Dynamic 3D Cosmic Space Solar System Parallax Backdrop (z-0) */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-transform duration-300 ease-out scale-110"
          style={{
            transform: `perspective(1200px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
          }}
        >
          {/* Base Solar System Image (from shared images.webp) */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-screen"
            style={{
              backgroundImage: "url('/solar_system.webp')",
            }}
          />
          {/* Dark space blend overlay */}
          <div className="absolute inset-0 bg-[#030208]/70 mix-blend-multiply" />

          {/* Nebula Cosmic Dust */}
          <div className="absolute top-[-15%] left-[-15%] w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-[#635bff]/20 to-[#8b5cf6]/14 blur-[90px] md:blur-[110px] animate-float-blob" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-gradient-to-br from-[#00d4b2]/15 to-[#635bff]/18 blur-[100px] md:blur-[120px] animate-float-blob-reverse" />

          {/* Central Sun in Parallax */}
          <div 
            className="absolute top-[50%] left-[50%] w-28 h-28 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 blur-[2px] shadow-[0_0_70px_20px_rgba(245,158,11,0.55)] animate-pulse transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 0) translate(-50%, -50%)`,
            }}
          />

          {/* 3D concentric Orbit Lines matching solar system rings */}
          <div className="solar-orbit solar-orbit-1" />
          <div className="solar-orbit solar-orbit-2" />
          <div className="solar-orbit solar-orbit-3" />
          <div className="solar-orbit solar-orbit-4" />
          <div className="asteroid-belt" />
          <div className="solar-orbit solar-orbit-6" />
          <div className="solar-orbit solar-orbit-7" />
          <div className="solar-orbit solar-orbit-8" />

          {/* Planets aligned on their orbits with independent 3D parallax offsets */}
          {/* 1. Mercury */}
          <div 
            className="absolute top-[48%] left-[45%] w-2 h-2 rounded-full bg-gray-400 shadow-sm animate-pulse transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * -5}px, ${mousePos.y * -5}px, 10px)` }}
          />
          {/* 2. Venus */}
          <div 
            className="absolute top-[45%] left-[41%] w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 shadow-sm animate-float-blob transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * -2}px, ${mousePos.y * -2}px, 20px)` }}
          />
          {/* 3. Earth */}
          <div 
            className="absolute top-[41%] left-[36%] w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 shadow-md animate-float-blob-reverse transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 3}px, ${mousePos.y * 3}px, 30px)` }}
          />
          {/* 4. Mars */}
          <div 
            className="absolute top-[38%] left-[32%] w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 shadow-sm animate-float-blob transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 7}px, ${mousePos.y * 7}px, 40px)` }}
          />
          {/* 5. Jupiter */}
          <div 
            className="absolute top-[28%] left-[25%] w-12 h-12 rounded-full bg-gradient-to-tr from-amber-800 via-orange-600 to-yellow-300 shadow-md animate-float-blob transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 50px)` }}
          />
          {/* 6. Saturn with 3D Rings */}
          <div 
            className="absolute top-[18%] left-[15%] w-16 h-16 saturn-container animate-float-blob-reverse transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * 18}px, 60px)` }}
          >
            <div className="saturn-globe" />
            <div className="saturn-ring" />
          </div>
          {/* 7. Uranus */}
          <div 
            className="absolute top-[8%] left-[8%] w-10 h-10 cosmic-planet-cyan animate-float-blob transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 70px)` }}
          />
          {/* 8. Neptune */}
          <div 
            className="absolute top-[2%] left-[3%] w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-600 shadow-md animate-float-blob-reverse transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 80px)` }}
          />

          {/* Shooting Comets with delays */}
          <div className="shooting-comet top-[15%] right-[25%]" />
          <div className="shooting-comet top-[40%] right-[10%]" style={{ animationDelay: '5s' }} />
          <div className="shooting-comet top-[65%] right-[30%]" style={{ animationDelay: '9s' }} />
        </div>

        {/* Content wrapper with relative z-10 stack to render above background */}
        <div className="w-full max-w-md flex flex-col gap-6 animate-scale-up relative z-10">
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-stripe-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-premium animate-pulse-glow">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight text-white">Antigravity</h1>
              <p className="text-xs text-purple-300 font-semibold mt-0.5">SaaS Expense Tracker & Financial Coach</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="cyber-glass-panel cyber-corners p-6 md:p-8 rounded-2xl flex flex-col gap-5 text-white">
            <div className="flex flex-col gap-1 border-b border-notion-border-light dark:border-notion-border-dark pb-3">
              <h2 className="font-bold text-lg tracking-tight">
                {authMode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </h2>
              <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">
                {authMode === 'login' ? 'Enter credentials or click demo prefill below.' : 'Get started tracking with custom budgets.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 text-xs">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-text-muted-light" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-text-muted-light" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-notion-text-muted-light">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => showToast('Forgot password? Log in with prefilled demo credentials.', 'info')}
                      className="text-[10px] text-stripe-primary font-bold hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-text-muted-light" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-notion-text-muted-light hover:text-notion-text-light"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-stripe-primary hover:bg-stripe-primary/95 disabled:opacity-75 text-white font-bold py-2.5 rounded-xl shadow-premium flex items-center justify-center gap-2 text-xs md:text-sm mt-2 transition-all"
              >
                {authLoading ? 'Authorizing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Prefix Demo helper */}
            {authMode === 'login' && (
              <button
                onClick={prefillDemoUser}
                className="w-full py-2 bg-stripe-primary/5 dark:bg-stripe-primary/10 hover:bg-stripe-primary/10 border border-stripe-primary/20 hover:border-stripe-primary/30 rounded-xl font-bold text-stripe-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> Prefill Demo User
              </button>
            )}

            {/* Navigation toggle link */}
            <div className="text-center text-[11px] text-notion-text-muted-light dark:text-notion-text-muted-dark mt-1 font-medium">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-stripe-primary font-bold hover:underline"
              >
                {authMode === 'login' ? 'Create one now' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated View Dashboard layout
  return (
    <div className="min-h-screen bg-[#030208] flex flex-col md:flex-row text-notion-text-dark font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic 3D Cosmic Space Solar System Parallax Backdrop (z-0) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none transition-transform duration-300 ease-out scale-110"
        style={{
          transform: `perspective(1200px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
        }}
      >
        {/* Base Solar System Image (from shared images.webp) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-screen"
          style={{
            backgroundImage: "url('/solar_system.webp')",
          }}
        />
        {/* Dark space blend overlay */}
        <div className="absolute inset-0 bg-[#030208]/70 mix-blend-multiply" />

        {/* Nebula Cosmic Dust */}
        <div className="absolute top-[-15%] left-[-10%] w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full bg-gradient-to-tr from-[#635bff]/20 to-[#8b5cf6]/14 blur-[100px] animate-float-blob" />
        <div className="absolute bottom-[5%] right-[-10%] w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-gradient-to-br from-[#00d4b2]/15 to-[#635bff]/18 blur-[110px] animate-float-blob-reverse" />

        {/* Central Sun in Parallax */}
        <div 
          className="absolute top-[50%] left-[50%] w-32 h-32 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 blur-[2px] shadow-[0_0_80px_25px_rgba(245,158,11,0.6)] animate-pulse transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 0) translate(-50%, -50%)`,
          }}
        />

        {/* Concentric 3D Orbital Planes */}
        <div className="solar-orbit solar-orbit-1" />
        <div className="solar-orbit solar-orbit-2" />
        <div className="solar-orbit solar-orbit-3" />
        <div className="solar-orbit solar-orbit-4" />
        <div className="asteroid-belt" />
        <div className="solar-orbit solar-orbit-6" />
        <div className="solar-orbit solar-orbit-7" />
        <div className="solar-orbit solar-orbit-8" />

        {/* Planets aligned on their orbits with independent 3D parallax offsets */}
        {/* 1. Mercury */}
        <div 
          className="absolute top-[48%] left-[45%] w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm animate-pulse transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * -5}px, ${mousePos.y * -5}px, 10px)` }}
        />
        {/* 2. Venus */}
        <div 
          className="absolute top-[45%] left-[41%] w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 shadow-sm animate-float-blob transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * -2}px, ${mousePos.y * -2}px, 20px)` }}
        />
        {/* 3. Earth */}
        <div 
          className="absolute top-[41%] left-[36%] w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 shadow-md animate-float-blob-reverse transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 3}px, ${mousePos.y * 3}px, 30px)` }}
        />
        {/* 4. Mars */}
        <div 
          className="absolute top-[38%] left-[32%] w-4 h-4 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 shadow-sm animate-float-blob transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 7}px, ${mousePos.y * 7}px, 40px)` }}
        />
        {/* 5. Jupiter */}
        <div 
          className="absolute top-[28%] left-[25%] w-14 h-14 rounded-full bg-gradient-to-tr from-amber-800 via-orange-600 to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-float-blob transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 50px)` }}
        />
        {/* 6. Saturn with 3D Rings */}
        <div 
          className="absolute top-[18%] left-[15%] w-18 h-18 saturn-container animate-float-blob-reverse transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * 18}px, 60px)` }}
        >
          <div className="saturn-globe" />
          <div className="saturn-ring" />
        </div>
        {/* 7. Uranus */}
        <div 
          className="absolute top-[8%] left-[8%] w-12 h-12 cosmic-planet-cyan animate-float-blob transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 70px)` }}
        />
        {/* 8. Neptune */}
        <div 
          className="absolute top-[2%] left-[3%] w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-600 shadow-md animate-float-blob-reverse transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 80px)` }}
        />

        {/* Shooting Comets with delays */}
        <div className="shooting-comet top-[15%] right-[25%]" />
        <div className="shooting-comet top-[40%] right-[10%]" style={{ animationDelay: '5s' }} />
        <div className="shooting-comet top-[65%] right-[30%]" style={{ animationDelay: '9s' }} />
      </div>

      {/* Main Page Content (relative z-10 for explicit rendering stacking) */}
      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
        {/* Navigation Side Panel */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Active Tab main content viewport pane */}
        <main className="flex-grow overflow-y-auto h-auto md:h-screen backdrop-blur-[2px]">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'budgets' && <Budgets />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'ai-coach' && <AICoach />}
          {activeTab === 'settings' && <Settings />}
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
