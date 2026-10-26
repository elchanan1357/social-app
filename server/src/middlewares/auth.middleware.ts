import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/utils/config';
import { AuthRequest, TokenPayload } from '@/types/auto.type';
import { AppError } from '@/utils/appError';

export const authTokenMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Access token required', 401));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
        req.user = decoded;
        next();
    } catch {
        return next(new AppError('Invalid or expired access token', 403));
    }
};