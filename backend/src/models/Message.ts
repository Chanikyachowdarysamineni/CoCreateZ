import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction {
  emoji: string;
  users: string[];
  timestamp: Date;
}

export interface IAttachment {
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface IMessage extends Document {
  id: string;
  content: string;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  channel: string;
  timestamp: Date;
  editedAt?: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'voice' | 'code' | 'poll';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions: IReaction[];
  replyTo?: mongoose.Types.ObjectId;
  mentions: string[];
  attachments: IAttachment[];
  isEdited: boolean;
  isPinned: boolean;
  isForwarded: boolean;
  threadReplies: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deliveredTo: string[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  emoji: { type: String, required: true },
  users: [{ type: String, required: true }],
  timestamp: { type: Date, default: Date.now }
});

const AttachmentSchema = new Schema<IAttachment>({
  name: { type: String, required: true },
  size: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const MessageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  channel: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  editedAt: { type: Date },
  type: { 
    type: String, 
    enum: ['text', 'image', 'file', 'system', 'voice', 'code', 'poll'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  reactions: [ReactionSchema],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  mentions: [{ type: String }],
  attachments: [AttachmentSchema],
  isEdited: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isForwarded: { type: Boolean, default: false },
  threadReplies: { type: Number, default: 0 },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  deliveredTo: [{ type: String }],
  readBy: [{ type: String }]
}, {
  timestamps: true
});

// Indexes for better performance
MessageSchema.index({ channel: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, timestamp: -1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ isPinned: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);