import pg from 'pg';

const { Pool } = pg;
const dbConfig = {
  host: 'localhost',      // آدرس سرور PostgreSQL
  user: 'dp_user',        // نام کاربری
  password: '123456',     // رمز عبور
  database: 'datapipeline', // نام دیتابیس
  port: 5432,             // پورت پیش‌فرض
  max: 10,                // حداکثر اتصال همزمان
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};
const validateConfig = (config) => {
  const required = ['host', 'user', 'password', 'database', 'port'];
  required.forEach(field => {
    if (!config[field]) throw new Error(`Missing database ${field} configuration`);
  });
};

validateConfig(dbConfig);

const pool = new Pool(dbConfig);
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

pool.on('connect', () => console.log('New DB connection'));
pool.on('error', (err) => console.error('Pool error:', err));

process.on('exit', () => pool.end());