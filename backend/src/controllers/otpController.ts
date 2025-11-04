import { Request, Response } from 'express';
import { OTPModel } from '../models/OTP';
import { sendMail } from '../services/mailer';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTPModel.createForEmail(email, code, 300); // 5 minutes

    // send via nodemailer
    const subject = 'Your verification code';
    const text = `Your verification code is ${code}. It expires in 5 minutes.`;
    await sendMail(email, subject, text);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

    const found = await OTPModel.findValid(email, code);
    if (!found) return res.status(400).json({ message: 'Invalid or expired code' });

    await OTPModel.markUsed(found.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify OTP', error: err });
  }
};
