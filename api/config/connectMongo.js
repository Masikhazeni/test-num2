// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config({ path: "./config.env" });

// const connectMongo = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error(" MongoDB connection error:", err);
//     process.exit(1);
//   }
// };

// export default connectMongo;


import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectMongo;

