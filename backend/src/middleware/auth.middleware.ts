import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = AuthService.verifyToken(token);
      
      // Attach user info to request
      (req as AuthRequest).userId = decoded.userId;
      (req as AuthRequest).user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
      };

      next();
    } catch (error) {
      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Extract account ID from authenticated request
 */
export const extractAccountId = (req: Request): string => {
  const authReq = req as AuthRequest;
  if (!authReq.userId) {
    throw new Error('User not authenticated');
  }
  return authReq.userId;
};

/**
 * Socket.io authentication middleware
 */
export const authenticateSocket = (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = AuthService.verifyToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
