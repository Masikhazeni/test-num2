import { publishToQueue } from '../services/queue.js';
import { redisClient } from '../config/connectRedis.js';
import Event from '../models/eventModel.js'

export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    await publishToQueue({ title, description });
    
    res.status(202).json({ 
      status: 'queued',
      message: 'Event is being processed' 
    });

  } catch (err) {
    console.error('Controller error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getEventById = async (req, res) => {
  const { id } = req.params;
  const redisKey = `event:${id}`;

  try {
    const cached = await redisClient.get(redisKey);

    if (cached) {
      console.log('Cache HIT - Served from Redis');
      return res.status(200).json({
        success:true,
        data:JSON.parse(cached),
        message:"Cache HIT - Served from Redis"
      });
    } else {
      console.log('Cache MISS - Fetching from DBs');
    }

    const pgResult = await query(
      'SELECT id, title, description FROM events WHERE id = $1',
      [id]
    );

    if (pgResult.rows.length === 0) {
      return res.status(404).json({ success:false,message:'not finde' });
    }

    const eventFromPG = pgResult.rows[0];
    const eventFromMongo = await Event.findOne({ pg_id: eventFromPG.id }).lean();

    if (!eventFromMongo) {
      console.warn('MongoDB record not found for pg_id:', eventFromPG.id);
    }

    const fullEvent = {
      ...eventFromPG,
      mongo_id: eventFromMongo?._id || null,
      createdAt: eventFromMongo?.createdAt || null,
      updatedAt: eventFromMongo?.updatedAt || null,
    };

    // ذخیره در Redis برای دفعات بعد (مثلاً 1 ساعت)
    await redisClient.set(redisKey, JSON.stringify(fullEvent), { EX: 3600 });
    console.log('Stored in Redis:', redisKey);
    res.status(200).json({
      success:true,
      data:fullEvent,
      message:'saved from postgreSQL,Monodb'
    });

  } catch (err) {
    console.error('Error in getEventById:', err.message);
    res.status(500).json({ success:false,message: 'خطای داخلی سرور' });
  }
};