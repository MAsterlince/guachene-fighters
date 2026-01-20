import React from 'react';
import { Fighter as FighterType } from '@/types/game';
import { CHARACTER_SPRITES } from '@/data/characterSprites';
import { useSpriteAnimation, SPRITE_CONFIGS } from '@/hooks/useSpriteAnimation';

interface AnimatedFighterProps {
  fighter: FighterType;
  isPlayer2?: boolean;
}

export function AnimatedFighter({ fighter, isPlayer2 = false }: AnimatedFighterProps) {
  const characterId = fighter.character.id;
  const sprites = CHARACTER_SPRITES[characterId];
  
  const { hasAnimation, spriteKey, getFrameStyle } = useSpriteAnimation({
    characterId,
    state: fighter.state,
    attackType: fighter.attackType === 'none' ? undefined : fighter.attackType,
    isActive: true,
  });

  // Get the appropriate sprite for current state
  const getCurrentSprite = () => {
    if (!sprites) return fighter.character.image;
    
    switch (fighter.state) {
      case 'walking':
        return sprites.walk;
      case 'jumping':
        return sprites.jump;
      case 'blocking':
        return sprites.block;
      case 'attacking':
        return fighter.attackType === 'heavy' 
          ? (sprites.heavyAttack || sprites.special || sprites.lightAttack)
          : sprites.lightAttack;
      case 'hit':
        return sprites.hit;
      case 'defeated':
        return sprites.defeat;
      case 'victory':
        return sprites.victory;
      default:
        return sprites.idle;
    }
  };

  const currentSprite = getCurrentSprite();
  const config = SPRITE_CONFIGS[characterId]?.[spriteKey];
  const frameStyle = getFrameStyle();

  const getTransform = () => {
    const scaleX = fighter.facingRight ? 1 : -1;
    const translateY = fighter.isJumping ? -fighter.y : 0;
    return `scaleX(${scaleX}) translateY(${translateY}px)`;
  };

  const getFilter = () => {
    if (fighter.state === 'blocking') {
      return 'brightness(0.85) drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))';
    }
    if (fighter.state === 'hit') {
      return 'brightness(1.8) saturate(0.3) drop-shadow(0 0 15px rgba(255, 0, 0, 0.8))';
    }
    if (fighter.state === 'defeated') {
      return 'grayscale(0.5) brightness(0.7)';
    }
    return 'none';
  };

  return (
    <div
      className="fighter"
      style={{
        left: fighter.x,
        bottom: 0,
        width: 200,
        height: 300,
        transform: getTransform(),
        transformOrigin: 'bottom center',
      }}
    >
      {/* Fighter sprite with frame extraction */}
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url(${currentSprite})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: hasAnimation && config 
            ? `${config.maxCols * 100}% ${config.totalRows * 100}%`
            : 'contain',
          backgroundPosition: hasAnimation && config
            ? frameStyle.backgroundPosition
            : 'center bottom',
          imageRendering: 'auto',
          filter: getFilter(),
          transition: 'filter 0.1s',
        }}
      />
      
      {/* Attack effect */}
      {fighter.isAttacking && (
        <div 
          className={`absolute ${fighter.facingRight ? 'right-0 translate-x-3/4' : 'left-0 -translate-x-3/4'} top-1/3`}
          style={{
            width: fighter.attackType === 'heavy' ? 80 : 50,
            height: fighter.attackType === 'heavy' ? 80 : 50,
          }}
        >
          <div 
            className={`w-full h-full rounded-full ${
              fighter.attackType === 'heavy' 
                ? 'bg-gradient-radial from-white/80 via-fire-yellow/60 to-fire-red/40' 
                : 'bg-gradient-radial from-white/60 via-fire-yellow/50 to-transparent'
            }`}
            style={{
              animation: 'attack-flash 0.15s ease-out',
              boxShadow: fighter.attackType === 'heavy'
                ? '0 0 40px rgba(255, 100, 50, 0.9), 0 0 80px rgba(255, 50, 0, 0.6)'
                : '0 0 25px rgba(255, 200, 50, 0.8)',
            }}
          />
        </div>
      )}
      
      {/* Blocking shield effect */}
      {fighter.isBlocking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-40 h-56 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 255, 255, 0.15) 0%, transparent 70%)',
              border: '3px solid rgba(0, 255, 255, 0.5)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1)',
              animation: 'pulse 0.8s ease-in-out infinite',
            }}
          />
        </div>
      )}
      
      {/* Player indicator */}
      <div 
        className={`absolute -top-8 left-1/2 px-2 py-1 rounded text-[8px] font-pixel uppercase tracking-wide ${
          isPlayer2 
            ? 'bg-gradient-to-r from-fire-red to-fire-orange' 
            : 'bg-gradient-to-r from-neon-blue to-neon-cyan'
        }`}
        style={{ 
          transform: `scaleX(${fighter.facingRight ? 1 : -1}) translateX(-50%)`,
          boxShadow: isPlayer2 
            ? '0 0 10px rgba(255, 100, 50, 0.7)' 
            : '0 0 10px rgba(0, 200, 255, 0.7)',
        }}
      >
        {isPlayer2 ? 'P2' : 'P1'}
      </div>
    </div>
  );
}
