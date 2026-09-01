import { Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '@/utils/config';
import {AuthRequest, TokenPayload} from '@/types/auto.type';
import {logger} from '@/utils/logger';

export const authTokenMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn(`[AUTH] Access token missing in request headers`);
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
        req.user = decoded;
        logger.info(`[AUTH] Access token verified successfully`);
        next();
    } catch (err) {
        logger.warn(`[AUTH] Invalid or expired access token: ${err}`);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
}
