import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Test database access with authenticated session
    const { data, error: dbError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (dbError) {
      console.error('Database test failed:', dbError)
      throw dbError
    }

    return { 
      success: true,
      message: 'Connected successfully to Supabase',
      data
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred during connection test'
    }
  }
}