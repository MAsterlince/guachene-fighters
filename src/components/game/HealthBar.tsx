import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  playerName: string;
  isPlayer2?: boolean;
}

export function HealthBar({ health, maxHealth, playerName, isPlayer2 = false }: HealthBarProps) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  const getHealthGradient = () => {
    if (healthPercent > 50) {
      return 'linear-gradient(180deg, #7CFC00 0%, #32CD32 30%, #228B22 70%, #006400 100%)';
    }
    if (healthPercent > 25) {
      return 'linear-gradient(180deg, #FFD700 0%, #FFA500 30%, #FF8C00 70%, #FF6600 100%)';
    }
    return 'linear-gradient(180deg, #FF4500 0%, #DC143C 30%, #B22222 70%, #8B0000 100%)';
  };

  return (
    <div className={`flex flex-col ${isPlayer2 ? 'items-end' : 'items-start'}`}>
      {/* Player name */}
      <div className="mb-2">
        <span 
          className="text-sm font-pixel uppercase tracking-wider"
          style={{
            color: '#FFD700',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 10px rgba(255, 165, 0, 0.5)',
          }}
        >
          {playerName}
        </span>
      </div>
      
      {/* Health bar container - styled like reference */}
      <div 
        className="relative"
        style={{
          width: 380,
          height: 36,
          transform: isPlayer2 ? 'scaleX(-1)' : 'none',
        }}
      >
        {/* Outer metallic frame */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 20%, #1a1a1a 50%, #2a2a2a 80%, #3a3a3a 100%)',
            borderRadius: '4px 20px 20px 4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            clipPath: isPlayer2 
              ? 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)' 
              : 'polygon(0 15%, 100% 0, 100% 100%, 0 85%)',
          }}
        />
        
        {/* Inner dark background */}
        <div 
          className="absolute"
          style={{
            left: 8,
            right: 20,
            top: 6,
            bottom: 6,
            background: 'linear-gradient(180deg, #0a0a0a 0%, #151515 50%, #0a0a0a 100%)',
            borderRadius: '2px 12px 12px 2px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
          }}
        />
        
        {/* Health fill with gradient */}
        <div 
          className="absolute transition-all duration-200 ease-out"
          style={{
            left: 10,
            top: 8,
            bottom: 8,
            width: `calc((100% - 32px) * ${healthPercent / 100})`,
            background: getHealthGradient(),
            borderRadius: '2px 10px 10px 2px',
            boxShadow: healthPercent > 25 
              ? '0 0 15px rgba(255, 200, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)' 
              : '0 0 20px rgba(255, 50, 0, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)',
            animation: healthPercent <= 25 ? 'health-pulse 0.5s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Shine overlay */}
        <div 
          className="absolute pointer-events-none"
          style={{
            left: 10,
            right: 22,
            top: 8,
            height: 8,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            borderRadius: '2px 10px 0 0',
          }}
        />
        
        {/* Corner accent - metallic detail */}
        <div 
          className="absolute"
          style={{
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 28,
            background: 'linear-gradient(135deg, #666 0%, #333 40%, #222 60%, #444 100%)',
            clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 80%)',
            boxShadow: '2px 0 4px rgba(0,0,0,0.5)',
          }}
        />

        {/* Fire accent on the edge */}
        <div 
          className="absolute"
          style={{
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 20,
            background: 'linear-gradient(180deg, #FF4500 0%, #FF6600 30%, #FF8C00 70%, #FF4500 100%)',
            clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 70%)',
            boxShadow: '0 0 10px rgba(255, 100, 0, 0.8)',
            animation: 'flicker 0.3s ease-in-out infinite alternate',
          }}
        />
      </div>
      
      {/* Health percentage */}
      <div className={`mt-1 ${isPlayer2 ? 'mr-4' : 'ml-4'}`}>
        <span 
          className="text-[10px] font-pixel"
          style={{
            color: healthPercent > 50 ? '#7CFC00' : healthPercent > 25 ? '#FFD700' : '#FF4500',
            textShadow: '1px 1px 0 #000',
            transform: isPlayer2 ? 'scaleX(-1)' : 'none',
            display: 'inline-block',
          }}
        >
          {Math.round(healthPercent)}%
        </span>
      </div>
    </div>
  );
}
