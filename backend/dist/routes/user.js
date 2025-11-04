"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
router.get('/profile', authMiddleware_1.authenticate, userController_1.getProfile);
router.put('/profile', authMiddleware_1.authenticate, userController_1.updateProfile);
router.post('/profile/avatar', authMiddleware_1.authenticate, upload.single('avatar'), userController_1.uploadAvatar);
exports.default = router;
