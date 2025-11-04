import mongoose, { Document, Schema } from 'mongoose';

export interface ICursorPosition {
  x: number;
  y: number;
  timestamp: Date;
  color: string;
}

export interface IUserPresence extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline' | 'focus';
  lastSeen: Date;
  currentChannel: string;
  isTyping: boolean;
  typingChannel?: string;
  cursorPosition: ICursorPosition;
  device: 'desktop' | 'mobile' | 'web';
  currentActivity: string;
  connectionId: string;
  rtcConnections: string[];
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  sessionStart: Date;
  lastActivity: Date;
}

const CursorPositionSchema = new Schema<ICursorPosition>({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  color: { type: String, required: true }
});

const UserPresenceSchema = new Schema<IUserPresence>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, required: true },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline', 'focus'],
    default: 'online'
  },
  lastSeen: { type: Date, default: Date.now },
  currentChannel: { type: String, default: 'general' },
  isTyping: { type: Boolean, default: false },
  typingChannel: { type: String },
  cursorPosition: CursorPositionSchema,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'web'],
    default: 'web'
  },
  currentActivity: { type: String, default: 'idle' },
  connectionId: { type: String, required: true },
  rtcConnections: [{ type: String }],
  networkQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  },
  latency: { type: Number, default: 0 },
  bandwidth: {
    upload: { type: Number, default: 0 },
    download: { type: Number, default: 0 }
  },
  sessionStart: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// TTL index to automatically remove old presence records
UserPresenceSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 3600 }); // 1 hour
UserPresenceSchema.index({ userId: 1 });
UserPresenceSchema.index({ status: 1 });
UserPresenceSchema.index({ currentChannel: 1 });

export const UserPresence = mongoose.model<IUserPresence>('UserPresence', UserPresenceSchema);