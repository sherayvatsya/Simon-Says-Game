import { Schema, model, Document, Types } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  icon: string; // Icon identifier/slug (e.g., 'award', 'zap')
  points: number; // XP points awarded
  unlockedUsers: Types.ObjectId[]; // List of User ObjectIds who unlocked it
}

const AchievementSchema = new Schema<IAchievement>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  points: { type: Number, default: 0 },
  unlockedUsers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] }
});

export const Achievement = model<IAchievement>('Achievement', AchievementSchema);
