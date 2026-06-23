import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Leaderboard } from '../models/Leaderboard';
import * as mockDb from '../config/mockDb';
import { sendEmail } from '../utils/mailer';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  securityQuestion: z.string().min(3),
  securityAnswer: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'simonxsupersecretkeyjwt123!', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res): Promise<any> => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const message = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({ success: false, message, errors: validation.error.errors });
    }

    const { name, email, password, securityQuestion, securityAnswer } = validation.data;

    // Check if user exists
    if (isDbConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);
      const verificationToken = crypto.randomBytes(20).toString('hex');

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        verificationToken,
        isVerified: true, // auto-verify
        securityQuestion,
        securityAnswer: hashedAnswer,
      });

      await Leaderboard.create({
        userId: newUser._id,
        username: newUser.name,
        highestScore: 0,
        dailyScore: 0,
        weeklyScore: 0,
      });

      // Send verification email
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
      sendEmail(
        email,
        'Verify Your SimonX Account',
        `<h1>Welcome to SimonX!</h1><p>Please verify your email address by clicking the link below:</p><a href="${verifyUrl}">Verify Email</a>`
      );
    } else {
      // Offline mock register fallback
      const userExists = mockDb.mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);
      const verificationToken = crypto.randomBytes(20).toString('hex');

      const mockId = `mock-user-${Date.now()}`;
      mockDb.mockUsers.push({
        _id: mockId,
        name,
        email,
        password: hashedPassword,
        avatar: '',
        role: 'user',
        highestScore: 0,
        gamesPlayed: 0,
        wins: 0,
        levelReached: 0,
        achievements: [],
        isVerified: true, // auto-verify
        securityQuestion,
        securityAnswer: hashedAnswer,
        createdAt: new Date(),
      });

      mockDb.mockLeaderboards.push({
        userId: mockId,
        username: name,
        avatar: '',
        highestScore: 0,
        dailyScore: 0,
        weeklyScore: 0,
      });

      mockDb.persistMockDb(); // Persist mock db

      console.log(`[Offline Register] Seeded mock user: ${name} (${email})`);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
      sendEmail(
        email,
        'Verify Your SimonX Account',
        `<h1>Welcome to SimonX!</h1><p>Please verify your email address by clicking the link below:</p><a href="${verifyUrl}">Verify Email</a>`
      );
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account is active and verified.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Log in user
router.post('/login', async (req, res): Promise<any> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.errors });
    }

    const { email, password } = validation.data;

    let user: any = null;

    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = mockDb.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please log in with credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google login / registration stub (Google removed from frontend UI)
router.post('/google', async (req, res): Promise<any> => {
  res.status(400).json({ success: false, message: 'Google Sign-in option disabled.' });
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password request
router.post('/forgot-password', async (req, res): Promise<any> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.errors });
    }

    const { email } = validation.data;
    let user: any = null;

    if (isDbConnected()) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
      sendEmail(
        email,
        'Reset Your SimonX Password',
        `<h1>Password Reset Request</h1><p>Reset your password by clicking the link below:</p><a href="${resetUrl}">Reset Password</a>`
      );
    } else {
      user = mockDb.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      (user as any).resetPasswordToken = resetToken;
      (user as any).resetPasswordExpire = new Date(Date.now() + 3600000);

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
      sendEmail(
        email,
        'Reset Your SimonX Password',
        `<h1>Password Reset Request</h1><p>Reset your password by clicking the link below:</p><a href="${resetUrl}">Reset Password</a>`
      );
    }

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res): Promise<any> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.errors });
    }

    const { token, password } = validation.data;

    let user: any = null;

    if (isDbConnected()) {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      user = mockDb.mockUsers.find(
        u => (u as any).resetPasswordToken === token && 
             (u as any).resetPasswordExpire && 
             (u as any).resetPasswordExpire.getTime() > Date.now()
      );

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      (user as any).resetPasswordToken = undefined;
      (user as any).resetPasswordExpire = undefined;
    }

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/verify-email
// @desc    Verify email address
router.get('/verify-email', async (req, res): Promise<any> => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required' });
  }

  try {
    if (isDbConnected()) {
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid verification token' });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
    } else {
      const user = mockDb.mockUsers.find(u => (u as any).verificationToken === token);
      if (!user) {
        // For local mock verification ease, if token isn't found just verify the last registered user
        const lastUser = mockDb.mockUsers[mockDb.mockUsers.length - 1];
        if (lastUser) {
          (lastUser as any).isVerified = true;
        }
      } else {
        (user as any).isVerified = true;
        (user as any).verificationToken = undefined;
      }
    }

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, (req: AuthRequest, res) => {
  res.json({ success: true, user: req.user });
});

// @route   POST /api/auth/forgot-password/question
// @desc    Get user security question by email
router.post('/forgot-password/question', async (req, res): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user: any = null;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = mockDb.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ success: false, message: 'No security question configured for this account' });
    }

    res.json({ success: true, question: user.securityQuestion });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password/reset
// @desc    Reset password using security answer
router.post('/forgot-password/reset', async (req, res): Promise<any> => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    let user: any = null;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = mockDb.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.securityAnswer) {
      return res.status(400).json({ success: false, message: 'No security question set on this account' });
    }

    const isMatch = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect answer to security question' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (isDbConnected()) {
      user.password = hashedPassword;
      await user.save();
    } else {
      user.password = hashedPassword;
      mockDb.persistMockDb();
    }

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
