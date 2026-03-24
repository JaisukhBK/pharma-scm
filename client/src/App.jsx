import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import AIChatPanel, { AIChatTrigger } from './agents/AIChatPanel';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WMSPage from './pages/WMSPage';
import TMSPage from './pages/TMSPage';
import OMSPage from './pages/OMSPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LiveMapPage from './pages/LiveMapPage';
import ForecastPage from './pages/ForecastPage';
import ReorderPage from './pages/ReorderPage';
import { Bell, Search, Sun, Moon } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem('sf_theme') || 'dark');

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { document.documentElement.classList.toggle('light', theme === 'light'); localStorage.setItem('sf_theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <span className="text-white font-bold text-2xl">SF</span>
          </div>
          <p className="theme-text-dim text-sm">Loading SupplyFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage theme={theme} toggleTheme={toggleTheme} />;

  const aiModule = ['wms', 'tms', 'oms', 'analytics', 'reorder'].includes(activeModule) ? (activeModule === 'reorder' ? 'wms' : activeModule) : 'analytics';

  const pageMap = {
    dashboard: <DashboardPage />,
    wms: <WMSPage />,
    tms: <TMSPage />,
    oms: <OMSPage />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
    livemap: <LiveMapPage />,
    forecast: <ForecastPage />,
    reorder: <ReorderPage />,
  };

  const NAV_LABELS = {
    dashboard: 'Command Center',
    wms: 'Warehouse Management',
    tms: 'Transportation Management',
    oms: 'Order Management',
    analytics: 'Analytics & Insights',
    settings: 'Settings',
    livemap: 'Live Shipment Map',
    forecast: 'Demand Forecasting',
    reorder: 'Smart Reorder',
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-bg">
      <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 theme-border">
          <div>
            <h1 className="text-lg font-bold tracking-tight theme-text">{NAV_LABELS[activeModule] || 'Dashboard'}</h1>
            <p className="theme-text-dim text-xs mt-0.5">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-dim" />
              <input type="text" placeholder="Search..." className="input-field pl-9 w-56" />
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-xl transition-all theme-text-muted" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="relative p-2 rounded-xl transition-all theme-text-dim" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
              <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{pageMap[activeModule] || <DashboardPage />}</div>
      </div>
      <AIChatPanel module={aiModule} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      {!chatOpen && <AIChatTrigger onClick={() => setChatOpen(true)} module={aiModule} />}
    </div>
  );
}

export default function App() { return <AuthProvider><AppContent /></AuthProvider>; }
