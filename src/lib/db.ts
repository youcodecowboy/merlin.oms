import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

const pool = new Pool({
  connectionString: 'postgresql://postgres.adhaigfqpqcaatinxoah:b3Zkgesy2p7QxE9O@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
})

export const db = drizzle(pool)