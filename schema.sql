-- Updated schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE item_status_1 AS ENUM (
    'PRODUCTION',
    'STOCK',
    'WASH',
    'QC',
    'FINISH',
    'PACKING',
    'FULFILLMENT',
    'FULFILLED'
);

CREATE TYPE item_status_2 AS ENUM (
    'UNCOMMITTED',
    'COMMITTED',
    'ASSIGNED'
);

CREATE TYPE order_status AS ENUM (
    'CREATED',
    'PRODUCTION',
    'PROCESSING',
    'WASH_REQUEST',
    'WASHING',
    'QC_PENDING',
    'QC_FAILED',
    'FINISHING',
    'PACKING',
    'READY',
    'SHIPPED'
);

CREATE TYPE location_type AS ENUM (
    'WAREHOUSE',
    'PRODUCTION_FLOOR',
    'WASH-STA',
    'WASH-IND',
    'WASH-ONX',
    'WASH-JAG',
    'QC_STATION',
    'FINISHING',
    'PACKING',
    'SHIPPING'
);

CREATE TYPE bin_type AS ENUM (
    'SMALL',    -- 10 capacity
    'MEDIUM',   -- 25 capacity
    'LARGE',    -- 100 capacity
    'WASH'      -- 25 capacity
);

CREATE TYPE request_type AS ENUM (
    'WASHING',
    'QC',
    'PRODUCTION',
    'FINISHING'
);

CREATE TYPE request_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE event_type AS ENUM (
    'ORDER_CREATED',
    'ORDER_STATUS_CHANGED',
    'ORDER_UPDATED',
    'ITEM_CREATED',
    'ITEM_STATUS_CHANGED',
    'ITEM_LOCATION_CHANGED',
    'ITEM_ASSIGNED_TO_ORDER',
    'WASH_REQUEST_CREATED',
    'WASH_STEP_COMPLETED',
    'WASH_COMPLETED',
    'PRODUCTION_STARTED',
    'PRODUCTION_COMPLETED',
    'QC_STARTED',
    'QC_PASSED',
    'QC_FAILED'
);

-- Tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status order_status NOT NULL DEFAULT 'CREATED',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bins (
    id VARCHAR(50) PRIMARY KEY,  -- Format: XXX-CAP-ZONE-SHELF-RACK
    zone location_type NOT NULL,
    type bin_type NOT NULL,
    rack VARCHAR(10) NOT NULL,
    shelf VARCHAR(10) NOT NULL,
    capacity INTEGER NOT NULL,
    current_items INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    current_sku VARCHAR(50) NOT NULL,
    target_sku VARCHAR(50),
    status1 item_status_1 NOT NULL,
    status2 item_status_2 NOT NULL,
    location location_type,
    bin_id VARCHAR(50) REFERENCES bins(id),
    order_id UUID REFERENCES orders(id),
    batch_id VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
    id VARCHAR(50) PRIMARY KEY,
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    request_type request_type NOT NULL,
    status request_status NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    event_type event_type NOT NULL,
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    order_id UUID REFERENCES orders(id),
    created_by VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_inventory_items_location ON inventory_items(location);
CREATE INDEX idx_inventory_items_status ON inventory_items(status1, status2);
CREATE INDEX idx_inventory_items_bin ON inventory_items(bin_id);
CREATE INDEX idx_inventory_items_order ON inventory_items(order_id);
CREATE INDEX idx_requests_item ON requests(item_id);
CREATE INDEX idx_requests_type_status ON requests(request_type, status);
CREATE INDEX idx_events_item ON events(item_id);
CREATE INDEX idx_events_order ON events(order_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_bins_zone ON bins(zone);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bins_updated_at
    BEFORE UPDATE ON bins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Second SQL Generation 27/11/24

-- Complete schema.sql for all application functionality

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------
-- ENUMS
------------------

CREATE TYPE item_status_1 AS ENUM (
    'PRODUCTION',
    'STOCK',
    'WASH',
    'QC',
    'FINISH',
    'PACKING',
    'FULFILLMENT',
    'FULFILLED'
);

CREATE TYPE item_status_2 AS ENUM (
    'UNCOMMITTED',
    'COMMITTED',
    'ASSIGNED'
);

CREATE TYPE order_status AS ENUM (
    'CREATED',
    'PRODUCTION',
    'PROCESSING',
    'WASH_REQUEST',
    'WASHING',
    'QC_PENDING',
    'QC_FAILED',
    'FINISHING',
    'PACKING',
    'READY',
    'SHIPPED'
);

CREATE TYPE location_type AS ENUM (
    'WAREHOUSE',
    'PRODUCTION_FLOOR',
    'WASH-STA',
    'WASH-IND',
    'WASH-ONX',
    'WASH-JAG',
    'QC_STATION',
    'FINISHING',
    'PACKING',
    'SHIPPING'
);

CREATE TYPE bin_type AS ENUM (
    'SMALL',    -- 10 capacity
    'MEDIUM',   -- 25 capacity
    'LARGE',    -- 100 capacity
    'WASH'      -- 25 capacity
);

CREATE TYPE bin_zone AS ENUM (
    'WASH',
    'QC',
    'STOCK',
    'FINISH',
    'PACK',
    '1',
    '2',
    '3',
    '4',
    '5'
);

CREATE TYPE request_type AS ENUM (
    'WASHING',
    'QC',
    'PRODUCTION',
    'FINISHING'
);

CREATE TYPE request_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE event_type AS ENUM (
    'ORDER_CREATED',
    'ORDER_STATUS_CHANGED',
    'ORDER_UPDATED',
    'ITEM_CREATED',
    'ITEM_STATUS_CHANGED',
    'ITEM_LOCATION_CHANGED',
    'ITEM_ASSIGNED_TO_ORDER',
    'ITEM_ASSIGNED_TO_BIN',
    'ITEM_AUTO_ASSIGNED_TO_BIN',
    'WASH_REQUEST_CREATED',
    'WASH_STEP_COMPLETED',
    'WASH_COMPLETED',
    'PRODUCTION_STARTED',
    'PRODUCTION_COMPLETED',
    'QC_STARTED',
    'QC_PASSED',
    'QC_FAILED',
    'BIN_CREATED',
    'BIN_UPDATED',
    'BIN_ASSIGNMENT_FAILED'
);

------------------
-- TABLES
------------------

-- Core Tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    status order_status NOT NULL DEFAULT 'CREATED',
    priority VARCHAR(20) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bin Management
CREATE TABLE bins (
    id VARCHAR(50) PRIMARY KEY,  -- Format: XXX-CAP-ZONE-SHELF-RACK
    zone bin_zone NOT NULL,
    type bin_type NOT NULL,
    rack VARCHAR(10) NOT NULL,
    shelf VARCHAR(10) NOT NULL,
    capacity INTEGER NOT NULL,
    current_items INTEGER DEFAULT 0,
    items TEXT[], -- Array of item IDs
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_capacity CHECK (current_items <= capacity)
);

CREATE TABLE bin_capacity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id VARCHAR(50) REFERENCES bins(id),
    previous_count INTEGER NOT NULL,
    new_count INTEGER NOT NULL,
    capacity_at_time INTEGER NOT NULL,
    reason TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Management
CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    current_sku VARCHAR(50) NOT NULL,
    target_sku VARCHAR(50),
    status1 item_status_1 NOT NULL,
    status2 item_status_2 NOT NULL,
    location location_type,
    bin_id VARCHAR(50) REFERENCES bins(id),
    order_id UUID REFERENCES orders(id),
    batch_id VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wash Process Management
CREATE TABLE wash_types (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'STA', 'IND', 'ONX', 'JAG'
    name VARCHAR(50) NOT NULL,  -- e.g., 'Stardust', 'Indigo', 'Onyx', 'Jagger'
    description TEXT,
    max_capacity INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sku_transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_sku VARCHAR(50) NOT NULL,
    target_sku VARCHAR(50) NOT NULL,
    wash_type_id VARCHAR(10) REFERENCES wash_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_sku, target_sku)
);

-- Request Management
CREATE TABLE requests (
    id VARCHAR(50) PRIMARY KEY,
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    request_type request_type NOT NULL,
    status request_status NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(50) REFERENCES requests(id),
    step_type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status request_status NOT NULL DEFAULT 'PENDING',
    sequence_number INTEGER NOT NULL,
    metadata JSONB,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event and History Tracking
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    event_type event_type NOT NULL,
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    order_id UUID REFERENCES orders(id),
    created_by VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bin_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    bin_id VARCHAR(50) REFERENCES bins(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMP WITH TIME ZONE,
    assigned_by VARCHAR(50),
    assignment_type VARCHAR(50), -- 'MANUAL' or 'AUTOMATIC'
    reason TEXT
);

CREATE TABLE item_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(50) REFERENCES inventory_items(id),
    from_location location_type,
    to_location location_type NOT NULL,
    from_bin VARCHAR(50) REFERENCES bins(id),
    to_bin VARCHAR(50) REFERENCES bins(id),
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    moved_by VARCHAR(50),
    reason TEXT,
    request_id VARCHAR(50) REFERENCES requests(id)
);

------------------
-- INDEXES
------------------

-- Inventory Indexes
CREATE INDEX idx_inventory_items_location ON inventory_items(location);
CREATE INDEX idx_inventory_items_status ON inventory_items(status1, status2);
CREATE INDEX idx_inventory_items_bin ON inventory_items(bin_id);
CREATE INDEX idx_inventory_items_order ON inventory_items(order_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(current_sku, target_sku);

-- Bin Indexes
CREATE INDEX idx_bins_zone ON bins(zone);
CREATE INDEX idx_bins_type ON bins(type);
CREATE INDEX idx_bins_capacity ON bins(current_items, capacity);

-- Request Indexes
CREATE INDEX idx_requests_item ON requests(item_id);
CREATE INDEX idx_requests_type_status ON requests(request_type, status);
CREATE INDEX idx_request_steps_request ON request_steps(request_id);

-- Event Indexes
CREATE INDEX idx_events_item ON events(item_id);
CREATE INDEX idx_events_order ON events(order_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Movement Indexes
CREATE INDEX idx_item_movements_item ON item_movements(item_id);
CREATE INDEX idx_item_movements_locations ON item_movements(from_location, to_location);
CREATE INDEX idx_item_movements_bins ON item_movements(from_bin, to_bin);

-- Assignment Indexes
CREATE INDEX idx_bin_assignments_item ON bin_assignments(item_id);
CREATE INDEX idx_bin_assignments_bin ON bin_assignments(bin_id);
CREATE INDEX idx_bin_assignments_active ON bin_assignments(removed_at) 
    WHERE removed_at IS NULL;

------------------
-- TRIGGERS
------------------

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bins_updated_at
    BEFORE UPDATE ON bins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_steps_updated_at
    BEFORE UPDATE ON request_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bin Capacity Trigger
CREATE OR REPLACE FUNCTION log_bin_capacity_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_items != OLD.current_items THEN
        INSERT INTO bin_capacity_history (
            bin_id,
            previous_count,
            new_count,
            capacity_at_time
        ) VALUES (
            NEW.id,
            OLD.current_items,
            NEW.current_items,
            NEW.capacity
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_bin_capacity_changes
    AFTER UPDATE OF current_items ON bins
    FOR EACH ROW
    EXECUTE FUNCTION log_bin_capacity_change();

