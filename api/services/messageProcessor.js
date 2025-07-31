const processMessage = async (msg, { Event, channel, cacheService }) => {
  try {
    const data = JSON.parse(msg.content.toString());

    const savedEvent = await Event.create({
      temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
    });

    channel.ack(msg);

    const mongoId = savedEvent._id;

    await cacheService.cacheEvent(mongoId, {
      temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
      timestamp: new Date(),
    });

    await cacheService.publishEvent({
      temperature: data.temperature,
      humidity: data.humidity,
      user_id: data.user_id,
      device_id: data.device_id,
      timestamp: new Date(),
    });
  } catch (err) {
    channel.nack(msg, false, true);
    throw err;
  }
};

module.exports = { processMessage };
