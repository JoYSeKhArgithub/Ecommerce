import mongoose from 'mongoose';
import logger from '../logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; 

export const connectDB = async (uri: string) => {
  let retries = 0;

  const connect = async () => {
    try {
      await mongoose.connect(uri, {
        autoIndex: true, 
      });
    } catch (err) {
      retries += 1;
      logger.error(`Failed to connect to MongoDB (Attempt ${retries}/${MAX_RETRIES})`);
      
      if (retries < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_INTERVAL / 1000}s...`);
        setTimeout(connect, RETRY_INTERVAL);
      } else {
        logger.error('Max retries reached. Exiting process...');
        process.exit(1);
      }
    }
  };

  mongoose.connection.on('connected', () => logger.info(' MongoDB Connected Successfully'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB Connection Error:', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB Disconnected. Trying to reconnect...'));

  await connect();
};

export const closeDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
};
