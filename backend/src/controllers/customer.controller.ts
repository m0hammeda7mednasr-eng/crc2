import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { extractAccountId } from '../middleware/auth.middleware';

export class CustomerController {
  /**
   * Create new customer
   * POST /api/customers
   */
  static async createCustomer(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { phoneNumber, name } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          error: 'Phone number is required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      const socketManager = req.app.get('socketManager');
      const customer = await CustomerService.findOrCreateByPhone(
        phoneNumber,
        userId,
        name,
        socketManager
      );

      res.status(201).json({ 
        message: 'Customer created successfully',
        customer 
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to create customer',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * List all customers for account
   * GET /api/customers
   */
  static async listCustomers(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      const customers = await CustomerService.getCustomersByAccount(userId);

      res.status(200).json({ customers });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch customers',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get single customer
   * GET /api/customers/:id
   */
  static async getCustomer(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { id } = req.params;

      const customer = await CustomerService.getCustomerById(id as string, userId);

      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ customer });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch customer',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Mark customer messages as read
   * POST /api/customers/:id/read
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { id } = req.params;
      const socketManager = req.app.get('socketManager');

      await CustomerService.resetUnreadCount(id as string, userId, socketManager);

      res.status(200).json({ 
        message: 'Messages marked as read',
        success: true 
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to mark messages as read',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete customer
   * DELETE /api/customers/:id
   */
  static async deleteCustomer(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { id } = req.params;
      const socketManager = req.app.get('socketManager');

      await CustomerService.deleteCustomer(id as string, userId, socketManager);

      res.status(200).json({ 
        message: 'Customer deleted successfully',
        success: true 
      });
    } catch (error: any) {
      if (error.message === 'Customer not found or access denied') {
        return res.status(404).json({
          error: error.message,
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: 'Failed to delete customer',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
