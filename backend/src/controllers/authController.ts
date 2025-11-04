import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { emitProfileUpdate } from '../services/realtime';
import crypto from 'crypto';

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  // notify realtime clients
  emitProfileUpdate(user.id, user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
  // notify realtime clients about login (may update lastSeen/status)
  emitProfileUpdate(user.id, user);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

// Google OAuth redirect
export const googleAuth = async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid profile email');
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  // Optionally set state in cookie/local storage — here we just redirect
  res.redirect(authUrl);
};

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ message: 'Missing code' });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
        grant_type: 'authorization_code'
      } as any)
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ message: 'Failed to exchange token', detail: tokenData });

    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userinfoRes.json();

    // profile contains sub, email, name, picture
    let user = await User.findByEmail(profile.email);
    if (!user) {
      // create user with random password
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await User.create({ email: profile.email, password: hashed, name: profile.name, avatar: profile.picture });
    } else {
      // update name/avatar if changed
      const updates: any = {};
      if (profile.name && profile.name !== user.name) updates.name = profile.name;
      if (profile.picture && profile.picture !== user.avatar) updates.avatar = profile.picture;
      if (Object.keys(updates).length) {
        user = await User.update(user.id, updates) as any;
      }
    }

  // Issue JWT and emit only if user exists
  if (!user) return res.status(500).json({ message: 'Failed to create or find user' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

  // Emit profile update to other sockets
  emitProfileUpdate(user.id, user);

    // Redirect to frontend with token (or return JSON)
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectTo = `${frontend}/?token=${token}`;
    res.redirect(redirectTo);
  } catch (err) {
    res.status(500).json({ message: 'Google auth failed', error: err });
  }
};
