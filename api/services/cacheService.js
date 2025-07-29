
// import { redisClient } from "../config/connectRedis.js";

// export class CacheService {
//   async cacheEvent(eventId, data, ttl = 3600) {
//     await redisClient.set(`event:${eventId}`, JSON.stringify(data), { EX: ttl });
//   }

//   async publishEvent(data) {
//     await redisClient.publish("events", JSON.stringify(data));
//   }

//   async getEvent(eventId) {
//     const data = await redisClient.get(`event:${eventId}`);
//     return data ? JSON.parse(data) : null;
//   }

//   async invalidateEvent(eventId) {
//     await redisClient.del(`event:${eventId}`);
//   }
// }

const { redisClient } = require("../config/connectRedis");

class CacheService {
  async cacheEvent(eventId, data, ttl = 3600) {
    await redisClient.set(`event:${eventId}`, JSON.stringify(data), { EX: ttl });
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
}

module.exports = { CacheService };