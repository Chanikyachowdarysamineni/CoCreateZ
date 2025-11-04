import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import fileRoutes from './routes/file';
import dashboardRoutes from './routes/dashboard';
import teamRoutes from './routes/team';
import chatRoutes from './routes/chat';
import meetingRoutes from './routes/meeting';
import reminderRoutes from './routes/reminder';
// @ts-ignore
import analyticsRoutes from './routes/analytics';
// @ts-ignore
import collabRoutes from './routes/collab';
import { connectDB } from './utils/db';
import http from 'http';
import { RealTimeServer } from './services/realTimeServer';

dotenv.config();

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for WebRTC
  crossOriginEmbedderPolicy: false // Disable for real-time features
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration for real-time features
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/collab', collabRoutes);

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
const server = http.createServer(app);

// Initialize real-time server
const realTimeServer = new RealTimeServer(server);
// expose io for controllers
import { setRealtimeIO } from './services/realtime';
// @ts-ignore
setRealtimeIO((realTimeServer as any).io);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

connectDB().then(() => {
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
