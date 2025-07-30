const { getChannel } = require("../config/rabbitmq");

const publishToQueue = async (data) => {
  try {
    const channel = getChannel();
    const sent = channel.sendToQueue(
      "events",
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
        headers: {
          "retry-count": 0,
        },
      }
    );

    if (!sent) {
      throw new Error("Message could not be sent");
    }

    console.log("Event queued:", data.title);
  } catch (err) {
    console.error("Failed to queue event:", err);
    throw err;
  }
};

module.exports = { publishToQueue };


