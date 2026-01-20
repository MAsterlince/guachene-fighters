import React, { useState } from 'react';
import { GameMode } from '@/types/game';
import menuBackground from '@/assets/menu-background.png';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-end relative overflow-hidden"
      style={{
        backgroundImage: `url(${menuBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />

      {/* Content at bottom */}
      <div className="relative z-10 flex flex-col items-center gap-6 pb-12">
        {/* Menu buttons */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => onSelectMode('pvp')}
            onMouseEnter={() => setHoveredButton('pvp')}
            onMouseLeave={() => setHoveredButton(null)}
            className="relative min-w-[280px] py-3 px-8 font-pixel text-lg uppercase tracking-widest transition-all duration-200"
            style={{
              background: hoveredButton === 'pvp'
                ? 'linear-gradient(180deg, #ff8844 0%, #ff5522 50%, #cc3300 100%)'
                : 'linear-gradient(180deg, rgba(40, 40, 50, 0.9) 0%, rgba(30, 30, 40, 0.95) 100%)',
              border: '3px solid',
              borderColor: hoveredButton === 'pvp' ? '#ffaa66' : 'rgba(100, 100, 120, 0.6)',
              color: hoveredButton === 'pvp' ? '#fff' : '#ccccdd',
              boxShadow: hoveredButton === 'pvp'
                ? '0 0 30px rgba(255, 100, 50, 0.6), 0 4px 0 #882200, inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : '0 4px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transform: hoveredButton === 'pvp' ? 'translateY(-2px)' : 'translateY(0)',
              textShadow: hoveredButton === 'pvp' ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <span style={{ color: hoveredButton === 'pvp' ? '#ffdd44' : '#888899' }}>👥</span>
              VS Jugador
            </span>
          </button>
          
          <button
            onClick={() => onSelectMode('cpu')}
            onMouseEnter={() => setHoveredButton('cpu')}
            onMouseLeave={() => setHoveredButton(null)}
            className="relative min-w-[280px] py-3 px-8 font-pixel text-lg uppercase tracking-widest transition-all duration-200"
            style={{
              background: hoveredButton === 'cpu'
                ? 'linear-gradient(180deg, #ff8844 0%, #ff5522 50%, #cc3300 100%)'
                : 'linear-gradient(180deg, rgba(40, 40, 50, 0.9) 0%, rgba(30, 30, 40, 0.95) 100%)',
              border: '3px solid',
              borderColor: hoveredButton === 'cpu' ? '#ffaa66' : 'rgba(100, 100, 120, 0.6)',
              color: hoveredButton === 'cpu' ? '#fff' : '#ccccdd',
              boxShadow: hoveredButton === 'cpu'
                ? '0 0 30px rgba(255, 100, 50, 0.6), 0 4px 0 #882200, inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : '0 4px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transform: hoveredButton === 'cpu' ? 'translateY(-2px)' : 'translateY(0)',
              textShadow: hoveredButton === 'cpu' ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <span style={{ color: hoveredButton === 'cpu' ? '#ffdd44' : '#888899' }}>🤖</span>
              VS CPU
            </span>
          </button>
        </div>

        {/* Controls info - compact */}
        <div 
          className="p-4 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 100, 50, 0.3)',
          }}
        >
          <div className="flex gap-10 text-[10px]" style={{ color: '#8899aa' }}>
            <div>
              <p className="font-pixel mb-1" style={{ color: '#4488ff' }}>P1</p>
              <p><span style={{ color: '#667788' }}>WASD</span> Moverse</p>
              <p><span style={{ color: '#667788' }}>C/V</span> Golpes</p>
            </div>
            <div>
              <p className="font-pixel mb-1" style={{ color: '#ff4444' }}>P2</p>
              <p><span style={{ color: '#667788' }}>Flechas</span> Moverse</p>
              <p><span style={{ color: '#667788' }}>O/P</span> Golpes</p>
            </div>
          </div>
        </div>

        {/* Blinking text */}
        <p 
          className="text-sm font-pixel animate-pulse tracking-widest"
          style={{ color: '#ffcc00', textShadow: '0 0 10px rgba(255, 200, 0, 0.5)' }}
        >
          PRESS START BUTTON
        </p>
      </div>
    </div>
  );
}
