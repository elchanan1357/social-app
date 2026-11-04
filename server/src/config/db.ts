import mongoose from 'mongoose'
import { config } from '@/utils/config'
import { logger } from '@/utils/logger'

let connectionPromise: Promise<typeof mongoose> | null = null

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }
    if (connectionPromise) {
        return connectionPromise
    }

    connectionPromise = mongoose
        .connect(config.mongo_uri)
        .then((m) => {
            logger.info(`MongoDB connected successfully. Host: ${m.connection.host}`)
            return m
        })
        .catch((err) => {
            connectionPromise = null
            logger.error('MongoDB connection error:', err)
            throw err
        })

    return connectionPromise
}

export const disconnectDB = async () => {
    try {
        await mongoose.connection.close()
        connectionPromise = null
        logger.info('MongoDB disconnected successfully')
    } catch (error) {
        logger.error('Error disconnecting MongoDB:', error)
    }
}
