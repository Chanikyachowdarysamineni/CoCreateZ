import { Request, Response } from 'express';
import { Meeting } from '../models';
import { emitProfileUpdate } from '../services/realtime';

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const payload = req.body;
    const meeting = new Meeting({ ...payload, host: userId });
    await meeting.save();
    // broadcast meeting created
    // TODO: choose proper channel
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create meeting', error: err });
  }
};

export const listMeetings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const meetings = await Meeting.find({ $or: [{ host: userId }, { participants: userId }] }).sort({ startTime: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list meetings', error: err });
  }
};
