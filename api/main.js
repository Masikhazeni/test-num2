const dotenv = require("dotenv");
const path = require("path");
const { connectPostgres } = require("./config/connectPostgres");
const { connectRedis } = require("./config/connectRedis");
const { connectRabbit } = require("./config/rabbitmq");
const connectMongo = require("./config/connectMongo");
require("./server");

dotenv.config({ path: path.join(__dirname, "config.env") });

const start = async () => {
  await connectRabbit();
  await connectMongo();
  await connectPostgres();
  await connectRedis();
  console.log("All connections established");
};

start();
