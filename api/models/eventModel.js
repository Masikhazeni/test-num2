// const mongoose = require("mongoose");

// const eventSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 255,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     pg_id: {
//       type: Number,
//       required: true,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Event", eventSchema);



const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
     device_id: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
