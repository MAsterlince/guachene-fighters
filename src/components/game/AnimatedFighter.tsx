import React from 'react';
import { Fighter as FighterType } from '@/types/game';
import { CHARACTER_SPRITES } from '@/data/characterSprites';
import { useSpriteAnimation, SPRITE_DIMENSIONS } from '@/hooks/useSpriteAnimation';

interface AnimatedFighterProps {
  fighter: FighterType;
  isPlayer2?: boolean;
}

// Visual scale factor for displaying the fighter
const DISPLAY_SCALE = 0.72; // 277 * 0.72 ≈ 200px

export function AnimatedFighter({ fighter, isPlayer2 = false }: AnimatedFighterProps) {
  const characterId = fighter.character.id;
  const sprites = CHARACTER_SPRITES[characterId];
  
  const { hasAnimation, getFrameStyle } = useSpriteAnimation({
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
  const frameStyle = getFrameStyle();

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

  // Fighter visual dimensions
  const displayWidth = SPRITE_DIMENSIONS.cellWidth * DISPLAY_SCALE;
  const displayHeight = SPRITE_DIMENSIONS.cellHeight * DISPLAY_SCALE;

  return (
    <div
      className="fighter absolute"
      style={{
        left: `${fighter.x}px`,
        bottom: `${fighter.y}px`,
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        transformOrigin: 'bottom center',
        transform: fighter.facingRight ? 'scaleX(1)' : 'scaleX(-1)',
      }}
    >
      {/* Sprite container with exact cell dimensions, then scaled down */}
      <div
        className="origin-bottom-left"
        style={{
          width: `${SPRITE_DIMENSIONS.cellWidth}px`,
          height: `${SPRITE_DIMENSIONS.cellHeight}px`,
          transform: `scale(${DISPLAY_SCALE})`,
          overflow: 'hidden',
        }}
      >
        {/* Actual sprite with pixel-perfect positioning */}
        <div
          style={{
            width: `${SPRITE_DIMENSIONS.cellWidth}px`,
            height: `${SPRITE_DIMENSIONS.cellHeight}px`,
            backgroundImage: `url(${currentSprite})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: hasAnimation ? frameStyle.backgroundSize : 'contain',
            backgroundPosition: hasAnimation ? frameStyle.backgroundPosition : 'center bottom',
            imageRendering: 'auto',
            filter: getFilter(),
            transition: 'filter 0.1s',
          }}
        />
      </div>
      
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
