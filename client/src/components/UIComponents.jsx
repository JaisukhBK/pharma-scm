import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── STATUS BADGE ───────────────────────────────
const STATUS_STYLES = {
  operational: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  maintenance: { bg: 'bg-amber-500/15', text: 'text-amber-600', dot: 'bg-amber-500' },
  alert: { bg: 'bg-red-500/15', text: 'text-red-600', dot: 'bg-red-500' },
  inactive: { bg: 'bg-gray-500/15', text: 'text-gray-500', dot: 'bg-gray-400' },
  in_transit: { bg: 'bg-blue-500/15', text: 'text-blue-600', dot: 'bg-blue-500' },
  picked_up: { bg: 'bg-blue-500/15', text: 'text-blue-600', dot: 'bg-blue-500' },
  out_for_delivery: { bg: 'bg-purple-500/15', text: 'text-purple-600', dot: 'bg-purple-500' },
  delivered: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-600', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-500/15', text: 'text-blue-600', dot: 'bg-blue-500' },
  processing: { bg: 'bg-blue-500/15', text: 'text-blue-600', dot: 'bg-blue-500' },
  picking: { bg: 'bg-purple-500/15', text: 'text-purple-600', dot: 'bg-purple-500' },
  packing: { bg: 'bg-purple-500/15', text: 'text-purple-600', dot: 'bg-purple-500' },
  shipped: { bg: 'bg-violet-500/15', text: 'text-violet-600', dot: 'bg-violet-500' },
  delayed: { bg: 'bg-red-500/15', text: 'text-red-600', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-500', dot: 'bg-gray-400' },
  returned: { bg: 'bg-orange-500/15', text: 'text-orange-600', dot: 'bg-orange-500' },
  fulfilled: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-600', dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-500/15', text: 'text-amber-600', dot: 'bg-amber-500' },
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  full: { bg: 'bg-red-500/15', text: 'text-red-600', dot: 'bg-red-500' },
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`status-badge ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

// ─── KPI CARD ───────────────────────────────────
export function KpiCard({ title, value, change, positive, icon, color = '#3b82f6' }) {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold font-mono theme-text">{value}</div>
      <div className="text-xs uppercase tracking-wider mt-1 theme-text-dim">{title}</div>
    </div>
  );
}

// ─── PROGRESS BAR ───────────────────────────────
export function ProgressBar({ value, color = '#60a5fa', height = 6, showLabel = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, backgroundColor: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      {showLabel && <span className="text-xs font-mono theme-text-muted w-10 text-right">{value}%</span>}
    </div>
  );
}

// ─── DATA TABLE ─────────────────────────────────
export function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  if (!data?.length) {
    return <div className="text-center py-12 theme-text-dim text-sm">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} className="table-header" style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
              {columns.map(col => (
                <td key={col.key} className="py-3.5">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── LOADING SKELETON ───────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'var(--border)' }} />;
}

// ─── PAGE HEADER ────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="font-bold text-xl theme-text">{title}</h2>
        {subtitle && <p className="theme-text-dim text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="theme-text-dim mb-4">{icon}</div>}
      <h3 className="theme-text font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="theme-text-dim text-sm mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

// ─── MODAL ──────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative ${widths[size]} w-full glass-card p-6 animate-fade-in`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="theme-text font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="theme-text-dim hover:theme-text transition-colors text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
