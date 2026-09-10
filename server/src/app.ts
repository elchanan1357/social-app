import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '@/routers/user.router';
import postRoutes from '@/routers/post.router';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));


app.use("/api/auth", authRoutes)
app.use('/api/posts', postRoutes);
app.use(errorHandler);

export default app;