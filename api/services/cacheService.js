import { redisClient } from "../config/connectRedis.js";

class CacheService {
  // کش کردن رویدادها
  async cacheEvent(eventId, data, ttl = 3600) {
    await redisClient.set(`event:${eventId}`, JSON.stringify(data), { EX: ttl });
  }

  async publishEvent(data) {
  await redisClient.publish("events", JSON.stringify(data));
}
  // دریافت رویداد از کش
  async getEvent(eventId) {
    const data = await redisClient.get(`event:${eventId}`);
    return data ? JSON.parse(data) : null;
  }

  // ابطال کش یک رویداد
  async invalidateEvent(eventId) {
    await redisClient.del(`event:${eventId}`);
  }
}

export default new CacheService();