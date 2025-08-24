import mongoose from 'mongoose';
import { env } from './env';
import logger from './logger';

export const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};
