
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import { GameState, GameMode, Player, BOARD_SIZE } from './types';
import { createEmptyBoard, checkWin, isBoardFull } from './logic';
import { getAiMove } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 'BLACK',
    winner: null,
    history: [],
    lastMove: null,
    gameMode: 'AI',
    isAiThinking: false,
  });

  const aiProcessingRef = useRef(false);

  // 核心落子邏輯
  const makeMove = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.winner || prev.board[row][col]) return prev;

      const newBoard = prev.board.map(r => [...r]);
      newBoard[row][col] = prev.currentPlayer;

      const won = checkWin(newBoard, row, col);
      const draw = !won && isBoardFull(newBoard);
      const nextPlayer: Player = prev.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK';

      return {
        ...prev,
        board: newBoard,
        currentPlayer: (won || draw) ? prev.currentPlayer : nextPlayer,
        winner: won ? prev.currentPlayer : draw ? 'DRAW' : null,
        lastMove: { row, col },
        history: [...prev.history, { row, col, player: prev.currentPlayer }],
        isAiThinking: false 
      };
    });
  }, []);

  // 玩家點擊處理
  const handleCellClick = (row: number, col: number) => {
    if (gameState.winner || gameState.isAiThinking) return;
    if (gameState.gameMode === 'AI' && gameState.currentPlayer === 'WHITE') return;
    
    makeMove(row, col);
  };

  const handleRestart = () => {
    aiProcessingRef.current = false;
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: 'BLACK',
      winner: null,
      history: [],
      lastMove: null,
      gameMode: gameState.gameMode,
      isAiThinking: false,
    });
  };

  const handleToggleMode = () => {
    aiProcessingRef.current = false;
    const newMode: GameMode = gameState.gameMode === 'AI' ? 'PVP' : 'AI';
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: 'BLACK',
      winner: null,
      history: [],
      lastMove: null,
      gameMode: newMode,
      isAiThinking: false,
    });
  };

  const undoMove = () => {
    if (gameState.history.length === 0 || gameState.winner || gameState.isAiThinking) return;

    setGameState(prev => {
      const undoCount = prev.gameMode === 'AI' ? 2 : 1;
      if (prev.history.length < undoCount) return prev;

      const newHistory = prev.history.slice(0, -undoCount);
      const newBoard = createEmptyBoard();
      newHistory.forEach(move => {
        newBoard[move.row][move.col] = move.player;
      });

      const last = newHistory[newHistory.length - 1] || null;
      const nextPlayer: Player = prev.gameMode === 'AI' ? 'BLACK' : (prev.currentPlayer === 'BLACK' ? 'WHITE' : 'BLACK');

      return {
        ...prev,
        board: newBoard,
        history: newHistory,
        lastMove: last ? { row: last.row, col: last.col } : null,
        currentPlayer: nextPlayer,
        winner: null,
        isAiThinking: false
      };
    });
  };

  // AI 處理效果
  useEffect(() => {
    const isAiTurn = gameState.gameMode === 'AI' && gameState.currentPlayer === 'WHITE' && !gameState.winner;
    
    if (isAiTurn && !aiProcessingRef.current) {
      aiProcessingRef.current = true;
      
      const processAiTurn = async () => {
        setGameState(prev => ({ ...prev, isAiThinking: true }));
        
        try {
          await new Promise(r => setTimeout(r, 600));
          const move = await getAiMove(gameState.board, 'WHITE');
          
          if (move) {
            makeMove(move.row, move.col);
          }
        } catch (err) {
          console.error("AI Error:", err);
        } finally {
          aiProcessingRef.current = false;
          setGameState(prev => ({ ...prev, isAiThinking: false }));
        }
      };

      processAiTurn();
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.winner, gameState.board, makeMove]);

  return (
    <div className="min-h-screen bg-[#f3f0e9] flex flex-col items-center justify-start py-6 px-4">
      {/* 標題區域 */}
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight flex items-center justify-center gap-4">
          <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-900 shadow-lg" />
          五子棋 ZEN
          <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-stone-300 shadow-md" />
        </h1>
        <p className="text-stone-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] mt-1 md:mt-2">Professional Gomoku Engine</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-10 items-center xl:items-start justify-center w-full max-w-7xl">
        
        {/* 左側控制台 */}
        <div className="w-full max-w-[600px] xl:w-72 flex flex-col gap-4 order-2 xl:order-1">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-stone-200">
            <h2 className="text-stone-400 text-[10px] font-black uppercase mb-4 tracking-widest">回合狀態</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${gameState.currentPlayer === 'BLACK' ? 'bg-stone-900 shadow-xl' : 'bg-stone-100 border border-stone-200'}
              `}>
                <div className={`w-3 h-3 rounded-full ${gameState.currentPlayer === 'BLACK' ? 'bg-white' : 'bg-stone-400'}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">Current Turn</p>
                <p className="font-black text-stone-800 text-lg">
                  {gameState.currentPlayer === 'BLACK' ? '玩家 (黑棋)' : 'AI (白棋)'}
                </p>
              </div>
            </div>

            {gameState.winner ? (
              <div className="bg-stone-900 p-4 rounded-xl text-center text-white font-bold animate-pulse text-xl">
                {gameState.winner === 'DRAW' ? '和局' : `${gameState.winner === 'BLACK' ? '黑棋' : '白棋'} 獲勝！`}
              </div>
            ) : gameState.isAiThinking ? (
              <div className="bg-amber-50 p-4 rounded-xl text-center text-amber-700 font-bold border border-amber-200">
                AI 正在思考中...
              </div>
            ) : (
              <div className="p-4 text-center text-stone-300 text-sm font-medium border border-dashed border-stone-200 rounded-xl">
                請落子
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-stone-100 flex flex-col gap-2">
            <button onClick={handleRestart} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">重新開始</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={undoMove} disabled={gameState.history.length === 0 || !!gameState.winner || gameState.isAiThinking} className="py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 disabled:opacity-30">悔棋</button>
              <button onClick={handleToggleMode} className="py-3 bg-amber-100 text-amber-800 rounded-xl font-bold hover:bg-amber-200 uppercase text-xs">{gameState.gameMode === 'AI' ? '雙人對戰' : 'AI 對戰'}</button>
            </div>
          </div>
        </div>

        {/* 棋盤主體 */}
        <div className="order-1 xl:order-2 flex-grow flex justify-center w-full">
          <Board 
            board={gameState.board} 
            onCellClick={handleCellClick} 
            lastMove={gameState.lastMove}
            disabled={!!gameState.winner || gameState.isAiThinking}
          />
        </div>

        {/* 右側資訊 (僅桌機) */}
        <div className="hidden xl:flex w-72 flex-col gap-4 order-3">
          <div className="bg-stone-800 p-8 rounded-2xl text-stone-300 shadow-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
              <i className="fas fa-gamepad text-amber-500"></i> 操作說明
            </h3>
            <ul className="text-sm space-y-3 leading-relaxed opacity-90">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>黑棋先行，連成五子獲勝</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>直接點擊線條交點落子</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>AI 模擬國手級棋路</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>支持悔棋與對戰模式切換</span>
              </li>
            </ul>
          </div>
          <div className="p-6 text-center italic text-stone-400 text-xs leading-relaxed border border-stone-200 rounded-2xl bg-white/50">
            "棋逢敵手，勝負在於毫釐之間。心靜自然涼，落子自有方。"
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
