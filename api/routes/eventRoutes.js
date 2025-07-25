import express from 'express';
import { createEvent } from '../controllers/eventControllers.js';
import { body } from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';

const eventRouter = express.Router();
const createUserValidation=[
    body('title').notEmpty().withMessage(' عنوان نباید خالی باشد'),
    body('description').notEmpty().withMessage('توضسحات نباید خالی باشد'),
]

eventRouter.post('/events', checkValidation,createEvent);

export default eventRouter;
