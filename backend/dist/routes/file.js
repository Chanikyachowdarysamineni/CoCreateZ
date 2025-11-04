"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fileController_1 = require("../controllers/fileController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/upload', authMiddleware_1.authenticate, upload.single('file'), fileController_1.uploadFile);
router.get('/', authMiddleware_1.authenticate, fileController_1.getFiles);
router.delete('/:id', authMiddleware_1.authenticate, fileController_1.deleteFile);
router.get('/download/:id', authMiddleware_1.authenticate, fileController_1.downloadFile);
router.post('/share/:id', authMiddleware_1.authenticate, fileController_1.shareFile);
exports.default = router;
