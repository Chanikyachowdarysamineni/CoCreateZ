"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/profile', authMiddleware_1.authenticate, userController_1.getProfile);
router.put('/profile', authMiddleware_1.authenticate, userController_1.updateProfile);
exports.default = router;
