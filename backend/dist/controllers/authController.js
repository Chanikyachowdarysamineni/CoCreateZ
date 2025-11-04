"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const realtime_1 = require("../services/realtime");
const crypto_1 = __importDefault(require("crypto"));
const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await models_1.User.findByEmail(email);
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({ email, password: hashedPassword, name });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // notify realtime clients
        (0, realtime_1.emitProfileUpdate)(user.id, user);
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ message: 'Signup failed', error: err });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await models_1.User.findByEmail(email);
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // notify realtime clients about login (may update lastSeen/status)
        (0, realtime_1.emitProfileUpdate)(user.id, user);
        res.status(200).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ message: 'Login failed', error: err });
    }
};
exports.login = login;
// Google OAuth redirect
const googleAuth = async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    const state = crypto_1.default.randomBytes(16).toString('hex');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
    // Optionally set state in cookie/local storage — here we just redirect
    res.redirect(authUrl);
};
exports.googleAuth = googleAuth;
// Google OAuth callback
const googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code)
            return res.status(400).json({ message: 'Missing code' });
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token)
            return res.status(400).json({ message: 'Failed to exchange token', detail: tokenData });
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const profile = await userinfoRes.json();
        // profile contains sub, email, name, picture
        let user = await models_1.User.findByEmail(profile.email);
        if (!user) {
            // create user with random password
            const randomPassword = crypto_1.default.randomBytes(24).toString('hex');
            const hashed = await bcryptjs_1.default.hash(randomPassword, 10);
            user = await models_1.User.create({ email: profile.email, password: hashed, name: profile.name, avatar: profile.picture });
        }
        else {
            // update name/avatar if changed
            const updates = {};
            if (profile.name && profile.name !== user.name)
                updates.name = profile.name;
            if (profile.picture && profile.picture !== user.avatar)
                updates.avatar = profile.picture;
            if (Object.keys(updates).length) {
                user = await models_1.User.update(user.id, updates);
            }
        }
        // Issue JWT and emit only if user exists
        if (!user)
            return res.status(500).json({ message: 'Failed to create or find user' });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Emit profile update to other sockets
        (0, realtime_1.emitProfileUpdate)(user.id, user);
        // Redirect to frontend with token (or return JSON)
        const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectTo = `${frontend}/?token=${token}`;
        res.redirect(redirectTo);
    }
    catch (err) {
        res.status(500).json({ message: 'Google auth failed', error: err });
    }
};
exports.googleCallback = googleCallback;
