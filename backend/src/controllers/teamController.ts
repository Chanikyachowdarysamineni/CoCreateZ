import { Request, Response } from 'express';
import { Team } from '../models/Team';

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const owner = req.user?.id;
    const { email } = req.body;
    if (!owner || !email) return res.status(400).json({ message: 'Missing owner or email' });
    const team = await Team.invite(owner, email);
    res.status(200).json({ message: 'Invitation sent', team });
  } catch (err) {
    res.status(500).json({ message: 'Failed to invite member', error: err });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const owner = req.user?.id;
    if (!owner) return res.status(400).json({ message: 'Missing owner' });
    const members = await Team.getMembers(owner);
    res.status(200).json({ members });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get members', error: err });
  }
};

export const getInvites = async (req: Request, res: Response) => {
  try {
    const owner = req.user?.id;
    if (!owner) return res.status(400).json({ message: 'Missing owner' });
    const invites = await Team.getInvites(owner);
    res.status(200).json({ invites });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get invites', error: err });
  }
};
