import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') return apiError(res, 405, 'Method not allowed');
  const { product_id } = req.query || {};

  try {
    let forecasts;
    if (product_id) {
      // Daily forecast for a specific product
      forecasts = await sql`
        SELECT f.*, row_to_json(p) as product
        FROM demand_forecasts f
        JOIN products p ON f.product_id = p.id
        WHERE f.product_id = ${product_id}
          AND f.forecast_date >= CURRENT_DATE
        ORDER BY f.forecast_date
        LIMIT 30`;
    } else {
      // Aggregate forecast per product
      forecasts = await sql`
        SELECT
          p.id as product_id, p.sku, p.name, p.category,
          SUM(f.predicted_demand)::int as total_predicted_30d,
          (AVG(f.predicted_demand))::int as avg_daily_demand,
          MIN(f.confidence_lower)::int as min_lower,
          MAX(f.confidence_upper)::int as max_upper,
          COUNT(f.id)::int as forecast_days
        FROM demand_forecasts f
        JOIN products p ON f.product_id = p.id
        WHERE f.forecast_date >= CURRENT_DATE
        GROUP BY p.id, p.sku, p.name, p.category
        ORDER BY SUM(f.predicted_demand) DESC`;
    }

    // Get current inventory for comparison
    const inventory = await sql`
      SELECT product_id, SUM(quantity_on_hand)::int as total_stock, SUM(reorder_point)::int as total_reorder_point
      FROM inventory GROUP BY product_id`;

    const invMap = {};
    (inventory || []).forEach(i => { invMap[i.product_id] = i; });

    const enriched = (forecasts || []).map(f => {
      const stock = parseInt(invMap[f.product_id]?.total_stock || 0);
      const avgDemand = parseInt(f.avg_daily_demand || 0);
      return {
        ...f,
        current_stock: stock,
        reorder_point: parseInt(invMap[f.product_id]?.total_reorder_point || 0),
        days_until_stockout: avgDemand > 0 ? Math.floor(stock / avgDemand) : null
      };
    });

    return apiSuccess(res, enriched);
  } catch (err) {
    console.error('Forecast error:', err);
    return apiError(res, 500, 'Failed to fetch forecasts');
  }
}
export default function(req, res) { return withAuth(req, res, handler); }
