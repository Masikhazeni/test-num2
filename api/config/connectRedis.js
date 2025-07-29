const { createClient } = require("redis");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis connected successfully");
    }
  } catch (err) {
    console.error("Redis connection failed:", err);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
