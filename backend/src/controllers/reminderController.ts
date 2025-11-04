import { Request, Response } from 'express';
import { Reminder } from '../models';

export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const payload = req.body;
    const reminder = new Reminder({ ...payload, userId });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reminder', error: err });
  }
};

export const listReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const reminders = await Reminder.find({ userId }).sort({ time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list reminders', error: err });
  }
};
