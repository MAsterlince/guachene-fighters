import React from 'react';
import { Character } from '@/types/game';

interface VictoryScreenProps {
  winner: Character;
  winnerPlayer: 1 | 2;
  onRematch: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

export function VictoryScreen({ 
  winner, 
  winnerPlayer, 
  onRematch, 
  onCharacterSelect, 
  onMainMenu 
}: VictoryScreenProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-in">
      {/* Winner announcement - top of screen */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2">
        <h2 className="text-4xl md:text-5xl font-pixel fire-gradient text-shadow-fire uppercase text-center whitespace-nowrap">
          ¡{winner.name} Gana!
        </h2>
      </div>

      {/* Minimalist bottom menu */}
      <div 
        className="p-4 pb-6"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          <button 
            onClick={onRematch} 
            className="arcade-button px-6 py-3 text-sm"
          >
            ¡Revancha!
          </button>
          
          <button 
            onClick={onCharacterSelect} 
            className="arcade-button-secondary px-6 py-3 text-sm"
          >
            Cambiar Personajes
          </button>
          
          <button 
            onClick={onMainMenu} 
            className="arcade-button-secondary px-6 py-3 text-sm"
          >
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
