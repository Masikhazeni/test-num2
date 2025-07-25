import express from 'express'
import eventRouter from './routes/eventRoutes.js';

const app=express()
app.use(express.json());

app.use('/api/events',eventRouter)
app.use('not exist', (req, res) => {
  res.status(404).json({ error: 'آدرس مورد نظر یافت نشد' });
})

export default app



