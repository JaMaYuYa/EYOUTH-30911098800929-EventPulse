const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 🔍 Debug log: Print the URI (masking password) to verify formatting
    const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
    console.log('🔗 Attempting connection with URI:', maskedUri);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;