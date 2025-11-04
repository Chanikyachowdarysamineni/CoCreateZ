import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  owner: mongoose.Types.ObjectId;
  members: string[]; // array of emails
  invites: { email: string; invitedAt: Date }[];
}

const TeamSchema = new Schema<ITeam>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: String, required: true }],
  invites: [{
    email: { type: String, required: true },
    invitedAt: { type: Date, default: Date.now }
  }]
});

export const TeamModel = mongoose.model<ITeam>('Team', TeamSchema);

export class Team {
  static async invite(owner: string, email: string) {
    let team = await TeamModel.findOne({ owner });
    if (!team) {
      team = new TeamModel({ owner, members: [], invites: [] });
    }
    team.invites.push({ email, invitedAt: new Date() });
    await team.save();
    return team;
  }
  static async getMembers(owner: string) {
    const team = await TeamModel.findOne({ owner });
    return team ? team.members : [];
  }
  static async getInvites(owner: string) {
    const team = await TeamModel.findOne({ owner });
    return team ? team.invites : [];
  }
}
