"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = exports.uploadFile = void 0;
const models_1 = require("../models");
const uploadFile = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const file = await models_1.File.create({
            filename: req.file.filename,
            originalname: req.file.originalname,
            user_id: userId
        });
        res.status(201).json(file);
    }
    catch (err) {
        res.status(500).json({ message: 'File upload failed', error: err });
    }
};
exports.uploadFile = uploadFile;
const getFiles = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const files = await models_1.File.findByUserId(userId);
        res.json(files);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch files', error: err });
    }
};
exports.getFiles = getFiles;
