import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config({ path: './config.env' });

const startConsumer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('mongodb connected');

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('events', { durable: true });

    console.log(' waiting...');

    channel.consume('events', async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await Event.create(data);
          console.log('message saved', data);
          channel.ack(msg);
        } catch (err) {
          console.error('saving message error', err);
        }
      }
    });
  } catch (err) {
    console.error('consumer error', err);
    process.exit(1);
  }
};

startConsumer();

