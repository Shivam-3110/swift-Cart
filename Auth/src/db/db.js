import mongoose from "mongoose";

async function connectDb () {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Databse connected Successfully")
    } catch (error) {
        console.error("databse connection failed",err);
    }
}
export default connectDb;