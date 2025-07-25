import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('events', { durable: true });

    console.log('connect to RabbitMQ');
  } catch (err) {
    console.error(' connect to RabbitMQ failed', err);
    process.exit(1);
  }
};

export const publishToQueue = async (data) => {
  if (!channel) throw new Error('کانال RabbitMQ هنوز ایجاد نشده');
  channel.sendToQueue('events', Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};

