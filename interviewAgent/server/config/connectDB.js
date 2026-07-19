import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DataBase Connected")
    } catch(error){
        console.log(`DataBase error ${error}`)
    }
}


export default connectDB