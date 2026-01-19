import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface SpriteConfig {
  cols: number;
  rows: number;
  totalFrames?: number; // If not all cells are used
  frameDuration: number;
  loop: boolean;
}

// Sprite sheet configurations with actual frame counts
export const SPRITE_CONFIGS: Record<string, Record<string, SpriteConfig>> = {
  andres: {
    idle: { cols: 1, rows: 1, totalFrames: 1, frameDuration: 500, loop: true },
    walk: { cols: 4, rows: 1, totalFrames: 4, frameDuration: 120, loop: true },
    jump: { cols: 3, rows: 1, totalFrames: 3, frameDuration: 100, loop: false },
    block: { cols: 1, rows: 1, totalFrames: 1, frameDuration: 200, loop: true },
    lightAttack: { cols: 1, rows: 1, totalFrames: 1, frameDuration: 100, loop: false },
    heavyAttack: { cols: 3, rows: 2, totalFrames: 5, frameDuration: 80, loop: false },
    hit: { cols: 1, rows: 2, totalFrames: 2, frameDuration: 100, loop: false },
    defeat: { cols: 2, rows: 4, totalFrames: 7, frameDuration: 150, loop: false },
    victory: { cols: 4, rows: 1, totalFrames: 4, frameDuration: 180, loop: true },
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
  const hasAnimation = !!config && config.totalFrames && config.totalFrames > 1;
  const totalFrames = config?.totalFrames || 1;
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

  // Calculate the exact pixel position for background-position
  const getFrameStyle = useCallback((spriteWidth: number, spriteHeight: number) => {
    if (!config) {
      return {
        backgroundSize: 'contain',
        backgroundPosition: 'center bottom',
      };
    }

    const { cols, rows } = config;
    const col = currentFrame % cols;
    const row = Math.floor(currentFrame / cols);
    
    // Frame dimensions
    const frameWidth = spriteWidth / cols;
    const frameHeight = spriteHeight / rows;
    
    // Background position as percentages
    const xPercent = cols > 1 ? (col / (cols - 1)) * 100 : 50;
    const yPercent = rows > 1 ? (row / (rows - 1)) * 100 : 0;

    return {
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
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
