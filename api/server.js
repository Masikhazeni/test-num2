import dotenv from 'dotenv';
import app from './app.js';
import { connectRabbitMQ } from './config/connectRabbit.js';
import connectMongo from './config/connectMongo.js';
import { connectPostgres } from './config/connectPostgres.js';

dotenv.config({ path: './config.env' });

const startServer = async () => {
  try {
    
    await connectMongo()
    await connectPostgres()
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

