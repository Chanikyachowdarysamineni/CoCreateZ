import { Router } from 'express';
import { createMeeting, listMeetings } from '../controllers/meetingController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createMeeting);
router.get('/', authenticate, listMeetings);

export default router;
