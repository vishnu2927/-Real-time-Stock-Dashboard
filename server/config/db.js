const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

let connectionPromise = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[db] MONGO_URI is not set; skipping MongoDB connection');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4
      })
      .then(() => {
        console.info('[db] MongoDB connected');
        return mongoose.connection;
      })
      .catch((error) => {
        console.error('[db] MongoDB connection failed:', error.message);
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

module.exports = connectDB;