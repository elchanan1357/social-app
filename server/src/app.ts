import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '@/routers/user.router';
import postRoutes from '@/routers/post.router';
import { errorHandler } from './middlewares/errorHandler';
import { config } from './utils/config';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1)
app.use(cors({ origin: config.clientUrl, credentials: true }))


app.use("/api/auth", authRoutes)
app.use('/api/posts', postRoutes);
app.use(errorHandler);

export default app;