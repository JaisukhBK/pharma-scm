import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') return apiError(res, 405, 'Method not allowed');
  const months = parseInt(req.query?.months) || 6;
  try {
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - months);
    const since = sinceDate.toISOString().split('T')[0];

    const [snapshots, orderBreak, topCustomers] = await Promise.all([
      sql`SELECT * FROM analytics_snapshots WHERE snapshot_date >= ${since}::date ORDER BY snapshot_date`,
      sql`SELECT status, COUNT(*) as cnt, COALESCE(SUM(total),0) as rev FROM orders GROUP BY status`,
      sql`SELECT name, tier, total_orders, total_revenue FROM customers ORDER BY total_revenue DESC LIMIT 10`
    ]);

    const orderBreakdown = {};
    (orderBreak || []).forEach(o => { orderBreakdown[o.status] = parseInt(o.cnt); });
    const totalRevenue = (orderBreak || []).reduce((s, o) => s + parseFloat(o.rev), 0);
    const totalOrders = (orderBreak || []).reduce((s, o) => s + parseInt(o.cnt), 0);

    return apiSuccess(res, {
      trends: snapshots,
      order_breakdown: orderBreakdown,
      top_customers: topCustomers,
      total_revenue: totalRevenue,
      avg_order_value: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return apiError(res, 500, 'Failed to fetch analytics');
  }
}
export default function(req, res) { return withAuth(req, res, handler); }
