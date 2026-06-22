import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { protect, admin, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { GameHistory } from '../models/GameHistory';
import { Leaderboard } from '../models/Leaderboard';
import { Achievement } from '../models/Achievement';
import * as mockDb from '../config/mockDb';

const router = Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// Protect all admin routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/users
// @desc    Get all users for admin list
router.get('/users', async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.json({ success: true, users });
    } else {
      res.json({ success: true, users: mockDb.mockUsers });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user (role or status)
router.put('/users/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  const { role, isVerified, avatar } = req.body;

  try {
    if (isDbConnected()) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (role !== undefined) user.role = role;
      if (isVerified !== undefined) user.isVerified = isVerified;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();
      res.json({ success: true, message: 'User updated successfully', user });
    } else {
      const user = mockDb.mockUsers.find(u => u._id === id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (role !== undefined) user.role = role;
      if (isVerified !== undefined) user.isVerified = isVerified;
      if (avatar !== undefined) user.avatar = avatar;

      res.json({ success: true, message: 'User updated successfully (Mock DB)', user });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and their database ties
router.delete('/users/:id', async (req, res): Promise<any> => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await User.findByIdAndDelete(id);
      await Leaderboard.deleteOne({ userId: id });
      await GameHistory.deleteMany({ userId: id });
    } else {
      const userIdx = mockDb.mockUsers.findIndex(u => u._id === id);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      mockDb.mockUsers.splice(userIdx, 1);
      
      const lIdx = mockDb.mockLeaderboards.findIndex(l => l.userId === id);
      if (lIdx !== -1) mockDb.mockLeaderboards.splice(lIdx, 1);

      // Filter out histories
      const filteredHist = mockDb.mockGameHistory.filter(h => h.userId !== id);
      mockDb.mockGameHistory.length = 0;
      mockDb.mockGameHistory.push(...filteredHist);
    }

    res.json({ success: true, message: 'User and linked data deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics charts and metrics
router.get('/analytics', async (req, res) => {
  try {
    if (isDbConnected()) {
      const totalUsers = await User.countDocuments({});
      const totalGames = await GameHistory.countDocuments({});
      
      const scoreAgg = await GameHistory.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]);
      const averageScore = scoreAgg.length > 0 ? Number(scoreAgg[0].avgScore.toFixed(1)) : 0;

      const registrationsByDay = await User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]);

      const sessionsByDay = await GameHistory.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]);

      const modeDistribution = await GameHistory.aggregate([
        {
          $group: {
            _id: '$mode',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        metrics: {
          totalUsers,
          totalGames,
          averageScore,
        },
        charts: {
          registrations: registrationsByDay.map(r => ({ date: r._id, count: r.count })),
          sessions: sessionsByDay.map(s => ({ date: s._id, count: s.count })),
          modes: modeDistribution.map(m => ({ mode: m._id, count: m.count }))
        }
      });
    } else {
      // Aggregate mock in-memory database values
      const totalUsers = mockDb.mockUsers.length;
      const totalGames = mockDb.mockGameHistory.length;
      const averageScore = totalGames > 0 ? Number((mockDb.mockGameHistory.reduce((sum, h) => sum + h.score, 0) / totalGames).toFixed(1)) : 0;

      // Group registrations by day
      const regGroups: Record<string, number> = {};
      mockDb.mockUsers.forEach(u => {
        const day = u.createdAt.toISOString().split('T')[0];
        regGroups[day] = (regGroups[day] || 0) + 1;
      });

      // Group sessions by day
      const sessGroups: Record<string, number> = {};
      mockDb.mockGameHistory.forEach(h => {
        const day = h.date.toISOString().split('T')[0];
        sessGroups[day] = (sessGroups[day] || 0) + 1;
      });

      // Group modes
      const modeGroups: Record<string, number> = {};
      mockDb.mockGameHistory.forEach(h => {
        modeGroups[h.mode] = (modeGroups[h.mode] || 0) + 1;
      });

      res.json({
        success: true,
        metrics: {
          totalUsers,
          totalGames,
          averageScore,
        },
        charts: {
          registrations: Object.entries(regGroups).map(([date, count]) => ({ date, count })),
          sessions: Object.entries(sessGroups).map(([date, count]) => ({ date, count })),
          modes: Object.entries(modeGroups).map(([mode, count]) => ({ mode, count }))
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
