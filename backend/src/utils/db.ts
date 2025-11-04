import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Require a MongoDB Atlas connection string via environment variable.
// This project is configured to connect to Atlas only. Do NOT hardcode credentials.
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'CoCreateZ';

if (!MONGO_URI) {
  console.error('\n✖ MONGO_URI not set.');
  console.error('Set the MongoDB Atlas connection string in backend/.env as MONGO_URI.');
  console.error('Example (do NOT commit credentials):');
  console.error('MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority');
  process.exit(1);
}

export const connectDB = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      await mongoose.connect(MONGO_URI, {
        dbName: MONGO_DB_NAME,
        autoIndex: true,
        // keep default TLS behavior; Atlas uses TLS on standard ports
      });
      console.log(`MongoDB connected (db: "${MONGO_DB_NAME}")`);
      return;
    } catch (err: any) {
      console.error(`MongoDB connection error (attempt ${attempt}/${maxRetries}):`, err?.message || err);
      if (attempt >= maxRetries) {
        console.error('Failed to connect to MongoDB Atlas after multiple attempts. Exiting.');
        process.exit(1);
      }
      // Wait a bit before retrying
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
};
