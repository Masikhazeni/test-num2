const express = require("express");
const { body, param } = require("express-validator");
const {
  createEvent,
  getEventById,
} = require("../controllers/eventControllers");
const checkValidation = require("../Middleware/checkValidation");

const eventRouter = express.Router();

const createEventValidation = [
  body("humidity").notEmpty().withMessage("مقدار رطوبت نباید خالی باشد").bail()
  .isNumeric().withMessage("رطوبت باید یک عدد باشد"),

  body("temperature").notEmpty().withMessage("مقدار دما نباید خالی باشد").bail()
  .isNumeric().withMessage("دما باید یک عدد باشد"),
  
  
  body("user_id").notEmpty().withMessage("مقدار شماره کاربری نباید خالی باشد").bail()
  .isNumeric().withMessage("شماره کاربری باید یک عدد باشد"),
  
  body("device_id").notEmpty().withMessage("سریال دستگاه دما نباید خالی باشد").bail()
  .isNumeric().withMessage("سریال دستگاه باید یک عدد باشد"),
];

const getEventValidation = [
  param("id").notEmpty().withMessage("شناسه الزامی است"),
];

eventRouter.post("/", createEventValidation, checkValidation, createEvent);

eventRouter.get("/:id", getEventValidation, checkValidation, getEventById);

module.exports = eventRouter;
