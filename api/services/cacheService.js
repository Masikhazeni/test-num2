const { redisClient } = require("../config/connectRedis");

class CacheService {
  async cacheEvent(eventId, data, ttl = 3600) {
    const eventKey = `event:${eventId}`;
    const userEventKey = `user_id:${data.user_id}:events:${eventId}`;
    await redisClient.set(eventKey, JSON.stringify(data), { EX: ttl });
    await redisClient.set(userEventKey, JSON.stringify(data), { EX: ttl });
  }

  async publishEvent(data) {
    await redisClient.publish("events", JSON.stringify(data));
  }

  async getEvent(eventId) {
    const data = await redisClient.get(`event:${eventId}`);
    return data ? JSON.parse(data) : null;
  }

  async invalidateEvent(eventId) {
    await redisClient.del(`event:${eventId}`);
  }

async getUserEvents(userId) {
  const keys = await redisClient.keys(`user_id:${userId}:events:*`);
  const events = [];

  for (const key of keys) {
    const value = await redisClient.get(key);
    if (value) {
      try {
        events.push(JSON.parse(value));
      } catch (err) {
        console.warn(`JSON parse failed for key ${key}:`, err.message);
      }
    }
  }

  return events;
}

}

module.exports = { CacheService };




