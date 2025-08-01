const mongoose = require("mongoose");
const { getChannel, connectRabbit } = require("../config/rabbitmq");
const { connectPostgres, query } = require("../config/connectPostgres");
const { connectRedis } = require("../config/connectRedis");
const Event = require("../models/eventModel");
const { CacheService } = require("../services/cacheService");
const cacheService = new CacheService();

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/events", {
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

    savedEvent=await Event.create({
      temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
    });

     if (channel && msg) {
      channel.ack(msg);
    }
    console.log("Processed:",data);
      const mongoId=savedEvent._id
    await cacheService.cacheEvent(mongoId, {
 temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
timestamp: new Date(),
    });

    await cacheService.publishEvent({
     temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
      timestamp: new Date(),
    });

    console.log("Published to Redis");
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

