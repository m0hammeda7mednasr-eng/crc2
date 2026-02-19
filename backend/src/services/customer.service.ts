import prisma from '../utils/prisma';
import { SocketManager } from '../utils/socket.manager';

export class CustomerService {
  /**
   * Find or create customer by phone number
   */
  static async findOrCreateByPhone(
    phoneNumber: string,
    userId: string,
    name?: string,
    socketManager?: SocketManager
  ) {
    let customer = await prisma.customer.findFirst({
      where: {
        phoneNumber,
        userId,
      },
    });

    let isNewCustomer = false;
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber,
          userId,
          name: name || null,
        },
      });
      isNewCustomer = true;
    }

    // Broadcast new customer to account via WebSocket
    if (socketManager && isNewCustomer) {
      socketManager.broadcastToAccount(userId, 'customer:new', {
        customer,
      });
    }

    return customer;
  }

  /**
   * Get all customers for an account
   */
  static async getCustomersByAccount(userId: string) {
    const customers = await prisma.customer.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return customers;
  }

  /**
   * Get customer by ID with account validation
   */
  static async getCustomerById(customerId: string, userId: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId,
      },
      include: {
        _count: {
          select: { messages: true, orders: true },
        },
      },
    });

    return customer;
  }

  /**
   * Validate customer belongs to account
   */
  static async validateAccountOwnership(
    customerId: string,
    userId: string
  ): Promise<boolean> {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId,
      },
    });

    return !!customer;
  }

  /**
   * Update customer name
   */
  static async updateCustomer(
    customerId: string,
    userId: string,
    data: { name?: string }
  ) {
    const customer = await prisma.customer.updateMany({
      where: {
        id: customerId,
        userId,
      },
      data,
    });

    return customer;
  }

  /**
   * Find customer by phone number (any user)
   */
  static async findCustomerByPhone(phoneNumber: string) {
    const customer = await prisma.customer.findFirst({
      where: { phoneNumber },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return customer;
  }

  /**
   * Get first user in system (for testing/demo)
   */
  static async getFirstUser() {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
      },
    });

    return user;
  }
}
