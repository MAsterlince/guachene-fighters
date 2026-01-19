import React from 'react';
import { Fighter as FighterType } from '@/types/game';

interface FighterProps {
  fighter: FighterType;
  isPlayer2?: boolean;
}

export function Fighter({ fighter, isPlayer2 = false }: FighterProps) {
  const getAnimationClass = () => {
    switch (fighter.state) {
      case 'idle':
        return 'animate-idle';
      case 'hit':
        return 'animate-hit';
      case 'attacking':
        return 'animate-attack';
      case 'defeated':
        return 'opacity-50';
      case 'victory':
        return 'scale-110';
      default:
        return '';
    }
  };

  const getTransform = () => {
    const scaleX = fighter.facingRight ? 1 : -1;
    const translateY = fighter.isJumping ? -fighter.y : 0;
    return `scaleX(${scaleX}) translateY(${translateY}px)`;
  };

  return (
    <div
      className={`fighter ${getAnimationClass()}`}
      style={{
        left: fighter.x,
        bottom: 0,
        width: 150,
        height: 250,
        transform: getTransform(),
        transformOrigin: 'bottom center',
      }}
    >
      {/* Fighter sprite */}
      <img
        src={fighter.character.image}
        alt={fighter.character.name}
        className="w-full h-full object-contain object-bottom"
        style={{
          filter: fighter.state === 'blocking' 
            ? 'brightness(0.7) saturate(1.2)' 
            : fighter.state === 'hit'
            ? 'brightness(2) saturate(0.5)'
            : 'none',
          transition: 'filter 0.1s',
        }}
      />
      
      {/* Attack effect */}
      {fighter.isAttacking && (
        <div 
          className={`absolute ${fighter.facingRight ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} top-1/3`}
          style={{
            width: fighter.attackType === 'heavy' ? 80 : 50,
            height: fighter.attackType === 'heavy' ? 80 : 50,
          }}
        >
          <div 
            className={`w-full h-full rounded-full ${
              fighter.attackType === 'heavy' 
                ? 'bg-fire-red/60' 
                : 'bg-fire-yellow/60'
            }`}
            style={{
              animation: 'scale-in 0.15s ease-out',
              boxShadow: fighter.attackType === 'heavy'
                ? '0 0 30px rgba(255, 100, 50, 0.8)'
                : '0 0 20px rgba(255, 200, 50, 0.6)',
            }}
          />
        </div>
      )}
      
      {/* Blocking shield effect */}
      {fighter.isBlocking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-32 h-40 rounded-full border-4 border-neon-cyan/50 bg-neon-cyan/10"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            }}
          />
        </div>
      )}
      
      {/* Player indicator */}
      <div 
        className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[8px] font-pixel ${
          isPlayer2 ? 'bg-fire-red' : 'bg-neon-blue'
        }`}
        style={{ transform: `scaleX(${fighter.facingRight ? 1 : -1}) translateX(-50%)` }}
      >
        {isPlayer2 ? 'P2' : 'P1'}
      </div>
    </div>
  );
}
