import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Leaderboard } from '../models/Leaderboard';
import * as mockDb from '../config/mockDb';

const router = Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get formatted leaderboards
const getLeaderboardList = async (sortBy: 'highestScore' | 'dailyScore' | 'weeklyScore', res: Response) => {
  try {
    if (isDbConnected()) {
      const list = await Leaderboard.find()
        .populate('userId', 'avatar name')
        .sort({ [sortBy]: -1 })
        .limit(50);

      const formatted = list.map((entry: any, index) => ({
        userId: entry.userId?._id || entry.userId,
        username: entry.userId?.name || entry.username,
        avatar: entry.userId?.avatar || '',
        score: entry[sortBy],
        rank: index + 1,
      }));

      res.json({ success: true, leaderboard: formatted });
    } else {
      // Return sorted mock leaderboard
      const list = [...mockDb.mockLeaderboards]
        .sort((a, b) => {
          const aScore = a[sortBy] !== undefined ? a[sortBy] : a.highestScore;
          const bScore = b[sortBy] !== undefined ? b[sortBy] : b.highestScore;
          return (bScore as number) - (aScore as number);
        })
        .slice(0, 50);

      const formatted = list.map((entry: any, index) => ({
        userId: entry.userId,
        username: entry.username,
        avatar: entry.avatar,
        score: entry[sortBy] !== undefined ? entry[sortBy] : entry.highestScore,
        rank: index + 1,
      }));

      res.json({ success: true, leaderboard: formatted });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/leaderboard/global
// @desc    Get global rankings (All Time)
router.get('/global', async (req, res) => {
  await getLeaderboardList('highestScore', res);
});

// @route   GET /api/leaderboard/daily
// @desc    Get daily rankings
router.get('/daily', async (req, res) => {
  await getLeaderboardList('dailyScore', res);
});

// @route   GET /api/leaderboard/weekly
// @desc    Get weekly rankings
router.get('/weekly', async (req, res) => {
  await getLeaderboardList('weeklyScore', res);
});

export default router;
