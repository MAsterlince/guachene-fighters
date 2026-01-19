import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onCharacterSelect: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResume, onCharacterSelect, onMainMenu }: PauseMenuProps) {
  return (
    <div className="pause-overlay">
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-4xl font-pixel fire-gradient text-shadow-fire">
          PAUSA
        </h2>
        
        <div className="flex flex-col gap-4">
          <button onClick={onResume} className="arcade-button min-w-[280px]">
            Continuar
          </button>
          
          <button onClick={onCharacterSelect} className="arcade-button-secondary min-w-[280px]">
            Cambiar Personajes
          </button>
          
          <button onClick={onMainMenu} className="arcade-button-secondary min-w-[280px]">
            Menú Principal
          </button>
        </div>
        
        <p className="text-muted-foreground text-xs font-pixel">
          Presiona ESC para continuar
        </p>
      </div>
    </div>
  );
}
