import cacheService from '../services/cacheService.js';

export const getEvent = async (req, res) => {
  const { id } = req.params;

  // ۱. چک کش
  const cachedEvent = await cacheService.getEvent(id);
  if (cachedEvent) {
    return res.json(cachedEvent);
  }

  // ۲. دریافت از دیتابیس
  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // ۳. ذخیره در کش
  await cacheService.cacheEvent(id, event);
  res.json(event);
};


export const updateEvent = async (req, res) => {
  const { id } = req.params;
  
  // ۱. آپدیت در دیتابیس
  await Event.updateOne({ _id: id }, req.body);

  // ۲. ابطال کش
  await cacheService.invalidateEvent(id);

  res.json({ success: true });
};