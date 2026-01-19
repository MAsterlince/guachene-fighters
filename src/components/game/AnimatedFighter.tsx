import React, { useMemo } from 'react';
import { Fighter as FighterType } from '@/types/game';
import { CHARACTER_SPRITES, SPRITE_DIMENSIONS } from '@/data/characterSprites';
import { useSpriteAnimation } from '@/hooks/useSpriteAnimation';

interface AnimatedFighterProps {
  fighter: FighterType;
  isPlayer2?: boolean;
}

const STATE_TO_SPRITE_KEY: Record<string, keyof typeof CHARACTER_SPRITES.andres> = {
  idle: 'idle',
  walking: 'walk',
  jumping: 'jump',
  blocking: 'block',
  attacking: 'lightAttack',
  hit: 'hit',
  defeated: 'defeat',
  victory: 'victory',
};

export function AnimatedFighter({ fighter, isPlayer2 = false }: AnimatedFighterProps) {
  const characterId = fighter.character.id;
  const sprites = CHARACTER_SPRITES[characterId];
  
  const { currentFrame, getFramePosition, spriteKey } = useSpriteAnimation({
    characterId,
    state: fighter.state,
    isActive: true,
  });

  // Get the appropriate sprite for current state
  const currentSprite = useMemo(() => {
    if (!sprites) return fighter.character.image;
    
    const stateKey = STATE_TO_SPRITE_KEY[fighter.state] || 'idle';
    
    // For heavy attack, use special/heavyAttack sprite
    if (fighter.state === 'attacking' && fighter.attackType === 'heavy') {
      return sprites.heavyAttack || sprites.lightAttack;
    }
    
    return sprites[stateKey] || sprites.idle;
  }, [sprites, fighter.state, fighter.attackType, fighter.character.image]);

  const framePosition = getFramePosition();
  const hasSpriteSheet = SPRITE_DIMENSIONS[characterId]?.[spriteKey];

  const getTransform = () => {
    const scaleX = fighter.facingRight ? 1 : -1;
    const translateY = fighter.isJumping ? -fighter.y : 0;
    return `scaleX(${scaleX}) translateY(${translateY}px)`;
  };

  const getAnimationClass = () => {
    switch (fighter.state) {
      case 'idle':
        return hasSpriteSheet ? '' : 'animate-idle';
      case 'hit':
        return 'animate-hit';
      case 'attacking':
        return 'animate-attack';
      case 'defeated':
        return 'opacity-70';
      case 'victory':
        return 'scale-105';
      default:
        return '';
    }
  };

  return (
    <div
      className={`fighter ${getAnimationClass()}`}
      style={{
        left: fighter.x,
        bottom: 0,
        width: 180,
        height: 280,
        transform: getTransform(),
        transformOrigin: 'bottom center',
      }}
    >
      {/* Fighter sprite */}
      {hasSpriteSheet ? (
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${currentSprite})`,
            backgroundSize: `${framePosition.width * (SPRITE_DIMENSIONS[characterId]?.[spriteKey]?.cols || 1)}% ${framePosition.height * (SPRITE_DIMENSIONS[characterId]?.[spriteKey]?.rows || 1)}%`,
            backgroundPosition: `${framePosition.x}% ${framePosition.y}%`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            filter: fighter.state === 'blocking' 
              ? 'brightness(0.8) saturate(1.2)' 
              : fighter.state === 'hit'
              ? 'brightness(1.5) saturate(0.5)'
              : 'none',
            transition: 'filter 0.1s',
          }}
        />
      ) : (
        <img
          src={currentSprite}
          alt={fighter.character.name}
          className="w-full h-full object-contain object-bottom"
          style={{
            filter: fighter.state === 'blocking' 
              ? 'brightness(0.8) saturate(1.2)' 
              : fighter.state === 'hit'
              ? 'brightness(1.5) saturate(0.5)'
              : 'none',
            transition: 'filter 0.1s',
            imageRendering: 'auto',
          }}
        />
      )}
      
      {/* Attack effect */}
      {fighter.isAttacking && (
        <div 
          className={`absolute ${fighter.facingRight ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} top-1/3`}
          style={{
            width: fighter.attackType === 'heavy' ? 100 : 60,
            height: fighter.attackType === 'heavy' ? 100 : 60,
          }}
        >
          <div 
            className={`w-full h-full rounded-full ${
              fighter.attackType === 'heavy' 
                ? 'bg-gradient-to-r from-fire-red/70 to-fire-yellow/70' 
                : 'bg-gradient-to-r from-fire-yellow/60 to-fire-orange/60'
            }`}
            style={{
              animation: 'scale-in 0.15s ease-out',
              boxShadow: fighter.attackType === 'heavy'
                ? '0 0 40px rgba(255, 100, 50, 0.8), 0 0 60px rgba(255, 50, 0, 0.5)'
                : '0 0 25px rgba(255, 200, 50, 0.7)',
            }}
          />
        </div>
      )}
      
      {/* Blocking shield effect */}
      {fighter.isBlocking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-36 h-44 rounded-full border-4 border-neon-cyan/60 bg-neon-cyan/15"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2)',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        </div>
      )}
      
      {/* Player indicator */}
      <div 
        className={`absolute -top-10 left-1/2 px-3 py-1.5 rounded-lg text-[10px] font-pixel uppercase tracking-wide ${
          isPlayer2 
            ? 'bg-gradient-to-r from-fire-red to-fire-orange' 
            : 'bg-gradient-to-r from-neon-blue to-neon-cyan'
        }`}
        style={{ 
          transform: `scaleX(${fighter.facingRight ? 1 : -1}) translateX(-50%)`,
          boxShadow: isPlayer2 
            ? '0 0 15px rgba(255, 100, 50, 0.6)' 
            : '0 0 15px rgba(0, 200, 255, 0.6)',
        }}
      >
        {isPlayer2 ? 'P2' : 'P1'}
      </div>
    </div>
  );
}
