import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, Shield, Warehouse, Truck, Package, Eye } from 'lucide-react';

const DEMO_USERS = [
  { email: 'admin@supplyflow.com', password: 'Admin@123', label: 'Admin', icon: Shield, color: '#8b5cf6', desc: 'Full access' },
  { email: 'warehouse@supplyflow.com', password: 'Warehouse@123', label: 'WMS Manager', icon: Warehouse, color: '#3b82f6', desc: 'Warehouse ops' },
  { email: 'transport@supplyflow.com', password: 'Transport@123', label: 'TMS Manager', icon: Truck, color: '#10b981', desc: 'Transport ops' },
  { email: 'orders@supplyflow.com', password: 'Orders@123', label: 'Order Operator', icon: Package, color: '#f59e0b', desc: 'Order fulfillment' },
  { email: 'viewer@supplyflow.com', password: 'Viewer@123', label: 'Viewer', icon: Eye, color: '#6b7280', desc: 'Read-only access' },
];

export default function LoginPage({ theme, toggleTheme }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingInAs, setLoggingInAs] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) { await signUp(email, password, fullName); }
      else { await signIn(email, password); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = async (user) => {
    setError('');
    setLoggingInAs(user.label);
    try {
      await signIn(user.email, user.password);
    } catch (err) {
      // User might not exist yet — create them
      try {
        await signUp(user.email, user.password, user.label);
      } catch (signupErr) {
        setError(`Failed to login as ${user.label}: ${signupErr.message}`);
      }
    }
    setLoggingInAs(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Theme toggle */}
      {toggleTheme && (
        <button onClick={toggleTheme} className="fixed top-4 right-4 p-2 rounded-xl transition-all z-10"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <div className="relative w-full max-w-5xl flex gap-8 items-start">

        {/* Left: Login Form */}
        <div className="flex-1 max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <span className="text-white font-bold text-2xl">SF</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight theme-text">SupplyFlow</h1>
            <p className="theme-text-dim text-sm mt-1">AI-Powered Supply Chain Management</p>
          </div>

          <div className="glass-card p-8">
            <h2 className="theme-text text-lg font-semibold mb-6">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block theme-text-muted text-xs mb-1.5">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="John Doe" required={isSignUp} />
                </div>
              )}
              <div>
                <label className="block theme-text-muted text-xs mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" required />
              </div>
              <div>
                <label className="block theme-text-muted text-xs mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="theme-text-dim text-sm hover:text-blue-500 transition-colors">
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Demo Login */}
        <div className="flex-1 max-w-sm pt-24">
          <h3 className="theme-text font-semibold text-sm mb-1">Quick Demo Login</h3>
          <p className="theme-text-dim text-xs mb-4">Click any role to sign in instantly</p>

          <div className="space-y-2.5">
            {DEMO_USERS.map(user => {
              const Icon = user.icon;
              const isLoading = loggingInAs === user.label;
              return (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user)}
                  disabled={!!loggingInAs}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    opacity: loggingInAs && !isLoading ? 0.5 : 1
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = user.color + '40'; e.currentTarget.style.background = user.color + '08'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: user.color + '18' }}>
                    <Icon size={18} style={{ color: user.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="theme-text text-sm font-semibold">{user.label}</div>
                    <div className="theme-text-dim text-xs">{user.desc}</div>
                  </div>
                  <div className="text-xs font-mono px-2 py-1 rounded-lg theme-text-dim" style={{ background: 'var(--bg-secondary)' }}>
                    {isLoading ? (
                      <span className="animate-pulse">Signing in...</span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→ Login</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="theme-text-dim text-xs mt-4 text-center">
            Demo users are auto-created on first click
          </p>
        </div>
      </div>

      <p className="fixed bottom-4 text-center theme-text-dim text-xs">
        Powered by Neon PostgreSQL · xAI Grok AI
      </p>
    </div>
  );
}
