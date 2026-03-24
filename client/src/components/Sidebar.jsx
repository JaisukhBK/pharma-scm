import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Warehouse, Truck, Package, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut, Map, TrendingUp, RefreshCw
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'wms', label: 'Warehouse (WMS)', icon: Warehouse },
  { id: 'tms', label: 'Transport (TMS)', icon: Truck },
  { id: 'oms', label: 'Orders (OMS)', icon: Package },
  { id: 'divider1', divider: true, label: 'AI-POWERED' },
  { id: 'livemap', label: 'Live Shipment Map', icon: Map, badge: 'NEW' },
  { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, badge: 'NEW' },
  { id: 'reorder', label: 'Smart Reorder', icon: RefreshCw, badge: 'NEW' },
  { id: 'divider2', divider: true, label: 'SYSTEM' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeModule, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? 72 : 250, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <span className="text-white font-bold text-sm">SF</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm tracking-tight theme-text">SupplyFlow</div>
            <div className="theme-text-dim text-xs">SCM Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          if (item.divider) {
            if (collapsed) return null;
            return <div key={item.id} className="pt-4 pb-1 px-3"><span className="theme-text-dim text-[10px] font-semibold tracking-widest">{item.label}</span></div>;
          }
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                isActive ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'theme-text-dim border border-transparent hover:theme-text-muted'
              }`}
              title={collapsed ? item.label : undefined}>
              <Icon size={17} />
              {!collapsed && (
                <span className="font-medium flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-500">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="theme-text text-xs font-medium truncate">{user.email}</div>
              <button onClick={signOut} className="theme-text-dim text-xs hover:text-red-500 transition-colors flex items-center gap-1"><LogOut size={10} /> Sign out</button>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="w-full p-2 rounded-lg theme-text-dim transition-colors flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
}
