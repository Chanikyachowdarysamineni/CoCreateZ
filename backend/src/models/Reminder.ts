import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  time: Date;
  recurrence?: { freq: string; interval?: number };
  metadata?: any;
  active: boolean;
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  time: { type: Date, required: true },
  recurrence: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  active: { type: Boolean, default: true }
}, { timestamps: true });

ReminderSchema.index({ userId: 1, time: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
