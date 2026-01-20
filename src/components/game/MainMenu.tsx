import React, { useState } from 'react';
import { GameMode } from '@/types/game';
import tituloImg from '@/assets/titulo.png';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
      }}
    >
      {/* Arcade grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 100, 50, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 100, 50, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          perspective: '500px',
          transform: 'rotateX(60deg) translateY(-50%)',
          transformOrigin: 'center top',
        }}
      />

      {/* Glowing orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255, 100, 50, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(255, 200, 50, 0.4) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulse 3s ease-in-out infinite 1s',
        }}
      />

      {/* Animated fire particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `hsl(${20 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
            left: `${Math.random() * 100}%`,
            bottom: '0%',
            animation: `float-up ${4 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 4}s`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Logo with fire effect */}
        <div className="relative">
          {/* Fire glow behind logo */}
          <div 
            className="absolute inset-0 blur-3xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 100, 50, 0.5) 0%, rgba(255, 50, 0, 0.3) 50%, transparent 80%)',
              transform: 'scale(1.5)',
            }}
          />
          
          <div 
            className="relative px-8 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)',
              border: '3px solid transparent',
              borderImage: 'linear-gradient(180deg, #ff6a33, #ff3300, #aa2200) 1',
              boxShadow: `
                0 0 30px rgba(255, 100, 50, 0.5),
                0 0 60px rgba(255, 50, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {!imageLoaded && (
              <div className="w-[400px] max-w-[80vw] h-[140px] flex items-center justify-center">
                <span 
                  className="text-3xl font-pixel animate-pulse"
                  style={{
                    background: 'linear-gradient(180deg, #ffd700 0%, #ff6a33 50%, #ff3300 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(255, 100, 50, 0.8)',
                  }}
                >
                  GUACHENE FIGHTERS
                </span>
              </div>
            )}
            <img 
              src={tituloImg} 
              alt="Guachene Fighters" 
              className={`w-[400px] max-w-[80vw] ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
              style={{ filter: 'drop-shadow(0 0 20px rgba(255, 100, 50, 0.6))' }}
            />
          </div>
        </div>

        {/* Menu buttons - Arcade style */}
        <div className="flex flex-col gap-5 items-center mt-4">
          <button
            onClick={() => onSelectMode('pvp')}
            onMouseEnter={() => setHoveredButton('pvp')}
            onMouseLeave={() => setHoveredButton(null)}
            className="relative min-w-[300px] py-4 px-8 font-pixel text-xl uppercase tracking-widest transition-all duration-200"
            style={{
              background: hoveredButton === 'pvp'
                ? 'linear-gradient(180deg, #ff8844 0%, #ff5522 50%, #cc3300 100%)'
                : 'linear-gradient(180deg, #444455 0%, #333344 50%, #222233 100%)',
              border: '3px solid',
              borderColor: hoveredButton === 'pvp' ? '#ffaa66' : '#555566',
              color: hoveredButton === 'pvp' ? '#fff' : '#ccccdd',
              boxShadow: hoveredButton === 'pvp'
                ? '0 0 30px rgba(255, 100, 50, 0.6), 0 6px 0 #882200, inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : '0 6px 0 #111122, inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
            className="relative min-w-[300px] py-4 px-8 font-pixel text-xl uppercase tracking-widest transition-all duration-200"
            style={{
              background: hoveredButton === 'cpu'
                ? 'linear-gradient(180deg, #ff8844 0%, #ff5522 50%, #cc3300 100%)'
                : 'linear-gradient(180deg, #444455 0%, #333344 50%, #222233 100%)',
              border: '3px solid',
              borderColor: hoveredButton === 'cpu' ? '#ffaa66' : '#555566',
              color: hoveredButton === 'cpu' ? '#fff' : '#ccccdd',
              boxShadow: hoveredButton === 'cpu'
                ? '0 0 30px rgba(255, 100, 50, 0.6), 0 6px 0 #882200, inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : '0 6px 0 #111122, inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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

        {/* Controls info - styled panel */}
        <div 
          className="mt-6 p-6 rounded-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 30, 40, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)',
            border: '2px solid rgba(255, 100, 50, 0.3)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <p 
            className="text-center text-xs font-pixel mb-4 tracking-widest"
            style={{ color: '#ff8844' }}
          >
            ⌨️ CONTROLES
          </p>
          <div className="flex gap-12">
            <div className="text-left">
              <p 
                className="text-xs font-pixel mb-2 tracking-wide"
                style={{ color: '#4488ff' }}
              >
                JUGADOR 1
              </p>
              <div className="text-[10px] space-y-1" style={{ color: '#8899aa' }}>
                <p><span style={{ color: '#667788' }}>W</span> - Saltar</p>
                <p><span style={{ color: '#667788' }}>A/D</span> - Moverse</p>
                <p><span style={{ color: '#667788' }}>S</span> - Bloquear</p>
                <p><span style={{ color: '#667788' }}>C</span> - Golpe suave</p>
                <p><span style={{ color: '#667788' }}>V</span> - Golpe fuerte</p>
              </div>
            </div>
            <div className="text-left">
              <p 
                className="text-xs font-pixel mb-2 tracking-wide"
                style={{ color: '#ff4444' }}
              >
                JUGADOR 2
              </p>
              <div className="text-[10px] space-y-1" style={{ color: '#8899aa' }}>
                <p><span style={{ color: '#667788' }}>↑</span> - Saltar</p>
                <p><span style={{ color: '#667788' }}>←/→</span> - Moverse</p>
                <p><span style={{ color: '#667788' }}>↓</span> - Bloquear</p>
                <p><span style={{ color: '#667788' }}>O</span> - Golpe suave</p>
                <p><span style={{ color: '#667788' }}>P</span> - Golpe fuerte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="text-[10px] font-pixel mt-4 opacity-40"
          style={{ color: '#667788' }}
        >
          PRESS START TO FIGHT
        </p>
      </div>
    </div>
  );
}
