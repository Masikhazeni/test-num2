// import mongoose from "mongoose";
// import { getChannel, connectRabbit } from "../config/rabbitmq.js";
// import { query } from "../config/connectPostgres.js";
// import Event from "../models/eventModel.js";
// import CacheService from '../services/cacheService.js'

// const mongoConnect = async () => {
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
//     console.log(pgResult.rows[0]);
//      const pgId=pgResult.rows[0].id
//     await Event.create({
//       title: data.title,
//       description: data.description,
//       pg_id:pgId ,
//     });

//     channel.ack(msg);
//     console.log("Processed:", data.title);
//     // پاک کردن کش لیست ایونت‌ها و ایونت تکی
//     await CacheService.invalidateEvent("all"); // فرضاً کلید لیست
//     await CacheService.invalidateEvent(pgId);  // ایونت تکی

//     // به‌روزرسانی کش با داده جدید
//     await CacheService.cacheEvent(pgId, {
//       title: data.title,
//       description: data.description,
//       pg_id: pgId,
//       timestamp: new Date(),
//     });

//       // انتشار پیام real-time
//     await CacheService.publishEvent({
//       title: data.title,
//       description: data.description,
//       pg_id: pgId,
//       timestamp: new Date(),
//     });
//     console.log(" Published to Redis:", data.title);
//   } catch (err) {
//     console.error("Error:", err.message);
//     channel.nack(msg, false, true);
//   }
// };

// const startConsumer = async () => {
//   await connectRabbit();
//   const channel = getChannel();
//   channel.consume("events", processMessage);
//   console.log("Consumer started");
// };

// (async () => {
//   await mongoConnect();
//   await startConsumer();
// })();



import mongoose from "mongoose";
import { getChannel, connectRabbit } from "../config/rabbitmq.js";
import { connectPostgres } from "../config/connectPostgres.js"; // اضافه شد
import { connectRedis } from "../config/connectRedis.js";       // اضافه شد
import { query } from "../config/connectPostgres.js";
import Event from "../models/eventModel.js";
import { CacheService } from "../services/cacheService.js";

const cacheService = new CacheService();

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/event-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
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
    console.log("✅ Processed:", data.title);

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

    console.log("📢 Published to Redis:", data.title);
  } catch (err) {
    console.error("❌ Error processing message:", err.message);
    channel.nack(msg, false, true);
  }
};

const startConsumer = async () => {
  await connectPostgres();     // ✅ اضافه شد
  await connectRedis();        // ✅ اضافه شد
  await connectRabbit();
  const channel = getChannel();
  channel.consume("events", processMessage);
  console.log("🚀 Consumer started");
};

(async () => {
  await connectMongo();        // ✅ MongoDB اتصال اولیه
  await startConsumer();       // ✅ راه‌اندازی باقی سرویس‌ها و مصرف‌کننده
})();
