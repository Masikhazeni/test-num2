const amqplib = require("amqplib");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });

let connection;
let channel;
let isConnected = false;

const connectRabbit = async () => {
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue("events", { durable: true });

    isConnected = true;
    console.log("RabbitMQ connected successfully");
    return channel;
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
    throw err;
  }
};

const getChannel = () => {
  if (!isConnected || !channel) {
    throw new Error(
      "RabbitMQ connection not established - please call connectRabbit() first"
    );
  }
  return channel;
};

module.exports = {
  connectRabbit,
  getChannel,
};
