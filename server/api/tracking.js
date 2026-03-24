import { sql } from '../lib/db.js';
import { withAuth, apiSuccess, apiError } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') return apiError(res, 405, 'Method not allowed');

  try {
    // Get all shipments with coordinates for map display
    const shipments = await sql`
      SELECT
        s.id, s.tracking_number, s.status, s.progress_pct,
        s.origin_city, s.origin_state, s.destination_city, s.destination_state,
        s.current_lat, s.current_lng, s.shipping_cost, s.weight_kg,
        s.estimated_delivery,
        row_to_json(c) as carrier,
        ow.lat as origin_lat, ow.lng as origin_lng
      FROM shipments s
      LEFT JOIN carriers c ON s.carrier_id = c.id
      LEFT JOIN warehouses ow ON s.origin_warehouse_id = ow.id
      WHERE s.status IN ('in_transit', 'picked_up', 'out_for_delivery', 'delayed', 'pending')
      ORDER BY
        CASE s.status WHEN 'delayed' THEN 1 WHEN 'in_transit' THEN 2 WHEN 'out_for_delivery' THEN 3 ELSE 4 END`;

    // Destination coordinates (hardcoded for demo, would come from geocoding in prod)
    const destCoords = {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Detroit': { lat: 42.3314, lng: -83.0458 },
      'Phoenix': { lat: 33.4484, lng: -112.0740 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
      'Atlanta': { lat: 33.7490, lng: -84.3880 },
      'Portland': { lat: 45.5155, lng: -122.6789 },
      'San Francisco': { lat: 37.7749, lng: -122.4194 },
    };

    const enriched = (shipments || []).map(s => ({
      ...s,
      dest_lat: destCoords[s.destination_city]?.lat || null,
      dest_lng: destCoords[s.destination_city]?.lng || null,
    }));

    // Summary stats
    const total = enriched.length;
    const delayed = enriched.filter(s => s.status === 'delayed').length;
    const inTransit = enriched.filter(s => s.status === 'in_transit').length;

    return apiSuccess(res, { shipments: enriched, stats: { total, delayed, in_transit: inTransit } });
  } catch (err) {
    console.error('Tracking error:', err);
    return apiError(res, 500, 'Failed to fetch tracking data');
  }
}
export default function(req, res) { return withAuth(req, res, handler); }
