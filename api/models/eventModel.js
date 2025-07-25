import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "عنوان الزامی است"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "توضیحات الزامی است"],
    trim: true,
  },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
