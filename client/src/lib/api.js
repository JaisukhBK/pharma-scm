const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('sf_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401) { localStorage.removeItem('sf_token'); localStorage.removeItem('sf_user'); window.location.reload(); }
    throw new Error(json.error || `API error: ${res.status}`);
  }
  return json.data;
}

export const api = {
  // Dashboard
  getDashboardKpis: () => request('/dashboard'),

  // Warehouses
  getWarehouses: () => request('/warehouses'),
  getWarehouse: (id) => request(`/warehouses?id=${id}`),
  createWarehouse: (data) => request('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  updateWarehouse: (id, data) => request(`/warehouses?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWarehouse: (id) => request(`/warehouses?id=${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/inventory${qs ? `?${qs}` : ''}`); },
  updateInventory: (id, data) => request(`/inventory?id=${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Shipments
  getShipments: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/shipments${qs ? `?${qs}` : ''}`); },
  getShipment: (id) => request(`/shipments?id=${id}`),
  createShipment: (data) => request('/shipments', { method: 'POST', body: JSON.stringify(data) }),
  updateShipment: (id, data) => request(`/shipments?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Orders
  getOrders: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/orders${qs ? `?${qs}` : ''}`); },
  getOrder: (id) => request(`/orders?id=${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id, data) => request(`/orders?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Carriers
  getCarriers: () => request('/carriers'),

  // Analytics
  getAnalytics: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/analytics${qs ? `?${qs}` : ''}`); },

  // AI Chat
  aiChat: (module, messages, conversationId) => request('/ai-chat', { method: 'POST', body: JSON.stringify({ module, messages, conversation_id: conversationId }) }),

  // ─── Phase 1 New Endpoints ─────────────────────

  // Forecast
  getForecasts: (params = {}) => { const qs = new URLSearchParams(params).toString(); return request(`/forecast${qs ? `?${qs}` : ''}`); },
  getProductForecast: (productId, days = 30) => request(`/forecast?product_id=${productId}&days=${days}`),

  // Reorders
  getReorders: (status = 'all') => request(`/reorders?status=${status}`),
  createReorder: (data) => request('/reorders', { method: 'POST', body: JSON.stringify(data) }),
  updateReorder: (id, data) => request(`/reorders?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Live Tracking
  getTracking: () => request('/tracking'),
};
