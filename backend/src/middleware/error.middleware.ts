import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const errorResponse: ErrorResponse = {
    error: error.message || 'Internal server error',
    code: error.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString(),
  };

  // Don't expose sensitive information
  if (process.env.NODE_ENV === 'production') {
    delete errorResponse.details;
  } else {
    errorResponse.details = error.stack;
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
