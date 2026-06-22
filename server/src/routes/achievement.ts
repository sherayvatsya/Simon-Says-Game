import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Achievement } from '../models/Achievement';
import { User } from '../models/User';

const router = Router();

// @route   GET /api/achievement
// @desc    Get all achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({});
    res.json({ success: true, achievements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/achievement/unlock
// @desc    Manually unlock an achievement
router.post('/unlock', protect, async (req: AuthRequest, res: Response): Promise<any> => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Achievement title is required' });
  }

  try {
    const achievement = await Achievement.findOne({ title });
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const user = req.user!;
    if (user.achievements.includes(title)) {
      return res.status(400).json({ success: false, message: 'Achievement already unlocked' });
    }

    // Unlock
    user.achievements.push(title);
    await user.save();

    await Achievement.updateOne(
      { title },
      { $addToSet: { unlockedUsers: user._id } }
    );

    res.json({
      success: true,
      message: `Achievement '${title}' unlocked!`,
      achievements: user.achievements,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
