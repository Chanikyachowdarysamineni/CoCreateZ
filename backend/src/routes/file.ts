import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getFiles, deleteFile, downloadFile, shareFile } from '../controllers/fileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticate, upload.single('file'), uploadFile);
router.get('/', authenticate, getFiles);
router.delete('/:id', authenticate, deleteFile);
router.get('/download/:id', authenticate, downloadFile);
router.post('/share/:id', authenticate, shareFile);

export default router;
