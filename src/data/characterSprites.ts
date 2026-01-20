import { CharacterSprites } from '@/types/sprites';

// Andres unified spritesheet
import andresSpritesheet from '@/assets/characters/andres/spritesheet.png';
// Oliver unified spritesheet
import oliverSpritesheet from '@/assets/characters/oliver/spritesheet.png';

// Import other character base images for now (placeholders until sprites provided)
import camiloImg from '@/assets/characters/camilo.png';
import jordanImg from '@/assets/characters/jordan.png';

// Andres and Oliver use unified spritesheets - all states point to the same image
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
