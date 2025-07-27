import express from 'express';
import { createEvent } from '../controllers/eventControllers.js';
import { body } from 'express-validator';
import checkValidation from '../Middleware/checkValidation.js';
import { getEventById } from '../controllers/getEventController.js';

const eventRouter = express.Router();
const createEventValidation=[
    body('title').notEmpty().withMessage(' عنوان نباید خالی باشد'),
    body('description').notEmpty().withMessage('توضیحات نباید خالی باشد'),
]
const getEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('شناسه الزامی است'),
];

eventRouter.post('/', createEventValidation,checkValidation,createEvent);

eventRouter.get('/:id',getEventValidation,checkValidation,getEventById);

export default eventRouter;
