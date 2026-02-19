import prisma from '../utils/prisma';
import { SocketManager } from '../utils/socket.manager';

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(
    shopifyOrderId: string | null,
    orderNumber: string,
    total: number,
    status: string,
    customerName: string,
    customerPhone: string,
    userId: string,
    customerId?: string,
    items?: any,
    socketManager?: SocketManager
  ) {
    const order = await prisma.order.create({
      data: {
        shopifyOrderId,
        orderNumber,
        total,
        status,
        customerName,
        customerPhone,
        userId,
        customerId,
        items,
      },
      include: {
        customer: true,
      },
    });

    // Broadcast new order to account via WebSocket
    if (socketManager) {
      socketManager.broadcastToAccount(userId, 'order:update', {
        order,
        action: 'created',
      });
    }

    return order;
  }

  /**
   * Update order status with account validation
   */
  static async updateStatus(orderId: string, status: string, userId: string, socketManager?: SocketManager) {
    // Validate order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
      },
    });

    // Broadcast order update to account via WebSocket
    if (socketManager) {
      socketManager.broadcastToAccount(userId, 'order:update', {
        order: updatedOrder,
        action: 'updated',
      });
    }

    return updatedOrder;
  }

  /**
   * Get orders by account with optional status filter
   */
  static async getOrdersByAccount(userId: string, statusFilter?: string) {
    const where: any = { userId };

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            name: true,
          },
        },
      },
    });

    return orders;
  }

  /**
   * Get order by ID with account validation
   */
  static async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        customer: true,
      },
    });

    return order;
  }

  /**
   * Get orders by customer
   */
  static async getOrdersByCustomer(customerId: string, userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }
}
