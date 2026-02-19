import { PrismaClient } from '@prisma/client';
import { DashboardStats } from '../types';
import { SocketManager } from '../utils/socket.manager';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Calculate dashboard statistics
   */
  static async calculateStats(userId: string, socketManager?: SocketManager): Promise<DashboardStats> {
    const [totalOrders, confirmedOrders, cancelledOrders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: 'confirmed' } }),
      prisma.order.count({ where: { userId, status: 'cancelled' } }),
    ]);

    const stats = {
      totalOrders,
      confirmedOrders,
      cancelledOrders,
    };

    // Broadcast stats update to account via WebSocket
    if (socketManager) {
      socketManager.broadcastToAccount(userId, 'stats:update', stats);
    }

    return stats;
  }

  /**
   * Get order count by status
   */
  static async getOrderCountByStatus(userId: string, status: string): Promise<number> {
    return prisma.order.count({
      where: {
        userId,
        status,
      },
    });
  }
}
