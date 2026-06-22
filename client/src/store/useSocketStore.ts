import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { playSound } from '../utils/sounds';

interface OpponentType {
  name: string;
  avatar: string;
}

interface MatchResultType {
  youWon: boolean;
  reason: string;
  myScore: number;
  opponentScore: number;
}

interface SocketState {
  socket: Socket | null;
  inQueue: boolean;
  matchId: string | null;
  opponent: OpponentType | null;
  sequence: string[];
  level: number;
  myScore: number;
  myCurrentStep: number;
  opponentCurrentStep: number;
  isPlayingSequence: boolean;
  activeColor: string | null;
  matchResult: MatchResultType | null;
  multiplayerGameOver: boolean;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  joinQueue: () => void;
  leaveQueue: () => void;
  submitInput: (color: string, index: number) => void;
  playSocketSequence: () => Promise<void>;
  resetSocketMatch: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  return {
    socket: null,
    inQueue: false,
    matchId: null,
    opponent: null,
    sequence: [],
    level: 0,
    myScore: 0,
    myCurrentStep: 0,
    opponentCurrentStep: 0,
    isPlayingSequence: false,
    activeColor: null,
    matchResult: null,
    multiplayerGameOver: false,

    connectSocket: (token) => {
      if (get().socket) return;

      const socketUrl = window.location.origin; // Same origin (proxied during dev)
      const socketInstance = io(socketUrl, {
        auth: { token },
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socketInstance.on('queueJoined', () => {
        set({ inQueue: true });
      });

      socketInstance.on('queueLeft', () => {
        set({ inQueue: false });
      });

      socketInstance.on('matchStart', (data: { matchId: string; opponent: OpponentType; sequence: string[]; level: number }) => {
        set({
          matchId: data.matchId,
          opponent: data.opponent,
          sequence: data.sequence,
          level: data.level,
          myScore: 0,
          myCurrentStep: 0,
          opponentCurrentStep: 0,
          inQueue: false,
          matchResult: null,
          multiplayerGameOver: false,
        });

        setTimeout(() => {
          get().playSocketSequence();
        }, 1000);
      });

      socketInstance.on('opponentStep', (data: { step: number }) => {
        set({ opponentCurrentStep: data.step });
      });

      socketInstance.on('roundCompleted', (data: { score: number }) => {
        set({ myScore: data.score });
      });

      socketInstance.on('nextRound', (data: { sequence: string[]; level: number }) => {
        set({
          sequence: data.sequence,
          level: data.level,
          myCurrentStep: 0,
          opponentCurrentStep: 0,
        });

        setTimeout(() => {
          get().playSocketSequence();
        }, 1000);
      });

      socketInstance.on('matchOver', (data: MatchResultType) => {
        set({
          matchResult: data,
          multiplayerGameOver: true,
          matchId: null, // clear match ID
        });
        playSound(data.youWon ? 'win' : 'wrong');
      });

      set({ socket: socketInstance });
    },

    disconnectSocket: () => {
      const s = get().socket;
      if (s) {
        s.disconnect();
        set({ socket: null, inQueue: false, matchId: null, opponent: null });
      }
    },

    joinQueue: () => {
      const s = get().socket;
      if (s) s.emit('joinQueue');
    },

    leaveQueue: () => {
      const s = get().socket;
      if (s) s.emit('leaveQueue');
    },

    submitInput: (color, index) => {
      const s = get().socket;
      if (!s || get().isPlayingSequence || get().multiplayerGameOver) return;

      // Optimistic local update
      set({ myCurrentStep: index + 1 });
      playSound(color as any);

      s.emit('playerInput', {
        matchId: get().matchId,
        color,
        index,
      });
    },

    playSocketSequence: async () => {
      const seq = get().sequence;
      if (seq.length === 0) return;

      set({ isPlayingSequence: true });
      const playbackSpeed = 500; // stable multiplayer playback speed

      for (let i = 0; i < seq.length; i++) {
        const color = seq[i];
        set({ activeColor: color });
        playSound(color as any);
        await new Promise((resolve) => setTimeout(resolve, playbackSpeed));
        set({ activeColor: null });
        await new Promise((resolve) => setTimeout(resolve, playbackSpeed / 2));
      }

      set({ isPlayingSequence: false });
    },

    resetSocketMatch: () => {
      set({
        matchId: null,
        opponent: null,
        sequence: [],
        level: 0,
        myScore: 0,
        myCurrentStep: 0,
        opponentCurrentStep: 0,
        matchResult: null,
        multiplayerGameOver: false,
        inQueue: false,
      });
    },
  };
});
