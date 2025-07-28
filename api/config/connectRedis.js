import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis Subscriber connected');
    }
  } catch (err) {
    console.error('Redis connection failed:', err);
    process.exit(1);
  }
};

export { redisClient, connectRedis };

