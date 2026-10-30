import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payrakshak';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // Fast fail for seamless demo fallback
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.log(`[Database] MongoDB not available locally (${err.message}). Activating High-Performance Demo Mode (In-Memory Engine).`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}

