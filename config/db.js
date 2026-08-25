const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevents queries from hanging when DB isn't connected yet
      serverSelectionTimeoutMS: 5000, // Fails fast (5s) instead of timing out Vercel
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    throw err;
  }
};

module.exports = connectDB;