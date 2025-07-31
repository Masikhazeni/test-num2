const { redisClient } = require("../config/connectRedis");

const socketUserMap = new Map(); 

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("register", async (userId) => {
      console.log(`User ${userId} registered with socket ${socket.id}`);

      await redisClient.sAdd("activeUsers", String(userId));      
      socketUserMap.set(socket.id, String(userId));              
      socket.join(String(userId));                             
    });

    socket.on("disconnect", async () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        await redisClient.sRem("activeUsers", userId);         
        socketUserMap.delete(socket.id);                        
        console.log(`User ${userId} disconnected`);
      } else {
        console.log(`Socket ${socket.id} disconnected (no user registered)`);
      }
    });
  });
};


