// import mongoose from "mongoose";
// import { getChannel, connectRabbit } from "../config/rabbitmq.js";
// import { connectPostgres } from "../config/connectPostgres.js"; 
// import { connectRedis } from "../config/connectRedis.js";    
// import { query } from "../config/connectPostgres.js";
// import Event from "../models/eventModel.js";
// import { CacheService } from "../services/cacheService.js";

// const cacheService = new CacheService();

// const connectMongo = async () => {
//   try {
//     await mongoose.connect("mongodb://localhost:27017/event-db", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//     process.exit(1);
//   }
// };

// const processMessage = async (msg) => {
//   const channel = getChannel();

//   try {
//     const data = JSON.parse(msg.content.toString());

//     const pgResult = await query(
//       "INSERT INTO events(title, description) VALUES($1, $2) RETURNING id",
//       [data.title, data.description]
//     );

//     const pgId = pgResult.rows[0].id;

//     await Event.create({
//       title: data.title,
//       description: data.description,
//       pg_id: pgId,
//     });

//     channel.ack(msg);
//     console.log("Processed:", data.title);

//     await cacheService.invalidateEvent("all");
//     await cacheService.invalidateEvent(pgId);

//     await cacheService.cacheEvent(pgId, {
//       title: data.title,
//       description: data.description,
//       pg_id: pgId,
//       timestamp: new Date(),
//     });

//     await cacheService.publishEvent({
//       title: data.title,
//       description: data.description,
//       pg_id: pgId,
//       timestamp: new Date(),
//     });

//     console.log("Published to Redis:", data.title);
//   } catch (err) {
//     console.error("Error processing message:", err.message);
//     channel.nack(msg, false, true);
//   }
// };

// const startConsumer = async () => {
//   await connectPostgres();     
//   await connectRedis();        
//   await connectRabbit();
//   const channel = getChannel();
//   channel.consume("events", processMessage);
//   console.log("Consumer started");
// };

// (async () => {
//   await connectMongo();        
//   await startConsumer();       
// })();


const mongoose = require("mongoose");
const { getChannel, connectRabbit } = require("../config/rabbitmq");
const { connectPostgres, query } = require("../config/connectPostgres");
const { connectRedis } = require("../config/connectRedis");
const Event = require("../models/eventModel");
const { CacheService } = require("../services/cacheService");

const cacheService = new CacheService();

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/event-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const processMessage = async (msg) => {
  const channel = getChannel();

  try {
    const data = JSON.parse(msg.content.toString());

    const pgResult = await query(
      "INSERT INTO events(title, description) VALUES($1, $2) RETURNING id",
      [data.title, data.description]
    );

    const pgId = pgResult.rows[0].id;

    await Event.create({
      title: data.title,
      description: data.description,
      pg_id: pgId,
    });

    channel.ack(msg);
    console.log("Processed:", data.title);

    await cacheService.invalidateEvent("all");
    await cacheService.invalidateEvent(pgId);

    await cacheService.cacheEvent(pgId, {
      title: data.title,
      description: data.description,
      pg_id: pgId,
      timestamp: new Date(),
    });

    await cacheService.publishEvent({
      title: data.title,
      description: data.description,
      pg_id: pgId,
      timestamp: new Date(),
    });

    console.log("Published to Redis:", data.title);
  } catch (err) {
    console.error("Error processing message:", err.message);
    channel.nack(msg, false, true);
  }
};

const startConsumer = async () => {
  await connectPostgres();
  await connectRedis();
  await connectRabbit();
  const channel = getChannel();
  channel.consume("events", processMessage);
  console.log("Consumer started");
};

(async () => {
  await connectMongo();
  await startConsumer();
})();


