import { publishToQueue } from '../services/queue.js';

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