import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  host: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  channel: string;
  recordingUrl?: string;
  metadata?: any;
}

const MeetingSchema = new Schema<IMeeting>({
  title: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  channel: { type: String },
  recordingUrl: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

MeetingSchema.index({ channel: 1, startTime: -1 });

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
