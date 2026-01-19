import React, { useState } from 'react';
import { Character, GameMode } from '@/types/game';
import { CHARACTERS } from '@/data/gameData';
import tituloImg from '@/assets/titulo.png';

interface CharacterSelectProps {
  mode: GameMode;
  onSelectCharacters: (p1: Character, p2: Character) => void;
  onBack: () => void;
}

export function CharacterSelect({ mode, onSelectCharacters, onBack }: CharacterSelectProps) {
  const [player1Selection, setPlayer1Selection] = useState<Character | null>(null);
  const [player2Selection, setPlayer2Selection] = useState<Character | null>(null);
  const [selectingPlayer, setSelectingPlayer] = useState<1 | 2>(1);

  const handleCharacterClick = (character: Character) => {
    if (mode === 'cpu') {
      if (!player1Selection) {
        setPlayer1Selection(character);
        // CPU selects random character (different from player)
        const availableChars = CHARACTERS.filter(c => c.id !== character.id);
        const cpuChar = availableChars[Math.floor(Math.random() * availableChars.length)];
        setPlayer2Selection(cpuChar);
      }
    } else {
      if (selectingPlayer === 1) {
        setPlayer1Selection(character);
        setSelectingPlayer(2);
      } else {
        setPlayer2Selection(character);
      }
    }
  };

  const canProceed = player1Selection && player2Selection;

  const handleProceed = () => {
    if (player1Selection && player2Selection) {
      onSelectCharacters(player1Selection, player2Selection);
    }
  };

  const resetSelection = () => {
    setPlayer1Selection(null);
    setPlayer2Selection(null);
    setSelectingPlayer(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-4">
        {/* Header */}
        <img 
          src={tituloImg} 
          alt="Guachene Fighters" 
          className="w-[300px] mb-4 drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 15px rgba(255, 165, 0, 0.4))' }}
        />
        
        <h2 className="text-2xl font-pixel text-foreground mb-2">
          SELECCIONA TU LUCHADOR
        </h2>
        
        <p className="text-fire-yellow text-sm font-pixel mb-8">
          {mode === 'cpu' 
            ? 'Selecciona tu personaje' 
            : `Jugador ${selectingPlayer} - Elige tu luchador`
          }
        </p>

        {/* Character grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {CHARACTERS.map((character) => {
            const isP1Selected = player1Selection?.id === character.id;
            const isP2Selected = player2Selection?.id === character.id;
            const isSelected = isP1Selected || isP2Selected;
            
            return (
              <button
                key={character.id}
                onClick={() => handleCharacterClick(character)}
                disabled={isSelected && mode === 'pvp'}
                className={`character-card ${isSelected ? 'selected' : ''} relative group`}
              >
                {/* Player indicator */}
                {isP1Selected && (
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-neon-blue flex items-center justify-center text-xs font-pixel z-10">
                    P1
                  </div>
                )}
                {isP2Selected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-fire-red flex items-center justify-center text-xs font-pixel z-10">
                    P2
                  </div>
                )}
                
                {/* Character image */}
                <div className="w-40 h-52 overflow-hidden flex items-end justify-center bg-gradient-to-t from-card to-transparent rounded">
                  <img 
                    src={character.image} 
                    alt={character.name}
                    className="w-full h-full object-contain object-bottom transform group-hover:scale-110 transition-transform duration-200"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
                
                {/* Name */}
                <div className="mt-2 text-center">
                  <span className="text-sm font-pixel fire-gradient uppercase">
                    {character.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected characters display */}
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-neon-blue text-xs font-pixel mb-2">JUGADOR 1</p>
            <div className="w-24 h-24 fire-border rounded-lg overflow-hidden bg-card flex items-center justify-center">
              {player1Selection ? (
                <img 
                  src={player1Selection.image} 
                  alt={player1Selection.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-3xl">?</span>
              )}
            </div>
            <p className="text-xs font-pixel mt-2 text-foreground">
              {player1Selection?.name || '---'}
            </p>
          </div>

          <div className="text-4xl font-pixel fire-gradient">VS</div>

          <div className="text-center">
            <p className="text-fire-red text-xs font-pixel mb-2">
              {mode === 'cpu' ? 'CPU' : 'JUGADOR 2'}
            </p>
            <div className="w-24 h-24 fire-border rounded-lg overflow-hidden bg-card flex items-center justify-center">
              {player2Selection ? (
                <img 
                  src={player2Selection.image} 
                  alt={player2Selection.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-3xl">?</span>
              )}
            </div>
            <p className="text-xs font-pixel mt-2 text-foreground">
              {player2Selection?.name || '---'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button onClick={onBack} className="arcade-button-secondary">
            Volver
          </button>
          
          {(player1Selection || player2Selection) && (
            <button onClick={resetSelection} className="arcade-button-secondary">
              Reiniciar
            </button>
          )}
          
          {canProceed && (
            <button onClick={handleProceed} className="arcade-button">
              ¡A Pelear!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
