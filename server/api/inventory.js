import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';

async function handler(req, res) {
  const { method } = req;
  const { id, warehouse_id, product_id } = req.query || {};

  if (method === 'GET') {
    let rows;
    if (warehouse_id) {
      rows = await sql`SELECT i.*, row_to_json(p) as product, row_to_json(w) as warehouse
        FROM inventory i JOIN products p ON i.product_id=p.id JOIN warehouses w ON i.warehouse_id=w.id
        WHERE i.warehouse_id = ${warehouse_id} ORDER BY i.updated_at DESC`;
    } else {
      rows = await sql`SELECT i.*, row_to_json(p) as product, row_to_json(w) as warehouse
        FROM inventory i JOIN products p ON i.product_id=p.id JOIN warehouses w ON i.warehouse_id=w.id
        ORDER BY i.updated_at DESC`;
    }
    const withAlerts = rows.map(item => ({
      ...item,
      alert: item.quantity_on_hand <= item.reorder_point && item.reorder_point > 0
        ? (item.quantity_on_hand <= item.reorder_point * 0.25 ? 'critical' : 'warning') : null
    }));
    return apiSuccess(res, withAlerts);
  }
  if (method === 'PATCH' && id) {
    const b = await parseBody(req);
    const rows = await sql`UPDATE inventory SET quantity_on_hand=COALESCE(${b.quantity_on_hand},quantity_on_hand),
      quantity_reserved=COALESCE(${b.quantity_reserved},quantity_reserved), updated_at=NOW() WHERE id=${id} RETURNING *`;
    return apiSuccess(res, rows[0]);
  }
  return apiError(res, 405, 'Method not allowed');
}
export default function(req, res) { return withAuth(req, res, handler); }
