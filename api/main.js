// import dotenv from 'dotenv';
// import { __dirname } from './app.js';
// dotenv.config({path:`${__dirname}/config.env`})

// import { connectPostgres } from './config/connectPostgres.js';
// import { connectRedis } from './config/connectRedis.js';
// import { connectRabbit } from './config/rabbitmq.js';
// import connectMongo from './config/connectMongo.js';
// import './server.js'




// const start = async () => {
//   await connectRabbit();
//   await connectMongo();
//   await connectPostgres();
//   await connectRedis();
//    console.log('All connections established');
 
// };

// start();


const dotenv = require('dotenv');
const path = require('path');
const { connectPostgres } = require('./config/connectPostgres');
const { connectRedis } = require('./config/connectRedis');
const { connectRabbit } = require('./config/rabbitmq');
const connectMongo = require('./config/connectMongo');
require('./server');

// استفاده مستقیم از __dirname که در CommonJS به‌صورت built-in موجوده
dotenv.config({ path: path.join(__dirname, 'config.env') });

const start = async () => {
  await connectRabbit();
  await connectMongo();
  await connectPostgres();
  await connectRedis();
  console.log('All connections established');
};

start();




