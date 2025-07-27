import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisSubscriber = createClient({
  url: process.env.REDIS_URL
});

redisSubscriber.on('error', (err) => {
  console.error('Redis Error:', err);
});

const connectRedis = async () => {
  try {
    if (!redisSubscriber.isOpen) {
      await redisSubscriber.connect();
      console.log('Redis Subscriber connected');
    }
  } catch (err) {
    console.error('Redis connection failed:', err);
    process.exit(1);
  }
};

export { redisSubscriber, connectRedis };
