import { connectPostgres } from './config/connectPostgres.js';
import { connectRedis } from './config/connectRedis.js';
import { connectRabbit } from './config/rabbitmq.js';
import connectMongo from './config/connectMongo.js';
import dotenv from 'dotenv';
import { __dirname } from './app.js';
import './server.js'
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

dotenv.config({path:`${__dirname}/config.env`})


const start = async () => {
  await connectRabbit();
  await connectMongo();
  await connectPostgres();
  await connectRedis();
   console.log('All connections established');
 
};

start();
