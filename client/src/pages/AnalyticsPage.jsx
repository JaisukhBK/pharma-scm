import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../lib/api';
import { PageHeader, Skeleton } from '../components/UIComponents';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); try { setData(await api.getAnalytics({ months: 6 })); } catch(err){console.error(err);} finally{setLoading(false);} }

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i=><Skeleton key={i} className="h-64" />)}</div>;

  const revenueTrend = (data?.trends||[]).filter(t=>t.metric_name==='monthly_revenue').map(t=>({ month: new Date(t.snapshot_date).toLocaleDateString('en-US',{month:'short'}), revenue: t.metric_value/1000 }));
  const orderTrend = (data?.trends||[]).filter(t=>t.metric_name==='monthly_orders').map(t=>({ month: new Date(t.snapshot_date).toLocaleDateString('en-US',{month:'short'}), orders: t.metric_value }));
  const onTimeTrend = (data?.trends||[]).filter(t=>t.metric_name==='on_time_rate').map(t=>({ month: new Date(t.snapshot_date).toLocaleDateString('en-US',{month:'short'}), rate: t.metric_value }));
  const orderBreakdown = Object.entries(data?.order_breakdown||{}).map(([status,count])=>({ name: status.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase()), value: count }));
  const topCustomers = (data?.top_customers||[]).slice(0,5).map(c=>({ name: c.name||'Unknown', revenue: parseFloat(c.total_revenue)/1000, orders: c.total_orders }));

  const tt = { contentStyle:{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, fontSize:12, color:'var(--text-primary)' }, labelStyle:{color:'var(--text-muted)'} };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analytics & Insights" subtitle="Cross-module performance metrics and trend analysis"
        actions={<button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>} />

      <div className="grid grid-cols-3 gap-4">
        {[{ label:'Total Revenue (6mo)', val: data?.total_revenue ? `$${(data.total_revenue/1000).toFixed(0)}K` : '$0' },
          { label:'Avg Order Value', val: `$${parseFloat(data?.avg_order_value||0).toLocaleString()}` },
          { label:'Total Orders', val: Object.values(data?.order_breakdown||{}).reduce((s,v)=>s+v,0) }
        ].map(s=>(
          <div key={s.label} className="glass-card p-5">
            <div className="theme-text-dim text-xs uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-3xl font-bold font-mono theme-text">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">Monthly Revenue ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={{r:4,fill:'#8b5cf6'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={orderBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {orderBreakdown.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip {...tt} />
              <Legend iconSize={8} wrapperStyle={{fontSize:11,color:'var(--text-muted)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">On-Time Delivery (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={onTimeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis domain={[85,100]} tick={{fill:'var(--text-muted)',fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{r:4,fill:'#10b981'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">Top Customers</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} width={80} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
