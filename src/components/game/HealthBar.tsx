import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  playerName: string;
  isPlayer2?: boolean;
}

export function HealthBar({ health, maxHealth, playerName, isPlayer2 = false }: HealthBarProps) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  const getHealthColor = () => {
    if (healthPercent > 50) return { main: '#00FF00', glow: '#00CC00' };
    if (healthPercent > 25) return { main: '#FFFF00', glow: '#CCCC00' };
    return { main: '#FF0000', glow: '#CC0000' };
  };

  const colors = getHealthColor();

  return (
    <div className={`flex flex-col ${isPlayer2 ? 'items-end' : 'items-start'}`}>
      {/* Player name with portrait style */}
      <div className={`flex items-center gap-2 mb-1 ${isPlayer2 ? 'flex-row-reverse' : ''}`}>
        {/* Mini portrait box */}
        <div 
          className="w-10 h-10 rounded border-2"
          style={{
            borderColor: isPlayer2 ? '#FF6600' : '#00CCFF',
            background: 'linear-gradient(180deg, #333 0%, #111 100%)',
            boxShadow: isPlayer2 
              ? '0 0 10px rgba(255, 100, 0, 0.5)' 
              : '0 0 10px rgba(0, 200, 255, 0.5)',
          }}
        />
        <span 
          className="text-xs font-pixel uppercase tracking-wide"
          style={{
            color: '#FFFFFF',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
          }}
        >
          {playerName}
        </span>
      </div>
      
      {/* Health bar container - arcade style */}
      <div 
        className="relative"
        style={{
          width: 320,
          height: 24,
        }}
      >
        {/* Outer frame with metallic gradient */}
        <div 
          className="absolute inset-0 rounded-sm"
          style={{
            background: 'linear-gradient(180deg, #666 0%, #333 20%, #222 50%, #333 80%, #555 100%)',
            padding: 3,
          }}
        >
          {/* Inner dark background */}
          <div 
            className="w-full h-full rounded-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0505 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {/* Health fill */}
            <div 
              className="h-full transition-all duration-150 ease-out relative"
              style={{
                width: `${healthPercent}%`,
                background: `linear-gradient(180deg, 
                  ${colors.main} 0%, 
                  ${colors.glow} 40%, 
                  ${colors.main}88 70%, 
                  ${colors.glow} 100%)`,
                boxShadow: healthPercent > 0 
                  ? `0 0 10px ${colors.main}99, inset 0 1px 2px rgba(255,255,255,0.4)` 
                  : 'none',
                animation: healthPercent <= 25 ? 'health-pulse 0.4s ease-in-out infinite' : 'none',
              }}
            >
              {/* Shine effect on health bar */}
              <div 
                className="absolute inset-x-0 top-0 h-1/3"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
                }}
              />
            </div>
            
            {/* Segment lines */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="flex-1 border-r border-black/30"
                  style={{ borderRightWidth: i === 4 ? 2 : 1 }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Corner accent */}
        <div 
          className="absolute"
          style={{
            [isPlayer2 ? 'left' : 'right']: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 20,
            background: 'linear-gradient(180deg, #888 0%, #444 50%, #666 100%)',
            clipPath: isPlayer2 
              ? 'polygon(100% 0, 100% 100%, 0 50%)' 
              : 'polygon(0 0, 0 100%, 100% 50%)',
          }}
        />
      </div>
    </div>
  );
}
