import dotenv from "dotenv";
import Event from "../models/Event.js";
import connectMongo from "../config/connectMongo.js";
import { connectRabbitMQ, getChannel } from "../config/connectRabbit.js";

dotenv.config({ path: "./config.env" });

const startConsumer = async () => {
  try {
    await connectMongo();
    await connectRabbitMQ();
    const channel = getChannel();

    console.log(" waiting...");

    channel.consume("events", async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await Event.create(data);
          console.log("message saved", data);
          channel.ack(msg);
        } catch (err) {
          console.error("saving message error", err);
        }
      }
    });
  } catch (err) {
    console.error("consumer error", err);
    process.exit(1);
  }
};

startConsumer();
