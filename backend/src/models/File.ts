import mongoose, { Schema, Document } from 'mongoose';

import { Types } from 'mongoose';
export interface IFile extends Document {
  filename: string;
  originalname: string;
  user_id: Types.ObjectId;
  mime?: string;
  size?: number;
  fileType?: 'excel' | 'document' | 'presentation' | 'image' | 'other';
  tags?: string[];
  permissions?: any;
}

const FileSchema = new Schema<IFile>({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  ,
  mime: { type: String },
  size: { type: Number },
  fileType: { type: String, enum: ['excel','document','presentation','image','other'], default: 'other' },
  tags: [{ type: String }],
  permissions: { type: Schema.Types.Mixed }
});

export const FileModel = mongoose.model<IFile>('File', FileSchema);

export class File {
  static async create(data: Partial<IFile>): Promise<IFile> {
    const file = new FileModel(data);
    return file.save();
  }
  static async findByUserId(user_id: string): Promise<IFile[]> {
    return FileModel.find({ user_id });
  }
}
