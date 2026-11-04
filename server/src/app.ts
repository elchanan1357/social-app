import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '@/routers/user.router';
import postRoutes from '@/routers/post.router';
import { errorHandler } from './middlewares/errorHandler';
import { config } from './utils/config';

const app = express();
const corsOptions = {
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1)
app.use(cors(corsOptions))


app.use("/api/auth", authRoutes)
app.use('/api/posts', postRoutes);
app.use(errorHandler);

export default app;