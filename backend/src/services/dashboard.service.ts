import { PrismaClient } from '@prisma/client';
import { DashboardStats } from '../types';
import { SocketManager } from '../utils/socket.manager';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Calculate dashboard statistics with product details
   */
  static async calculateStats(userId: string, socketManager?: SocketManager): Promise<DashboardStats> {
    const [totalOrders, confirmedOrders, cancelledOrders, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: 'confirmed' } }),
      prisma.order.count({ where: { userId, status: 'cancelled' } }),
      prisma.order.count({ where: { userId, status: 'pending' } }),
    ]);

    // Calculate total revenue from confirmed orders
    const revenueResult = await prisma.order.aggregate({
      where: { userId, status: 'confirmed' },
      _sum: { total: true },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Get all confirmed orders with their data
    const confirmedOrdersData = await prisma.order.findMany({
      where: { userId, status: 'confirmed' },
      select: {
        shopifyOrderData: true,
      },
    });

    // Extract and count products
    const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    
    confirmedOrdersData.forEach(order => {
      if (order.shopifyOrderData && typeof order.shopifyOrderData === 'object') {
        const orderData = order.shopifyOrderData as any;
        const lineItems = orderData.line_items || [];
        
        lineItems.forEach((item: any) => {
          const productId = item.product_id?.toString() || item.id?.toString() || 'unknown';
          const productName = item.name || item.title || 'Unknown Product';
          const quantity = item.quantity || 1;
          const price = parseFloat(item.price || '0');
          
          if (!productCounts[productId]) {
            productCounts[productId] = {
              name: productName,
              count: 0,
              revenue: 0,
            };
          }
          
          productCounts[productId].count += quantity;
          productCounts[productId].revenue += price * quantity;
        });
      }
    });

    // Convert to array and sort by count
    const topProducts = Object.entries(productCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 products

    const stats = {
      totalOrders,
      confirmedOrders,
      cancelledOrders,
      pendingOrders,
      totalRevenue,
      topProducts,
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
