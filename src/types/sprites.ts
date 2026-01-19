// Sprite animation system types

export interface SpriteAnimation {
  name: string;
  frames: number;
  frameDuration: number; // ms per frame
  loop: boolean;
}

export interface CharacterSprites {
  idle: string;
  walk: string;
  jump: string;
  block: string;
  lightAttack: string;
  heavyAttack: string;
  hit: string;
  defeat: string;
  victory: string;
  special?: string;
}

export interface SpriteSheetConfig {
  image: string;
  frameWidth: number;
  frameHeight: number;
  framesPerRow: number;
  totalFrames: number;
  animations: Record<string, SpriteAnimation>;
}

// Frame counts per animation for each sprite sheet
export const ANDRES_SPRITE_CONFIG = {
  idle: { frames: 1, loop: true, frameDuration: 500 },
  walk: { frames: 4, loop: true, frameDuration: 150 },
  jump: { frames: 3, loop: false, frameDuration: 100 },
  block: { frames: 1, loop: true, frameDuration: 200 },
  lightAttack: { frames: 1, loop: false, frameDuration: 150 },
  heavyAttack: { frames: 5, loop: false, frameDuration: 80 },
  hit: { frames: 2, loop: false, frameDuration: 100 },
  defeat: { frames: 7, loop: false, frameDuration: 150 },
  victory: { frames: 4, loop: true, frameDuration: 200 },
};
