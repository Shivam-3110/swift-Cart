import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI) 
    console.log('Connected to Payment database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}
export default connectDB;