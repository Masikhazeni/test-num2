const express = require("express");
const { body, param } = require("express-validator");
const {
  createEvent,
  getEventById,
} = require("../controllers/eventControllers");
const checkValidation = require("../Middleware/checkValidation");

const eventRouter = express.Router();

const createEventValidation = [
  body("title").notEmpty().withMessage("عنوان نباید خالی باشد"),
  body("description").notEmpty().withMessage("توضیحات نباید خالی باشد"),
];

const getEventValidation = [
  param("id").notEmpty().withMessage("شناسه الزامی است"),
];

eventRouter.post("/", createEventValidation, checkValidation, createEvent);

eventRouter.get("/:id", getEventValidation, checkValidation, getEventById);

module.exports = eventRouter;
