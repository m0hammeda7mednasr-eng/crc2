import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest } from '../types';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password }: RegisterRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Password length validation
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await AuthService.register(email, password);

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          error: error.message,
          code: 'EMAIL_EXISTS',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await AuthService.login(email, password);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          error: error.message,
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const user = await AuthService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
