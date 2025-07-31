const app = require("./app.js");
require("./main.js");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { redisSubscriber, redisClient, connectRedis } = require("./config/connectRedis.js"); 
const socketHandler = require("./sockets/socketHandler.js");

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

const startServer = async () => {
  await connectRedis();

  await redisSubscriber.subscribe("events", async (message) => {
    const data = JSON.parse(message);
    console.log("New Event received from Redis:", data);

    const userId = String(data.user_id);
    const isOnline = await redisClient.sIsMember("activeUsers", userId);

    if (isOnline) {
      io.to(userId).emit("device-event", data);
      console.log(`Message sent to user ${userId}`);
    } else {
      console.log(`User ${userId} is not online. Message not sent.`);
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Real-time Service running on port ${PORT}`);
  });
};

startServer();






