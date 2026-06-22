import { create } from 'zustand';
import { playSound, setMuteState, setGlobalVolume } from '../utils/sounds';
import api from '../services/api';
import { useAuthStore } from './useAuthStore';

export type GameMode = 'classic' | 'time-attack' | 'reverse' | 'zen';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';

interface GameState {
  // Game states
  started: boolean;
  isGameOver: boolean;
  gameSeq: string[];
  userSeq: string[];
  level: number;
  score: number;
  bestScore: number;
  lives: number;
  combo: number;
  isPlayingSequence: boolean;
  activeColor: string | null;
  mode: GameMode;
  difficulty: DifficultyLevel;
  
  // Stats
  accuracy: number;
  totalPresses: number;
  correctPresses: number;
  startTime: number;
  sessionDuration: number;

  // AI Difficulty parameters
  playbackSpeed: number; // in ms
  responseTimes: number[];

  // Settings
  isMuted: boolean;
  volume: number;

  // Timers
  timeRemaining: number;

  // Actions
  setMode: (mode: GameMode) => void;
  setDifficulty: (diff: DifficultyLevel) => void;
  startGame: () => void;
  playSequence: () => Promise<void>;
  inputColor: (color: string) => Promise<void>;
  endGame: () => void;
  resetGame: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (vol: number) => void;
  tickTimer: () => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];

const getDifficultySpeed = (diff: DifficultyLevel): number => {
  switch (diff) {
    case 'easy': return 800;
    case 'medium': return 600;
    case 'hard': return 450;
    case 'extreme': return 300;
  }
};

const getDifficultyLives = (diff: DifficultyLevel): number => {
  switch (diff) {
    case 'easy': return 3;
    case 'medium': return 2;
    case 'hard': return 1;
    case 'extreme': return 1;
  }
};

