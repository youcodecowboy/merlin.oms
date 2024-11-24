import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'STOCKED', 'COMMITTED']);
export const inventoryStatus1Enum = pgEnum('inventory_status1', ['STOCK', 'PRODUCTION']);
export const inventoryStatus2Enum = pgEnum('inventory_status2', ['COMMITTED', 'UNCOMMITTED']);
export const batchStatusEnum = pgEnum('batch_status', ['CREATED', 'IN_PROGRESS', 'COMPLETED']);
export const productionRequestStatusEnum = pgEnum('production_request_status', ['PENDING', 'ACCEPTED', 'COMPLETED']);

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().default(createId),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  number: integer('number').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().default(createId),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull().default(1),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Inventory items table
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().default(createId),
  sku: text('sku').notNull(),
  status1: inventoryStatus1Enum('status1').notNull(),
  status2: inventoryStatus2Enum('status2').notNull(),
  qrCode: text('qr_code'),
  batchId: uuid('batch_id').references(() => batches.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Batches table
export const batches = pgTable('batches', {
  id: uuid('id').primaryKey().default(createId),
  productionRequestId: uuid('production_request_id').notNull().references(() => productionRequests.id),
  totalQuantity: integer('total_quantity').notNull(),
  status: batchStatusEnum('status').notNull().default('CREATED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Production requests table
export const productionRequests = pgTable('production_requests', {
  id: uuid('id').primaryKey().default(createId),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  status: productionRequestStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  })
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  })
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  batch: one(batches, {
    fields: [inventoryItems.batchId],
    references: [batches.id]
  })
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  productionRequest: one(productionRequests, {
    fields: [batches.productionRequestId],
    references: [productionRequests.id]
  }),
  inventoryItems: many(inventoryItems)
}));

export const productionRequestsRelations = relations(productionRequests, ({ many }) => ({
  batches: many(batches)
}));