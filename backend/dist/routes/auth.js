"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const otpController_1 = require("../controllers/otpController");
const router = (0, express_1.Router)();
router.post('/login', authController_1.login);
router.post('/signup', authController_1.signup);
// Google OAuth
router.get('/google', authController_1.googleAuth);
router.get('/google/callback', authController_1.googleCallback);
// OTP endpoints
router.post('/otp/send', otpController_1.sendOtp);
router.post('/otp/verify', otpController_1.verifyOtp);
exports.default = router;
