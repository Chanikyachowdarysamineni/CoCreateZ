import { Request, Response } from 'express';
import { File } from '../models';
import { FileModel } from '../models/File';
import path from 'path';
import fs from 'fs';
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const fileId = req.params.id;
    const file = await FileModel.findOne({ _id: fileId, user_id: userId });
    if (!file) return res.status(404).json({ message: 'File not found' });
    await FileModel.deleteOne({ _id: fileId });
    // Optionally delete file from disk
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete file', error: err });
  }
};
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const fileId = req.params.id;
    const file = await FileModel.findOne({ _id: fileId, user_id: userId });
    if (!file) return res.status(404).json({ message: 'File not found' });
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on disk' });
    res.download(filePath, file.originalname);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download file', error: err });
  }
};
export const shareFile = async (req: Request, res: Response) => {
  try {
    // Implement sharing logic (e.g., add sharedWith field, send email, etc.)
    // For now, just return success
    res.json({ message: 'File shared (demo endpoint)' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to share file', error: err });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const file = await File.create({
      filename: req.file.filename,
      originalname: req.file.originalname,
      user_id: userId
    });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: 'File upload failed', error: err });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const files = await File.findByUserId(userId);
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files', error: err });
  }
};
