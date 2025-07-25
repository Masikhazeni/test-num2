import amqplib from 'amqplib';

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    
    // Check if queue exists and get its arguments
    const queueInfo = await channel.checkQueue('events').catch(() => null);
    
    // If queue exists with different arguments, delete it
    if (queueInfo && (!queueInfo.messageTtl || queueInfo.messageTtl !== 86400000)) {
      await channel.deleteQueue('events');
      console.log('Deleted existing queue with incompatible arguments');
    }
    
    // Create queue with desired parameters
    await channel.assertQueue('events', {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000 // 24 hours
      }
    });
    
    console.log('✅ RabbitMQ connected and queue configured');
    return channel;
  } catch (err) {
    console.error('❌ RabbitMQ connection error:', err);
    throw err;
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  channel = null;
  connection = null;
};