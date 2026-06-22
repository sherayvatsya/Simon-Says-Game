import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  highestScore: number;
  gamesPlayed: number;
  wins: number;
  levelReached: number;
  achievements: string[]; // List of unlocked achievement IDs/titles
  googleId?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  highestScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  levelReached: { type: Number, default: 0 },
  achievements: { type: [String], default: [] },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  securityQuestion: { type: String, default: '' },
  securityAnswer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Remove password in JSON transform
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.verificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.securityAnswer;
    return ret;
  }
});

export const User = model<IUser>('User', UserSchema);
