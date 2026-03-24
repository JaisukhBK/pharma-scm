import { useState, useEffect } from 'react';
import { Package, Truck, ShoppingCart, CheckCircle, AlertTriangle, Warehouse } from 'lucide-react';
import { api } from '../lib/api';
import { KpiCard, StatusBadge, ProgressBar, DataTable, Skeleton } from '../components/UIComponents';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [kpiData, shipData, invData] = await Promise.all([
        api.getDashboardKpis(), api.getShipments({ status: 'in_transit' }), api.getInventory({ low_stock: 'true' })
      ]);
      setKpis(kpiData);
      setShipments(shipData?.slice(0, 6) || []);
      setInventory(invData?.filter(i => i.alert) || []);
    } catch (err) { console.error('Dashboard load error:', err); }
    finally { setLoading(false); }
  }

  if (loading) {
    return <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-64" /></div>;
  }

  const shipmentColumns = [
    { key: 'tracking_number', label: 'Tracking #', render: (v) => <span className="font-mono text-blue-600">{v}</span> },
    { key: 'route', label: 'Route', render: (_, row) => <span className="theme-text-secondary">{row.origin_city} → {row.destination_city}</span> },
    { key: 'carrier', label: 'Carrier', render: (_, row) => <span className="theme-text-muted">{row.carrier?.name || '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'progress_pct', label: 'Progress', width: '120px', render: (v, row) => <ProgressBar value={v} color={row.status === 'delayed' ? '#ef4444' : '#60a5fa'} showLabel /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Inventory" value={kpis?.total_inventory?.toLocaleString() || '0'} change="12.3%" positive icon={<Package size={18} />} color="#3b82f6" />
        <KpiCard title="Active Shipments" value={kpis?.active_shipments || '0'} change="8.7%" positive icon={<Truck size={18} />} color="#8b5cf6" />
        <KpiCard title="Pending Orders" value={kpis?.pending_orders || '0'} change="3.2%" positive={false} icon={<ShoppingCart size={18} />} color="#f59e0b" />
        <KpiCard title="Fulfillment Rate" value={`${kpis?.fulfillment_rate || 0}%`} change="2.1%" positive icon={<CheckCircle size={18} />} color="#10b981" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="theme-text font-semibold text-sm">Active Shipments</h3>
            <span className="theme-text-dim text-xs">{shipments.length} in transit</span>
          </div>
          <DataTable columns={shipmentColumns} data={shipments} emptyMessage="No active shipments" />
        </div>

        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="theme-text font-semibold text-sm">Inventory Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 font-medium">{inventory.length}</span>
          </div>
          <div className="space-y-3">
            {inventory.length === 0 ? (
              <p className="theme-text-dim text-sm text-center py-8">All inventory levels healthy</p>
            ) : inventory.slice(0, 5).map((item, i) => (
              <div key={i} className="glass-card-hover p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="theme-text text-xs font-medium truncate flex-1">{item.product?.name || item.product_id}</span>
                  <StatusBadge status={item.alert} />
                </div>
                <div className="flex items-center justify-between text-xs theme-text-dim">
                  <span>{item.product?.sku}</span>
                  <span className="font-mono">{item.quantity_on_hand}/{item.reorder_point}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-3">Warehouse Health</h3>
          <div className="flex items-center gap-4">
            <Warehouse size={32} className="text-blue-500" />
            <div>
              <div className="text-2xl font-bold font-mono theme-text">{kpis?.warehouses_operational}/{kpis?.total_warehouses}</div>
              <div className="text-xs theme-text-dim">Operational warehouses</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-3">Stock Alerts</h3>
          <div className="flex items-center gap-4">
            <AlertTriangle size={32} className="text-amber-500" />
            <div>
              <div className="text-2xl font-bold font-mono theme-text">{kpis?.low_stock_alerts || 0}</div>
              <div className="text-xs theme-text-dim">Items below reorder point</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
