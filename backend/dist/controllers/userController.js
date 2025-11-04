"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.updateProfile = exports.getProfile = void 0;
const models_1 = require("../models");
const realtime_1 = require("../services/realtime");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await models_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const updated = await models_1.User.update(userId, req.body);
        if (updated) {
            // notify realtime clients about profile change
            (0, realtime_1.emitProfileUpdate)(userId, updated);
        }
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err });
    }
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        // Save avatar path (could be replaced by cloud url)
        const avatarPath = `/uploads/${req.file.filename}`;
        const updated = await models_1.User.update(userId, { avatar: avatarPath });
        if (updated) {
            (0, realtime_1.emitProfileUpdate)(userId, updated);
        }
        res.json({ success: true, avatar: avatarPath, user: updated });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to upload avatar', error: err });
    }
};
exports.uploadAvatar = uploadAvatar;
