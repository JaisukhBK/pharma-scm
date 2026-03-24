import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge, PageHeader, DataTable, Modal, Skeleton } from '../components/UIComponents';

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/15 text-red-600',
  high: 'bg-orange-500/15 text-orange-600',
  medium: 'bg-amber-500/15 text-amber-600',
  low: 'bg-gray-500/15 text-gray-500',
};

export default function OMSPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); try { setOrders(await api.getOrders() || []); } catch(err){console.error(err);} finally{setLoading(false);} }

  async function viewOrder(order) {
    try { setSelectedOrder(await api.getOrder(order.id)); setShowDetail(true); } catch(err){console.error(err);}
  }

  async function updateOrderStatus(id, status) {
    try { await api.updateOrder(id, { status }); loadData(); if(selectedOrder?.id===id) setSelectedOrder(prev=>({...prev,status})); } catch(err){alert(err.message);}
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) { const s = search.toLowerCase(); return o.order_number?.toLowerCase().includes(s) || o.customer?.name?.toLowerCase().includes(s) || o.customer?.company?.toLowerCase().includes(s); }
    return true;
  });

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  const columns = [
    { key: 'order_number', label: 'Order #', render: (v) => <span className="font-mono text-blue-600 font-medium">{v}</span> },
    { key: 'customer', label: 'Customer', render: (_, r) => (<div><div className="theme-text font-medium text-sm">{r.customer?.company || r.customer?.name}</div><div className="theme-text-dim text-xs">{r.customer?.name}</div></div>) },
    { key: 'total', label: 'Total', render: (v) => <span className="font-mono theme-text font-medium">${parseFloat(v).toLocaleString()}</span> },
    { key: 'priority', label: 'Priority', render: (v) => <span className={`status-badge capitalize ${PRIORITY_STYLES[v] || ''}`}>{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'ordered_at', label: 'Date', render: (v) => <span className="theme-text-muted">{new Date(v).toLocaleDateString()}</span> },
    { key: 'actions', label: '', render: (_, r) => <button onClick={(e)=>{e.stopPropagation();viewOrder(r);}} className="text-blue-500 hover:text-blue-400"><Eye size={16} /></button> },
  ];

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i=><Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Order Management System" subtitle="Order lifecycle, fulfillment tracking & customer management"
        actions={<><button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button><button className="btn-primary flex items-center gap-2"><Plus size={14} /> New Order</button></>} />

      <div className="grid grid-cols-5 gap-3">
        {[{ label:'All Orders', key:'all', count:orders.length }, { label:'Processing', key:'processing', count:statusCounts.processing||0 }, { label:'Shipped', key:'shipped', count:statusCounts.shipped||0 }, { label:'Delivered', key:'delivered', count:statusCounts.delivered||0 }, { label:'Pending', key:'pending', count:statusCounts.pending||0 }].map(tab => (
          <button key={tab.key} onClick={()=>setStatusFilter(tab.key)}
            className={`rounded-xl p-4 text-left transition-all border ${statusFilter===tab.key ? 'bg-blue-500/[0.06] border-blue-500/25' : ''}`}
            style={statusFilter!==tab.key ? { background:'var(--bg-card)', borderColor:'var(--border)' } : {}}>
            <div className="text-2xl font-bold font-mono theme-text">{tab.count}</div>
            <div className="text-xs theme-text-dim mt-0.5">{tab.label}</div>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-dim" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders, customers..." className="input-field pl-9" />
      </div>

      <div className="glass-card p-5"><DataTable columns={columns} data={filtered} onRowClick={viewOrder} emptyMessage="No orders found" /></div>

      <Modal isOpen={showDetail} onClose={()=>setShowDetail(false)} title={`Order ${selectedOrder?.order_number}`} size="lg">
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4"><div className="theme-text-dim text-xs mb-1">Customer</div><div className="theme-text font-medium">{selectedOrder.customer?.company}</div><div className="theme-text-muted text-xs">{selectedOrder.customer?.name}</div></div>
              <div className="glass-card p-4"><div className="theme-text-dim text-xs mb-1">Total</div><div className="theme-text font-bold font-mono text-lg">${parseFloat(selectedOrder.total).toLocaleString()}</div></div>
              <div className="glass-card p-4"><div className="theme-text-dim text-xs mb-1">Status</div><div className="mt-1"><StatusBadge status={selectedOrder.status} /></div></div>
            </div>
            {selectedOrder.items?.length > 0 && (
              <div>
                <h4 className="theme-text text-sm font-semibold mb-3">Line Items</h4>
                <table className="w-full text-sm">
                  <thead><tr style={{borderBottom:'1px solid var(--border)'}}><th className="table-header">Product</th><th className="table-header">SKU</th><th className="table-header">Qty</th><th className="table-header">Unit Price</th><th className="table-header">Total</th></tr></thead>
                  <tbody>{selectedOrder.items.map(item=>(
                    <tr key={item.id} className="table-row"><td className="py-2.5 theme-text">{item.product?.name}</td><td className="py-2.5 font-mono theme-text-muted">{item.product?.sku}</td><td className="py-2.5 font-mono theme-text">{item.quantity}</td><td className="py-2.5 font-mono theme-text-muted">${parseFloat(item.unit_price).toFixed(2)}</td><td className="py-2.5 font-mono theme-text font-medium">${parseFloat(item.total_price).toLocaleString()}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <div>
              <h4 className="theme-text text-sm font-semibold mb-3">Update Status</h4>
              <div className="flex gap-2 flex-wrap">
                {['confirmed','processing','picking','packing','shipped','delivered'].map(status=>(
                  <button key={status} onClick={()=>updateOrderStatus(selectedOrder.id,status)} disabled={selectedOrder.status===status}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${selectedOrder.status===status ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' : 'theme-text-muted border'}`}
                    style={selectedOrder.status!==status ? { borderColor:'var(--border)', background:'var(--bg-secondary)' } : {}}>
                    {status.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
