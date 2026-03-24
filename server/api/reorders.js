import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';

async function handler(req, res) {
  const { method } = req;
  const { id, status } = req.query || {};

  // GET — list reorder requests
  if (method === 'GET') {
    let rows;
    if (status && status !== 'all') {
      rows = await sql`
        SELECT r.*, row_to_json(p) as product, row_to_json(w) as warehouse
        FROM reorder_requests r
        JOIN products p ON r.product_id = p.id
        JOIN warehouses w ON r.warehouse_id = w.id
        WHERE r.status = ${status}
        ORDER BY r.created_at DESC`;
    } else {
      rows = await sql`
        SELECT r.*, row_to_json(p) as product, row_to_json(w) as warehouse
        FROM reorder_requests r
        JOIN products p ON r.product_id = p.id
        JOIN warehouses w ON r.warehouse_id = w.id
        ORDER BY
          CASE r.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
          r.created_at DESC`;
    }
    return apiSuccess(res, rows);
  }

  // POST — create new reorder request (can be AI-triggered)
  if (method === 'POST') {
    const b = await parseBody(req);
    const rows = await sql`
      INSERT INTO reorder_requests (product_id, warehouse_id, current_stock, reorder_point, suggested_quantity, estimated_cost, priority, ai_reasoning, requested_by)
      VALUES (${b.product_id}, ${b.warehouse_id}, ${b.current_stock}, ${b.reorder_point}, ${b.suggested_quantity}, ${b.estimated_cost || null}, ${b.priority || 'medium'}, ${b.ai_reasoning || null}, ${req.user.id})
      RETURNING *`;
    return apiSuccess(res, rows[0], 201);
  }

  // PUT — approve/reject/update status
  if (method === 'PUT' && id) {
    const b = await parseBody(req);
    const rows = await sql`
      UPDATE reorder_requests
      SET status = COALESCE(${b.status}, status),
          approved_by = CASE WHEN ${b.status} = 'approved' THEN ${req.user.id}::uuid ELSE approved_by END,
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *`;

    // If approved, update inventory reorder quantity
    if (b.status === 'approved' && rows[0]) {
      const r = rows[0];
      await sql`UPDATE inventory SET reorder_quantity = ${r.suggested_quantity}, updated_at = NOW()
        WHERE product_id = ${r.product_id} AND warehouse_id = ${r.warehouse_id}`;
    }

    return apiSuccess(res, rows[0]);
  }

  return apiError(res, 405, 'Method not allowed');
}
export default function(req, res) { return withAuth(req, res, handler); }
