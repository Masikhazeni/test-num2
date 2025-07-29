const app = require('./app.js');
require('./main.js');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { redisClient, connectRedis } = require('./config/connectRedis.js');
const socketHandler = require('./sockets/socketHandler.js');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// مدیریت اتصال کلاینت‌ها
socketHandler(io);

// اتصال به Redis و گوش دادن به کانال 'events'
const startServer = async () => {
  await connectRedis();

  await redisClient.subscribe('events', (message) => {
    const data = JSON.parse(message);
    console.log('New Event received from Redis:', data);

    io.emit('new-event', data);
  });

  const PORT = process.env.PORT;
  console.log(PORT);
  server.listen(PORT, () => {
    console.log(`Real-time Service running on port ${PORT}`);
  });
};

startServer();
