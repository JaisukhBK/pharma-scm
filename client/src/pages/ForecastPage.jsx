import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, Package, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { api } from '../lib/api';
import { PageHeader, KpiCard, StatusBadge, Skeleton } from '../components/UIComponents';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForecast, setProductForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try { setForecasts(await api.getForecasts() || []); }
    catch (err) { console.error('Forecast error:', err); }
    finally { setLoading(false); }
  }

  async function loadProductDetail(product) {
    setSelectedProduct(product);
    try {
      const detail = await api.getProductForecast(product.product_id, 30);
      setProductForecast(detail || []);
    } catch (err) { console.error(err); }
  }

  if (loading) return <div className="space-y-4 animate-fade-in">{[1,2,3].map(i=><Skeleton key={i} className="h-40" />)}</div>;

  const atRisk = forecasts.filter(f => f.days_until_stockout !== null && f.days_until_stockout <= 7);
  const totalDemand30d = forecasts.reduce((s, f) => s + parseInt(f.total_predicted_30d || 0), 0);

  const tt = { contentStyle: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, fontSize:12, color:'var(--text-primary)' }, labelStyle:{color:'var(--text-muted)'} };

  // Chart data for daily forecast
  const dailyChartData = productForecast.map(f => ({
    date: new Date(f.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    demand: f.predicted_demand,
    lower: f.confidence_lower,
    upper: f.confidence_upper
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="AI Demand Forecasting" subtitle="30-day predictive demand analysis powered by AI"
        actions={<button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Products Tracked" value={forecasts.length} icon={<Package size={18} />} color="#3b82f6" />
        <KpiCard title="30-Day Total Demand" value={totalDemand30d.toLocaleString()} icon={<TrendingUp size={18} />} color="#8b5cf6" />
        <KpiCard title="At-Risk (< 7 days)" value={atRisk.length} icon={<AlertTriangle size={18} />} color="#ef4444" />
        <KpiCard title="Forecast Period" value="30 days" icon={<Clock size={18} />} color="#10b981" />
      </div>

      <div className="flex gap-4">
        {/* Product Forecast Table */}
        <div className="flex-1 glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">Demand Forecast by Product</h3>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="table-header">Product</th>
                <th className="table-header">30d Demand</th>
                <th className="table-header">Daily Avg</th>
                <th className="table-header">Current Stock</th>
                <th className="table-header">Days Left</th>
                <th className="table-header">Risk</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map(f => {
                const daysLeft = f.days_until_stockout;
                const risk = daysLeft === null ? 'ok' : daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'ok';
                return (
                  <tr key={f.product_id} className="table-row cursor-pointer"
                    onClick={() => loadProductDetail(f)}
                    style={selectedProduct?.product_id === f.product_id ? { background: 'rgba(59,130,246,0.06)' } : {}}>
                    <td className="py-3">
                      <div className="theme-text font-medium text-sm">{f.name}</div>
                      <div className="theme-text-dim text-xs font-mono">{f.sku}</div>
                    </td>
                    <td className="py-3 font-mono theme-text">{parseInt(f.total_predicted_30d).toLocaleString()}</td>
                    <td className="py-3 font-mono theme-text-muted">{f.avg_daily_demand}/day</td>
                    <td className="py-3 font-mono theme-text">{f.current_stock.toLocaleString()}</td>
                    <td className="py-3 font-mono" style={{ color: risk === 'critical' ? '#ef4444' : risk === 'warning' ? '#f59e0b' : '#10b981' }}>
                      {daysLeft !== null ? `${daysLeft} days` : '—'}
                    </td>
                    <td className="py-3">{risk !== 'ok' && <StatusBadge status={risk} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Demand Breakdown Bar Chart */}
        <div className="w-80 flex-shrink-0 glass-card p-5">
          <h3 className="theme-text font-semibold text-sm mb-4">30-Day Demand Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecasts.map(f => ({ name: f.sku, demand: parseInt(f.total_predicted_30d), stock: f.current_stock }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={65} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="demand" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Predicted Demand" />
              <Bar dataKey="stock" fill="#10b981" radius={[0, 4, 4, 0]} name="Current Stock" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Forecast Chart (when product selected) */}
      {selectedProduct && dailyChartData.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="theme-text font-semibold text-sm">{selectedProduct.name} — Daily Forecast</h3>
              <p className="theme-text-dim text-xs">{selectedProduct.sku} · Next 30 days · Confidence band shown</p>
            </div>
            <button onClick={() => setSelectedProduct(null)} className="text-blue-500 text-xs">Close</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#8b5cf6" fillOpacity={0.1} name="Upper Bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#8b5cf6" fillOpacity={0.05} name="Lower Bound" />
              <Line type="monotone" dataKey="demand" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2, fill: '#8b5cf6' }} name="Predicted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
