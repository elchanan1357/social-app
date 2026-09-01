import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

export interface Config {
    port: string | number;
    mongo_uri: string;
    logLevel: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: SignOptions["expiresIn"];
    jwtRefreshExpiresIn: SignOptions["expiresIn"];
    nodeEnv: string;
}

export const config: Config = {
    port: process.env.PORT || 3000,
    mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017/social_app',
    logLevel: process.env.LOG_LEVEL || 'info',

    jwtSecret: process.env.JWT_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtAccessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || '1h',
    jwtRefreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || '7d',

    nodeEnv: process.env.NODE_ENV || 'development',
};