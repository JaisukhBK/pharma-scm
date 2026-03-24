-- =============================================
-- SupplyFlow — Seed Data (matches schema.sql)
-- Run AFTER schema.sql in Neon SQL Editor
-- =============================================

-- Warehouses (columns: id, name, code, location_address, city, state, lat, lng, total_capacity, current_utilization, zone_count, worker_count, status)
INSERT INTO warehouses (id, name, code, location_address, city, state, lat, lng, total_capacity, current_utilization, zone_count, worker_count, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Boston Distribution Center', 'BOS-DC', '100 Supply Chain Blvd', 'Boston', 'MA', 42.3601, -71.0589, 50000, 87.2, 12, 145, 'operational'),
  ('a1000000-0000-0000-0000-000000000002', 'Chicago Mega Hub', 'CHI-MH', '500 Logistics Ave', 'Chicago', 'IL', 41.8781, -87.6298, 80000, 72.1, 18, 210, 'operational'),
  ('a1000000-0000-0000-0000-000000000003', 'LA Pacific Warehouse', 'LAX-PW', '200 Harbor Dr', 'Los Angeles', 'CA', 34.0522, -118.2437, 35000, 94.5, 8, 95, 'maintenance'),
  ('a1000000-0000-0000-0000-000000000004', 'Dallas South Depot', 'DAL-SD', '750 Interstate Pkwy', 'Dallas', 'TX', 32.7767, -96.7970, 45000, 61.3, 10, 120, 'operational'),
  ('a1000000-0000-0000-0000-000000000005', 'Miami Import Center', 'MIA-IC', '300 Port Blvd', 'Miami', 'FL', 25.7617, -80.1918, 25000, 45.8, 6, 78, 'alert');

-- Warehouse Zones (columns: warehouse_id, name, zone_type, capacity, current_units, utilization, temperature_controlled, status)
INSERT INTO warehouse_zones (warehouse_id, name, zone_type, capacity, current_units, utilization, temperature_controlled, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Receiving Dock A', 'receiving', 5000, 4200, 84.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Storage Block 1', 'storage', 10000, 8900, 89.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Storage Block 2', 'storage', 10000, 9200, 92.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Pick Zone Alpha', 'picking', 8000, 6800, 85.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Pack Station 1', 'packing', 3000, 2400, 80.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Shipping Bay', 'shipping', 5000, 4100, 82.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Cold Storage', 'cold_storage', 4000, 3700, 92.5, true, 'active'),
  ('a1000000-0000-0000-0000-000000000001', 'Returns Processing', 'returns', 5000, 4050, 81.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Main Receiving', 'receiving', 8000, 5600, 70.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Bulk Storage', 'storage', 25000, 18000, 72.0, false, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Hazmat Zone', 'hazmat', 2000, 1200, 60.0, true, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Pick Line', 'picking', 10000, 7500, 75.0, false, 'active');

-- Products (columns: id, sku, name, description, category, unit_price, unit_cost, weight_kg)
INSERT INTO products (id, sku, name, description, category, unit_price, unit_cost, weight_kg) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'SKU-8812', 'Lithium Battery Pack A7', '18650 cell pack, 7S3P config', 'Electronics', 45.99, 24.50, 0.85),
  ('d1000000-0000-0000-0000-000000000002', 'SKU-4401', 'HDMI Cable 6ft Premium', 'Gold-plated 8K HDMI 2.1', 'Cables', 12.99, 3.20, 0.15),
  ('d1000000-0000-0000-0000-000000000003', 'SKU-2209', 'Wireless Mouse M300', 'Ergonomic BT mouse, 2400 DPI', 'Peripherals', 29.99, 8.75, 0.12),
  ('d1000000-0000-0000-0000-000000000004', 'SKU-7756', 'USB-C Hub 7-Port', 'Aluminum hub with PD passthrough', 'Accessories', 49.99, 15.00, 0.22),
  ('d1000000-0000-0000-0000-000000000005', 'SKU-1133', 'Mechanical Keyboard K1', 'Cherry MX Brown, TKL', 'Peripherals', 79.99, 22.00, 0.95),
  ('d1000000-0000-0000-0000-000000000006', 'SKU-5590', '27" 4K Monitor', 'IPS panel, HDR400', 'Displays', 399.99, 180.00, 5.50),
  ('d1000000-0000-0000-0000-000000000007', 'SKU-3321', 'Webcam HD Pro', 'Auto-focus with ring light', 'Peripherals', 49.99, 12.00, 0.18),
  ('d1000000-0000-0000-0000-000000000008', 'SKU-9944', 'Laptop Stand Aluminum', 'Adjustable ergonomic stand', 'Accessories', 34.99, 9.00, 1.20),
  ('d1000000-0000-0000-0000-000000000009', 'SKU-6678', 'Ethernet Cable Cat6 10ft', 'Shielded, gold contacts', 'Cables', 8.99, 1.50, 0.10),
  ('d1000000-0000-0000-0000-000000000010', 'SKU-2255', 'Noise Cancelling Headset', 'ANC over-ear, 40hr battery', 'Audio', 129.99, 35.00, 0.32);

-- Inventory (columns: product_id, warehouse_id, quantity_on_hand, quantity_reserved, reorder_point, reorder_quantity)
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, reorder_point, reorder_quantity) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 120, 30, 500, 1000),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 340, 50, 400, 800),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 89, 15, 300, 600),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 560, 80, 600, 1200),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 2200, 100, 500, 1000),
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 450, 60, 200, 400),
  ('d1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 780, 40, 300, 600),
  ('d1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 1500, 120, 400, 800),
  ('d1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 3200, 200, 1000, 2000),
  ('d1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 0, 0, 200, 500);

-- Carriers (columns: id, name, code, contact_email, rating, on_time_rate, cost_per_mile, supported_modes, is_active)
INSERT INTO carriers (id, name, code, contact_email, rating, on_time_rate, cost_per_mile, supported_modes, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'FedEx Freight', 'FEDEX', 'ops@fedex.example.com', 4.50, 96.2, 2.45, '{ground,air}', true),
  ('b1000000-0000-0000-0000-000000000002', 'XPO Logistics', 'XPO', 'dispatch@xpo.example.com', 4.20, 92.8, 2.10, '{ground}', true),
  ('b1000000-0000-0000-0000-000000000003', 'UPS Freight', 'UPS', 'logistics@ups.example.com', 4.60, 94.5, 2.65, '{ground,air}', true),
  ('b1000000-0000-0000-0000-000000000004', 'Old Dominion', 'ODFL', 'service@odfl.example.com', 4.30, 89.1, 1.95, '{ground}', true),
  ('b1000000-0000-0000-0000-000000000005', 'SAIA Inc', 'SAIA', 'ops@saia.example.com', 4.00, 87.3, 1.80, '{ground}', true),
  ('b1000000-0000-0000-0000-000000000006', 'Estes Express', 'ESTES', 'dispatch@estes.example.com', 3.90, 85.6, 1.72, '{ground}', true);

-- Customers (columns: id, name, email, company, city, state, tier, total_orders, total_revenue)
INSERT INTO customers (id, name, email, company, city, state, tier, total_orders, total_revenue) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Sarah Mitchell', 'sarah@acme.example.com', 'Acme Corp', 'New York', 'NY', 'enterprise', 342, 2100000),
  ('c1000000-0000-0000-0000-000000000002', 'James Wong', 'james@techvault.example.com', 'TechVault Inc', 'San Francisco', 'CA', 'premium', 218, 1400000),
  ('c1000000-0000-0000-0000-000000000003', 'Maria Garcia', 'maria@globalmart.example.com', 'GlobalMart', 'Chicago', 'IL', 'enterprise', 567, 4200000),
  ('c1000000-0000-0000-0000-000000000004', 'David Park', 'david@nexgen.example.com', 'NexGen Auto', 'Detroit', 'MI', 'enterprise', 134, 720000),
  ('c1000000-0000-0000-0000-000000000005', 'Lisa Thompson', 'lisa@summit.example.com', 'Summit Health', 'Boston', 'MA', 'premium', 98, 540000),
  ('c1000000-0000-0000-0000-000000000006', 'Robert Chen', 'robert@freshfoods.example.com', 'FreshFoods Co', 'Miami', 'FL', 'standard', 76, 310000);

-- Shipments (columns: id, tracking_number, carrier_id, origin_warehouse_id, origin_address, origin_city, origin_state, destination_address, destination_city, destination_state, status, weight_kg, shipping_cost, progress_pct)
INSERT INTO shipments (id, tracking_number, carrier_id, origin_warehouse_id, origin_address, origin_city, origin_state, destination_address, destination_city, destination_state, status, weight_kg, shipping_cost, progress_pct, estimated_delivery) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'SF-TRK-10234', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '100 Supply Chain Blvd', 'Boston', 'MA', '500 5th Ave', 'New York', 'NY', 'in_transit', 1088.6, 1250.00, 68, NOW() + INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000002', 'SF-TRK-10235', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', '500 Logistics Ave', 'Chicago', 'IL', '200 Michigan Ave', 'Detroit', 'MI', 'delivered', 2313.3, 890.00, 100, NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'SF-TRK-10236', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', '200 Harbor Dr', 'Los Angeles', 'CA', '100 Central Ave', 'Phoenix', 'AZ', 'in_transit', 816.5, 720.00, 35, NOW() + INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000004', 'SF-TRK-10237', 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', '750 Interstate Pkwy', 'Dallas', 'TX', '300 Main St', 'Houston', 'TX', 'pending', 1451.5, 450.00, 0, NOW() + INTERVAL '3 days'),
  ('f1000000-0000-0000-0000-000000000005', 'SF-TRK-10238', 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', '300 Port Blvd', 'Miami', 'FL', '400 Peachtree St', 'Atlanta', 'GA', 'delayed', 2086.5, 1100.00, 22, NOW() + INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000006', 'SF-TRK-10239', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', '500 Logistics Ave', 'Seattle', 'WA', '100 Broadway', 'Portland', 'OR', 'in_transit', 544.3, 380.00, 82, NOW() + INTERVAL '1 day');

-- Orders (columns: id, order_number, customer_id, warehouse_id, status, priority, subtotal, tax, shipping_cost, total, shipping_city, shipping_state, ordered_at)
INSERT INTO orders (id, order_number, customer_id, warehouse_id, status, priority, subtotal, tax, shipping_cost, total, shipping_city, shipping_state, ordered_at) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'ORD-50012', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'processing', 'high', 11200.00, 950.00, 300.00, 12450.00, 'New York', 'NY', NOW() - INTERVAL '2 hours'),
  ('e1000000-0000-0000-0000-000000000002', 'ORD-50013', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'shipped', 'medium', 3800.00, 280.00, 120.00, 4200.00, 'San Francisco', 'CA', NOW() - INTERVAL '1 day'),
  ('e1000000-0000-0000-0000-000000000003', 'ORD-50014', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'pending', 'high', 79500.00, 5800.00, 2000.00, 87300.00, 'Chicago', 'IL', NOW() - INTERVAL '30 minutes'),
  ('e1000000-0000-0000-0000-000000000004', 'ORD-50015', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'delivered', 'low', 21000.00, 1600.00, 500.00, 23100.00, 'Boston', 'MA', NOW() - INTERVAL '3 days'),
  ('e1000000-0000-0000-0000-000000000005', 'ORD-50016', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'processing', 'medium', 38000.00, 2800.00, 1000.00, 41800.00, 'Detroit', 'MI', NOW() - INTERVAL '4 hours'),
  ('e1000000-0000-0000-0000-000000000006', 'ORD-50017', 'c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'cancelled', 'low', 14200.00, 900.00, 500.00, 15600.00, 'Miami', 'FL', NOW() - INTERVAL '5 days');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 50, 45.99, 2299.50),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 30, 79.99, 2399.70),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 20, 49.99, 999.80),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000007', 40, 49.99, 1999.60),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 35, 29.99, 1049.65),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 100, 399.99, 39999.00),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000010', 200, 129.99, 25998.00);

-- Analytics Snapshots (6 months of monthly data)
INSERT INTO analytics_snapshots (snapshot_date, module, metric_name, metric_value) VALUES
  ('2025-10-01', 'oms', 'monthly_orders', 2100),
  ('2025-10-01', 'oms', 'monthly_revenue', 420000),
  ('2025-11-01', 'oms', 'monthly_orders', 2400),
  ('2025-11-01', 'oms', 'monthly_revenue', 510000),
  ('2025-12-01', 'oms', 'monthly_orders', 3200),
  ('2025-12-01', 'oms', 'monthly_revenue', 680000),
  ('2026-01-01', 'oms', 'monthly_orders', 2800),
  ('2026-01-01', 'oms', 'monthly_revenue', 590000),
  ('2026-02-01', 'oms', 'monthly_orders', 2600),
  ('2026-02-01', 'oms', 'monthly_revenue', 540000),
  ('2026-03-01', 'oms', 'monthly_orders', 3100),
  ('2026-03-01', 'oms', 'monthly_revenue', 650000),
  ('2025-10-01', 'tms', 'on_time_rate', 91.2),
  ('2025-11-01', 'tms', 'on_time_rate', 92.5),
  ('2025-12-01', 'tms', 'on_time_rate', 90.8),
  ('2026-01-01', 'tms', 'on_time_rate', 93.1),
  ('2026-02-01', 'tms', 'on_time_rate', 94.0),
  ('2026-03-01', 'tms', 'on_time_rate', 94.2),
  ('2025-10-01', 'wms', 'avg_utilization', 74.5),
  ('2025-11-01', 'wms', 'avg_utilization', 76.2),
  ('2025-12-01', 'wms', 'avg_utilization', 82.1),
  ('2026-01-01', 'wms', 'avg_utilization', 79.8),
  ('2026-02-01', 'wms', 'avg_utilization', 77.3),
  ('2026-03-01', 'wms', 'avg_utilization', 80.4);