import mongoose, { Document, Schema } from 'mongoose';

export interface ICollaborationSession extends Document {
  sessionId: string;
  channelId: string;
  type: 'chat' | 'whiteboard' | 'document' | 'screen_share';
  participants: mongoose.Types.ObjectId[];
  host: mongoose.Types.ObjectId;
  status: 'active' | 'paused' | 'ended';
  rtcConfig: {
    iceServers: string[];
    dataChannels: string[];
  };
  permissions: {
    userId: mongoose.Types.ObjectId;
    canEdit: boolean;
    canAnnotate: boolean;
    canShare: boolean;
    isAdmin: boolean;
  }[];
  settings: {
    autoSave: boolean;
    recordSession: boolean;
    allowGuests: boolean;
    maxParticipants: number;
  };
  metadata: {
    title: string;
    description: string;
    tags: string[];
  };
  performance: {
    averageLatency: number;
    connectionQuality: number;
    dataTransferred: number;
    sessionDuration: number;
  };
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

const CollaborationSessionSchema = new Schema<ICollaborationSession>({
  sessionId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  type: {
    type: String,
    enum: ['chat', 'whiteboard', 'document', 'screen_share'],
    required: true
  },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active'
  },
  rtcConfig: {
    iceServers: [{ type: String }],
    dataChannels: [{ type: String }]
  },
  permissions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    canEdit: { type: Boolean, default: true },
    canAnnotate: { type: Boolean, default: true },
    canShare: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
  }],
  settings: {
    autoSave: { type: Boolean, default: true },
    recordSession: { type: Boolean, default: false },
    allowGuests: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 50 }
  },
  metadata: {
    title: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }]
  },
  performance: {
    averageLatency: { type: Number, default: 0 },
    connectionQuality: { type: Number, default: 100 },
    dataTransferred: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 }
  },
  endedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes
CollaborationSessionSchema.index({ sessionId: 1 });
CollaborationSessionSchema.index({ channelId: 1, status: 1 });
CollaborationSessionSchema.index({ participants: 1 });
CollaborationSessionSchema.index({ createdAt: -1 });

export const CollaborationSession = mongoose.model<ICollaborationSession>('CollaborationSession', CollaborationSessionSchema);