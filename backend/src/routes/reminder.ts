import { Router } from 'express';
import { createReminder, listReminders } from '../controllers/reminderController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createReminder);
router.get('/', authenticate, listReminders);

export default router;
