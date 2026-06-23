import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/simonx';
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected successfully!`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('⚠️ Server will continue to run, but database queries may fail or hang.');
  }
};
