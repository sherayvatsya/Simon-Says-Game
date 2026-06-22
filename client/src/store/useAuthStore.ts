import { create } from 'zustand';
import api from '../services/api';

export interface UserType {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  highestScore: number;
  gamesPlayed: number;
  wins: number;
  levelReached: number;
  achievements: string[];
  createdAt: string;
}

interface AuthState {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (credentials: any) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUserStats: (newStats: Partial<UserType>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isInitialized: false,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/google', { credential });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Google Login failed', loading: false });
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/register', userData);
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isInitialized: true });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isInitialized: true });
    }
  },

  updateUserStats: (newStats) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...newStats } });
    }
  },
}));
