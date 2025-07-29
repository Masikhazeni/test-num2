// import mongoose from 'mongoose';

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 255
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   pg_id: {
//     type: Number,
//     required: true,
//     index: true
//   }
// }, { timestamps: true });

// export default mongoose.model('Event', eventSchema);


const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true
  },
  pg_id: {
    type: Number,
    required: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
