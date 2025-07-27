import redis from '../config/redis.js';

class CacheService {
  // کش کردن رویدادها
  async cacheEvent(eventId, data, ttl = 3600) {
    await redis.set(`event:${eventId}`, JSON.stringify(data), { EX: ttl });
  }

  async publishEvent(data) {
  await redis.publish("events", JSON.stringify(data));
}
  // دریافت رویداد از کش
  async getEvent(eventId) {
    const data = await redis.get(`event:${eventId}`);
    return data ? JSON.parse(data) : null;
  }

  // ابطال کش یک رویداد
  async invalidateEvent(eventId) {
    await redis.del(`event:${eventId}`);
  }
}

export default new CacheService();