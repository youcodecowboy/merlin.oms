import { InferModel } from 'drizzle-orm';
import { orders, orderItems, inventoryItems, batches, productionRequests } from './schema';

// Define types for each table
export type Order = InferModel<typeof orders>;
export type OrderItem = InferModel<typeof orderItems>;
export type InventoryItem = InferModel<typeof inventoryItems>;
export type Batch = InferModel<typeof batches>;
export type ProductionRequest = InferModel<typeof productionRequests>;

// Define types for inserts
export type NewOrder = InferModel<typeof orders, 'insert'>;
export type NewOrderItem = InferModel<typeof orderItems, 'insert'>;
export type NewInventoryItem = InferModel<typeof inventoryItems, 'insert'>;
export type NewBatch = InferModel<typeof batches, 'insert'>;
export type NewProductionRequest = InferModel<typeof productionRequests, 'insert'>;