import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { extractAccountId } from '../middleware/auth.middleware';

export class DashboardController {
  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  static async getStats(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      const stats = await DashboardService.calculateStats(userId, socketManager);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch statistics',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
