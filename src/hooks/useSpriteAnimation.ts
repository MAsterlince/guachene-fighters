import { useState, useEffect, useRef, useCallback } from 'react';
import { SPRITE_DIMENSIONS } from '@/data/characterSprites';

interface UseSpriteAnimationProps {
  characterId: string;
  state: string;
  isActive: boolean;
}

interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

const ANIMATION_SPEEDS: Record<string, number> = {
  idle: 500,
  walk: 150,
  jump: 100,
  block: 200,
  lightAttack: 100,
  heavyAttack: 80,
  hit: 100,
  defeat: 150,
  victory: 200,
};

export function useSpriteAnimation({ characterId, state, isActive }: UseSpriteAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameTimerRef = useRef<number>();
  const lastStateRef = useRef(state);

  const spriteKey = STATE_TO_SPRITE_KEY[state] || 'idle';
  const dimensions = SPRITE_DIMENSIONS[characterId]?.[spriteKey];
  
  const totalFrames = dimensions ? dimensions.cols * dimensions.rows : 1;
  const speed = ANIMATION_SPEEDS[spriteKey] || 150;
  const shouldLoop = ['idle', 'walk', 'victory'].includes(spriteKey);

  // Reset frame when state changes
  useEffect(() => {
    if (lastStateRef.current !== state) {
      setCurrentFrame(0);
      lastStateRef.current = state;
    }
  }, [state]);

  // Animate frames
  useEffect(() => {
    if (!isActive || totalFrames <= 1) return;

    const animate = () => {
      setCurrentFrame(prev => {
        const next = prev + 1;
        if (next >= totalFrames) {
          return shouldLoop ? 0 : prev;
        }
        return next;
      });
    };

    frameTimerRef.current = window.setInterval(animate, speed);

    return () => {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
    };
  }, [isActive, totalFrames, speed, shouldLoop, state]);

  const getFramePosition = useCallback((): SpriteFrame => {
    if (!dimensions) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    const col = currentFrame % dimensions.cols;
    const row = Math.floor(currentFrame / dimensions.cols);
    
    // Calculate percentage for background-position
    const xPercent = dimensions.cols > 1 ? (col / (dimensions.cols - 1)) * 100 : 0;
    const yPercent = dimensions.rows > 1 ? (row / (dimensions.rows - 1)) * 100 : 0;

    return {
      x: xPercent,
      y: yPercent,
      width: 100 / dimensions.cols,
      height: 100 / dimensions.rows,
    };
  }, [currentFrame, dimensions]);

  return {
    currentFrame,
    totalFrames,
    getFramePosition,
    spriteKey,
  };
}
