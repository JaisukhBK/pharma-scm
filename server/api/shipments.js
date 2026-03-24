import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError, parseBody } from '../lib/middleware.js';

async function handler(req, res) {
  const { method } = req;
  const { id, status, carrier_id } = req.query || {};

  if (method === 'GET') {
    if (id) {
      const rows = await sql`SELECT s.*, row_to_json(c) as carrier FROM shipments s LEFT JOIN carriers c ON s.carrier_id=c.id WHERE s.id=${id}`;
      if (!rows.length) return apiError(res, 404, 'Shipment not found');
      const events = await sql`SELECT * FROM shipment_events WHERE shipment_id=${id} ORDER BY occurred_at DESC`;
      return apiSuccess(res, { ...rows[0], events });
    }
    let rows;
    if (status && status !== 'all') {
      rows = await sql`SELECT s.*, row_to_json(c) as carrier FROM shipments s LEFT JOIN carriers c ON s.carrier_id=c.id WHERE s.status=${status} ORDER BY s.created_at DESC`;
    } else {
      rows = await sql`SELECT s.*, row_to_json(c) as carrier FROM shipments s LEFT JOIN carriers c ON s.carrier_id=c.id ORDER BY s.created_at DESC`;
    }
    return apiSuccess(res, rows);
  }
  if (method === 'POST') {
    const b = await parseBody(req);
    const trackNum = b.tracking_number || `SF-TRK-${Date.now().toString(36).toUpperCase()}`;
    const rows = await sql`INSERT INTO shipments (tracking_number, carrier_id, origin_address, origin_city, origin_state, destination_address, destination_city, destination_state, weight_kg, mode, created_by)
      VALUES (${trackNum}, ${b.carrier_id||null}, ${b.origin_address}, ${b.origin_city}, ${b.origin_state||null}, ${b.destination_address}, ${b.destination_city}, ${b.destination_state||null}, ${b.weight_kg||null}, ${b.mode||'ground'}, ${req.user.id})
      RETURNING *`;
    return apiSuccess(res, rows[0], 201);
  }
  if (method === 'PUT' && id) {
    const b = await parseBody(req);
    if (b.status) {
      await sql`INSERT INTO shipment_events (shipment_id, event_type, description) VALUES (${id}, ${'status_'+b.status}, ${'Status changed to '+b.status})`;
    }
    const rows = await sql`UPDATE shipments SET status=COALESCE(${b.status},status), progress_pct=COALESCE(${b.progress_pct},progress_pct), updated_at=NOW() WHERE id=${id} RETURNING *`;
    return apiSuccess(res, rows[0]);
  }
  return apiError(res, 405, 'Method not allowed');
}
export default function(req, res) { return withAuth(req, res, handler); }
