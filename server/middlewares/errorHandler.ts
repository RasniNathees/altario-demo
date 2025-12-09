import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};