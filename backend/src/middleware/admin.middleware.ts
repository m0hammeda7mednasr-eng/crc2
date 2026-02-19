import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

/**
 * Middleware to verify admin role
 */
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Authorization check failed',
      code: 'SERVER_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
};
