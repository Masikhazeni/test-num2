import { getChannel } from "../config/connectRabbit.js";

export const publishToQueue = async (data) => {
  const channel = getChannel();
  if (!channel) throw new Error("کانال RabbitMQ هنوز ایجاد نشده");
  channel.sendToQueue("events", Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
