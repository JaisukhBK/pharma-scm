import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/UIComponents';
import { Save, Key, Bell, Shield, Link, Database } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: <Database size={16} /> },
    { id: 'integrations', label: 'Integrations', icon: <Link size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'api', label: 'API Keys', icon: <Key size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Platform Settings" subtitle="Configure your SupplyFlow instance" />

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeSection === s.id
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/[0.03]'
              }`}
            >
              {s.icon}
              <span className="font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeSection === 'general' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-white font-semibold">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Company Name</label>
                  <input className="input-field" defaultValue="SupplyFlow Inc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Default Currency</label>
                    <select className="input-field">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                      <option>INR - Indian Rupee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Timezone</label>
                    <select className="input-field">
                      <option>America/New_York (EST)</option>
                      <option>America/Chicago (CST)</option>
                      <option>America/Los_Angeles (PST)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Default Warehouse</label>
                  <select className="input-field">
                    <option>Boston Distribution Center (BOS-DC)</option>
                    <option>Chicago Mega Hub (CHI-MH)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-4">
              {[
                { name: 'Supabase', desc: 'Database & authentication', status: 'connected', color: '#3ecf8e' },
                { name: 'Anthropic Claude API', desc: 'AI agent intelligence', status: 'connected', color: '#d97706' },
                { name: 'SAP ERP', desc: 'Enterprise resource planning sync', status: 'not_configured', color: '#6b7280' },
                { name: 'FedEx API', desc: 'Real-time shipment tracking', status: 'not_configured', color: '#6b7280' },
                { name: 'UPS API', desc: 'Carrier rate & tracking', status: 'not_configured', color: '#6b7280' },
                { name: 'Stripe', desc: 'Payment processing', status: 'not_configured', color: '#6b7280' },
                { name: 'Slack', desc: 'Alert notifications', status: 'not_configured', color: '#6b7280' },
              ].map(int => (
                <div key={int.name} className="glass-card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: `${int.color}20`, color: int.color }}>
                      {int.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{int.name}</div>
                      <div className="text-gray-500 text-xs">{int.desc}</div>
                    </div>
                  </div>
                  {int.status === 'connected' ? (
                    <span className="status-badge bg-emerald-500/15 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                    </span>
                  ) : (
                    <button className="btn-ghost text-xs">Configure</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-white font-semibold">Notification Preferences</h3>
              {[
                { label: 'Low stock alerts', desc: 'When inventory falls below reorder point', default: true },
                { label: 'Shipment delays', desc: 'When a shipment misses its ETA', default: true },
                { label: 'Order status changes', desc: 'When orders move through fulfillment stages', default: false },
                { label: 'Warehouse capacity warnings', desc: 'When utilization exceeds 90%', default: true },
                { label: 'Daily KPI digest', desc: 'Morning summary of key metrics', default: false },
                { label: 'AI agent insights', desc: 'When agents detect anomalies', default: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white text-sm font-medium">{n.label}</div>
                    <div className="text-gray-500 text-xs">{n.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/[0.1] peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-white font-semibold">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white text-sm font-medium">Two-Factor Authentication</div>
                    <div className="text-gray-500 text-xs">Add an extra layer of security</div>
                  </div>
                  <button className="btn-ghost text-xs">Enable</button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white text-sm font-medium">Session Timeout</div>
                    <div className="text-gray-500 text-xs">Auto-logout after inactivity</div>
                  </div>
                  <select className="input-field w-40">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white text-sm font-medium">Audit Logging</div>
                    <div className="text-gray-500 text-xs">Track all user actions</div>
                  </div>
                  <span className="status-badge bg-emerald-500/15 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-white font-semibold">API Keys</h3>
              <p className="text-gray-500 text-sm">Manage API keys for external integrations.</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">Production Key</span>
                    <span className="text-gray-500 text-xs">Created Mar 1, 2026</span>
                  </div>
                  <div className="font-mono text-xs text-gray-400 bg-white/[0.03] px-3 py-2 rounded-lg">
                    sf_prod_••••••••••••••••••••••••
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">Development Key</span>
                    <span className="text-gray-500 text-xs">Created Mar 15, 2026</span>
                  </div>
                  <div className="font-mono text-xs text-gray-400 bg-white/[0.03] px-3 py-2 rounded-lg">
                    sf_dev_••••••••••••••••••••••••
                  </div>
                </div>
              </div>
              <button className="btn-primary flex items-center gap-2"><Key size={14} /> Generate New Key</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
