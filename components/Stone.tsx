
import React from 'react';
import { Player } from '../types';

interface StoneProps {
  player: Player;
  isLastMove?: boolean;
}

const Stone: React.FC<StoneProps> = ({ player, isLastMove }) => {
  const baseClass = "w-4/5 h-4/5 rounded-full shadow-md flex items-center justify-center transition-all duration-300";
  const colorClass = player === 'BLACK' 
    ? "bg-stone-900 bg-gradient-to-br from-stone-700 to-stone-950" 
    : "bg-stone-50 bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300";

  return (
    <div className={`${baseClass} ${colorClass}`}>
      {isLastMove && (
        <div className={`w-1.5 h-1.5 rounded-full ${player === 'BLACK' ? 'bg-red-400' : 'bg-red-500'}`} />
      )}
    </div>
  );
};

export default Stone;
