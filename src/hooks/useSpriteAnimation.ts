import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Sprite cell dimensions in pixels
const CELL_WIDTH = 277;
const CELL_HEIGHT = 277;
const TOTAL_ROWS = 9;
const MAX_COLS = 7;

// Total spritesheet dimensions
const SHEET_WIDTH = CELL_WIDTH * MAX_COLS;  // 1939px
const SHEET_HEIGHT = CELL_HEIGHT * TOTAL_ROWS; // 2493px

interface RowBasedSpriteConfig {
  row: number;
  cols: number;
  frameDuration: number;
  loop: boolean;
}

// Andres unified spritesheet configuration
// Row 0: idle (1 frame)
// Row 1: walk (5 frames)
// Row 2: jump (3 frames)
// Row 3: lightAttack (1 frame)
// Row 4: heavyAttack (5 frames)
// Row 5: block (1 frame)
// Row 6: hit (2 frames)
// Row 7: victory (5 frames)
// Row 8: defeat (3 frames)

export const SPRITE_CONFIGS: Record<string, Record<string, RowBasedSpriteConfig>> = {
  andres: {
    idle: { row: 0, cols: 1, frameDuration: 600, loop: true },
    walk: { row: 1, cols: 5, frameDuration: 150, loop: true },
    jump: { row: 2, cols: 3, frameDuration: 200, loop: false },
    lightAttack: { row: 3, cols: 1, frameDuration: 250, loop: false },
    heavyAttack: { row: 4, cols: 5, frameDuration: 100, loop: false },
    block: { row: 5, cols: 1, frameDuration: 300, loop: true },
    hit: { row: 6, cols: 2, frameDuration: 300, loop: false },
    victory: { row: 7, cols: 5, frameDuration: 180, loop: true },
    defeat: { row: 8, cols: 3, frameDuration: 300, loop: false },
  },
  // Other characters use single images for now
  camilo: {},
  oliver: {},
  jordan: {},
};

// Sprite dimensions export for components
export const SPRITE_DIMENSIONS = {
  cellWidth: CELL_WIDTH,
  cellHeight: CELL_HEIGHT,
  sheetWidth: SHEET_WIDTH,
  sheetHeight: SHEET_HEIGHT,
};

const STATE_TO_SPRITE_KEY: Record<string, string> = {
  idle: 'idle',
  walking: 'walk',
  jumping: 'jump',
  blocking: 'block',
  attacking: 'lightAttack',
  hit: 'hit',
  defeated: 'defeat',
  victory: 'victory',
};

interface UseSpriteAnimationProps {
  characterId: string;
  state: string;
  attackType?: 'light' | 'heavy' | 'none';
  isActive: boolean;
}

export function useSpriteAnimation({ 
  characterId, 
  state, 
  attackType = 'none',
  isActive 
}: UseSpriteAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameTimerRef = useRef<number>();
  const lastStateRef = useRef(state);
  const lastAttackTypeRef = useRef(attackType);

  // Determine which sprite key to use
  const spriteKey = useMemo(() => {
    if (state === 'attacking') {
      return attackType === 'heavy' ? 'heavyAttack' : 'lightAttack';
    }
    return STATE_TO_SPRITE_KEY[state] || 'idle';
  }, [state, attackType]);

  const config = SPRITE_CONFIGS[characterId]?.[spriteKey];
  const hasAnimation = !!config;
  const totalFrames = config?.cols || 1;
  const frameDuration = config?.frameDuration || 150;
  const shouldLoop = config?.loop ?? true;

  // Reset frame when state or attack type changes
  useEffect(() => {
    if (lastStateRef.current !== state || lastAttackTypeRef.current !== attackType) {
      setCurrentFrame(0);
      lastStateRef.current = state;
      lastAttackTypeRef.current = attackType;
    }
  }, [state, attackType]);

  // Animate frames
  useEffect(() => {
    if (!isActive || !hasAnimation || totalFrames <= 1) return;

    const animate = () => {
      setCurrentFrame(prev => {
        const next = prev + 1;
        if (next >= totalFrames) {
          return shouldLoop ? 0 : totalFrames - 1;
        }
        return next;
      });
    };

    frameTimerRef.current = window.setInterval(animate, frameDuration);

    return () => {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
    };
  }, [isActive, hasAnimation, totalFrames, frameDuration, shouldLoop, state, attackType]);

  // Calculate background position using ABSOLUTE PIXELS
  const getFrameStyle = useCallback(() => {
    if (!config) {
      return {
        backgroundSize: 'contain',
        backgroundPosition: 'center bottom',
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
      };
    }

    const { row } = config;
    
    // Calculate pixel positions (negative values for background-position)
    const xPos = -(currentFrame * CELL_WIDTH);
    const yPos = -(row * CELL_HEIGHT);

    return {
      backgroundSize: `${SHEET_WIDTH}px ${SHEET_HEIGHT}px`,
      backgroundPosition: `${xPos}px ${yPos}px`,
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
    };
  }, [currentFrame, config]);

  return {
    currentFrame,
    totalFrames,
    hasAnimation,
    spriteKey,
    config,
    getFrameStyle,
    dimensions: SPRITE_DIMENSIONS,
  };
}
