import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  playerName: string;
  isPlayer2?: boolean;
}

export function HealthBar({ health, maxHealth, playerName, isPlayer2 = false }: HealthBarProps) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  const getHealthClass = () => {
    if (healthPercent > 50) return 'health-high';
    if (healthPercent > 25) return 'health-mid';
    return 'health-low';
  };

  return (
    <div className={`flex flex-col ${isPlayer2 ? 'items-end' : 'items-start'}`}>
      {/* Player name */}
      <div className="mb-1">
        <span className="text-xs font-pixel text-foreground uppercase tracking-wider">
          {playerName}
        </span>
      </div>
      
      {/* Health bar container */}
      <div className="relative w-[400px]">
        {/* Background bar with border styling */}
        <div className="health-bar" style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '3px solid #3a3a5a',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,165,0,0.2)',
        }}>
          {/* Health fill */}
          <div
            className={`health-bar-fill ${getHealthClass()}`}
            style={{
              width: `${healthPercent}%`,
              transform: isPlayer2 ? 'scaleX(-1)' : 'none',
              transformOrigin: isPlayer2 ? 'right' : 'left',
              marginLeft: isPlayer2 ? 'auto' : 0,
            }}
          />
          
          {/* Shine effect */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent"
            style={{ borderRadius: 'inherit' }}
          />
        </div>
        
        {/* Health percentage text */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isPlayer2 ? 'left-3' : 'right-3'}`}>
          <span className="text-[10px] font-pixel text-foreground/80">
            {Math.round(healthPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}
