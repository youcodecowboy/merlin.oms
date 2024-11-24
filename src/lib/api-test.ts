import { supabase } from './supabase'
import { getNextOrderNumber, createCustomer, createOrder, acceptProductionRequest, getBatches } from './core-functions'

/**
 * Test core API functions
 * @returns Promise<boolean> True if all tests pass
 */
export async function testCoreFunctions() {
  try {
    // Test getNextOrderNumber
    const nextNumber = await getNextOrderNumber()
    console.log('Next order number:', nextNumber)

    // Test createCustomer
    const customer = await createCustomer({
      email: `test${Date.now()}@example.com`,
      name: 'Test Customer'
    })
    console.log('Created customer:', customer)

    // Test createOrder
    const order = await createOrder({
      customer_id: customer.id,
      order_status: 'PENDING',
      items: [{
        sku: 'TEST-SKU',
        style: 'ST',
        waist: 32,
        shape: 'S',
        inseam: 32,
        wash: 'RAW',
        hem: 'STH',
        quantity: 1
      }]
    })
    console.log('Created order:', order)

    // Test getBatches
    const { items: batches } = await getBatches({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    console.log('Retrieved batches:', batches)

    return true
  } catch (error) {
    console.error('Core functions test failed:', error)
    return false
  }
}