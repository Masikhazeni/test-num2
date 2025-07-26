import dotenv from 'dotenv';
import app from './app.js';
import connectMongo from './config/connectMongo.js';
import { connectRabbit } from './config/rabbitmq.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongo();
    console.log(' MongoDB connected');

    
    await connectRabbit();
    console.log('RabbitMQ connected');

    
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` API Docs: http://localhost:${PORT}/api-docs`);
    });

  } catch (err) {
    console.error(' Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
