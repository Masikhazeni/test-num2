const { redisClient } = require("../config/connectRedis");
const { CacheService } = require("../services/cacheService");
const socketUserMap = new Map();
const cacheService = new CacheService();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("register", async (userId) => {
      try {
        userId = String(userId);

        console.log(`User ${userId} registered with socket ${socket.id}`);
        await redisClient.sAdd("activeUsers", userId);
        socketUserMap.set(socket.id, userId);
        socket.join(userId);
        const userData = await getAllUserData(userId);
        console.log("User initial data:", userData);
        socket.emit("user-data", userData);
      } catch (error) {
        console.error("Error in register handler:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const userId = socketUserMap.get(socket.id);

        if (userId) {
          await redisClient.sRem("activeUsers", userId);
          socketUserMap.delete(socket.id);
          console.log(`User ${userId} disconnected`);
        } else {
          console.log(`Socket ${socket.id} disconnected (no user registered)`);
        }
      } catch (error) {
        console.error("Error in disconnect handler:", error);
      }
    });
  });
};


async function getAllUserData(userId) {
  try {
    const events = await cacheService.getUserEvents(userId);
    return events;
  } catch (error) {
    console.error(" Error in getAllUserData:", error);
    return [];
  }
}






