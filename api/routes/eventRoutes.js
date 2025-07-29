// import express from 'express';
// import { createEvent,getEventById } from '../controllers/eventControllers.js';
// import { body, param } from 'express-validator';
// import checkValidation from '../Middleware/checkValidation.js';

// const eventRouter = express.Router();
// const createEventValidation=[
//     body('title').notEmpty().withMessage(' عنوان نباید خالی باشد'),
//     body('description').notEmpty().withMessage('توضیحات نباید خالی باشد'),
// ]
// const getEventValidation = [
//   param('id')
//     .notEmpty()
//     .withMessage('شناسه الزامی است'),
// ];

// eventRouter.post('/', createEventValidation,checkValidation,createEvent);

// eventRouter.get('/:id',getEventValidation,checkValidation,getEventById);

// export default eventRouter;

const express = require('express');
const { body, param } = require('express-validator');
const { createEvent, getEventById } = require('../controllers/eventControllers');
const checkValidation = require('../Middleware/checkValidation');

const eventRouter = express.Router();

// Validation middleware arrays
const createEventValidation = [
  body('title')
    .notEmpty()
    .withMessage('عنوان نباید خالی باشد'),
  body('description')
    .notEmpty()
    .withMessage('توضیحات نباید خالی باشد')
];

const getEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('شناسه الزامی است')
];

// Routes
eventRouter.post(
  '/',
  createEventValidation,
  checkValidation,
  createEvent
);

eventRouter.get(
  '/:id',
  getEventValidation,
  checkValidation,
  getEventById
);

module.exports = eventRouter;



