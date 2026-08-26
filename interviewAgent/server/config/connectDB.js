import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("error", (err) => {
            console.error("Mongoose connection error:", err.message);
        });
        mongoose.connection.on("disconnected", () => {
            console.warn("Mongoose disconnected");
        });
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("DataBase Connected");
    } catch(error) {
        console.error(`DataBase connection error: ${error.message}`);
    }
};

export default connectDB;