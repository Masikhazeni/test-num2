// import Event from '../models/eventModel.js';
// import { publishToQueue } from "../services/rabbitmq.js";

// export const createEvent = async (req, res) => {
//   try {
  
//     const { title, description } = req.body;
//     const newEvent = await Event.create({ 
//       title: title.trim(),
//       description: description.trim()
//     });

//     await publishToQueue({
//       title: newEvent.title,
//       description: newEvent.description,
//     });
//     res.status(201).json({
//       success: true,
//       data: {
//         id: newEvent._id,
//         title: newEvent.title,
//         description: newEvent.description,
//         createdAt: newEvent.createdAt
//       }
//     });

//   } catch (err) {
//     console.error('error at event', err);

//     // خطاهای خاص mongoose
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(el => el.message);
//       return res.status(400).json({
//         success: false,
//         error: errors.join(', ')
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'خطای سرور در پردازش درخواست'
//     });
//   }
// };




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