import { Character, GameMap } from '@/types/game';

import andresPortrait from '@/assets/characters/andres/andrespose.png';
import andresIcon from '@/assets/characters/andres/andresicono.png';
import camiloPortrait from '@/assets/characters/camilo/camilopose.png';
import camiloIcon from '@/assets/characters/camilo/camiloicono.png';
import jordanPortrait from '@/assets/characters/jordan/jordanpose.png';
import jordanIcon from '@/assets/characters/jordan/jordanicono.png';
import oliverPortrait from '@/assets/characters/oliver/oliverpose.png';
import oliverIcon from '@/assets/characters/oliver/olivericono.png';
import jurgenPortrait from '@/assets/characters/jurgen/Jurgenpose.png';
import jurgenIcon from '@/assets/characters/jurgen/jurgenicono.png';
import pachecoPortrait from '@/assets/characters/pacheco/pachecopose.png';
import pachecoIcon from '@/assets/characters/pacheco/pachecoicono.png';

import bogotaImg from '@/assets/maps/bogota.png';
import medellinImg from '@/assets/maps/medellin.png';
import barImg from '@/assets/maps/bar.png';

export const CHARACTERS: Character[] = [
  { id: 'camilo',  name: 'Camilo',  image: camiloPortrait,  icon: camiloIcon,  color: '#1a1a2e' },
  { id: 'oliver',  name: 'Oliver',  image: oliverPortrait,  icon: oliverIcon,  color: '#3b5998' },
  { id: 'andres',  name: 'Andres',  image: andresPortrait,  icon: andresIcon,  color: '#2563eb' },
  { id: 'jordan',  name: 'Jordan',  image: jordanPortrait,  icon: jordanIcon,  color: '#1f2937' },
  { id: 'jurgen',  name: 'Jurgen',  image: jurgenPortrait,  icon: jurgenIcon,  color: '#4c1d95' },
  { id: 'pacheco', name: 'Pacheco', image: pachecoPortrait, icon: pachecoIcon, color: '#7f1d1d' },
];

export const MAPS: GameMap[] = [
  { id: 'bogota',   name: 'Bogotá',   image: bogotaImg },
  { id: 'medellin', name: 'Medellín', image: medellinImg },
  { id: 'bar',      name: 'Bar',      image: barImg },
];

export const GAME_CONFIG = {
  ARENA_WIDTH: 1200, ARENA_HEIGHT: 500, GROUND_Y: 380,
  FIGHTER_WIDTH: 120, FIGHTER_HEIGHT: 200,
  GRAVITY: 0.8, JUMP_FORCE: 20, MOVE_SPEED: 6,
  LIGHT_DAMAGE: 8, HEAVY_DAMAGE: 15,
  LIGHT_ATTACK_RANGE: 140, HEAVY_ATTACK_RANGE: 180,
  BLOCK_REDUCTION: 0.3, MAX_HEALTH: 100, ROUND_TIME: 99,
};
