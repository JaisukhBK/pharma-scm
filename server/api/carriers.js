import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') return apiError(res, 405, 'Method not allowed');
  const data = await sql`SELECT * FROM carriers WHERE is_active = true ORDER BY rating DESC`;
  return apiSuccess(res, data);
}
export default function(req, res) { return withAuth(req, res, handler); }
