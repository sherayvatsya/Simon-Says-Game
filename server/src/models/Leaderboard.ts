import { Schema, model, Document, Types } from 'mongoose';

export interface ILeaderboard extends Document {
  userId: Types.ObjectId;
  username: string;
  highestScore: number;
  weeklyScore: number;
  dailyScore: number;
  rank?: number;
  lastUpdated: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, required: true },
  highestScore: { type: Number, default: 0 },
  weeklyScore: { type: Number, default: 0 },
  dailyScore: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export const Leaderboard = model<ILeaderboard>('Leaderboard', LeaderboardSchema);
