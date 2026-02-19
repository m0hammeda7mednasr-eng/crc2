import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { extractAccountId } from '../middleware/auth.middleware';
import { UpdateOrderStatusRequest } from '../types';

export class OrderController {
  /**
   * List all orders
   * GET /api/orders
   */
  static async listOrders(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { status } = req.query;

      const orders = await OrderService.getOrdersByAccount(
        userId,
        status as string
      );

      res.status(200).json({ orders });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch orders',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get single order
   * GET /api/orders/:id
   */
  static async getOrder(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { id } = req.params;

      const order = await OrderService.getOrderById(id, userId);

      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ order });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch order',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { id } = req.params;
      const { status }: UpdateOrderStatusRequest = req.body;

      // Validation
      if (!status) {
        return res.status(400).json({
          error: 'Status is required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status value',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      const order = await OrderService.updateStatus(id, status, userId, socketManager);

      res.status(200).json({
        message: 'Order status updated successfully',
        order,
      });
    } catch (error: any) {
      if (error.message === 'Order not found or unauthorized') {
        return res.status(404).json({
          error: error.message,
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: 'Failed to update order status',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
