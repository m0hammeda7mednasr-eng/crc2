import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              customers: true,
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({ users });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch users',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:id
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          shopifyDomain: true,
          n8nWebhookUrl: true,
          createdAt: true,
          updatedAt: true,
          subscription: true,
          customers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              createdAt: true,
              _count: {
                select: {
                  messages: true,
                  orders: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              customers: true,
              orders: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch user',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      const [totalUsers, totalCustomers, totalOrders, totalMessages] = await Promise.all([
        prisma.user.count(),
        prisma.customer.count(),
        prisma.order.count(),
        prisma.message.count(),
      ]);

      const stats = {
        totalUsers,
        totalCustomers,
        totalOrders,
        totalMessages,
      };

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch statistics',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      // Prevent deleting admin users
      if (user.role === 'admin') {
        return res.status(403).json({
          error: 'Cannot delete admin users',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete user',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get analytics data with real date filtering
   * GET /api/admin/analytics
   */
  static async getAnalytics(req: Request, res: Response) {
    try {
      const { range = '30d' } = req.query;

      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (range) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default: // '30d'
          startDate.setDate(now.getDate() - 30);
      }

      // Get all stats in parallel - filtered by date range
      const [
        totalUsers,
        totalCustomers,
        totalOrders,
        activeSubscriptions,
        revenueResult,
        subscriptions,
        userGrowthRaw,
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
        prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
        prisma.order.count({ where: { createdAt: { gte: startDate } } }),
        prisma.subscription.count({ where: { status: 'active' } }),
        // Real revenue: sum of all orders in range
        prisma.order.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: startDate } },
        }),
        // Subscriptions by plan
        prisma.subscription.findMany({
          select: { planName: true, price: true },
        }),
        // User growth: users grouped by day
        prisma.user.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      const totalRevenue = revenueResult._sum.total ?? 0;

      // Build daily user growth
      const growthMap: Record<string, number> = {};
      for (const u of userGrowthRaw) {
        const day = u.createdAt.toISOString().split('T')[0];
        growthMap[day] = (growthMap[day] || 0) + 1;
      }
      const userGrowth = Object.entries(growthMap).map(([date, count]) => ({
        date,
        count,
      }));

      // Revenue by plan (real prices)
      const planGroups: Record<string, { count: number; revenue: number }> = {
        free: { count: 0, revenue: 0 },
        pro: { count: 0, revenue: 0 },
        enterprise: { count: 0, revenue: 0 },
      };
      for (const sub of subscriptions) {
        const plan = sub.planName in planGroups ? sub.planName : 'free';
        planGroups[plan].count += 1;
        planGroups[plan].revenue += sub.price ?? 0;
      }
      const revenueByPlan = Object.entries(planGroups).map(([plan, data]) => ({
        plan,
        ...data,
      }));

      res.status(200).json({
        totalUsers,
        totalCustomers,
        totalOrders,
        totalRevenue,
        activeSubscriptions,
        userGrowth,
        revenueByPlan,
        range,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch analytics',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
