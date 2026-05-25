import mongoose from 'mongoose';

let cached = null;

const connectDB = async () => {
  if (cached) return cached;
  try {
    cached = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${cached.connection.host}`);
    return cached;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectDB;
