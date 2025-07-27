import express from 'express'
import eventRouter from './routes/eventRoutes.js';
import path from 'path'
import { fileURLToPath } from 'url'

const __filename=fileURLToPath(import.meta.url)
export const __dirname=path.dirname(__filename)

const app=express()
app.use(express.json());

app.use('/api/events',eventRouter)
app.use('not exist', (req, res) => {
  res.status(404).json({ error: 'آدرس مورد نظر یافت نشد' });
})

export default app



