import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '@/utils/appError'; 

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstErrorMessage = error.issues[0]?.message || 'Validation failed';
        return next(new AppError(firstErrorMessage, 400));
      }
      next(error);
    }
  };
};