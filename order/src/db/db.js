import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Order Service DB Connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;