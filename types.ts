
export type Player = 'BLACK' | 'WHITE';

export type CellValue = Player | null;

export type GameMode = 'PVP' | 'AI';

export interface GameState {
  board: CellValue[][];
  currentPlayer: Player;
  winner: Player | 'DRAW' | null;
  history: { row: number; col: number; player: Player }[];
  lastMove: { row: number; col: number } | null;
  gameMode: GameMode;
  isAiThinking: boolean;
}

export const BOARD_SIZE = 15;
