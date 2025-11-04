"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = exports.uploadFile = exports.shareFile = exports.downloadFile = exports.deleteFile = void 0;
const models_1 = require("../models");
const File_1 = require("../models/File");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteFile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const fileId = req.params.id;
        const file = await File_1.FileModel.findOne({ _id: fileId, user_id: userId });
        if (!file)
            return res.status(404).json({ message: 'File not found' });
        await File_1.FileModel.deleteOne({ _id: fileId });
        // Optionally delete file from disk
        const filePath = path_1.default.join(__dirname, '../../uploads', file.filename);
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
        res.json({ message: 'File deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to delete file', error: err });
    }
};
exports.deleteFile = deleteFile;
const downloadFile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const fileId = req.params.id;
        const file = await File_1.FileModel.findOne({ _id: fileId, user_id: userId });
        if (!file)
            return res.status(404).json({ message: 'File not found' });
        const filePath = path_1.default.join(__dirname, '../../uploads', file.filename);
        if (!fs_1.default.existsSync(filePath))
            return res.status(404).json({ message: 'File not found on disk' });
        res.download(filePath, file.originalname);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to download file', error: err });
    }
};
exports.downloadFile = downloadFile;
const shareFile = async (req, res) => {
    try {
        // Implement sharing logic (e.g., add sharedWith field, send email, etc.)
        // For now, just return success
        res.json({ message: 'File shared (demo endpoint)' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to share file', error: err });
    }
};
exports.shareFile = shareFile;
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
