
import { GoogleGenAI, Type } from "@google/genai";
import { BOARD_SIZE, CellValue, Player } from "../types";

// Initialize AI inside the function to ensure it uses the latest process.env.API_KEY
export const getAiMove = async (board: CellValue[][], aiPlayer: Player): Promise<{ row: number; col: number } | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    // Represent the board as a string for context
    const boardRepresentation = board.map((row, rIdx) => 
      `${rIdx.toString().padStart(2, ' ')} ` + row.map(cell => (cell === 'BLACK' ? 'B' : cell === 'WHITE' ? 'W' : '.')).join(' ')
    ).join('\n');

    const colHeader = "   " + Array.from({length: BOARD_SIZE}, (_, i) => i.toString().slice(-1)).join(' ');

    const prompt = `You are a Grandmaster Gomoku (Five in a Row) player. 
Current board (15x15):
${colHeader}
${boardRepresentation}

Legend: 'B' = Black (First Player), 'W' = White (Second Player), '.' = Empty.
You are playing as ${aiPlayer === 'BLACK' ? 'Black (B)' : 'White (W)'}.

Strategic rules:
1. Priority 1: If you have 4 in a row, complete it to win.
2. Priority 2: If the opponent has 3 or 4 in a row, you MUST block it immediately.
3. Priority 3: Create an "open four" (four in a row with both ends empty) or a "double three".
4. Priority 4: Play near existing stones to build connections.

Return your next move as row and col (0-14).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER, description: "Row index (0-14)" },
            col: { type: Type.INTEGER, description: "Column index (0-14)" },
            reasoning: { type: Type.STRING, description: "Strategic reasoning" }
          },
          required: ["row", "col"]
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    const { row, col } = result;

    // Validate move
    if (typeof row === 'number' && typeof col === 'number' && 
        row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === null) {
      return { row, col };
    }

    // Fallback: Find first available empty spot if AI is confused
    console.warn("AI returned invalid move or failed, using fallback.");
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null) return { row: r, col: c };
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini AI Move Error:", error);
    // Secure fallback: find first empty spot
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null) return { row: r, col: c };
      }
    }
    return null;
  }
};
