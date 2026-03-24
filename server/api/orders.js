import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';

async function handler(req, res) {
  const { method } = req;
  const { id, status, priority, customer_id } = req.query || {};

  if (method === 'GET') {
    if (id) {
      const rows = await sql`SELECT o.*, row_to_json(c) as customer, row_to_json(w) as warehouse
        FROM orders o LEFT JOIN customers c ON o.customer_id=c.id LEFT JOIN warehouses w ON o.warehouse_id=w.id WHERE o.id=${id}`;
      if (!rows.length) return apiError(res, 404, 'Order not found');
      const items = await sql`SELECT oi.*, row_to_json(p) as product FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=${id}`;
      return apiSuccess(res, { ...rows[0], items });
    }
    let rows;
    if (status && status !== 'all') {
      rows = await sql`SELECT o.*, row_to_json(c) as customer FROM orders o LEFT JOIN customers c ON o.customer_id=c.id WHERE o.status=${status} ORDER BY o.ordered_at DESC`;
    } else {
      rows = await sql`SELECT o.*, row_to_json(c) as customer FROM orders o LEFT JOIN customers c ON o.customer_id=c.id ORDER BY o.ordered_at DESC`;
    }
    return apiSuccess(res, rows);
  }
  if (method === 'POST') {
    const b = await parseBody(req);
    const orderNum = b.order_number || `ORD-${Date.now().toString(36).toUpperCase()}`;
    const rows = await sql`INSERT INTO orders (order_number, customer_id, warehouse_id, status, priority, subtotal, tax, total)
      VALUES (${orderNum}, ${b.customer_id}, ${b.warehouse_id||null}, 'pending', ${b.priority||'medium'}, ${b.subtotal||0}, ${b.tax||0}, ${b.total||0})
      RETURNING *`;
    return apiSuccess(res, rows[0], 201);
  }
  if (method === 'PUT' && id) {
    const b = await parseBody(req);
    const fulfilledAt = b.status === 'delivered' ? new Date().toISOString() : null;
    const rows = await sql`UPDATE orders SET status=COALESCE(${b.status},status), priority=COALESCE(${b.priority},priority),
      fulfilled_at=COALESCE(${fulfilledAt}::timestamptz, fulfilled_at), updated_at=NOW() WHERE id=${id} RETURNING *`;
    return apiSuccess(res, rows[0]);
  }
  return apiError(res, 405, 'Method not allowed');
}
export default function(req, res) { return withAuth(req, res, handler); }
