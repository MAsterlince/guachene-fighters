import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface RowBasedSpriteConfig {
  row: number;          // Which row in the spritesheet
  cols: number;         // Number of frames in this row
  frameDuration: number;
  loop: boolean;
  maxCols: number;      // Total columns in the spritesheet grid
  totalRows: number;    // Total rows in the spritesheet
}

// Andres unified spritesheet configuration
// Based on user's description:
// Row 0: idle (1 frame)
// Row 1: walk (4 frames)
// Row 2: jump (3 frames)
// Row 3: lightAttack (1 frame)
// Row 4: heavyAttack (5 frames)
// Row 5: block (1 frame)
// Row 6: hit (2 frames)
// Row 7: victory (5 frames)
// Row 8: defeat (3 frames)
const TOTAL_ROWS = 9;
const MAX_COLS = 5; // Maximum number of frames in any row

export const SPRITE_CONFIGS: Record<string, Record<string, RowBasedSpriteConfig>> = {
  andres: {
    idle: { row: 0, cols: 1, frameDuration: 500, loop: true, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    walk: { row: 1, cols: 4, frameDuration: 120, loop: true, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    jump: { row: 2, cols: 3, frameDuration: 100, loop: false, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    lightAttack: { row: 3, cols: 1, frameDuration: 100, loop: false, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    heavyAttack: { row: 4, cols: 5, frameDuration: 80, loop: false, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    block: { row: 5, cols: 1, frameDuration: 200, loop: true, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    hit: { row: 6, cols: 2, frameDuration: 100, loop: false, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    victory: { row: 7, cols: 5, frameDuration: 180, loop: true, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
    defeat: { row: 8, cols: 3, frameDuration: 200, loop: false, maxCols: MAX_COLS, totalRows: TOTAL_ROWS },
  },
  // Other characters use single images for now
  camilo: {},
  oliver: {},
  jordan: {},
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
  const hasAnimation = !!config && config.cols > 1;
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
    if (!isActive || !hasAnimation) return;

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

  // Calculate background position for row-based spritesheet
  const getFrameStyle = useCallback(() => {
    if (!config) {
      return {
        backgroundSize: 'contain',
        backgroundPosition: 'center bottom',
      };
    }

    const { row, maxCols, totalRows } = config;
    
    // Calculate percentage positions
    // X: move horizontally through frames
    const xPercent = maxCols > 1 ? (currentFrame / (maxCols - 1)) * 100 : 0;
    // Y: fixed row position
    const yPercent = totalRows > 1 ? (row / (totalRows - 1)) * 100 : 0;

    return {
      backgroundSize: `${maxCols * 100}% ${totalRows * 100}%`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
    };
  }, [currentFrame, config]);

  return {
    currentFrame,
    totalFrames,
    hasAnimation,
    spriteKey,
    config,
    getFrameStyle,
  };
}
