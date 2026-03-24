import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') return apiError(res, 405, 'Method not allowed');
  try {
    const [inv, ship, ord, wh, alerts] = await Promise.all([
      sql`SELECT COALESCE(SUM(quantity_on_hand),0) as total FROM inventory`,
      sql`SELECT COUNT(*) as cnt FROM shipments WHERE status IN ('in_transit','picked_up','out_for_delivery')`,
      sql`SELECT status, COUNT(*) as cnt, COALESCE(SUM(total),0) as rev FROM orders GROUP BY status`,
      sql`SELECT status, current_utilization FROM warehouses`,
      sql`SELECT COUNT(*) as cnt FROM inventory WHERE quantity_on_hand <= reorder_point AND reorder_point > 0`
    ]);

    const orderRows = ord || [];
    const pending = orderRows.filter(o => ['pending','confirmed','processing'].includes(o.status)).reduce((s,o) => s + parseInt(o.cnt), 0);
    const delivered = orderRows.find(o => o.status === 'delivered');
    const totalOrders = orderRows.reduce((s,o) => s + parseInt(o.cnt), 0);
    const rate = totalOrders > 0 ? ((parseInt(delivered?.cnt || 0) / totalOrders) * 100).toFixed(1) : 0;
    const warehouses = wh || [];
    const avgUtil = warehouses.length > 0 ? (warehouses.reduce((s,w) => s + parseFloat(w.current_utilization || 0), 0) / warehouses.length).toFixed(1) : 0;

    return apiSuccess(res, {
      total_inventory: parseInt(inv[0]?.total || 0),
      active_shipments: parseInt(ship[0]?.cnt || 0),
      pending_orders: pending,
      fulfillment_rate: parseFloat(rate),
      avg_utilization: parseFloat(avgUtil),
      low_stock_alerts: parseInt(alerts[0]?.cnt || 0),
      warehouses_operational: warehouses.filter(w => w.status === 'operational').length,
      total_warehouses: warehouses.length
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return apiError(res, 500, 'Failed to fetch KPIs');
  }
}
export default function(req, res) { return withAuth(req, res, handler); }
