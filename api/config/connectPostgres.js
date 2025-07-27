// 📁 config/connectPostgres.js
import pg from 'pg';

const { Pool } = pg;

const dbConfig = {
  host: 'localhost',
  user: 'dp_user',
  password: '123456',
  database: 'datapipeline',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// بررسی صحت کانفیگ
const validateConfig = (config) => {
  const required = ['host', 'user', 'password', 'database', 'port'];
  required.forEach(field => {
    if (!config[field]) throw new Error(`Missing database ${field} configuration`);
  });
};

validateConfig(dbConfig);

const pool = new Pool(dbConfig);

// ✅ تابع اتصال اولیه برای تست اتصال
export const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1'); // تست ساده
    client.release();
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

// 🔄 اجرای کوئری
export const query = async (text, params) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    console.error('Query failed:', {
      query: text,
      params: params,
      error: err.message
    });
    throw err;
  } finally {
    if (client) client.release();
  }
};

// لاگ‌های اتصال و خطا
pool.on('connect', () => console.log('New DB connection'));
pool.on('error', (err) => console.error('Pool error:', err));

process.on('exit', () => pool.end());
