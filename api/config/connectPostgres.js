// config/connectPostgres.js
import pg from 'pg';


const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

export const connectPostgres = async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL connected');
    return pool;
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    process.exit(1);
  }
};

export default pool;