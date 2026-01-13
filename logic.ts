
import { BOARD_SIZE, CellValue, Player } from './types';

export const createEmptyBoard = (): CellValue[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

export const checkWin = (board: CellValue[][], row: number, col: number): boolean => {
  const player = board[row][col];
  if (!player) return false;

  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal \
    [1, -1], // Diagonal /
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check one direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    // Check opposite direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 5) return true;
  }

  return false;
};

export const isBoardFull = (board: CellValue[][]): boolean => {
  return board.every(row => row.every(cell => cell !== null));
};
