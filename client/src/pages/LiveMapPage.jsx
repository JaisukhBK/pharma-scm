import { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertTriangle, Truck, MapPin, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge, KpiCard, Skeleton } from '../components/UIComponents';

export default function LiveMapPage() {
  const [data, setData] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => { loadData(); const interval = setInterval(loadData, 30000); return () => clearInterval(interval); }, []);

  async function loadData() {
    try {
      const result = await api.getTracking();
      setData(result);
      if (mapInstanceRef.current) updateMarkers(result.shipments);
    } catch (err) { console.error('Tracking error:', err); }
    finally { setLoading(false); }
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([39.8283, -98.5795], 4);

    // Add tile layer — using CartoDB for clean look
    const isDark = document.documentElement.classList.contains('light') ? false : true;
    L.tileLayer(isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;

    if (data?.shipments) updateMarkers(data.shipments);

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [loading]);

  function updateMarkers(shipments) {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    (shipments || []).forEach(s => {
      if (!s.current_lat || !s.current_lng) return;

      const color = s.status === 'delayed' ? '#ef4444' : s.status === 'in_transit' ? '#3b82f6' : s.status === 'pending' ? '#f59e0b' : '#10b981';

      // Truck marker
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([parseFloat(s.current_lat), parseFloat(s.current_lng)], { icon })
        .addTo(map)
        .on('click', () => setSelectedShipment(s));

      marker.bindTooltip(`${s.tracking_number} — ${s.status.replace('_', ' ')}`, { direction: 'top', offset: [0, -18] });
      markersRef.current.push(marker);

      // Draw route line (origin → current → destination)
      if (s.origin_lat && s.dest_lat) {
        const routeLine = L.polyline([
          [parseFloat(s.origin_lat), parseFloat(s.origin_lng || s.origin_lat)],
          [parseFloat(s.current_lat), parseFloat(s.current_lng)],
        ], { color, weight: 2, opacity: 0.6, dashArray: '8 4' }).addTo(map);
        markersRef.current.push(routeLine);

        const remainingLine = L.polyline([
          [parseFloat(s.current_lat), parseFloat(s.current_lng)],
          [parseFloat(s.dest_lat), parseFloat(s.dest_lng)],
        ], { color: '#94a3b8', weight: 1.5, opacity: 0.3, dashArray: '4 6' }).addTo(map);
        markersRef.current.push(remainingLine);
      }
    });
  }

  if (loading) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-96" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><Skeleton key={i} className="h-28" />)}</div></div>;

  const stats = data?.stats || {};

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-xl theme-text">Live Shipment Tracking</h2>
          <p className="theme-text-dim text-sm mt-1">Real-time GPS tracking across all active shipments</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-4 text-xs theme-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Transit</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Delayed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Delivered</span>
          </div>
          <button onClick={loadData} className="btn-ghost flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Active Shipments" value={stats.total || 0} icon={<Truck size={18} />} color="#3b82f6" />
        <KpiCard title="In Transit" value={stats.in_transit || 0} icon={<MapPin size={18} />} color="#8b5cf6" />
        <KpiCard title="Delayed" value={stats.delayed || 0} icon={<AlertTriangle size={18} />} color="#ef4444" />
        <KpiCard title="Auto-Refresh" value="30s" icon={<Clock size={18} />} color="#10b981" />
      </div>

      {/* Map + Detail Panel */}
      <div className="flex gap-4" style={{ height: '500px' }}>
        {/* Map */}
        <div className="flex-1 glass-card overflow-hidden rounded-2xl">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Side Panel */}
        <div className="w-80 flex-shrink-0 glass-card p-4 overflow-y-auto">
          <h3 className="theme-text font-semibold text-sm mb-3">
            {selectedShipment ? 'Shipment Detail' : 'All Shipments'}
          </h3>

          {selectedShipment ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedShipment(null)} className="text-blue-500 text-xs hover:text-blue-400">← Back to list</button>
              <div className="space-y-3">
                <div>
                  <div className="theme-text-dim text-xs">Tracking #</div>
                  <div className="theme-text font-mono font-medium">{selectedShipment.tracking_number}</div>
                </div>
                <StatusBadge status={selectedShipment.status} />
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="theme-text-dim text-xs">From</div><div className="theme-text text-sm">{selectedShipment.origin_city}, {selectedShipment.origin_state}</div></div>
                  <div><div className="theme-text-dim text-xs">To</div><div className="theme-text text-sm">{selectedShipment.destination_city}, {selectedShipment.destination_state}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="theme-text-dim text-xs">Carrier</div><div className="theme-text text-sm">{selectedShipment.carrier?.name || '—'}</div></div>
                  <div><div className="theme-text-dim text-xs">Weight</div><div className="theme-text text-sm font-mono">{selectedShipment.weight_kg ? `${Number(selectedShipment.weight_kg).toLocaleString()} kg` : '—'}</div></div>
                </div>
                <div>
                  <div className="theme-text-dim text-xs mb-1">Progress</div>
                  <div className="w-full rounded-full overflow-hidden h-2" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${selectedShipment.progress_pct}%`, background: selectedShipment.status === 'delayed' ? '#ef4444' : '#3b82f6' }} />
                  </div>
                  <div className="theme-text-muted text-xs mt-1 font-mono">{selectedShipment.progress_pct}%</div>
                </div>
                <div><div className="theme-text-dim text-xs">Cost</div><div className="theme-text font-mono">${parseFloat(selectedShipment.shipping_cost || 0).toLocaleString()}</div></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.shipments || []).map(s => (
                <button key={s.id} onClick={() => {
                  setSelectedShipment(s);
                  if (mapInstanceRef.current && s.current_lat) {
                    mapInstanceRef.current.flyTo([parseFloat(s.current_lat), parseFloat(s.current_lng)], 8, { duration: 1 });
                  }
                }}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-blue-600 text-xs font-medium">{s.tracking_number}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="theme-text-muted text-xs">{s.origin_city} → {s.destination_city}</div>
                  <div className="theme-text-dim text-xs mt-0.5">{s.carrier?.name || 'No carrier'}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
