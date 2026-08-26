import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected successfully");
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
};


export default connectDB