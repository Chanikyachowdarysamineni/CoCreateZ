"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const file_1 = __importDefault(require("./routes/file"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const team_1 = __importDefault(require("./routes/team"));
const chat_1 = __importDefault(require("./routes/chat"));
const meeting_1 = __importDefault(require("./routes/meeting"));
const reminder_1 = __importDefault(require("./routes/reminder"));
// @ts-ignore
const analytics_1 = __importDefault(require("./routes/analytics"));
// @ts-ignore
const collab_1 = __importDefault(require("./routes/collab"));
const db_1 = require("./utils/db");
const http_1 = __importDefault(require("http"));
const realTimeServer_1 = require("./services/realTimeServer");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security and performance middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for WebRTC
    crossOriginEmbedderPolicy: false // Disable for real-time features
}));
app.use((0, compression_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// CORS configuration for real-time features
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Serve uploaded files
app.use('/uploads', express_1.default.static('uploads'));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/files', file_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/team', team_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/meetings', meeting_1.default);
app.use('/api/reminders', reminder_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/collab', collab_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Real-time server status endpoint
app.get('/api/realtime/status', (req, res) => {
    res.json({
        connectedUsers: realTimeServer?.getConnectedUsersCount() || 0,
        activeChannels: realTimeServer?.getActiveChannelsCount() || 0,
        timestamp: new Date()
    });
});
const PORT = process.env.PORT || 4000;
const server = http_1.default.createServer(app);
// Initialize real-time server
const realTimeServer = new realTimeServer_1.RealTimeServer(server);
// expose io for controllers
const realtime_1 = require("./services/realtime");
// @ts-ignore
(0, realtime_1.setRealtimeIO)(realTimeServer.io);
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Real-time collaboration server active`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database connected`);
    });
}).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});
