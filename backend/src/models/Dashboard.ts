import mongoose, { Schema, Document } from 'mongoose';

import { Types } from 'mongoose';
export interface IDashboard extends Document {
  user_id: Types.ObjectId;
  last_login: Date;
  files_count: number;
}

const DashboardSchema = new Schema<IDashboard>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  last_login: { type: Date, default: Date.now },
  files_count: { type: Number, default: 0 }
});

export const DashboardModel = mongoose.model<IDashboard>('Dashboard', DashboardSchema);

export class Dashboard {
  static async getData(user_id: string): Promise<any> {
    const dashboard = await DashboardModel.findOne({ user_id });
    if (dashboard) {
      return dashboard;
    } else {
      // Fallback: count files and return current time
      const filesCount = await mongoose.model('File').countDocuments({ user_id });
      return {
        files_count: filesCount,
        last_login: new Date()
      };
    }
  }
}
