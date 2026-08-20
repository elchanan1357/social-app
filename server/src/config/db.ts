import mongoose from "mongoose";
import { config } from '@/utils/config';
import { logger } from "@/utils/logger";

export const connectDB = async () => {
    try {
        const db = mongoose.connection;
        db.once("open", () => {
            logger.info(`MongoDB connected successfully host is: ${db.host}}`);
        });
        db.on('error', (err) => {
            logger.error(`Error in db: ${err}`);
        });

        await mongoose.connect(config.mongo_uri)
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }


}

export const disconnectDB = async () => {
    try { 
        mongoose.connection.close();
        logger.info('MongoDB disconnected successfully');
    } catch (error) {
        logger.error('Error disconnecting MongoDB:', error);
    }
}
