import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import crypto from 'crypto';
import { Message } from '../models/Message';
import { UserPresence } from '../models/UserPresence';
import { CollaborationSession } from '../models/CollaborationSession';

// Simple UUID generator function
function generateUUID(): string {
  return crypto.randomUUID();
}

// Simple logger for now
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args)
};

export interface RTCSignalingData {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
}

export interface ChatEventData {
  type: 'message' | 'typing' | 'reaction' | 'presence' | 'cursor' | 'activity';
  data: any;
  userId: string;
  channel: string;
  timestamp: Date;
}

export interface PerformanceMetrics {
  latency: number;
  bandwidth: { upload: number; download: number };
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  packetLoss: number;
}

export class RealTimeServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Socket> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> socketId
  private channelRooms: Map<string, Set<string>> = new Map(); // channelId -> socketIds
  private rtcPairs: Map<string, Set<string>> = new Map(); // socketId -> connected peers
  private performanceData: Map<string, PerformanceMetrics> = new Map();

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
    this.startPerformanceMonitoring();
    logger.info('Real-time server initialized');
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`User connected: ${socket.id}`);
      this.connectedUsers.set(socket.id, socket);

      // Authentication and user setup
      socket.on('authenticate', async (userData: { userId: string; username: string; channel: string }) => {
        await this.handleUserAuthentication(socket, userData);
      });

      // WebRTC Signaling
      socket.on('rtc-signal', (data: RTCSignalingData) => {
        this.handleRTCSignaling(socket, data);
      });

      // Chat Events
      socket.on('chat-event', async (data: ChatEventData) => {
        await this.handleChatEvent(socket, data);
      });

      // Real-time Message Handling
      socket.on('send-message', async (messageData: any) => {
        await this.handleNewMessage(socket, messageData);
      });

      // Typing Indicators
      socket.on('typing-start', (data: { channel: string; username: string }) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing-stop', (data: { channel: string }) => {
        this.handleTypingStop(socket, data);
      });

      // Presence Updates
      socket.on('presence-update', async (data: { status: string; activity: string }) => {
        await this.handlePresenceUpdate(socket, data);
      });

      // Cursor Tracking
      socket.on('cursor-update', (data: { x: number; y: number; channel: string }) => {
        this.handleCursorUpdate(socket, data);
      });

      // Reactions
      socket.on('add-reaction', async (data: { messageId: string; emoji: string; channel: string }) => {
        await this.handleReaction(socket, data);
      });

      // Performance Monitoring
      socket.on('performance-update', (data: PerformanceMetrics) => {
        this.handlePerformanceUpdate(socket, data);
      });

      // Channel Management
      socket.on('join-channel', async (channelId: string) => {
        await this.handleJoinChannel(socket, channelId);
      });

      socket.on('leave-channel', async (channelId: string) => {
        await this.handleLeaveChannel(socket, channelId);
      });

      // Collaboration Features
      socket.on('start-collaboration', async (data: { type: string; channelId: string; metadata: any }) => {
        await this.handleStartCollaboration(socket, data);
      });

      socket.on('collaboration-action', (data: { sessionId: string; action: any }) => {
        this.handleCollaborationAction(socket, data);
      });

      // File Sharing
      socket.on('share-file', async (data: { channelId: string; fileData: any }) => {
        await this.handleFileShare(socket, data);
      });

      // Voice/Video Call Signaling
      socket.on('call-user', (data: { targetUserId: string; offer: any }) => {
        this.handleCallUser(socket, data);
      });

      socket.on('call-response', (data: { callerSocketId: string; answer: any }) => {
        this.handleCallResponse(socket, data);
      });

      // Disconnect Handler
      socket.on('disconnect', async (reason: string) => {
        await this.handleDisconnect(socket, reason);
      });

      // Error Handler
      socket.on('error', (error: Error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  private async handleUserAuthentication(socket: Socket, userData: { userId: string; username: string; channel: string }): Promise<void> {
    try {
      const { userId, username, channel } = userData;
      
      // Store user session
      this.userSessions.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.username = username;

      // Join a user-specific room for private events
      try {
        socket.join(`user:${userId}`);
      } catch (err) {
        logger.warn('Failed to join user room', err);
      }

      // Update or create user presence
      await UserPresence.findOneAndUpdate(
        { userId },
        {
          userId,
          username,
          status: 'online',
          lastSeen: new Date(),
          currentChannel: channel,
          connectionId: socket.id,
          device: 'web',
          sessionStart: new Date(),
          lastActivity: new Date(),
          cursorPosition: { x: 0, y: 0, timestamp: new Date(), color: this.generateUserColor(userId) }
        },
        { upsert: true, new: true }
      );

      // Join channel
      await this.handleJoinChannel(socket, channel);

      // Notify others of user joining
      socket.to(channel).emit('user-joined', {
        userId,
        username,
        timestamp: new Date()
      });

      // Send current online users to the new user
      const onlineUsers = await this.getChannelUsers(channel);
      socket.emit('online-users', onlineUsers);

      logger.info(`User ${username} (${userId}) authenticated and joined ${channel}`);
    } catch (error) {
      logger.error('Error in user authentication:', error);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  }

  private handleRTCSignaling(socket: Socket, data: RTCSignalingData): void {
    const targetSocket = this.connectedUsers.get(data.to);
    if (targetSocket) {
      targetSocket.emit('rtc-signal', {
        ...data,
        from: socket.id
      });

      // Track RTC connections
      if (!this.rtcPairs.has(socket.id)) {
        this.rtcPairs.set(socket.id, new Set());
      }
      this.rtcPairs.get(socket.id)?.add(data.to);

      logger.info(`RTC signal relayed from ${socket.id} to ${data.to}`);
    } else {
      socket.emit('rtc-error', { message: 'Target user not found' });
    }
  }

  private async handleChatEvent(socket: Socket, data: ChatEventData): Promise<void> {
    try {
      const { type, data: eventData, channel } = data;

      switch (type) {
        case 'message':
          await this.handleNewMessage(socket, eventData);
          break;
        case 'typing':
          if (eventData.isTyping) {
            this.handleTypingStart(socket, { channel, username: socket.data.username });
          } else {
            this.handleTypingStop(socket, { channel });
          }
          break;
        case 'cursor':
          this.handleCursorUpdate(socket, { ...eventData, channel });
          break;
        case 'activity':
          await this.handlePresenceUpdate(socket, { status: 'online', activity: eventData.activity });
          break;
      }
    } catch (error) {
      logger.error('Error handling chat event:', error);
    }
  }

  private async handleNewMessage(socket: Socket, messageData: any): Promise<void> {
    try {
      const message = new Message({
        ...messageData,
        sender: socket.data.userId,
        senderName: socket.data.username,
        timestamp: new Date(),
        status: 'sent'
      });

      await message.save();

      // Broadcast to all users in the channel
      this.io.to(messageData.channel).emit('new-message', {
        ...message.toObject(),
        id: message._id
      });

      // Update delivery status
      const channelUsers = await this.getChannelUsers(messageData.channel);
      const deliveredTo = channelUsers.filter(user => user.userId !== socket.data.userId).map(user => user.userId);
      
      await Message.findByIdAndUpdate(message._id, {
        status: 'delivered',
        deliveredTo
      });

      logger.info(`Message sent by ${socket.data.username} in ${messageData.channel}`);
    } catch (error) {
      logger.error('Error handling new message:', error);
      socket.emit('message-error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: Socket, data: { channel: string; username: string }): void {
    socket.to(data.channel).emit('user-typing', {
      userId: socket.data.userId,
      username: data.username,
      channel: data.channel,
      isTyping: true
    });
  }

  private handleTypingStop(socket: Socket, data: { channel: string }): void {
    socket.to(data.channel).emit('user-typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      channel: data.channel,
      isTyping: false
    });
  }

  private async handlePresenceUpdate(socket: Socket, data: { status: string; activity: string }): Promise<void> {
    try {
      await UserPresence.findOneAndUpdate(
        { userId: socket.data.userId },
        {
          status: data.status,
          currentActivity: data.activity,
          lastActivity: new Date()
        }
      );

      // Broadcast presence update
      socket.broadcast.emit('presence-update', {
        userId: socket.data.userId,
        status: data.status,
        activity: data.activity,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating presence:', error);
    }
  }

  private handleCursorUpdate(socket: Socket, data: { x: number; y: number; channel: string }): void {
    socket.to(data.channel).emit('cursor-update', {
      userId: socket.data.userId,
      username: socket.data.username,
      x: data.x,
      y: data.y,
      color: this.generateUserColor(socket.data.userId),
      timestamp: new Date()
    });
  }

  private async handleReaction(socket: Socket, data: { messageId: string; emoji: string; channel: string }): Promise<void> {
    try {
      const message = await Message.findById(data.messageId);
      if (!message) return;

      const existingReaction = message.reactions.find(r => r.emoji === data.emoji);
      if (existingReaction) {
        if (existingReaction.users.includes(socket.data.username)) {
          existingReaction.users = existingReaction.users.filter(u => u !== socket.data.username);
        } else {
          existingReaction.users.push(socket.data.username);
        }
      } else {
        message.reactions.push({
          emoji: data.emoji,
          users: [socket.data.username],
          timestamp: new Date()
        });
      }

      await message.save();

      // Broadcast reaction update
      this.io.to(data.channel).emit('reaction-update', {
        messageId: data.messageId,
        emoji: data.emoji,
        users: existingReaction?.users || [socket.data.username],
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error handling reaction:', error);
    }
  }

  private handlePerformanceUpdate(socket: Socket, data: PerformanceMetrics): void {
    this.performanceData.set(socket.id, data);
    
    // Update user presence with performance data
    UserPresence.findOneAndUpdate(
      { userId: socket.data.userId },
      {
        networkQuality: data.connectionQuality,
        latency: data.latency,
        bandwidth: data.bandwidth
      }
    ).catch(error => logger.error('Error updating performance data:', error));
  }

  private async handleJoinChannel(socket: Socket, channelId: string): Promise<void> {
    socket.join(channelId);
    
    if (!this.channelRooms.has(channelId)) {
      this.channelRooms.set(channelId, new Set());
    }
    this.channelRooms.get(channelId)?.add(socket.id);

    // Update user's current channel
    if (socket.data.userId) {
      await UserPresence.findOneAndUpdate(
        { userId: socket.data.userId },
        { currentChannel: channelId }
      );
    }

    logger.info(`User ${socket.data.username} joined channel ${channelId}`);
  }

  private async handleLeaveChannel(socket: Socket, channelId: string): Promise<void> {
    socket.leave(channelId);
    this.channelRooms.get(channelId)?.delete(socket.id);

    logger.info(`User ${socket.data.username} left channel ${channelId}`);
  }

  private async handleStartCollaboration(socket: Socket, data: { type: string; channelId: string; metadata: any }): Promise<void> {
    try {
      const session = new CollaborationSession({
        sessionId: generateUUID(),
        channelId: data.channelId,
        type: data.type,
        participants: [socket.data.userId],
        host: socket.data.userId,
        metadata: data.metadata
      });

      await session.save();

      socket.emit('collaboration-started', {
        sessionId: session.sessionId,
        type: session.type,
        metadata: session.metadata
      });

      // Notify channel about new collaboration session
      socket.to(data.channelId).emit('collaboration-available', {
        sessionId: session.sessionId,
        type: session.type,
        host: socket.data.username,
        metadata: session.metadata
      });

      logger.info(`Collaboration session ${session.sessionId} started by ${socket.data.username}`);
    } catch (error) {
      logger.error('Error starting collaboration:', error);
    }
  }

  private handleCollaborationAction(socket: Socket, data: { sessionId: string; action: any }): void {
    // Broadcast collaboration action to all participants
    socket.broadcast.emit('collaboration-action', {
      sessionId: data.sessionId,
      action: data.action,
      userId: socket.data.userId,
      timestamp: new Date()
    });
  }

  private async handleFileShare(socket: Socket, data: { channelId: string; fileData: any }): Promise<void> {
    try {
      const message = new Message({
        content: `Shared file: ${data.fileData.name}`,
        sender: socket.data.userId,
        senderName: socket.data.username,
        channel: data.channelId,
        type: 'file',
        attachments: [data.fileData],
        timestamp: new Date()
      });

      await message.save();

      this.io.to(data.channelId).emit('file-shared', {
        message: message.toObject(),
        fileData: data.fileData
      });
    } catch (error) {
      logger.error('Error sharing file:', error);
    }
  }

  private handleCallUser(socket: Socket, data: { targetUserId: string; offer: any }): void {
    const targetSocketId = this.userSessions.get(data.targetUserId);
    if (targetSocketId) {
      const targetSocket = this.connectedUsers.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('incoming-call', {
          callerSocketId: socket.id,
          callerUserId: socket.data.userId,
          callerUsername: socket.data.username,
          offer: data.offer
        });
      }
    }
  }

  private handleCallResponse(socket: Socket, data: { callerSocketId: string; answer: any }): void {
    const callerSocket = this.connectedUsers.get(data.callerSocketId);
    if (callerSocket) {
      callerSocket.emit('call-accepted', {
        answer: data.answer,
        responderUserId: socket.data.userId,
        responderUsername: socket.data.username
      });
    }
  }

  private async handleDisconnect(socket: Socket, reason: string): Promise<void> {
    logger.info(`User ${socket.data.username} (${socket.id}) disconnected: ${reason}`);

    // Clean up user session
    this.connectedUsers.delete(socket.id);
    if (socket.data.userId) {
      this.userSessions.delete(socket.data.userId);
    }

    // Update user presence to offline
    if (socket.data.userId) {
      await UserPresence.findOneAndUpdate(
        { userId: socket.data.userId },
        {
          status: 'offline',
          lastSeen: new Date()
        }
      );

      // Notify others of user leaving
      socket.broadcast.emit('user-left', {
        userId: socket.data.userId,
        username: socket.data.username,
        timestamp: new Date()
      });
    }

    // Clean up RTC connections
    this.rtcPairs.delete(socket.id);

    // Clean up performance data
    this.performanceData.delete(socket.id);

    // Remove from channel rooms
    this.channelRooms.forEach(room => room.delete(socket.id));
  }

  private async getChannelUsers(channelId: string): Promise<any[]> {
    try {
      const users = await UserPresence.find({
        currentChannel: channelId,
        status: { $ne: 'offline' }
      }).populate('userId', 'name email');
      
      return users.map(user => ({
        userId: user.userId,
        username: user.username,
        status: user.status,
        lastSeen: user.lastSeen,
        isTyping: user.isTyping
      }));
    } catch (error) {
      logger.error('Error getting channel users:', error);
      return [];
    }
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const connectedCount = this.connectedUsers.size;
      const activeChannels = this.channelRooms.size;
      const rtcConnections = Array.from(this.rtcPairs.values()).reduce((acc, set) => acc + set.size, 0);

      logger.info(`Performance: ${connectedCount} users, ${activeChannels} channels, ${rtcConnections} RTC connections`);

      // Broadcast server stats to all connected users
      this.io.emit('server-stats', {
        connectedUsers: connectedCount,
        activeChannels,
        rtcConnections,
        timestamp: new Date()
      });
    }, 30000); // Every 30 seconds
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getActiveChannelsCount(): number {
    return this.channelRooms.size;
  }
}