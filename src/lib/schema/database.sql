-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE inventory_status_1 AS ENUM ('STOCK', 'PRODUCTION');
CREATE TYPE inventory_status_2 AS ENUM ('UNCOMMITTED', 'COMMITTED', 'PENDING_WASH');
CREATE TYPE production_stage AS ENUM (
  'CUTTING',
  'SEWING',
  'WASHING',
  'FINISHING',
  'QC',
  'TEMPORARY_STORAGE',
  'PACKING',
  'COMPLETE'
);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., "BIN-1-Z1-1011"
  type TEXT NOT NULL,       -- e.g., "BIN", "RACK"
  number TEXT NOT NULL,     -- e.g., "1"
  zone TEXT NOT NULL,       -- e.g., "Z1"
  position TEXT NOT NULL,   -- e.g., "1011"
  capacity INTEGER NOT NULL,
  current_items INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers with measurements
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  last_measurement_date TIMESTAMPTZ,
  measurement_expiry TIMESTAMPTZ, -- Calculated as last_measurement_date + 90 days
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer measurements history
CREATE TABLE customer_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  waist DECIMAL NOT NULL,
  hip DECIMAL NOT NULL,
  thigh DECIMAL NOT NULL,
  inseam DECIMAL NOT NULL,
  notes TEXT,
  measured_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory items with QR codes and location tracking
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL,
  status1 inventory_status_1 NOT NULL,
  status2 inventory_status_2 NOT NULL DEFAULT 'UNCOMMITTED',
  batch_id UUID REFERENCES batches(id),
  location_id UUID REFERENCES locations(id),
  order_id UUID REFERENCES orders(id),
  production_stage production_stage,
  qr_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Enforce location requirement for STOCK items
  CONSTRAINT stock_items_need_location 
    CHECK (
      (status1 = 'PRODUCTION') OR 
      (status1 = 'STOCK' AND location_id IS NOT NULL)
    )
);

-- QR code scans
CREATE TABLE item_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  scanned_by UUID NOT NULL REFERENCES users(id),
  location_id UUID REFERENCES locations(id),
  scan_type TEXT NOT NULL, -- e.g., 'LOCATION_CHECK', 'STAGE_TRANSITION'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for measurement expiry
CREATE OR REPLACE FUNCTION update_measurement_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.measurement_expiry := NEW.last_measurement_date + INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_measurement_expiry
  BEFORE INSERT OR UPDATE OF last_measurement_date
  ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_measurement_expiry();

-- Trigger for location capacity check
CREATE OR REPLACE FUNCTION check_location_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    IF (
      SELECT current_items >= capacity 
      FROM locations 
      WHERE id = NEW.location_id
    ) THEN
      RAISE EXCEPTION 'Location capacity exceeded';
    END IF;
    
    -- Update location item count
    UPDATE locations 
    SET current_items = current_items + 1
    WHERE id = NEW.location_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_location_capacity
  BEFORE INSERT OR UPDATE OF location_id
  ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION check_location_capacity();

-- Bin Types with predefined capacities
CREATE TYPE bin_type AS ENUM (
  'BIN1',    -- Standard bin (10 units)
  'WBIN',    -- Wash bin (50 units)
  'DBIN',    -- Defect bin (20 units)
  'TBIN',    -- Temporary storage (30 units)
  'FBIN'     -- Fulfillment bin (40 units)
);

-- Bin capacities table
CREATE TABLE bin_capacities (
  bin_type bin_type PRIMARY KEY,
  capacity INTEGER NOT NULL,
  description TEXT,
  wash_type TEXT,  -- For wash bins, what wash they're designated for
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bin contents tracking
CREATE TABLE bin_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID NOT NULL REFERENCES users(id),
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES users(id),
  
  -- Prevent duplicate items in bins
  UNIQUE(location_id, inventory_item_id, removed_at)
);

-- Request step enforcement
CREATE TABLE request_step_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type request_type NOT NULL,
  step_number INTEGER NOT NULL,
  required_previous_step INTEGER,
  can_skip BOOLEAN DEFAULT false,
  requires_admin_override BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(request_type, step_number)
);

-- QC failures and defects
CREATE TABLE defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  qc_request_id UUID NOT NULL REFERENCES requests(id),
  defect_type TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  reported_by UUID NOT NULL REFERENCES users(id),
  review_request_id UUID REFERENCES requests(id),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add triggers for bin capacity enforcement
CREATE OR REPLACE FUNCTION check_bin_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Get current bin contents count
  IF (
    SELECT COUNT(*)
    FROM bin_contents bc
    WHERE bc.location_id = NEW.location_id
    AND bc.removed_at IS NULL
  ) >= (
    SELECT c.capacity 
    FROM locations l
    JOIN bin_capacities c ON c.bin_type::text = l.type
    WHERE l.id = NEW.location_id
  ) THEN
    RAISE EXCEPTION 'Bin capacity exceeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_bin_capacity
  BEFORE INSERT ON bin_contents
  FOR EACH ROW
  EXECUTE FUNCTION check_bin_capacity();

-- Add indexes for performance
CREATE INDEX idx_bin_contents_location ON bin_contents(location_id);
CREATE INDEX idx_bin_contents_item ON bin_contents(inventory_item_id);
CREATE INDEX idx_bin_contents_active ON bin_contents(location_id) 
  WHERE removed_at IS NULL;

-- Start with base tables and build up from there... 