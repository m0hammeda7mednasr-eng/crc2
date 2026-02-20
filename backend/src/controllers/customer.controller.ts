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
}
