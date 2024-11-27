export type ItemStatus1 = 
  | 'PRODUCTION'  // Item is in production process
  | 'STOCK'       // Item is in stock/inventory
  | 'WASH'        // Item is in wash department
  | 'QC'          // Item is in quality control
  | 'FINISH'      // Item is in finishing department
  | 'PACKING'     // Item is being packed
  | 'FULFILLMENT' // Item is ready for shipment
  | 'FULFILLED'   // Item has been shipped

export type ItemStatus2 = 
  | 'UNCOMMITTED' // Not assigned to any order
  | 'COMMITTED'   // Reserved for an order
  | 'ASSIGNED'    // Actively being processed for order

export type LocationType =
  | 'WAREHOUSE'
  | 'PRODUCTION_FLOOR'
  | 'WASH-STA'
  | 'WASH-IND'
  | 'WASH-ONX'
  | 'WASH-JAG'
  | 'QC_STATION'
  | 'FINISHING'
  | 'PACKING'
  | 'SHIPPING'

export type OrderStatus =
  | 'CREATED'      // Initial state
  | 'PRODUCTION'   // Needs to be made
  | 'PROCESSING'   // Matched to stock
  | 'WASH_REQUEST' // Ready for wash
  | 'WASHING'      // Currently being washed
  | 'QC_PENDING'   // Ready for QC
  | 'QC_FAILED'    // Failed QC, needs rewash
  | 'FINISHING'    // In finishing process
  | 'PACKING'      // Being packed
  | 'READY'        // Ready for shipment
  | 'SHIPPED'      // Order completed

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  'CREATED': ['PRODUCTION', 'PROCESSING'], // Can go either way
  'PRODUCTION': ['STOCK'],                 // Must become stock first
  'PROCESSING': ['WASH_REQUEST'],          // Matched to stock
  'WASH_REQUEST': ['WASHING'],
  'WASHING': ['QC_PENDING'],
  'QC_PENDING': ['QC_FAILED', 'FINISHING'],
  'QC_FAILED': ['WASHING'],                // Back to wash
  'FINISHING': ['PACKING'],
  'PACKING': ['READY'],
  'READY': ['SHIPPED'],
  'SHIPPED': []                            // Terminal state
}

export const STATUS_LOCATIONS: Record<ItemStatus1, LocationType[]> = {
  'PRODUCTION': ['PRODUCTION_FLOOR'],
  'STOCK': ['WAREHOUSE'],
  'WASH': ['WASH-STA', 'WASH-IND', 'WASH-ONX', 'WASH-JAG'],
  'QC': ['QC_STATION'],
  'FINISH': ['FINISHING'],
  'PACKING': ['PACKING'],
  'FULFILLMENT': ['SHIPPING'],
  'FULFILLED': ['SHIPPING']
}

export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { valid: boolean; error?: string } {
  const validTransitions = ORDER_STATUS_FLOW[currentStatus]
  if (!validTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid transition from ${currentStatus} to ${newStatus}`
    }
  }
  return { valid: true }
}

export function validateLocationForStatus(
  status: ItemStatus1,
  location: LocationType
): { valid: boolean; error?: string } {
  const validLocations = STATUS_LOCATIONS[status]
  if (!validLocations.includes(location)) {
    return {
      valid: false,
      error: `Invalid location ${location} for status ${status}`
    }
  }
  return { valid: true }
} 