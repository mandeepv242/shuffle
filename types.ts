export enum GameState {
  IDLE = 'IDLE',           // Before start, showing "Start Game"
  REVEALING_START = 'REVEALING_START', // Showing where the ball is initially
  COVERING = 'COVERING',   // Lowering cups
  SHUFFLING = 'SHUFFLING', // Cups moving
  GUESSING = 'GUESSING',   // Waiting for user input
  REVEALED = 'REVEALED',   // Show result
  WIN = 'WIN',
  LOSE = 'LOSE'
}

export interface CupData {
  id: number; // Unique ID of the cup (0, 1, 2)
}

export interface CommentaryResponse {
  text: string;
}

export interface GameStats {
  wins: number;
  total: number;
}