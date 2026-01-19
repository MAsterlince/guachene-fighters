import { CharacterSprites } from '@/types/sprites';

// Andres sprites
import andresIdle from '@/assets/characters/andres.png';
import andresWalk from '@/assets/characters/andres/walk.jpg';
import andresJump from '@/assets/characters/andres/jump.jpg';
import andresBlock from '@/assets/characters/andres/block.jpg';
import andresPunch from '@/assets/characters/andres/punch.png';
import andresSpecial from '@/assets/characters/andres/special.jpg';
import andresHit from '@/assets/characters/andres/hit.jpg';
import andresDefeat from '@/assets/characters/andres/defeat.jpg';
import andresVictory from '@/assets/characters/andres/victory.jpg';

// Import other character base images for now (placeholders until sprites provided)
import camiloImg from '@/assets/characters/camilo.png';
import oliverImg from '@/assets/characters/oliver.png';
import jordanImg from '@/assets/characters/jordan.png';

export const CHARACTER_SPRITES: Record<string, CharacterSprites> = {
  andres: {
    idle: andresIdle,
    walk: andresWalk,
    jump: andresJump,
    block: andresBlock,
    lightAttack: andresPunch,
    heavyAttack: andresSpecial,
    hit: andresHit,
    defeat: andresDefeat,
    victory: andresVictory,
    special: andresSpecial,
  },
  camilo: {
    idle: camiloImg,
    walk: camiloImg,
    jump: camiloImg,
    block: camiloImg,
    lightAttack: camiloImg,
    heavyAttack: camiloImg,
    hit: camiloImg,
    defeat: camiloImg,
    victory: camiloImg,
  },
  oliver: {
    idle: oliverImg,
    walk: oliverImg,
    jump: oliverImg,
    block: oliverImg,
    lightAttack: oliverImg,
    heavyAttack: oliverImg,
    hit: oliverImg,
    defeat: oliverImg,
    victory: oliverImg,
  },
  jordan: {
    idle: jordanImg,
    walk: jordanImg,
    jump: jordanImg,
    block: jordanImg,
    lightAttack: jordanImg,
    heavyAttack: jordanImg,
    hit: jordanImg,
    defeat: jordanImg,
    victory: jordanImg,
  },
};

// Sprite sheet dimensions for frame extraction
export const SPRITE_DIMENSIONS: Record<string, Record<string, { cols: number; rows: number }>> = {
  andres: {
    walk: { cols: 4, rows: 1 },
    jump: { cols: 3, rows: 1 },
    block: { cols: 1, rows: 1 },
    lightAttack: { cols: 1, rows: 1 },
    heavyAttack: { cols: 3, rows: 2 }, // 5 frames total
    hit: { cols: 1, rows: 2 },
    defeat: { cols: 2, rows: 4 }, // 7 frames
    victory: { cols: 4, rows: 1 },
  },
};
