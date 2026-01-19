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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        {/* Victory text */}
        <div className="text-center">
          <p className="text-lg font-pixel text-muted-foreground mb-2">
            JUGADOR {winnerPlayer}
          </p>
          <h2 className="text-5xl font-pixel fire-gradient text-shadow-fire mb-4">
            ¡VICTORIA!
          </h2>
        </div>
        
        {/* Winner character */}
        <div className="relative">
          <div 
            className="w-64 h-80 rounded-lg overflow-hidden fire-border glow-fire"
            style={{
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          >
            <img 
              src={winner.image} 
              alt={winner.name}
              className="w-full h-full object-contain object-bottom bg-gradient-to-t from-card to-background"
            />
          </div>
          
          {/* Winner name */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-card fire-border rounded">
            <span className="text-xl font-pixel fire-gradient uppercase">
              {winner.name}
            </span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button onClick={onRematch} className="arcade-button min-w-[280px]">
            ¡Revancha!
          </button>
          
          <button onClick={onCharacterSelect} className="arcade-button-secondary min-w-[280px]">
            Cambiar Personajes
          </button>
          
          <button onClick={onMainMenu} className="arcade-button-secondary min-w-[280px]">
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
