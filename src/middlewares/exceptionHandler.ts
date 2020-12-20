import AppError from '@errors/appError';
import { Request, Response, NextFunction } from 'express';

const exceptionHandler = (
  err: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return response.status(err.status).json({
      status: 'error',
      message: err.message,
      timestamp: err.timestamp,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
    description: err.message,
    timestamp: new Date().getTime(),
  });
};

export default exceptionHandler;
