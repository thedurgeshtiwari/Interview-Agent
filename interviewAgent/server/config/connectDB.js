import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongodbUrl = process.env.MONGODB_URL;
  if (!mongodbUrl) {
    console.error("❌ MONGODB_URL is not defined in environment variables!");
    throw new Error("MONGODB_URL environment variable is missing. Please configure it in Vercel project settings.");
  }

  try {
    cachedConnection = await mongoose.connect(mongodbUrl, {
      bufferCommands: false,
    });
    console.log("✅ MongoDB Database Connected successfully");
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;