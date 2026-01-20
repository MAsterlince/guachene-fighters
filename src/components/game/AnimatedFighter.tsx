import React from 'react';
import { Fighter as FighterType } from '@/types/game';
import { CHARACTER_SPRITES } from '@/data/characterSprites';
import { useSpriteAnimation, SPRITE_DIMENSIONS } from '@/hooks/useSpriteAnimation';

interface AnimatedFighterProps {
  fighter: FighterType;
  isPlayer2?: boolean;
}

// Visual scale factor for displaying the fighter
const DISPLAY_SCALE = 1.0; // Full size for visibility

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

  // No visual filters - show sprites as they are
  const getFilter = () => {
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
        bottom: `${fighter.y + 100}px`, // Raise fighter properly above floor
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        transformOrigin: 'bottom center',
        transform: fighter.facingRight ? 'scaleX(1)' : 'scaleX(-1)',
        transition: 'none', // Prevent paper-flip effect when changing direction
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
      
      {/* No blocking shield effect or player indicators */}
    </div>
  );
}