export const useGameStore = create<GameState>((set, get) => {
  let timeAttackInterval: any = null;

  return {
    started: false,
    isGameOver: false,
    gameSeq: [],
    userSeq: [],
    level: 0,
    score: 0,
    bestScore: Number(localStorage.getItem('bestScore') || '0'),
    lives: 3,
    combo: 0,
    isPlayingSequence: false,
    activeColor: null,
    mode: 'classic',
    difficulty: 'medium',
    
    accuracy: 100,
    totalPresses: 0,
    correctPresses: 0,
    startTime: 0,
    sessionDuration: 0,

    playbackSpeed: 600,
    responseTimes: [],

    isMuted: false,
    volume: 0.5,

    timeRemaining: 60,

    setMode: (mode) => set({ mode }),
    setDifficulty: (difficulty) => set({ difficulty, playbackSpeed: getDifficultySpeed(difficulty) }),

    setMuted: (isMuted) => {
      set({ isMuted });
      setMuteState(isMuted);
    },

    setVolume: (volume) => {
      set({ volume });
      setGlobalVolume(volume);
    },

    startGame: () => {
      if (timeAttackInterval) clearInterval(timeAttackInterval);

      const diff = get().difficulty;
      const initialSpeed = getDifficultySpeed(diff);
      const initialLives = getDifficultyLives(diff);

      set({
        started: true,
        isGameOver: false,
        gameSeq: [],
        userSeq: [],
        level: 1,
        score: 0,
        lives: get().mode === 'zen' ? 999 : initialLives,
        combo: 0,
        accuracy: 100,
        totalPresses: 0,
        correctPresses: 0,
        playbackSpeed: initialSpeed,
        responseTimes: [],
        startTime: Date.now(),
        timeRemaining: get().mode === 'time-attack' ? 60 : 0,
      });

      // Generate first sequence
      const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      set((state) => ({ gameSeq: [nextColor] }));
      
      // Setup time attack timer
      if (get().mode === 'time-attack') {
        timeAttackInterval = setInterval(() => {
          get().tickTimer();
        }, 1000);
      }

      setTimeout(() => {
        get().playSequence();
      }, 500);
    },

    tickTimer: () => {
      const current = get().timeRemaining;
      if (current <= 1) {
        clearInterval(timeAttackInterval);
        get().endGame();
      } else {
        set({ timeRemaining: current - 1 });
      }
    },

    playSequence: async () => {
      const { gameSeq, playbackSpeed } = get();
      set({ isPlayingSequence: true });

      for (let i = 0; i < gameSeq.length; i++) {
        const color = gameSeq[i];
        set({ activeColor: color });
        playSound(color as any);
        await new Promise((resolve) => setTimeout(resolve, playbackSpeed));
        set({ activeColor: null });
        await new Promise((resolve) => setTimeout(resolve, Math.max(100, playbackSpeed / 2)));
      }

      set({ isPlayingSequence: false, userSeq: [] });
    },

    inputColor: async (color) => {
      const state = get();
      if (!state.started || state.isGameOver || state.isPlayingSequence) return;

      const inputTime = Date.now();
      const currentStep = state.userSeq.length;
      const newUserSeq = [...state.userSeq, color];
      
      set({ userSeq: newUserSeq, activeColor: color });
      playSound(color as any);

      // Clear active color state after 150ms to create a bright flash/blink effect
      setTimeout(() => {
        if (get().activeColor === color && !get().isPlayingSequence) {
          set({ activeColor: null });
        }
      }, 150);

      // AI Difficulty: Track response speed for each input
      const sequenceDuration = state.gameSeq.length * (state.playbackSpeed * 1.5);
      const timeSinceSequenceEnded = inputTime - (state.startTime + sequenceDuration);
      const buttonPressTime = timeSinceSequenceEnded / (currentStep + 1); // rough average
      const responseTimes = [...state.responseTimes, buttonPressTime];
      
      const isZen = state.mode === 'zen';
      const isReverse = state.mode === 'reverse';

      // Check input matching
      let isMatch = false;
      if (isReverse) {
        // In reverse mode, check against the sequence backwards
        const targetColorIndex = state.gameSeq.length - 1 - currentStep;
        isMatch = color === state.gameSeq[targetColorIndex];
      } else {
        isMatch = color === state.gameSeq[currentStep];
      }

      const totalPresses = state.totalPresses + 1;
      const correctPresses = state.correctPresses + (isMatch ? 1 : 0);
      const accuracy = Math.round((correctPresses / totalPresses) * 100);

      set({ totalPresses, correctPresses, accuracy, responseTimes });

      if (isMatch) {
        const newCombo = state.combo + 1;
        set({ combo: newCombo });

        // If completed the whole sequence
        if (newUserSeq.length === state.gameSeq.length) {
          const addedScore = state.level * 10 + Math.floor(newCombo / 5) * 5;
          const nextScore = state.score + addedScore;
          
          if (nextScore > state.bestScore) {
            set({ bestScore: nextScore });
            localStorage.setItem('bestScore', nextScore.toString());
          }

          set({
            score: nextScore,
            level: state.level + 1,
          });

          // AI DIFFICULTY ADJUSTMENT ALGORITHM:
          // Check speed and accuracy over the last few inputs to scale speed
          let speed = state.playbackSpeed;
          if (accuracy >= 90) {
            const avgResponseTime = responseTimes.reduce((s, r) => s + r, 0) / responseTimes.length;
            if (avgResponseTime < 600) {
              // Speed up (lower playback time)
              speed = Math.max(150, speed - 50);
            }
          } else if (accuracy < 70) {
            // Slow down
            speed = Math.min(1200, speed + 80);
          }

          // Generate next color
          const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          set((prev) => ({
            gameSeq: [...prev.gameSeq, nextColor],
            playbackSpeed: speed,
          }));

          // Trigger next sequence after brief pause
          setTimeout(() => {
            get().playSequence();
          }, 800);
        }
      } else {
        // MISTAKE
        set({ combo: 0 });
        playSound('wrong');

        if (isZen) {
          // Zen mode: just clear the user's inputs and replay
          setTimeout(() => {
            get().playSequence();
          }, 1000);
        } else {
          const nextLives = state.lives - 1;
          set({ lives: nextLives });

          if (nextLives <= 0) {
            get().endGame();
          } else {
            // Replay sequence for user to try again
            setTimeout(() => {
              get().playSequence();
            }, 1000);
          }
        }
      }
    },

    endGame: () => {
      if (timeAttackInterval) clearInterval(timeAttackInterval);
      
      const duration = Math.round((Date.now() - get().startTime) / 1000);
      set({ isGameOver: true, sessionDuration: duration });

      // Save game score to database if logged in
      const token = localStorage.getItem('token');
      if (token) {
        api.post('/game/save', {
          mode: get().mode,
          difficulty: get().difficulty,
          score: get().score,
          accuracy: get().accuracy,
          duration: duration,
          levelReached: get().level,
        }).then((res) => {
          // Sync stats back to Auth Store
          const stats = res.data.stats;
          useAuthStore.getState().updateUserStats(stats);
        }).catch((err) => console.error('Failed to auto-save game stats:', err));
      }
    },

    resetGame: () => {
      if (timeAttackInterval) clearInterval(timeAttackInterval);
      set({
        started: false,
        isGameOver: false,
        gameSeq: [],
        userSeq: [],
        level: 0,
        score: 0,
        lives: 3,
        combo: 0,
        accuracy: 100,
        playbackSpeed: 600,
      });
    },
  };
});
