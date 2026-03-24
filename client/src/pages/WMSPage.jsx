import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Users, Box, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge, ProgressBar, PageHeader, DataTable, Modal, Skeleton } from '../components/UIComponents';

export default function WMSPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [activeTab, setActiveTab] = useState('warehouses');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [whData, invData] = await Promise.all([api.getWarehouses(), api.getInventory()]);
      setWarehouses(whData || []);
      setInventory(invData || []);
    } catch (err) { console.error('WMS load error:', err); }
    finally { setLoading(false); }
  }

  async function loadWarehouseDetail(id) {
    try { const data = await api.getWarehouse(id); setSelectedWarehouse(data); }
    catch (err) { console.error('Warehouse detail error:', err); }
  }

  const tabs = [
    { id: 'warehouses', label: 'Warehouses', count: warehouses.length },
    { id: 'inventory', label: 'Inventory', count: inventory.length },
    { id: 'receiving', label: 'Receiving', count: 0 },
    { id: 'pick-pack', label: 'Pick & Pack', count: 0 },
  ];

  const filteredInventory = inventory.filter(i =>
    !search || i.product?.name?.toLowerCase().includes(search.toLowerCase()) || i.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const inventoryColumns = [
    { key: 'sku', label: 'SKU', render: (_, row) => <span className="font-mono text-blue-600">{row.product?.sku}</span> },
    { key: 'name', label: 'Product', render: (_, row) => <span className="font-medium theme-text">{row.product?.name}</span> },
    { key: 'warehouse', label: 'Warehouse', render: (_, row) => <span className="theme-text-muted">{row.warehouse?.name || '—'}</span> },
    { key: 'quantity_on_hand', label: 'On Hand', render: (v) => <span className="font-mono theme-text">{v?.toLocaleString()}</span> },
    { key: 'quantity_reserved', label: 'Reserved', render: (v) => <span className="font-mono theme-text-muted">{v?.toLocaleString()}</span> },
    { key: 'quantity_available', label: 'Available', render: (v) => <span className="font-mono text-emerald-600">{v?.toLocaleString()}</span> },
    { key: 'reorder_point', label: 'Reorder At', render: (v) => <span className="font-mono theme-text-dim">{v?.toLocaleString()}</span> },
    { key: 'alert', label: 'Status', render: (v) => v ? <StatusBadge status={v} /> : <span className="theme-text-dim text-xs">OK</span> },
  ];

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Warehouse Management System"
        subtitle="Inventory tracking, zone management & warehouse operations"
        actions={<>
          <button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2"><Plus size={14} /> Add Warehouse</button>
        </>}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-blue-500/15 text-blue-600' : 'theme-text-dim'
            }`}>
            {tab.label}
            {tab.count > 0 && <span className="ml-2 text-xs opacity-60">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {warehouses.map(wh => (
              <div key={wh.id} onClick={() => loadWarehouseDetail(wh.id)}
                className={`glass-card-hover p-5 ${selectedWarehouse?.id === wh.id ? 'border-blue-500/30' : ''}`}
                style={selectedWarehouse?.id === wh.id ? { background: 'rgba(59,130,246,0.04)' } : {}}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-sm theme-text">{wh.name}</h4>
                    <p className="theme-text-dim text-xs mt-0.5 flex items-center gap-1"><MapPin size={10} />{wh.city}, {wh.state}</p>
                  </div>
                  <StatusBadge status={wh.status} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Units', val: Math.round(wh.total_capacity * wh.current_utilization / 100).toLocaleString() },
                    { label: 'Zones', val: wh.zone_count },
                    { label: 'Workers', val: wh.worker_count }
                  ].map(s => (
                    <div key={s.label}>
                      <div className="theme-text-dim text-xs mb-0.5">{s.label}</div>
                      <div className="text-sm font-bold font-mono theme-text">{s.val}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="theme-text-dim">Capacity</span>
                    <span className="font-mono" style={{ color: wh.current_utilization > 90 ? '#ef4444' : wh.current_utilization > 75 ? '#f59e0b' : '#10b981' }}>
                      {wh.current_utilization}%
                    </span>
                  </div>
                  <ProgressBar value={wh.current_utilization} color={wh.current_utilization > 90 ? '#ef4444' : wh.current_utilization > 75 ? '#f59e0b' : '#10b981'} height={8} />
                </div>
              </div>
            ))}
          </div>

          {selectedWarehouse?.zones?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="theme-text font-bold text-sm mb-4">{selectedWarehouse.name} — Zone Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedWarehouse.zones.map(zone => (
                  <div key={zone.id} className="glass-card p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="theme-text text-sm font-medium">{zone.name}</div>
                        <div className="theme-text-dim text-xs capitalize">{zone.zone_type.replace('_', ' ')}</div>
                      </div>
                      <StatusBadge status={zone.status} />
                    </div>
                    <div className="flex justify-between text-xs mb-1.5 mt-3">
                      <span className="theme-text-dim">{zone.current_units?.toLocaleString()} / {zone.capacity?.toLocaleString()}</span>
                      <span className="font-mono" style={{ color: zone.utilization > 90 ? '#ef4444' : zone.utilization > 75 ? '#fbbf24' : '#34d399' }}>{zone.utilization}%</span>
                    </div>
                    <ProgressBar value={zone.utilization} color={zone.utilization > 90 ? '#ef4444' : zone.utilization > 75 ? '#fbbf24' : '#10b981'} />
                    {zone.temperature_controlled && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1">❄ Temp controlled</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="theme-text font-semibold text-sm">All Inventory</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-dim" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU or product..." className="input-field pl-9 w-64" />
            </div>
          </div>
          <DataTable columns={inventoryColumns} data={filteredInventory} />
        </div>
      )}

      {activeTab === 'receiving' && (
        <div className="glass-card p-12 text-center">
          <Box size={48} className="theme-text-dim mx-auto mb-4" />
          <h3 className="theme-text font-semibold text-lg mb-2">Receiving Module</h3>
          <p className="theme-text-dim text-sm">Inbound receiving, PO verification, and putaway operations will be configured here.</p>
        </div>
      )}

      {activeTab === 'pick-pack' && (
        <div className="glass-card p-12 text-center">
          <Box size={48} className="theme-text-dim mx-auto mb-4" />
          <h3 className="theme-text font-semibold text-lg mb-2">Pick & Pack Module</h3>
          <p className="theme-text-dim text-sm">Wave planning, pick path optimization, and packing station management.</p>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Warehouse">
        <CreateWarehouseForm onSuccess={() => { setShowCreateModal(false); loadData(); }} />
      </Modal>
    </div>
  );
}

function CreateWarehouseForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', code: '', location_address: '', city: '', state: '', country: 'US', total_capacity: 10000 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.createWarehouse(form); onSuccess(); }
    catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block theme-text-muted text-xs mb-1.5">Warehouse Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <label className="block theme-text-muted text-xs mb-1.5">Code</label>
          <input className="input-field" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="BOS-DC" required />
        </div>
      </div>
      <div>
        <label className="block theme-text-muted text-xs mb-1.5">Address</label>
        <input className="input-field" value={form.location_address} onChange={e => setForm({...form, location_address: e.target.value})} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block theme-text-muted text-xs mb-1.5">City</label><input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required /></div>
        <div><label className="block theme-text-muted text-xs mb-1.5">State</label><input className="input-field" value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
        <div><label className="block theme-text-muted text-xs mb-1.5">Capacity</label><input className="input-field" type="number" value={form.total_capacity} onChange={e => setForm({...form, total_capacity: parseInt(e.target.value)})} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Warehouse'}</button>
      </div>
    </form>
  );
}
