import { publishToQueue } from "../services/rabbitmq.js";

export const createEvent = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'عنوان و توضیحات الزامی هستند' });
  }

  try {
    await publishToQueue({ title, description });
    res.status(200).json({ message: 'داده به صف ارسال شد' });
  } catch (err) {
    console.error(' خطا در ارسال به صف:', err);
    res.status(500).json({ error: 'خطای داخلی سرور' });
  }
};
