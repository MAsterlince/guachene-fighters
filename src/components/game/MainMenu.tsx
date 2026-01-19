import React, { useState } from 'react';
import { GameMode } from '@/types/game';
import tituloImg from '@/assets/titulo.png';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-arena-dark" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-fire-red/10 to-transparent" />
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-fire-yellow rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo */}
        <div className="relative">
          <div 
            className="px-6 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%)',
              boxShadow: '0 0 60px rgba(255, 165, 0, 0.4), 0 0 100px rgba(255, 100, 50, 0.3)',
            }}
          >
            {!imageLoaded && (
              <div className="w-[500px] max-w-[80vw] h-[180px] flex items-center justify-center">
                <span className="text-2xl font-pixel fire-gradient animate-pulse">
                  GUACHENE FIGHTERS
                </span>
              </div>
            )}
            <img 
              src={tituloImg} 
              alt="Guachene Fighters" 
              className={`w-[500px] max-w-[80vw] ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-6 items-center">
          <button
            onClick={() => onSelectMode('pvp')}
            className="arcade-button min-w-[320px]"
          >
            VS Jugador
          </button>
          
          <button
            onClick={() => onSelectMode('cpu')}
            className="arcade-button min-w-[320px]"
          >
            VS CPU
          </button>
        </div>

        {/* Controls info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs mb-4">CONTROLES</p>
          <div className="flex gap-12">
            <div className="text-left">
              <p className="text-fire-yellow text-xs mb-2">JUGADOR 1</p>
              <div className="text-muted-foreground text-[10px] space-y-1">
                <p>W - Saltar</p>
                <p>A/D - Moverse</p>
                <p>S - Bloquear</p>
                <p>C - Golpe suave</p>
                <p>V - Golpe fuerte</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-fire-yellow text-xs mb-2">JUGADOR 2</p>
              <div className="text-muted-foreground text-[10px] space-y-1">
                <p>↑ - Saltar</p>
                <p>←/→ - Moverse</p>
                <p>↓ - Bloquear</p>
                <p>O - Golpe suave</p>
                <p>P - Golpe fuerte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
