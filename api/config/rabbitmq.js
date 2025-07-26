import amqplib from 'amqplib';

let connection;
let channel;

export const connectRabbit = async () => {
  try {
    connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.deleteQueue('events').catch(() => {});
    await channel.assertQueue('events', { durable: true });
    
    console.log('RabbitMQ connected');
    return channel;
  } catch (err) {
    console.error('RabbitMQ connection failed:', err);
    throw err;
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error(' please first start rabbitMQ');
  }
  return channel;
};