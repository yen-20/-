
import React from 'react';
import { BOARD_SIZE, CellValue, Player } from '../types';
import Stone from './Stone';

interface BoardProps {
  board: CellValue[][];
  onCellClick: (row: number, col: number) => void;
  lastMove: { row: number; col: number } | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, lastMove, disabled }) => {
  const isStarPoint = (r: number, c: number) => {
    const points = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];
    return points.some(([pr, pc]) => pr === r && pc === c);
  };

  return (
    <div className="relative p-3 sm:p-6 bg-[#e6c18c] wood-texture shadow-2xl rounded-sm border-[10px] border-[#8b5a2b] select-none mx-auto w-full max-w-[min(850px,92vw,82vh)] aspect-square">
      {/* 棋盤背景陰影 */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.15)] pointer-events-none" />
      
      {/* 網格容器：15x15 的點陣 */}
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full relative z-10">
        {board.map((row, r) => 
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => !disabled && !cell && onCellClick(r, c)}
              className="relative flex items-center justify-center cursor-pointer group"
            >
              {/* 十字線繪製：確保交點在格子中心 */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 水平線 */}
                <div className={`h-[1.5px] bg-stone-800/70 absolute w-full ${c === 0 ? 'left-1/2 w-1/2' : c === BOARD_SIZE - 1 ? 'right-1/2 w-1/2' : 'w-full'}`} />
                {/* 垂直線 */}
                <div className={`w-[1.5px] bg-stone-800/70 absolute h-full ${r === 0 ? 'top-1/2 h-1/2' : r === BOARD_SIZE - 1 ? 'bottom-1/2 h-1/2' : 'h-full'}`} />
              </div>

              {/* 星點 (天元/小目) - 隨盤面縮放稍微加大一點點 */}
              {isStarPoint(r, c) && (
                <div className="w-[12%] h-[12%] max-w-[8px] max-h-[8px] bg-stone-900 rounded-full z-10 shadow-sm" />
              )}

              {/* 預覽棋子 (Hover) */}
              {!cell && !disabled && (
                <div className="w-[85%] h-[85%] rounded-full bg-stone-900/10 scale-0 group-hover:scale-100 transition-transform duration-150 z-20" />
              )}
              
              {/* 實體棋子 */}
              {cell && (
                <div className="w-[92%] h-[92%] z-30 animate-stone-drop">
                  <Stone 
                    player={cell} 
                    isLastMove={lastMove?.row === r && lastMove?.col === c} 
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <style>{`
        .grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        .grid-rows-15 { grid-template-rows: repeat(15, minmax(0, 1fr)); }
        @keyframes stone-drop {
          0% { transform: scale(1.3) translateY(-5px); opacity: 0.5; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-stone-drop {
          animation: stone-drop 0.12s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Board;
