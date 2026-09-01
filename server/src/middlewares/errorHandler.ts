import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`[APP ERROR] ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error(`[UNHANDLED ERROR] ${err.message}`, { stack: err.stack });
  return res.status(500).json({ message: 'Internal Server Error' });
};