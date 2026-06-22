import bcrypt from 'bcryptjs';

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'user' | 'admin';
  highestScore: number;
  gamesPlayed: number;
  wins: number;
  levelReached: number;
  achievements: string[];
  googleId?: string;
  isVerified: boolean;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: Date;
}

export interface MockGameHistory {
  _id: string;
  userId: string;
  mode: string;
  difficulty: string;
  score: number;
  accuracy: number;
  duration: number;
  levelReached: number;
  date: Date;
}

export interface MockLeaderboard {
  userId: string;
  username: string;
  avatar: string;
  highestScore: number;
  dailyScore: number;
  weeklyScore: number;
  rank?: number;
}

import fs from 'fs';
import path from 'path';

export const mockUsers: MockUser[] = [];
export const mockGameHistory: MockGameHistory[] = [];
export const mockLeaderboards: MockLeaderboard[] = [];
export const mockMatches: any[] = [];

const DB_FILE = path.join(__dirname, 'mockDbState.json');

export const persistMockDb = () => {
  try {
    const data = {
      mockUsers,
      mockGameHistory,
      mockLeaderboards,
      mockMatches,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write mock database file:', err);
  }
};

const loadMockDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const dataStr = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(dataStr);
      if (data.mockUsers) mockUsers.push(...data.mockUsers);
      if (data.mockGameHistory) mockGameHistory.push(...data.mockGameHistory);
      if (data.mockLeaderboards) mockLeaderboards.push(...data.mockLeaderboards);
      if (data.mockMatches) mockMatches.push(...data.mockMatches);
      console.log(`[Offline DB] Loaded ${mockUsers.length} users, ${mockGameHistory.length} game logs, ${mockLeaderboards.length} leaderboard items.`);
      return true;
    }
  } catch (err) {
    console.error('Failed to load mock database:', err);
  }
  return false;
};

// Seed a default admin and user
const seedMockDb = async () => {
  const isLoaded = loadMockDb();
  if (isLoaded && mockUsers.length > 0) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  // Test User
  mockUsers.push({
    _id: 'mock-user-1',
    name: 'Memory Legend',
    email: 'tester@simonx.com',
    password: hashedPassword,
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix',
    role: 'user',
    highestScore: 25,
    gamesPlayed: 5,
    wins: 1,
    levelReached: 10,
    achievements: ['Beginner', 'Perfect Accuracy'],
    isVerified: true,
    createdAt: new Date(),
  });

  // Test Admin
  mockUsers.push({
    _id: 'mock-admin-1',
    name: 'Game Director',
    email: 'admin@simonx.com',
    password: hashedPassword,
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aria',
    role: 'admin',
    highestScore: 50,
    gamesPlayed: 12,
    wins: 4,
    levelReached: 22,
    achievements: ['Beginner', 'Memory Master', 'Level 50'],
    isVerified: true,
    createdAt: new Date(),
  });

  // Test Leaderboard Seed
  mockLeaderboards.push({
    userId: 'mock-admin-1',
    username: 'Game Director',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aria',
    highestScore: 50,
    dailyScore: 50,
    weeklyScore: 50,
  });

  mockLeaderboards.push({
    userId: 'mock-user-1',
    username: 'Memory Legend',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix',
    highestScore: 25,
    dailyScore: 25,
    weeklyScore: 25,
  });

  persistMockDb();
};

seedMockDb();
