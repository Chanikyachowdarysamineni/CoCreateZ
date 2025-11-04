import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  department?: string;
  location?: string;
  bio?: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  department: { type: String },
  location: { type: String },
  bio: { type: String },
  avatar: { type: String }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

export class User {
  static async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }
  static async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }
  static async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }
  static async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
