import { Request, Response } from 'express';
import { Dashboard } from '../models';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const data = await Dashboard.getData(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: err });
  }
};
