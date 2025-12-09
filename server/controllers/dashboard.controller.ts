import { Request, Response } from 'express';
import { DashboardService } from '../services';
import { ApiResponse } from '../utils';

export class DashboardController {
  private service = new DashboardService();

  getStats = async (req: Request, res: Response) => {
    const stats = await this.service.getStats();
    res.json(ApiResponse.success(stats));
  };
}
