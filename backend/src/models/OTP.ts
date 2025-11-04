import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  used: boolean;
}

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false }
}, { timestamps: true });

OTPSchema.index({ email: 1, code: 1 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);

export class OTPModel {
  static async createForEmail(email: string, code: string, ttlSeconds = 300) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const otp = new OTP({ email, code, expiresAt });
    return otp.save();
  }

  static async findValid(email: string, code: string) {
    return OTP.findOne({ email, code, used: false, expiresAt: { $gt: new Date() } });
  }

  static async markUsed(id: string) {
    return OTP.findByIdAndUpdate(id, { used: true }, { new: true });
  }
}
