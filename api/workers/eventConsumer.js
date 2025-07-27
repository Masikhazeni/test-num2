import mongoose from "mongoose";
import { getChannel, connectRabbit } from "../config/rabbitmq.js";
import { query } from "../config/connectPostgres.js";
import Event from "../models/eventModel.js";
import redisClient from "../config/connectRedis.js";

const mongoConnect = async () => {
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
    console.log(pgResult.rows[0]);

    await Event.create({
      title: data.title,
      description: data.description,
      pg_id: pgResult.rows[0].id,
    });

    channel.ack(msg);
    console.log("Processed:", data.title);

    await redisClient.publish(
      "events",
      JSON.stringify({
        title: data.title,
        description: data.description,
        pg_id: pgResult.rows[0].id,
        timestamp: new Date(),
      })
    );
    console.log(" Published to Redis:", data.title);
  } catch (err) {
    console.error("Error:", err.message);
    channel.nack(msg, false, true);
  }
};

const startConsumer = async () => {
  await connectRabbit();
  const channel = getChannel();
  channel.consume("events", processMessage);
  console.log("Consumer started");
};

(async () => {
  await mongoConnect();
  await startConsumer();
})();
