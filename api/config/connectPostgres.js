import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: String(process.env.PGPASSWORD),
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: false,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectPostgres = async () => {
  try {
    await pool.connect();
    console.log('✅ PostgreSQL connected');
    return pool;
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(1);
  }
};

export default pool;