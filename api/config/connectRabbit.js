import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('events', { durable: true });
    console.log(' RabbitMQ connected');
  } catch (err) {
    console.error(' RabbitMQ connection error:', err);
    process.exit(1);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  return channel;
};