-- =============================================
-- Phase 1 Migration — Run in Neon SQL Editor
-- Adds: forecasts, reorder requests, shipment coordinates
-- =============================================

-- Shipment live tracking coordinates
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,6);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_lng DECIMAL(10,6);

-- Update existing shipments with simulated GPS coordinates
UPDATE shipments SET current_lat = 41.2033, current_lng = -73.2010 WHERE tracking_number = 'SF-TRK-10234'; -- Boston→NY, mid-route
UPDATE shipments SET current_lat = 41.8781, current_lng = -87.6298 WHERE tracking_number = 'SF-TRK-10235'; -- Delivered Chicago
UPDATE shipments SET current_lat = 33.4484, current_lng = -112.0740 WHERE tracking_number = 'SF-TRK-10236'; -- LA→Phoenix, near Phoenix
UPDATE shipments SET current_lat = 32.7767, current_lng = -96.7970 WHERE tracking_number = 'SF-TRK-10237'; -- Pending Dallas
UPDATE shipments SET current_lat = 30.3322, current_lng = -81.6557 WHERE tracking_number = 'SF-TRK-10238'; -- Miami→Atlanta, Jacksonville
UPDATE shipments SET current_lat = 45.9431, current_lng = -122.7765 WHERE tracking_number = 'SF-TRK-10239'; -- Seattle→Portland, near Portland

-- Demand forecasts table
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  forecast_date DATE NOT NULL,
  predicted_demand INTEGER NOT NULL,
  confidence_lower INTEGER,
  confidence_upper INTEGER,
  method TEXT DEFAULT 'ai_forecast',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecasts_product ON demand_forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON demand_forecasts(forecast_date);

-- Reorder requests table
CREATE TABLE IF NOT EXISTS reorder_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  current_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  suggested_quantity INTEGER NOT NULL,
  estimated_cost DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','ordered','received')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  ai_reasoning TEXT,
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reorder_status ON reorder_requests(status);

-- Seed forecast data (next 30 days for top products)
INSERT INTO demand_forecasts (product_id, warehouse_id, forecast_date, predicted_demand, confidence_lower, confidence_upper)
SELECT
  p.id,
  'a1000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + (d || ' days')::interval)::date,
  GREATEST(5, floor(random() * 80 + 20)::int),
  GREATEST(2, floor(random() * 60 + 10)::int),
  floor(random() * 100 + 40)::int
FROM products p
CROSS JOIN generate_series(1, 30) AS d
WHERE p.id IN (
  'd1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000003',
  'd1000000-0000-0000-0000-000000000005',
  'd1000000-0000-0000-0000-000000000006',
  'd1000000-0000-0000-0000-000000000010'
);

-- Seed some pending reorder requests
INSERT INTO reorder_requests (product_id, warehouse_id, current_stock, reorder_point, suggested_quantity, estimated_cost, status, priority, ai_reasoning) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 120, 500, 1000, 24500.00, 'pending', 'critical', 'Stock is at 24% of reorder point. Based on 30-day demand forecast of ~45 units/day, current stock will be depleted in ~2.7 days. Recommend immediate reorder of 1000 units.'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 89, 300, 600, 5250.00, 'pending', 'critical', 'Stock critically low at 30% of reorder point. Wireless Mouse M300 is a high-velocity SKU with avg 35 units/day demand. Recommend rush order.'),
  ('d1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 0, 200, 500, 17500.00, 'pending', 'critical', 'ZERO stock. Noise Cancelling Headset completely out. 3 pending customer orders affected. Immediate restock required.'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 340, 400, 800, 2560.00, 'pending', 'high', 'Stock approaching reorder point (85% of threshold). HDMI Cable is steady-demand item. Suggest standard reorder before stockout.');
