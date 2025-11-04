/// <reference path="../types/express/index.d.ts" />
import { Request, Response } from 'express';
import { User } from '../models';
import { emitProfileUpdate } from '../services/realtime';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const updated = await User.update(userId, req.body);
    if (updated) {
      // notify realtime clients about profile change
      emitProfileUpdate(userId, updated);
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Save avatar path (could be replaced by cloud url)
    const avatarPath = `/uploads/${req.file.filename}`;

    const updated = await User.update(userId, { avatar: avatarPath });
    if (updated) {
      emitProfileUpdate(userId, updated);
    }

    res.json({ success: true, avatar: avatarPath, user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload avatar', error: err });
  }
};
