// import dotenv from 'dotenv';
// import app from './app.js';
// import connectMongo from './config/connectMongo.js';
// import { connectRabbit } from './config/rabbitmq.js';

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectMongo();
//     console.log(' MongoDB connected');

    
//     await connectRabbit();
//     console.log('RabbitMQ connected');

    
//     app.listen(PORT, () => {
//       console.log(` Server running on port ${PORT}`);
//       console.log(` API Docs: http://localhost:${PORT}/api-docs`);
//     });

//   } catch (err) {
//     console.error(' Server startup failed:', err);
//     process.exit(1);
//   }
// };

// startServer();



import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { redisSubscriber, connectRedis } from './config/connectRedis.js';
import socketHandler from './sockets/socketHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // اگر داری با فرانت خاص کار می‌کنی، اینو تغییر بده
    methods: ['GET', 'POST']
  }
});

// مدیریت اتصال کلاینت‌ها
socketHandler(io);

// اتصال به Redis و گوش دادن به کانال 'events'
const startServer = async () => {
  await connectRedis();

  await redisSubscriber.subscribe('events', (message) => {
    const data = JSON.parse(message);
    console.log('New Event received from Redis:', data);

    // ارسال به تمام کاربران متصل
    io.emit('new-event', data);
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Real-time Service running on port ${PORT}`);
  });
};

startServer();

