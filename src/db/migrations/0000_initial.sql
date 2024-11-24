-- Create enums
CREATE TYPE order_status AS ENUM ('PENDING', 'STOCKED', 'COMMITTED');
CREATE TYPE inventory_status1 AS ENUM ('STOCK', 'PRODUCTION');
CREATE TYPE inventory_status2 AS ENUM ('COMMITTED', 'UNCOMMITTED');
CREATE TYPE batch_status AS ENUM ('CREATED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE production_request_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED');

-- Create tables
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    number INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status order_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    status1 inventory_status1 NOT NULL,
    status2 inventory_status2 NOT NULL,
    qr_code TEXT,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_request_id UUID NOT NULL REFERENCES production_requests(id),
    total_quantity INTEGER NOT NULL,
    status batch_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    status production_request_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku ON order_items(sku);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_batch_id ON inventory_items(batch_id);
CREATE INDEX idx_inventory_items_status1 ON inventory_items(status1);
CREATE INDEX idx_inventory_items_status2 ON inventory_items(status2);
CREATE INDEX idx_batches_production_request_id ON batches(production_request_id);
CREATE INDEX idx_production_requests_sku ON production_requests(sku);
CREATE INDEX idx_production_requests_status ON production_requests(status);