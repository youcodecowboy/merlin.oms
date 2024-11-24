import { supabase, supabaseAdmin } from './supabase'
import { db } from './db'

export async function testDatabaseConnection() {
  try {
    // Test Supabase regular client
    const { data: regularData, error: regularError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (regularError) {
      throw new Error(`Regular client error: ${regularError.message}`)
    }

    // Test Supabase admin client
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(1)

    if (adminError) {
      throw new Error(`Admin client error: ${adminError.message}`)
    }

    // Test Drizzle connection
    const client = await db.execute(sql`SELECT NOW()`)

    return {
      success: true,
      message: 'All database connections successful',
      regularData,
      adminData,
      timestamp: client[0].now
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}