import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Package, DollarSign, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader, StatusBadge, KpiCard, Skeleton } from '../components/UIComponents';

const PRIORITY_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' };

export default function ReorderPage() {
  const [reorders, setReorders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // id of reorder being approved/rejected

  useEffect(() => { loadData(); }, [filter]);

  async function loadData() {
    setLoading(true);
    try { setReorders(await api.getReorders(filter) || []); }
    catch (err) { console.error('Reorder error:', err); }
    finally { setLoading(false); }
  }

  async function handleAction(id, status) {
    setActing(id);
    try {
      await api.updateReorder(id, { status });
      // Remove from list with animation
      setReorders(prev => prev.filter(r => r.id !== id));
    } catch (err) { alert(err.message); }
    finally { setActing(null); }
  }

  async function approveAll() {
    const pending = reorders.filter(r => r.status === 'pending');
    for (const r of pending) {
      try { await api.updateReorder(r.id, { status: 'approved' }); }
      catch (err) { console.error(err); }
    }
    loadData();
  }

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i=><Skeleton key={i} className="h-32" />)}</div>;

  const totalCost = reorders.reduce((s, r) => s + parseFloat(r.estimated_cost || 0), 0);
  const criticalCount = reorders.filter(r => r.priority === 'critical').length;
  const pendingCount = reorders.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Smart Reorder Automation" subtitle="AI-generated purchase recommendations based on demand forecasting"
        actions={<div className="flex gap-3">
          <button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
          {pendingCount > 0 && (
            <button onClick={approveAll} className="btn-primary flex items-center gap-2"><CheckCircle size={14} /> Approve All ({pendingCount})</button>
          )}
        </div>} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Pending Reorders" value={pendingCount} icon={<Package size={18} />} color="#f59e0b" />
        <KpiCard title="Critical Items" value={criticalCount} icon={<AlertTriangle size={18} />} color="#ef4444" />
        <KpiCard title="Total Est. Cost" value={`$${totalCost.toLocaleString()}`} icon={<DollarSign size={18} />} color="#3b82f6" />
        <KpiCard title="AI Confidence" value="94%" icon={<Zap size={18} />} color="#8b5cf6" />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'ordered', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === s ? 'bg-blue-500/15 text-blue-600 border border-blue-500/25' : 'theme-text-dim border'
            }`} style={filter !== s ? { borderColor: 'var(--border)', background: 'var(--bg-secondary)' } : {}}>
            {s}
          </button>
        ))}
      </div>

      {/* Reorder Cards */}
      <div className="space-y-4">
        {reorders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
            <h3 className="theme-text font-semibold text-lg mb-2">All Clear</h3>
            <p className="theme-text-dim text-sm">No {filter === 'all' ? '' : filter} reorder requests right now.</p>
          </div>
        ) : reorders.map(r => (
          <div key={r.id} className="glass-card p-5 transition-all" style={{ borderLeft: `4px solid ${PRIORITY_COLORS[r.priority] || '#6b7280'}`, borderRadius: '0 16px 16px 0' }}>
            <div className="flex gap-6">
              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="theme-text font-semibold">{r.product?.name}</h4>
                  <span className="font-mono text-xs theme-text-dim">{r.product?.sku}</span>
                  <StatusBadge status={r.priority} />
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3">
                  <div>
                    <div className="theme-text-dim text-xs">Current Stock</div>
                    <div className="theme-text font-mono font-bold text-lg" style={{ color: r.current_stock <= r.reorder_point * 0.25 ? '#ef4444' : '#f59e0b' }}>
                      {r.current_stock}
                    </div>
                  </div>
                  <div>
                    <div className="theme-text-dim text-xs">Reorder Point</div>
                    <div className="theme-text font-mono font-medium">{r.reorder_point}</div>
                  </div>
                  <div>
                    <div className="theme-text-dim text-xs">Suggested Qty</div>
                    <div className="text-blue-600 font-mono font-bold text-lg">{r.suggested_quantity}</div>
                  </div>
                  <div>
                    <div className="theme-text-dim text-xs">Est. Cost</div>
                    <div className="theme-text font-mono font-medium">${parseFloat(r.estimated_cost || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="theme-text-dim text-xs">Warehouse</div>
                    <div className="theme-text text-sm">{r.warehouse?.name?.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                </div>

                {/* AI Reasoning */}
                {r.ai_reasoning && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={12} className="text-purple-500" />
                      <span className="text-purple-600 text-xs font-semibold">AI Recommendation</span>
                    </div>
                    <p className="theme-text-secondary text-xs leading-relaxed">{r.ai_reasoning}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {r.status === 'pending' && (
                <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                  <button
                    onClick={() => handleAction(r.id, 'approved')}
                    disabled={acting === r.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
                    style={{ background: '#10b981' }}>
                    <CheckCircle size={16} />
                    {acting === r.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'rejected')}
                    disabled={acting === r.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#ef4444' }}>
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
