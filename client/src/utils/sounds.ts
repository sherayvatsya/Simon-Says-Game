import { Howl } from 'howler';

// Sound files hosted on free CDN (standard audio frequencies for Simon)
const SOUNDS_CDN = {
  green: 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
  red: 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
  yellow: 'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
  blue: 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3',
  wrong: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  win: 'https://actions.google.com/sounds/v1/cartoon/cartoon_wink.ogg',
};

// Web Audio API Synthesizer fallback for offline/PWA support
let audioCtx: AudioContext | null = null;

const playSynthTone = (frequency: number, type: OscillatorType = 'sine', duration = 0.4) => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (browser security autoplays)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    // Smooth gain node wrapper to prevent clicking noises
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Web Audio synthesis failed:', e);
  }
};

const tones: Record<string, number> = {
  green: 415.30, // G#4
  red: 310.08,   // D#4
  yellow: 252.00, // B3
  blue: 209.30,  // C4
};

// Setup Howler sounds with fallbacks
const howlerSounds: Record<string, Howl> = {};

let isMuted = false;
let volume = 0.5;
let audioMode: 'synth' | 'retro' = (localStorage.getItem('simonx_audio_mode') as 'synth' | 'retro') || 'synth';

export const getAudioMode = (): 'synth' | 'retro' => audioMode;

export const setAudioMode = (mode: 'synth' | 'retro') => {
  audioMode = mode;
  localStorage.setItem('simonx_audio_mode', mode);
};

const playSynthToneForColor = (color: string) => {
  if (color === 'wrong') {
    playSynthTone(120, 'sawtooth', 0.6);
  } else if (color === 'win') {
    playSynthTone(587.33, 'triangle', 0.15);
    setTimeout(() => playSynthTone(880.00, 'triangle', 0.3), 150);
  } else {
    playSynthTone(tones[color] || 300, 'sine', 0.4);
  }
};

export const playSound = (color: 'green' | 'red' | 'yellow' | 'blue' | 'wrong' | 'win') => {
  if (isMuted) return;

  if (audioMode === 'synth') {
    playSynthToneForColor(color);
    return;
  }

  // Attempt Howler playback (retro mode)
  if (!howlerSounds[color]) {
    howlerSounds[color] = new Howl({
      src: [SOUNDS_CDN[color]],
      volume: volume,
      html5: true,
      onloaderror: () => {
        // Fallback to offline web audio synthesizer on loading failure
        playSynthToneForColor(color);
      }
    });
  }

  try {
    howlerSounds[color].volume(volume);
    const id = howlerSounds[color].play();
    if (typeof id !== 'number' || howlerSounds[color].state() !== 'loaded') {
      playSynthToneForColor(color);
    }
  } catch (err) {
    // Immediate fallback
    playSynthToneForColor(color);
  }
};

export const setMuteState = (mute: boolean) => {
  isMuted = mute;
};

export const setGlobalVolume = (val: number) => {
  volume = val;
};
