import app from './app';
import { logger } from '@/utils/logger';
import { config } from "@/utils/config";
import { connectDB, disconnectDB } from "@/config/db";

const main = async () => {
    try {
        const port = config.port;

        await connectDB();
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        logger.error(`Error starting server: ${error}`);
        process.exit(1);
    }
}


const cleanup = async (exitCode: number) => {
    try {
        logger.info(`Shutting down server...`)
        await disconnectDB();
        process.exit(exitCode)
    }
    catch (error) {
        const messageErr = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error during shutdown: ${messageErr}`);
    }
    finally {
        process.exit(exitCode)
    }
}

process.on('SIGINT', () => {
    cleanup(0);
});
process.on('SIGTERM', () => {
    cleanup(0);
});

main()