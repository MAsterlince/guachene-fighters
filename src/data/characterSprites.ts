import { CharacterSprites } from '@/types/sprites';

// Unified spritesheets for all characters
import andresSpritesheet from '@/assets/characters/andres/spritesheet.png';
import oliverSpritesheet from '@/assets/characters/oliver/spritesheet.png';
import jordanSpritesheet from '@/assets/characters/jordan/spritesheet.png';
import camiloSpritesheet from '@/assets/characters/camilo/spritesheet.png';

// All characters use unified spritesheets - all states point to the same image
// The animation hook handles row selection based on state
export const CHARACTER_SPRITES: Record<string, CharacterSprites> = {
  andres: {
    idle: andresSpritesheet,
    walk: andresSpritesheet,
    jump: andresSpritesheet,
    block: andresSpritesheet,
    lightAttack: andresSpritesheet,
    heavyAttack: andresSpritesheet,
    hit: andresSpritesheet,
    defeat: andresSpritesheet,
    victory: andresSpritesheet,
    special: andresSpritesheet,
  },
  oliver: {
    idle: oliverSpritesheet,
    walk: oliverSpritesheet,
    jump: oliverSpritesheet,
    block: oliverSpritesheet,
    lightAttack: oliverSpritesheet,
    heavyAttack: oliverSpritesheet,
    hit: oliverSpritesheet,
    defeat: oliverSpritesheet,
    victory: oliverSpritesheet,
    special: oliverSpritesheet,
  },
  jordan: {
    idle: jordanSpritesheet,
    walk: jordanSpritesheet,
    jump: jordanSpritesheet,
    block: jordanSpritesheet,
    lightAttack: jordanSpritesheet,
    heavyAttack: jordanSpritesheet,
    hit: jordanSpritesheet,
    defeat: jordanSpritesheet,
    victory: jordanSpritesheet,
    special: jordanSpritesheet,
  },
  camilo: {
    idle: camiloSpritesheet,
    walk: camiloSpritesheet,
    jump: camiloSpritesheet,
    block: camiloSpritesheet,
    lightAttack: camiloSpritesheet,
    heavyAttack: camiloSpritesheet,
    hit: camiloSpritesheet,
    defeat: camiloSpritesheet,
    victory: camiloSpritesheet,
    special: camiloSpritesheet,
  },
};

// Spritesheet config: row-based layout
// Andres spritesheet layout (top to bottom):
// Row 0: idle (1 frame)
// Row 1: walk (4 frames)
// Row 2: jump (3 frames)
// Row 3: lightAttack (1 frame)
// Row 4: heavyAttack (5 frames)
// Row 5: block (1 frame)
// Row 6: hit (2 frames)
// Row 7: victory (5 frames)
// Row 8: defeat (3 frames)
