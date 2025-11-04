"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const models_1 = require("../models");
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
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err });
    }
};
exports.updateProfile = updateProfile;
