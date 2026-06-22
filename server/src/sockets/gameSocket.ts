import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Match } from '../models/Match';
import * as mockDb from '../config/mockDb';

interface ActiveMatch {
  matchId: string;
  p1: { socketId: string; userId: string; name: string; score: number; currentStep: number; completedRound: boolean };
  p2: { socketId: string; userId: string; name: string; score: number; currentStep: number; completedRound: boolean };
  sequence: string[];
  level: number;
}

const activeMatches = new Map<string, ActiveMatch>();
let matchmakingQueue: { socketId: string; userId: string; name: string; avatar: string }[] = [];

const COLORS = ['red', 'blue', 'green', 'yellow'];

const generateNextColor = (): string => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const initSockets = (io: Server) => {
  // Authentication middleware for Socket.io
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'simonxsupersecretkeyjwt123!') as { id: string };
      let user;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id);
      } else {
        user = mockDb.mockUsers.find(u => u._id === decoded.id);
      }

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`User connected to socket: ${user.name} (${socket.id})`);

    // Matchmaking Queue Join
    socket.on('joinQueue', () => {
      // Avoid duplicate queues
      matchmakingQueue = matchmakingQueue.filter(p => p.userId !== user._id.toString());

      matchmakingQueue.push({
        socketId: socket.id,
        userId: user._id.toString(),
        name: user.name,
        avatar: user.avatar || '',
      });

      console.log(`Queue size: ${matchmakingQueue.length}`);

      socket.emit('queueJoined', { success: true });

      // Check if we have enough players to match
      if (matchmakingQueue.length >= 2) {
        const p1 = matchmakingQueue.shift()!;
        const p2 = matchmakingQueue.shift()!;

        startMatch(p1, p2);
      }
    });

    // Matchmaking Queue Leave
    socket.on('leaveQueue', () => {
      matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
      console.log(`User left queue. Queue size: ${matchmakingQueue.length}`);
      socket.emit('queueLeft');
    });

    // Player inputs a step
    socket.on('playerInput', async (data: { matchId: string; color: string; index: number }) => {
      const { matchId, color, index } = data;
      const match = activeMatches.get(matchId);
      if (!match) return;

      const isP1 = socket.id === match.p1.socketId;
      const player = isP1 ? match.p1 : match.p2;
      const opponent = isP1 ? match.p2 : match.p1;

      // Verify sequence index
      if (index !== player.currentStep) return;

      const expectedColor = match.sequence[index];

      if (color === expectedColor) {
        player.currentStep += 1;
        
        // Notify opponent of input progress
        io.to(opponent.socketId).emit('opponentStep', { step: player.currentStep });

        // If sequence is fully matched for the current round
        if (player.currentStep === match.sequence.length) {
          player.completedRound = true;
          player.score += match.level * 10; // Level multiplier

          // Inform client they completed the sequence
          socket.emit('roundCompleted', { score: player.score });

          // If BOTH finished their round, move to next round
          if (match.p1.completedRound && match.p2.completedRound) {
            match.level += 1;
            match.p1.completedRound = false;
            match.p2.completedRound = false;
            match.p1.currentStep = 0;
            match.p2.currentStep = 0;

            const nextColor = generateNextColor();
            match.sequence.push(nextColor);

            // Give a short delay before starting the next round
            setTimeout(() => {
              io.to(match.p1.socketId).emit('nextRound', { sequence: match.sequence, level: match.level });
              io.to(match.p2.socketId).emit('nextRound', { sequence: match.sequence, level: match.level });
            }, 1000);
          }
        }
      } else {
        // MISTAKE! Player loses immediately
        await endMatchDueToMistake(match, player.userId);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Remove from matchmaking queue if present
      matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);

      // Check if user is in an active match
      for (const [matchId, match] of activeMatches.entries()) {
        if (match.p1.socketId === socket.id || match.p2.socketId === socket.id) {
          const disconnectedUserId = match.p1.socketId === socket.id ? match.p1.userId : match.p2.userId;
          await endMatchDueToAbandon(match, disconnectedUserId);
          break;
        }
      }
    });
  });

  const startMatch = async (
    p1: { socketId: string; userId: string; name: string; avatar: string },
    p2: { socketId: string; userId: string; name: string; avatar: string }
  ) => {
    try {
      let matchId = `mock-match-${Date.now()}`;
      if (mongoose.connection.readyState === 1) {
        // Create match in Database
        const matchDb = await Match.create({
          player1: p1.userId,
          player2: p2.userId,
          status: 'playing',
        });
        matchId = matchDb._id.toString();
      } else {
        mockDb.mockMatches.push({
          _id: matchId,
          player1: p1.userId,
          player2: p2.userId,
          status: 'playing',
          createdAt: new Date(),
        });
        mockDb.persistMockDb();
      }

      const initialSequence = [generateNextColor(), generateNextColor(), generateNextColor()];

      const matchState: ActiveMatch = {
        matchId,
        p1: { socketId: p1.socketId, userId: p1.userId, name: p1.name, score: 0, currentStep: 0, completedRound: false },
        p2: { socketId: p2.socketId, userId: p2.userId, name: p2.name, score: 0, currentStep: 0, completedRound: false },
        sequence: initialSequence,
        level: 1,
      };

      activeMatches.set(matchId, matchState);

      // Tell players that a match has started
      io.to(p1.socketId).emit('matchStart', {
        matchId,
        opponent: { name: p2.name, avatar: p2.avatar },
        sequence: initialSequence,
        level: 1,
      });

      io.to(p2.socketId).emit('matchStart', {
        matchId,
        opponent: { name: p1.name, avatar: p1.avatar },
        sequence: initialSequence,
        level: 1,
      });

      console.log(`Match ${matchId} started between ${p1.name} and ${p2.name}`);
    } catch (err) {
      console.error('Error starting multiplayer match:', err);
    }
  };

  const endMatchDueToMistake = async (match: ActiveMatch, loserUserId: string) => {
    try {
      const isP1Loser = loserUserId === match.p1.userId;
      const winner = isP1Loser ? match.p2 : match.p1;
      const loser = isP1Loser ? match.p1 : match.p2;

      // Update match in Database
      if (mongoose.connection.readyState === 1) {
        const matchDb = await Match.findById(match.matchId);
        if (matchDb) {
          matchDb.status = 'completed';
          matchDb.winner = winner.userId as any;
          matchDb.score1 = match.p1.score;
          matchDb.score2 = match.p2.score;
          await matchDb.save();
        }

        // Award Wins to Winner user document
        await User.findByIdAndUpdate(winner.userId, { $inc: { wins: 1, gamesPlayed: 1 } });
        await User.findByIdAndUpdate(loser.userId, { $inc: { gamesPlayed: 1 } });
      } else {
        const matchDb = mockDb.mockMatches.find(m => m._id === match.matchId);
        if (matchDb) {
          matchDb.status = 'completed';
          matchDb.winner = winner.userId;
          matchDb.score1 = match.p1.score;
          matchDb.score2 = match.p2.score;
        }

        const dbWinner = mockDb.mockUsers.find(u => u._id === winner.userId);
        if (dbWinner) {
          dbWinner.wins += 1;
          dbWinner.gamesPlayed += 1;
        }

        const dbLoser = mockDb.mockUsers.find(u => u._id === loser.userId);
        if (dbLoser) {
          dbLoser.gamesPlayed += 1;
        }

        mockDb.persistMockDb();
      }

      // Emit game results
      io.to(winner.socketId).emit('matchOver', {
        winnerId: winner.userId,
        myScore: winner.score,
        opponentScore: loser.score,
        youWon: true,
        reason: 'opponent_mistake',
      });

      io.to(loser.socketId).emit('matchOver', {
        winnerId: winner.userId,
        myScore: loser.score,
        opponentScore: winner.score,
        youWon: false,
        reason: 'mistake',
      });

      activeMatches.delete(match.matchId);
      console.log(`Match ${match.matchId} ended. Winner: ${winner.name}`);
    } catch (err) {
      console.error('Error ending match due to mistake:', err);
    }
  };

  const endMatchDueToAbandon = async (match: ActiveMatch, disconnectedUserId: string) => {
    try {
      const isP1Disconnected = disconnectedUserId === match.p1.userId;
      const winner = isP1Disconnected ? match.p2 : match.p1;
      const loser = isP1Disconnected ? match.p1 : match.p2;

      // Update Database
      if (mongoose.connection.readyState === 1) {
        const matchDb = await Match.findById(match.matchId);
        if (matchDb) {
          matchDb.status = 'abandoned';
          matchDb.winner = winner.userId as any;
          matchDb.score1 = match.p1.score;
          matchDb.score2 = match.p2.score;
          await matchDb.save();
        }

        // Award Win
        await User.findByIdAndUpdate(winner.userId, { $inc: { wins: 1, gamesPlayed: 1 } });
      } else {
        const matchDb = mockDb.mockMatches.find(m => m._id === match.matchId);
        if (matchDb) {
          matchDb.status = 'abandoned';
          matchDb.winner = winner.userId;
          matchDb.score1 = match.p1.score;
          matchDb.score2 = match.p2.score;
        }

        const dbWinner = mockDb.mockUsers.find(u => u._id === winner.userId);
        if (dbWinner) {
          dbWinner.wins += 1;
          dbWinner.gamesPlayed += 1;
        }

        mockDb.persistMockDb();
      }

      // Notify the active player
      io.to(winner.socketId).emit('matchOver', {
        winnerId: winner.userId,
        myScore: winner.score,
        opponentScore: loser.score,
        youWon: true,
        reason: 'opponent_disconnected',
      });

      activeMatches.delete(match.matchId);
      console.log(`Match ${match.matchId} abandoned by ${loser.name}. Winner: ${winner.name}`);
    } catch (err) {
      console.error('Error ending match due to abandon:', err);
    }
  };
};
