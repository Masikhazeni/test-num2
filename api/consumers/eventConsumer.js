import { connectRabbitMQ, getChannel } from "../config/connectRabbit.js";
import pool from "../config/connectPostgres.js";

const startConsumer = async () => {
  try {
    await connectRabbitMQ();
    const channel = getChannel();
    await channel.prefetch(10);

    console.log("Listening for messages...");

    channel.consume("events", async (msg) => {
      if (!msg) return;

      try {
        const { title, description } = JSON.parse(msg.content.toString());
        const res = await pool.query(
          "INSERT INTO events(title, description) VALUES($1, $2) RETURNING *",
          [title, description]
        );

        console.log("💾 Saved event:", res.rows[0].id);
        channel.ack(msg);
      } catch (err) {
        console.error("Error processing message:", err);
        channel.nack(msg, false, false);
      }
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      await channel.close();
      process.exit(0);
    });
  } catch (err) {
    console.error("Fatal consumer error:", err);
    process.exit(1);
  }
};

startConsumer();
