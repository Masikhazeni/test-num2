const { publishToQueue } = require("../services/queue.js");
const { redisClient } = require("../config/connectRedis.js");
const Event = require("../models/eventModel.js");
const { query } = require("../config/connectPostgres.js");

const createEvent = async (req, res) => {
  try {
    const { temperature, humidity, user_id, device_id } = req.body;
    const checkDeviceQuery = `
      SELECT id FROM devices
      WHERE id = $1 AND user_id = $2
      LIMIT 1;
    `;
    const { rows } = await query(checkDeviceQuery, [device_id, user_id]);

    if (rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No device found for the given user_id and device_id",
      });
    }
    await publishToQueue({ temperature, humidity, user_id, device_id });

    return res.status(202).json({
      status: "queued",
      message: "Event is being processed",
    });
  } catch (err) {
    console.error("Controller error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;

  const eventFromMongo = await Event.findById(id)
  if(!eventFromMongo){
    return res.status(404).json({
      success:false,
      message:'not-existent'
    })
  }
  const redisKey = `event:${id}`;

  try {
    const cached = await redisClient.get(redisKey);

    if (cached) {
      console.log("Cache HIT - Served from Redis");
      return res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        message: "Cache HIT - Served from Redis",
      });
    } else {
      console.log("Cache MISS - Fetching from DBs");
    }

    await redisClient.set(redisKey, JSON.stringify(eventFromMongo), { EX: 3600 });
    console.log("Stored in Redis:", redisKey);
    res.status(200).json({
      success: true,
      data: eventFromMongo,
      message: "saved from postgreSQL, MongoDB",
    });
  } catch (err) {
    console.error("Error in getEventById:", err.message);
    res.status(500).json({ success: false, message: "خطای داخلی سرور" });
  }
};

module.exports = {
  createEvent,
  getEventById,
};



