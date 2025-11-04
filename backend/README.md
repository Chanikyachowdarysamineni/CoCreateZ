# 🚀 CoCreateX Real-Time Collaboration Backend

A comprehensive Node.js backend server with real-time collaboration features, WebRTC signaling, and advanced chat capabilities.

## ✨ Features

### 🔄 Real-Time Communication
- **WebRTC Signaling Server**: P2P connection establishment with ICE candidate exchange
- **Socket.IO Integration**: Real-time bidirectional communication
- **Live Presence System**: User status, typing indicators, and activity tracking
- **Cursor Tracking**: Real-time cursor position sharing for collaboration

### 💬 Advanced Chat System
- **Message Persistence**: MongoDB storage with delivery status tracking
- **Real-Time Reactions**: Instant emoji reactions with live updates
- **File Sharing**: Support for images, documents, and multimedia files
- **Message Threading**: Reply-to functionality and conversation threads
- **Message Search**: Full-text search across chat history

### 🔐 Security & Performance
- **JWT Authentication**: Secure user authentication and authorization
- **Rate Limiting**: Protection against abuse and spam
- **Helmet.js**: Security headers and protection
- **Compression**: Gzip compression for better performance
- **CORS**: Configurable cross-origin resource sharing

### 📊 Monitoring & Analytics
- **Performance Metrics**: Latency, bandwidth, and connection quality tracking
- **Real-Time Statistics**: Live user count and activity monitoring
- **Message Analytics**: Comprehensive chat and collaboration insights
- **Logging**: Structured logging with Winston

### 🤝 Collaboration Features
- **Live Document Editing**: Real-time collaborative editing
- **Whiteboard Sync**: Shared drawing and annotation
- **Screen Sharing**: WebRTC-based screen sharing support
- **Session Management**: Collaboration session tracking and permissions

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express validation middleware
- **Logging**: Winston
- **Security**: Helmet.js, CORS, Rate limiting

## 📦 Installation

### Quick Start

1. **Clone and navigate**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   # On Windows
   install-deps.bat
   
   # On macOS/Linux
   chmod +x install-deps.sh
   ./install-deps.sh
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Manual Installation

```bash
# Install production dependencies
npm install

# Install additional real-time dependencies
npm install uuid redis ioredis node-cron compression helmet express-rate-limit winston

# Install development dependencies
npm install --save-dev @types/uuid @types/compression @types/node-cron
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cocreatex` |
| `JWT_SECRET` | JWT signing secret | Required |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `MAX_CONNECTIONS_PER_USER` | Max concurrent connections | `5` |
| `MESSAGE_HISTORY_LIMIT` | Message history limit | `1000` |

### Real-Time Configuration

```typescript
// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### WebRTC Configuration

```typescript
// ICE servers for WebRTC
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chat/messages/:channelId` - Get channel messages
- `POST /api/chat/messages` - Send new message
- `PUT /api/chat/messages/:messageId` - Edit message
- `DELETE /api/chat/messages/:messageId` - Delete message
- `POST /api/chat/messages/:messageId/reactions` - Add/remove reaction
- `GET /api/chat/search` - Search messages

### Presence
- `GET /api/chat/presence` - Get user presence data
- `POST /api/chat/presence` - Update user presence

### Analytics
- `GET /api/chat/analytics/messages` - Message analytics
- `GET /api/realtime/status` - Real-time server status

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Description | Data |
|-------|-------------|------|
| `authenticate` | User authentication | `{ userId, username, channel }` |
| `send-message` | Send chat message | `{ content, channel, type }` |
| `typing-start` | Start typing indicator | `{ channel, username }` |
| `typing-stop` | Stop typing indicator | `{ channel }` |
| `cursor-update` | Update cursor position | `{ x, y, channel }` |
| `add-reaction` | Add message reaction | `{ messageId, emoji, channel }` |
| `rtc-signal` | WebRTC signaling | `{ type, data, to }` |
| `join-channel` | Join chat channel | `channelId` |
| `presence-update` | Update user status | `{ status, activity }` |

### Server → Client Events

| Event | Description | Data |
|-------|-------------|------|
| `new-message` | New chat message | `Message object` |
| `user-typing` | User typing status | `{ userId, username, isTyping }` |
| `cursor-update` | User cursor position | `{ userId, x, y, color }` |
| `reaction-update` | Message reaction update | `{ messageId, emoji, users }` |
| `user-joined` | User joined channel | `{ userId, username }` |
| `user-left` | User left channel | `{ userId, username }` |
| `presence-update` | User presence change | `{ userId, status, activity }` |
| `rtc-signal` | WebRTC signaling relay | `{ type, data, from }` |

## 📊 Data Models

### Message Model
```typescript
interface IMessage {
  content: string;
  sender: ObjectId;
  senderName: string;
  channel: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'voice';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions: IReaction[];
  replyTo?: ObjectId;
  mentions: string[];
  attachments: IAttachment[];
  isPinned: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
```

### User Presence Model
```typescript
interface IUserPresence {
  userId: ObjectId;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline' | 'focus';
  currentChannel: string;
  isTyping: boolean;
  cursorPosition: ICursorPosition;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
  lastActivity: Date;
}
```

## 🚀 Deployment

### Production Setup

1. **Environment configuration**:
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-secure-secret
   REDIS_URL=redis://your-redis-instance
   ```

2. **Build and start**:
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### Performance Optimization

- **Redis**: Use Redis for session storage and real-time data
- **Load Balancing**: Use sticky sessions for Socket.IO
- **CDN**: Serve static assets from CDN
- **Database**: Optimize MongoDB with proper indexing
- **Monitoring**: Set up monitoring with tools like PM2

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:4000/health
```

### Real-Time Status
```bash
curl http://localhost:4000/api/realtime/status
```

### Performance Metrics
- Connected users count
- Active channels
- RTC connections
- Message throughput
- Latency statistics

## 🛡️ Security

- **Rate Limiting**: 1000 requests per 15-minute window
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers enabled
- **Input Validation**: All endpoints validated
- **Authentication**: JWT-based auth required
- **File Upload**: Size and type restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**🌟 Ready for enterprise-level real-time collaboration!**

For questions or support, please open an issue in the repository.
