import redisClient from '../config/connectRedis.js';

const testSub = async () => {
  const subscriber = redisClient.duplicate(); // باید clone بگیری
  await subscriber.connect();

  await subscriber.subscribe('events', (message) => {
    console.log(' Message from Redis channel:', JSON.parse(message));
  });

  console.log('🔊 Subscribed to Redis channel "events"');
};

testSub();
