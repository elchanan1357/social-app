import dotenv from 'dotenv';
dotenv.config();


export const config = {
    port: process.env.PORT || 3000,
    mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017/social_app',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    logLevel: process.env.LOG_LEVEL || 'info',
}



