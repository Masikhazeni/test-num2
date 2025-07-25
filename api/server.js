// server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { connectRabbitMQ } from './services/rabbitmq.js';

dotenv.config({ path: './config.env' });

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('mongodb connected');

    await connectRabbitMQ();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`server is running${PORT}`);
    });

  } catch (err) {
    console.error('server error', err);
    process.exit(1);
  }
};

startServer();

