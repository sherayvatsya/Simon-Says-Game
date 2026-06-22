import { Router, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { protect, AuthRequest } from '../middleware/auth';
import { GameHistory } from '../models/GameHistory';
import { User } from '../models/User';
import { Leaderboard } from '../models/Leaderboard';
import { Achievement } from '../models/Achievement';
import * as mockDb from '../config/mockDb';

const router = Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

const saveGameSchema = z.object({
  mode: z.enum(['classic', 'time-attack', 'reverse', 'zen', 'multiplayer']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']),
  score: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  duration: z.number().min(0),
  levelReached: z.number().min(0),
});

// Helper check list of achievements
const ACHIEVEMENTS_LIST = [
  { title: 'Beginner', description: 'Complete your first memory challenge!', icon: 'award', points: 100 },
  { title: 'Memory Master', description: 'Reach a score of 20 or more in a single game!', icon: 'zap', points: 500 },
  { title: 'Level 50', description: 'Reach level 50 in Classic Mode!', icon: 'trophy', points: 1000 },
  { title: 'Level 100', description: 'Reach level 100 in Classic Mode!', icon: 'crown', points: 2500 },
  { title: 'Perfect Accuracy', description: 'Achieve 100% accuracy in a game with score 10+!', icon: 'star', points: 500 },
  { title: 'Zen Master', description: 'Play Zen mode for over 2 minutes!', icon: 'heart', points: 300 },
  { title: 'Time Warrior', description: 'Reach a score of 15 in Time Attack!', icon: 'timer', points: 400 },
];

const seedAchievements = async () => {
  try {
    if (isDbConnected()) {
      for (const ach of ACHIEVEMENTS_LIST) {
        const exists = await Achievement.findOne({ title: ach.title });
        if (!exists) {
          await Achievement.create(ach);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding achievements:', err);
  }
};
seedAchievements();

// @route   POST /api/game/save
// @desc    Save a game session, update stats and award achievements
router.post('/save', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const validation = saveGameSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.errors });
    }

    const { mode, difficulty, score, accuracy, duration, levelReached } = validation.data;
    const user = req.user!;

    if (isDbConnected()) {
      // Create game history log
      const gameHistory = await GameHistory.create({
        userId: user._id,
        mode,
        difficulty,
        score,
        accuracy,
        duration,
        levelReached,
      });

      // Update user general stats
      user.gamesPlayed += 1;
      if (score > user.highestScore) {
        user.highestScore = score;
      }
      if (levelReached > user.levelReached) {
        user.levelReached = levelReached;
      }
      if (mode === 'multiplayer' && req.body.isWinner) {
        user.wins += 1;
      }

      // Check & unlock achievements
      const newlyUnlocked: string[] = [];
      const checkAndUnlock = async (title: string, condition: boolean) => {
        if (condition && !user.achievements.includes(title)) {
          user.achievements.push(title);
          newlyUnlocked.push(title);
          await Achievement.updateOne(
            { title },
            { $addToSet: { unlockedUsers: user._id } }
          );
        }
      };

      await checkAndUnlock('Beginner', user.gamesPlayed >= 1);
      await checkAndUnlock('Memory Master', score >= 20);
      await checkAndUnlock('Level 50', levelReached >= 50 && mode === 'classic');
      await checkAndUnlock('Level 100', levelReached >= 100 && mode === 'classic');
      await checkAndUnlock('Perfect Accuracy', accuracy === 100 && score >= 10);
      await checkAndUnlock('Zen Master', mode === 'zen' && duration >= 120);
      await checkAndUnlock('Time Warrior', mode === 'time-attack' && score >= 15);

      await user.save();

      // Update Leaderboard entry
      let leaderboardEntry = await Leaderboard.findOne({ userId: user._id });
      if (!leaderboardEntry) {
        leaderboardEntry = new Leaderboard({
          userId: user._id,
          username: user.name,
        });
      }

      leaderboardEntry.highestScore = Math.max(leaderboardEntry.highestScore, user.highestScore);
      leaderboardEntry.dailyScore = Math.max(leaderboardEntry.dailyScore, score);
      leaderboardEntry.weeklyScore = Math.max(leaderboardEntry.weeklyScore, score);
      leaderboardEntry.lastUpdated = new Date();
      await leaderboardEntry.save();

      return res.json({
        success: true,
        gameHistory,
        newAchievements: newlyUnlocked,
        stats: {
          highestScore: user.highestScore,
          gamesPlayed: user.gamesPlayed,
          levelReached: user.levelReached,
          achievements: user.achievements,
        },
      });
    } else {
      // Mock db operations
      const mockHist: mockDb.MockGameHistory = {
        _id: `mock-hist-${Date.now()}`,
        userId: user._id,
        mode,
        difficulty,
        score,
        accuracy,
        duration,
        levelReached,
        date: new Date(),
      };
      mockDb.mockGameHistory.push(mockHist);

      // Update user in array
      const dbUser = mockDb.mockUsers.find(u => u._id === user._id);
      if (dbUser) {
        dbUser.gamesPlayed += 1;
        if (score > dbUser.highestScore) dbUser.highestScore = score;
        if (levelReached > dbUser.levelReached) dbUser.levelReached = levelReached;
        if (mode === 'multiplayer' && req.body.isWinner) dbUser.wins += 1;

        // Check & unlock achievements
        const newlyUnlocked: string[] = [];
        const checkUnlock = (title: string, condition: boolean) => {
          if (condition && !dbUser.achievements.includes(title)) {
            dbUser.achievements.push(title);
            newlyUnlocked.push(title);
          }
        };

        checkUnlock('Beginner', dbUser.gamesPlayed >= 1);
        checkUnlock('Memory Master', score >= 20);
        checkUnlock('Level 50', levelReached >= 50 && mode === 'classic');
        checkUnlock('Level 100', levelReached >= 100 && mode === 'classic');
        checkUnlock('Perfect Accuracy', accuracy === 100 && score >= 10);
        checkUnlock('Zen Master', mode === 'zen' && duration >= 120);
        checkUnlock('Time Warrior', mode === 'time-attack' && score >= 15);

        // Update leaderboard
        let entry = mockDb.mockLeaderboards.find(l => l.userId === user._id);
        if (!entry) {
          entry = {
            userId: user._id,
            username: user.name,
            avatar: user.avatar || '',
            highestScore: score,
            dailyScore: score,
            weeklyScore: score,
          };
          mockDb.mockLeaderboards.push(entry);
        } else {
          entry.highestScore = Math.max(entry.highestScore, dbUser.highestScore);
          entry.dailyScore = Math.max(entry.dailyScore, score);
          entry.weeklyScore = Math.max(entry.weeklyScore, score);
        }

        mockDb.persistMockDb();

        return res.json({
          success: true,
          gameHistory: mockHist,
          newAchievements: newlyUnlocked,
          stats: {
            highestScore: dbUser.highestScore,
            gamesPlayed: dbUser.gamesPlayed,
            levelReached: dbUser.levelReached,
            achievements: dbUser.achievements,
          },
        });
      }
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/game/history
// @desc    Get user game history
router.get('/history', protect, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const history = await GameHistory.find({ userId: req.user!._id })
        .sort({ date: -1 })
        .limit(20);
      res.json({ success: true, history });
    } else {
      const history = mockDb.mockGameHistory
        .filter(h => h.userId === req.user!._id)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 20);
      res.json({ success: true, history });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/game/stats
// @desc    Get user aggregate statistics
router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    if (isDbConnected()) {
      const history = await GameHistory.find({ userId });

      const totalSessions = history.length;
      const totalScore = history.reduce((sum, h) => sum + h.score, 0);
      const avgScore = totalSessions > 0 ? Number((totalScore / totalSessions).toFixed(1)) : 0;
      const avgAccuracy = totalSessions > 0 ? Number((history.reduce((sum, h) => sum + h.accuracy, 0) / totalSessions).toFixed(1)) : 0;
      const totalDuration = history.reduce((sum, h) => sum + h.duration, 0);

      const modeCounts = {
        classic: 0,
        'time-attack': 0,
        reverse: 0,
        zen: 0,
        multiplayer: 0,
      };

      history.forEach((h) => {
        if (h.mode in modeCounts) {
          modeCounts[h.mode as keyof typeof modeCounts]++;
        }
      });

      res.json({
        success: true,
        stats: {
          totalSessions,
          avgScore,
          avgAccuracy,
          totalDuration,
          modeCounts,
          highestScore: req.user!.highestScore,
          wins: req.user!.wins,
          gamesPlayed: req.user!.gamesPlayed,
          levelReached: req.user!.levelReached,
        },
      });
    } else {
      const history = mockDb.mockGameHistory.filter(h => h.userId === userId);
      const dbUser = mockDb.mockUsers.find(u => u._id === userId) || req.user!;

      const totalSessions = history.length;
      const totalScore = history.reduce((sum, h) => sum + h.score, 0);
      const avgScore = totalSessions > 0 ? Number((totalScore / totalSessions).toFixed(1)) : 0;
      const avgAccuracy = totalSessions > 0 ? Number((history.reduce((sum, h) => sum + h.accuracy, 0) / totalSessions).toFixed(1)) : 0;
      const totalDuration = history.reduce((sum, h) => sum + h.duration, 0);

      const modeCounts = {
        classic: 0,
        'time-attack': 0,
        reverse: 0,
        zen: 0,
        multiplayer: 0,
      };

      history.forEach((h) => {
        if (h.mode in modeCounts) {
          modeCounts[h.mode as keyof typeof modeCounts]++;
        }
      });

      res.json({
        success: true,
        stats: {
          totalSessions,
          avgScore,
          avgAccuracy,
          totalDuration,
          modeCounts,
          highestScore: dbUser.highestScore,
          wins: dbUser.wins,
          gamesPlayed: dbUser.gamesPlayed,
          levelReached: dbUser.levelReached,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
