import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
