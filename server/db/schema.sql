-- =============================================
-- SupplyFlow SCM Platform — Neon Database Schema
-- Run in Neon SQL Editor: console.neon.tech
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','manager','operator','viewer')),
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
  location_address TEXT NOT NULL, city TEXT NOT NULL, state TEXT, country TEXT DEFAULT 'US',
  lat DECIMAL(10,6), lng DECIMAL(10,6),
  total_capacity INTEGER DEFAULT 0, current_utilization DECIMAL(5,2) DEFAULT 0,
  zone_count INTEGER DEFAULT 0, worker_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational','maintenance','alert','inactive')),
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('receiving','storage','picking','packing','shipping','returns','cold_storage','hazmat')),
  capacity INTEGER DEFAULT 0, current_units INTEGER DEFAULT 0, utilization DECIMAL(5,2) DEFAULT 0,
  temperature_controlled BOOLEAN DEFAULT FALSE, min_temp DECIMAL(5,2), max_temp DECIMAL(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','full')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, category TEXT NOT NULL,
  unit_price DECIMAL(12,2) DEFAULT 0, unit_cost DECIMAL(12,2) DEFAULT 0, weight_kg DECIMAL(8,3),
  dimensions_cm JSONB, is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES warehouse_zones(id),
  quantity_on_hand INTEGER DEFAULT 0, quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point INTEGER DEFAULT 0, reorder_quantity INTEGER DEFAULT 0,
  lot_number TEXT, expiry_date DATE, last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id, lot_number)
);

CREATE TABLE IF NOT EXISTS carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
  contact_email TEXT, contact_phone TEXT,
  rating DECIMAL(3,2) DEFAULT 0, on_time_rate DECIMAL(5,2) DEFAULT 0, cost_per_mile DECIMAL(6,2) DEFAULT 0,
  supported_modes TEXT[] DEFAULT '{}', is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL, carrier_id UUID REFERENCES carriers(id),
  origin_warehouse_id UUID REFERENCES warehouses(id),
  origin_address TEXT NOT NULL, origin_city TEXT NOT NULL, origin_state TEXT,
  destination_address TEXT NOT NULL, destination_city TEXT NOT NULL, destination_state TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','picked_up','in_transit','out_for_delivery','delivered','delayed','cancelled','returned')),
  mode TEXT DEFAULT 'ground', weight_kg DECIMAL(10,2),
  estimated_delivery TIMESTAMPTZ, actual_delivery TIMESTAMPTZ,
  shipping_cost DECIMAL(12,2), progress_pct INTEGER DEFAULT 0,
  notes TEXT, created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, location TEXT, description TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT,
  address TEXT, city TEXT, state TEXT, country TEXT DEFAULT 'US',
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard','premium','enterprise')),
  total_orders INTEGER DEFAULT 0, total_revenue DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, customer_id UUID NOT NULL REFERENCES customers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','picking','packing','shipped','delivered','cancelled','returned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  order_type TEXT DEFAULT 'standard',
  subtotal DECIMAL(12,2) DEFAULT 0, tax DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0, total DECIMAL(12,2) DEFAULT 0,
  shipment_id UUID REFERENCES shipments(id),
  shipping_address TEXT, shipping_city TEXT, shipping_state TEXT, notes TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(), fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL, unit_price DECIMAL(12,2) NOT NULL, total_price DECIMAL(12,2) NOT NULL,
  picked BOOLEAN DEFAULT FALSE, packed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  module TEXT NOT NULL CHECK (module IN ('wms','tms','oms','analytics','general')),
  messages JSONB DEFAULT '[]', summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL, module TEXT NOT NULL,
  metric_name TEXT NOT NULL, metric_value DECIMAL(14,4) NOT NULL, metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
