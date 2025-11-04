import { Router } from 'express';
import { login, signup, googleAuth, googleCallback } from '../controllers/authController';
import { sendOtp, verifyOtp } from '../controllers/otpController';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// OTP endpoints
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
