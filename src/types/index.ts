export type KeyHandFinger = 
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface KeyMapInfo {
  key: string;
  display: string;
  finger: KeyHandFinger;
  row: number; // 0: numbers, 1: top, 2: home, 3: bottom, 4: space
}

export type QuizCategory = 'home-row' | 'top-row' | 'bottom-row' | 'all-letters' | 'numbers' | 'sentences-id' | 'sentences-en' | 'code-js' | 'code-html' | 'code-py' | 'custom';

export interface QuizItem {
  id: string;
  title: string;
  category: QuizCategory;
  language: 'id' | 'en' | 'code';
  text: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isCode?: boolean;
}

export interface TypingStats {
  wpm: number;
  netWpm: number;
  accuracy: number;
  elapsedSeconds: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  isCompleted: boolean;
}

export type PlayerAvatar = 'fox' | 'cat' | 'panda' | 'rabbit' | 'bear' | 'koala' | 'lion' | 'tiger';

export interface PlayerState {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  progress: number; // 0 - 100 percentage
  currentWpm: number;
  netWpm: number;
  accuracy: number;
  completed: boolean;
  score: number;
}

export type RoomStatus = 'lobby' | 'countdown' | 'in-progress' | 'round-ended' | 'podium';

export interface QuizRound {
  roundNumber: number;
  text: string;
  title: string;
  isCode?: boolean;
  durationSeconds?: number;
}

export interface LiveRoom {
  pin: string;
  title: string;
  hostName: string;
  status: RoomStatus;
  currentRoundIndex: number;
  rounds: QuizRound[];
  players: Record<string, PlayerState>;
  countdownSeconds: number;
  createdAt: number;
}
