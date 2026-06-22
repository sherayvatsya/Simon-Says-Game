import { Schema, model, Document, Types } from 'mongoose';

export interface IGameHistory extends Document {
  userId: Types.ObjectId;
  mode: 'classic' | 'time-attack' | 'reverse' | 'zen' | 'multiplayer';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  score: number;
  accuracy: number; // Percentage
  duration: number; // Seconds
  levelReached: number;
  date: Date;
}

const GameHistorySchema = new Schema<IGameHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { 
    type: String, 
    enum: ['classic', 'time-attack', 'reverse', 'zen', 'multiplayer'], 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'extreme'], 
    required: true 
  },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  duration: { type: Number, required: true },
  levelReached: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export const GameHistory = model<IGameHistory>('GameHistory', GameHistorySchema);
