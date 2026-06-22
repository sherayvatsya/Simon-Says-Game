import { Schema, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  player1: Types.ObjectId;
  player2: Types.ObjectId;
  winner?: Types.ObjectId;
  score1: number;
  score2: number;
  status: 'pending' | 'playing' | 'completed' | 'abandoned';
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  player1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  player2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'playing', 'completed', 'abandoned'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export const Match = model<IMatch>('Match', MatchSchema);
