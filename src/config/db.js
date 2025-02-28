import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI 

export const connectDB = async () => {
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error('Failed to connect to MongoDB Atlas:', err);
      process.exit(1); // Exit the application in case of error
    }
  };