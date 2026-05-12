import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionConfig = process.env.PGPASSWORD
  ? {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'Hotel',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
    }
  : {
      connectionString: process.env.DATABASE_URL,
    }

export const pool = new pg.Pool(connectionConfig)

export async function testConnection() {
  const result = await pool.query('SELECT NOW() AS server_time')
  return result.rows[0]
}
