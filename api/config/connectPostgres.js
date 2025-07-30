const { Pool } = require("pg");

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });
console.log(`in:${process.env.PORT}`);

const dbConfig = {
  host: "localhost",
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const validateConfig = (config) => {
  const required = ["host", "user", "password", "database", "port"];
  required.forEach((field) => {
    if (!config[field])
      throw new Error(`Missing database ${field} configuration`);
  });
};

validateConfig(dbConfig);

const pool = new Pool(dbConfig);

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

const query = async (text, params) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    console.error("Query failed:", {
      query: text,
      params: params,
      error: err.message,
    });
    throw err;
  } finally {
    if (client) client.release();
  }
};

pool.on("connect", () => console.log("New DB connection"));
pool.on("error", (err) => console.error("Pool error:", err));

process.on("exit", () => pool.end());

module.exports = {
  connectPostgres,
  query,
};



