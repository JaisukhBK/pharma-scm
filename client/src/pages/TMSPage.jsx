import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Clock, DollarSign, TrendingUp, Truck } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge, ProgressBar, PageHeader, DataTable, KpiCard, Modal, Skeleton } from '../components/UIComponents';

export default function TMSPage() {
  const [shipments, setShipments] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('shipments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [shipData, carrierData] = await Promise.all([api.getShipments(), api.getCarriers()]);
      setShipments(shipData || []); setCarriers(carrierData || []);
    } catch (err) { console.error('TMS load error:', err); }
    finally { setLoading(false); }
  }

  const filtered = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter);
  const statusCounts = shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});

  const shipmentColumns = [
    { key: 'tracking_number', label: 'Tracking #', render: (v) => <span className="font-mono text-blue-600 font-medium">{v}</span> },
    { key: 'origin', label: 'Origin', render: (_, r) => <span className="theme-text-secondary">{r.origin_city}, {r.origin_state}</span> },
    { key: 'dest', label: 'Destination', render: (_, r) => <span className="theme-text-secondary">{r.destination_city}, {r.destination_state}</span> },
    { key: 'carrier', label: 'Carrier', render: (_, r) => <span className="theme-text-muted">{r.carrier?.name || '—'}</span> },
    { key: 'weight_kg', label: 'Weight', render: (v) => <span className="font-mono theme-text-muted">{v ? `${Number(v).toLocaleString()} kg` : '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'progress_pct', label: 'Progress', width: '130px', render: (v, r) => <ProgressBar value={v} color={r.status === 'delayed' ? '#ef4444' : r.status === 'delivered' ? '#10b981' : '#60a5fa'} showLabel /> },
    { key: 'shipping_cost', label: 'Cost', render: (v) => <span className="font-mono theme-text">{v ? `$${parseFloat(v).toLocaleString()}` : '—'}</span> },
  ];

  const carrierColumns = [
    { key: 'name', label: 'Carrier', render: (v) => <span className="theme-text font-medium">{v}</span> },
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono theme-text-muted">{v}</span> },
    { key: 'rating', label: 'Rating', render: (v) => <span className="text-amber-500 font-medium">{'★'.repeat(Math.round(v))} <span className="theme-text-dim font-mono text-xs">{v}</span></span> },
    { key: 'on_time_rate', label: 'On-Time %', render: (v) => (
      <div className="flex items-center gap-2">
        <ProgressBar value={v} color={v > 92 ? '#10b981' : v > 88 ? '#f59e0b' : '#ef4444'} />
        <span className="font-mono text-xs w-12 text-right" style={{ color: v > 92 ? '#10b981' : v > 88 ? '#f59e0b' : '#ef4444' }}>{v}%</span>
      </div>
    )},
    { key: 'cost_per_mile', label: 'Cost/Mile', render: (v) => <span className="font-mono theme-text">${parseFloat(v).toFixed(2)}</span> },
    { key: 'supported_modes', label: 'Modes', render: (v) => <span className="theme-text-muted text-xs capitalize">{(v || []).join(', ')}</span> },
  ];

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transportation Management System" subtitle="Shipment tracking, carrier management & route optimization"
        actions={<>
          <button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2"><Plus size={14} /> New Shipment</button>
        </>} />

      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="On-Time Delivery" value={`${carriers.length > 0 ? (carriers.reduce((s,c) => s + parseFloat(c.on_time_rate), 0) / carriers.length).toFixed(1) : 0}%`} icon={<Clock size={18} />} color="#10b981" positive change="1.8%" />
        <KpiCard title="Active Shipments" value={shipments.filter(s => ['in_transit','picked_up','out_for_delivery'].includes(s.status)).length} icon={<Truck size={18} />} color="#3b82f6" positive change="12%" />
        <KpiCard title="Total Shipping Cost" value={`$${shipments.reduce((s,sh) => s + parseFloat(sh.shipping_cost || 0), 0).toLocaleString()}`} icon={<DollarSign size={18} />} color="#f59e0b" />
        <KpiCard title="Active Carriers" value={carriers.length} icon={<TrendingUp size={18} />} color="#8b5cf6" positive change="2" />
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {['shipments', 'carriers', 'routes'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-blue-500/15 text-blue-600' : 'theme-text-dim'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'shipments' && (<>
        <div className="flex gap-2">
          {['all', 'pending', 'in_transit', 'delivered', 'delayed'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                statusFilter === status ? 'bg-blue-500/15 text-blue-600 border border-blue-500/25' : 'theme-text-dim border'
              }`} style={statusFilter !== status ? { borderColor: 'var(--border)', background: 'var(--bg-secondary)' } : {}}>
              {status.replace('_', ' ')} {statusCounts[status] ? `(${statusCounts[status]})` : status === 'all' ? `(${shipments.length})` : ''}
            </button>
          ))}
        </div>
        <div className="glass-card p-5"><DataTable columns={shipmentColumns} data={filtered} emptyMessage="No shipments found" /></div>
      </>)}

      {activeTab === 'carriers' && <div className="glass-card p-5"><h3 className="theme-text font-semibold text-sm mb-4">Carrier Performance</h3><DataTable columns={carrierColumns} data={carriers} /></div>}

      {activeTab === 'routes' && (
        <div className="glass-card p-12 text-center">
          <Truck size={48} className="theme-text-dim mx-auto mb-4" />
          <h3 className="theme-text font-semibold text-lg mb-2">Route Optimization</h3>
          <p className="theme-text-dim text-sm">Lane analysis, multi-stop routing, and cost optimization tools.</p>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Shipment" size="lg">
        <CreateShipmentForm carriers={carriers} onSuccess={() => { setShowCreateModal(false); loadData(); }} />
      </Modal>
    </div>
  );
}

function CreateShipmentForm({ carriers, onSuccess }) {
  const [form, setForm] = useState({ origin_address:'', origin_city:'', origin_state:'', destination_address:'', destination_city:'', destination_state:'', carrier_id:'', weight_kg:'', mode:'ground' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { await api.createShipment({...form, weight_kg: parseFloat(form.weight_kg)||null}); onSuccess(); } catch(err){alert(err.message);} finally{setSaving(false);} };
  const set = (k,v) => setForm({...form,[k]:v});
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="theme-text-dim text-xs uppercase tracking-wider">Origin</h4>
      <div className="grid grid-cols-3 gap-3">
        <input className="input-field" placeholder="Address" value={form.origin_address} onChange={e=>set('origin_address',e.target.value)} required />
        <input className="input-field" placeholder="City" value={form.origin_city} onChange={e=>set('origin_city',e.target.value)} required />
        <input className="input-field" placeholder="State" value={form.origin_state} onChange={e=>set('origin_state',e.target.value)} />
      </div>
      <h4 className="theme-text-dim text-xs uppercase tracking-wider">Destination</h4>
      <div className="grid grid-cols-3 gap-3">
        <input className="input-field" placeholder="Address" value={form.destination_address} onChange={e=>set('destination_address',e.target.value)} required />
        <input className="input-field" placeholder="City" value={form.destination_city} onChange={e=>set('destination_city',e.target.value)} required />
        <input className="input-field" placeholder="State" value={form.destination_state} onChange={e=>set('destination_state',e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="block theme-text-muted text-xs mb-1.5">Carrier</label><select className="input-field" value={form.carrier_id} onChange={e=>set('carrier_id',e.target.value)}><option value="">Select</option>{carriers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="block theme-text-muted text-xs mb-1.5">Weight (kg)</label><input className="input-field" type="number" value={form.weight_kg} onChange={e=>set('weight_kg',e.target.value)} /></div>
        <div><label className="block theme-text-muted text-xs mb-1.5">Mode</label><select className="input-field" value={form.mode} onChange={e=>set('mode',e.target.value)}>{['ground','air','sea','rail'].map(m=><option key={m} value={m}>{m}</option>)}</select></div>
      </div>
      <div className="flex justify-end gap-3 pt-2"><button type="button" className="btn-ghost">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving?'Creating...':'Create Shipment'}</button></div>
    </form>
  );
}
