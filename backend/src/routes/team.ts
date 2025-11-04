import express from 'express';
import { inviteMember, getMembers, getInvites } from '../controllers/teamController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/invite', authenticate, inviteMember);
router.get('/members', authenticate, getMembers);
router.get('/invites', authenticate, getInvites);

export default router;
