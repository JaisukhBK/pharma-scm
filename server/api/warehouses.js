import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query || {};

  if (method === 'GET') {
    if (id) {
      const rows = await sql`SELECT * FROM warehouses WHERE id = ${id}`;
      if (!rows.length) return apiError(res, 404, 'Warehouse not found');
      const zones = await sql`SELECT * FROM warehouse_zones WHERE warehouse_id = ${id}`;
      return apiSuccess(res, { ...rows[0], zones });
    }
    const data = await sql`SELECT * FROM warehouses ORDER BY name`;
    return apiSuccess(res, data);
  }
  if (method === 'POST') {
    const b = await parseBody(req);
    const rows = await sql`INSERT INTO warehouses (name, code, location_address, city, state, country, total_capacity)
      VALUES (${b.name}, ${b.code}, ${b.location_address}, ${b.city}, ${b.state || null}, ${b.country || 'US'}, ${b.total_capacity || 10000})
      RETURNING *`;
    return apiSuccess(res, rows[0], 201);
  }
  if (method === 'PUT' && id) {
    const b = await parseBody(req);
    const rows = await sql`UPDATE warehouses SET name=COALESCE(${b.name},name), status=COALESCE(${b.status},status),
      current_utilization=COALESCE(${b.current_utilization},current_utilization), updated_at=NOW() WHERE id=${id} RETURNING *`;
    return apiSuccess(res, rows[0]);
  }
  if (method === 'DELETE' && id) {
    await sql`DELETE FROM warehouses WHERE id = ${id}`;
    return apiSuccess(res, { deleted: true });
  }
  return apiError(res, 405, 'Method not allowed');
}
export default function(req, res) { return withAuth(req, res, handler); }
