const { createClient } = require("redis");

const redisClient = createClient();
const redisSubscriber = createClient();

let isConnected = false;

const connectRedis = async () => {
  if (isConnected) return; 

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis client connected (commands)");
    }

    if (!redisSubscriber.isOpen) {
      await redisSubscriber.connect();
      console.log("Redis subscriber connected (pub/sub)");
    }

    isConnected = true;
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  redisSubscriber,
  connectRedis,
};




